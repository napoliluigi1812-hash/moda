import Database from "better-sqlite3";
import nodemailer from "nodemailer";
import path from "node:path";
import { leggiCapiOrdine } from "../../lib/ordini";

export const runtime = "nodejs";

type DatiSpedizione = {
  nome: string;
  cognome: string;
  email: string;
  via: string;
  cap: string;
  citta: string;
};

function validaDati(value: unknown): { dati: DatiSpedizione; ids: number[] } | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const campi = ["nome", "cognome", "email", "via", "cap", "citta"] as const;
  const dati = {} as DatiSpedizione;

  for (const campo of campi) {
    if (typeof body[campo] !== "string") return null;
    dati[campo] = body[campo].trim();
    if (!dati[campo] || dati[campo].length > (campo === "email" ? 254 : 200)) {
      return null;
    }
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dati.email) ||
    !/^\d{5}$/.test(dati.cap) ||
    !Array.isArray(body.ids) ||
    body.ids.length === 0 ||
    body.ids.length > 50 ||
    !body.ids.every((id) => Number.isSafeInteger(id) && Number(id) > 0)
  ) {
    return null;
  }

  const ids = body.ids as number[];
  if (new Set(ids).size !== ids.length) return null;
  return { dati, ids };
}

function calcolaDataConsegna() {
  const oggi = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Rome",
    year: "numeric",
  }).formatToParts(new Date());
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    Number(oggi.find((elemento) => elemento.type === tipo)?.value);
  const data = new Date(Date.UTC(parte("year"), parte("month") - 1, parte("day")));

  let giorniLavorativi = 0;
  while (giorniLavorativi < 4) {
    data.setUTCDate(data.getUTCDate() + 1);
    const giorno = data.getUTCDay();
    if (giorno !== 0 && giorno !== 6) giorniLavorativi++;
  }

  return {
    iso: data.toISOString().slice(0, 10),
    formattata: new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
      weekday: "long",
    }).format(data),
  };
}

function salvaOrdine(
  dati: DatiSpedizione,
  capi: ReturnType<typeof leggiCapiOrdine>,
  totale: number,
  dataOrdine: string,
  dataConsegna: string,
) {
  const database = new Database(path.resolve(process.cwd(), "ordini.db"));

  try {
    database.pragma("foreign_keys = ON");
    database.exec(`
      CREATE TABLE IF NOT EXISTS ordini (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        email TEXT NOT NULL,
        via TEXT NOT NULL,
        cap TEXT NOT NULL,
        citta TEXT NOT NULL,
        totale REAL NOT NULL,
        pagamento TEXT NOT NULL,
        data_ordine TEXT NOT NULL,
        data_consegna TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS ordine_capi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ordine_id INTEGER NOT NULL REFERENCES ordini(id),
        capo_id INTEGER NOT NULL,
        nome_capo TEXT NOT NULL,
        prezzo REAL NOT NULL
      );
    `);

    const inserisciOrdine = database.prepare(`
      INSERT INTO ordini (
        nome, cognome, email, via, cap, citta, totale, pagamento, data_ordine, data_consegna
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const inserisciCapo = database.prepare(`
      INSERT INTO ordine_capi (ordine_id, capo_id, nome_capo, prezzo)
      VALUES (?, ?, ?, ?)
    `);
    const salva = database.transaction(() => {
      const risultato = inserisciOrdine.run(
        dati.nome,
        dati.cognome,
        dati.email,
        dati.via,
        dati.cap,
        dati.citta,
        totale,
        "Pagamento alla consegna",
        dataOrdine,
        dataConsegna,
      );
      const ordineId = Number(risultato.lastInsertRowid);

      for (const capo of capi) {
        inserisciCapo.run(ordineId, capo.id, capo.nome, capo.prezzo);
      }

      return ordineId;
    });

    return salva();
  } finally {
    database.close();
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ errore: "Il contenuto della richiesta non è valido." }, { status: 400 });
  }

  const richiesta = validaDati(body);
  if (!richiesta) {
    return Response.json({ errore: "Controlla i dati inseriti e riprova." }, { status: 400 });
  }

  try {
    const capi = leggiCapiOrdine(richiesta.ids);
    if (capi.length !== richiesta.ids.length) {
      return Response.json({ errore: "Uno o più capi non sono più disponibili." }, { status: 400 });
    }
    if (capi.some((capo) => !Number.isFinite(capo.prezzo) || capo.prezzo < 0)) {
      throw new Error("Il catalogo contiene un prezzo non valido.");
    }

    const totale = Math.round(
      capi.reduce((somma, capo) => somma + capo.prezzo, 0) * 100,
    ) / 100;
    const oggi = new Date().toISOString();
    const consegna = calcolaDataConsegna();
    salvaOrdine(richiesta.dati, capi, totale, oggi, consegna.iso);

    const { SMTP_USER, SMTP_PASS, ORDINI_DESTINATARIO } = process.env;
    if (!SMTP_USER || !SMTP_PASS || !ORDINI_DESTINATARIO) {
      console.error("Email ordine non inviata: configurazione SMTP incompleta.");
    } else {
      const testoEmail = [
        `${richiesta.dati.nome} ${richiesta.dati.cognome} (${richiesta.dati.email}) HA ORDINATO:`,
        ...capi.map((capo) => `- ${capo.nome}: ${capo.prezzo.toFixed(2)} €`),
        `Totale: ${totale.toFixed(2)} € (pagamento alla consegna)`,
        `Indirizzo: ${richiesta.dati.via}, ${richiesta.dati.cap} ${richiesta.dati.citta}`,
        `Consegna stimata: ${consegna.formattata}`,
      ].join("\n");

      try {
        const trasportatore = nodemailer.createTransport({
          service: "gmail",
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        await trasportatore.sendMail({
          from: SMTP_USER,
          to: ORDINI_DESTINATARIO,
          subject: `Nuovo ordine da ${richiesta.dati.nome} ${richiesta.dati.cognome}`,
          text: testoEmail,
        });
      } catch (erroreEmail) {
        console.error("Invio email ordine non riuscito:", erroreEmail);
      }
    }

    return Response.json({ dataConsegna: consegna.formattata });
  } catch (errore) {
    console.error("Salvataggio ordine non riuscito:", errore);
    return Response.json(
      { errore: "Non è stato possibile salvare l’ordine. Riprova tra poco." },
      { status: 500 },
    );
  }
}
