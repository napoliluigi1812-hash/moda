"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useOutfit } from "../selezione/outfit-context";
import AnteprimaColore from "./anteprima-colore";

type Colore = {
  nome: string;
  parole: string[];
  etichetta: string;
  tinta: number;
  saturazione: number;
  tono: "colore" | "chiaro" | "scuro";
};

const COLORI: Colore[] = [
  { nome: "rosso", parole: ["rosso", "rossa", "rossi", "rosse"], etichetta: "Rosso", tinta: 0, saturazione: .78, tono: "colore" },
  { nome: "blu", parole: ["blu", "azzurro", "azzurra"], etichetta: "Blu", tinta: 218, saturazione: .72, tono: "colore" },
  { nome: "verde", parole: ["verde", "verdi"], etichetta: "Verde", tinta: 132, saturazione: .55, tono: "colore" },
  { nome: "nero", parole: ["nero", "nera", "neri", "nere"], etichetta: "Nero", tinta: 0, saturazione: .12, tono: "scuro" },
  { nome: "bianco", parole: ["bianco", "bianca", "bianchi", "bianche"], etichetta: "Bianco", tinta: 42, saturazione: .08, tono: "chiaro" },
  { nome: "rosa", parole: ["rosa", "cipria", "fucsia"], etichetta: "Rosa", tinta: 340, saturazione: .55, tono: "colore" },
  { nome: "viola", parole: ["viola", "lilla"], etichetta: "Viola", tinta: 278, saturazione: .55, tono: "colore" },
  { nome: "giallo", parole: ["giallo", "gialla"], etichetta: "Giallo", tinta: 49, saturazione: .68, tono: "colore" },
  { nome: "arancione", parole: ["arancione", "arancio"], etichetta: "Arancione", tinta: 26, saturazione: .75, tono: "colore" },
  { nome: "marrone", parole: ["marrone", "marroni", "cacao", "cioccolato"], etichetta: "Marrone", tinta: 25, saturazione: .48, tono: "colore" },
  { nome: "grigio", parole: ["grigio", "grigia", "grigi", "grigie"], etichetta: "Grigio", tinta: 0, saturazione: .04, tono: "colore" },
  { nome: "beige", parole: ["beige", "sabbia", "avorio"], etichetta: "Beige", tinta: 38, saturazione: .30, tono: "chiaro" },
];

type Messaggio = { id: number; testo: string; autore: "assistente" | "utente" };

export default function Assistente() {
  const { capi } = useOutfit();
  const [capoId, setCapoId] = useState(capi[0]?.id ?? "");
  const [colore, setColore] = useState<Colore | null>(null);
  const [testo, setTesto] = useState("");
  const [messaggi, setMessaggi] = useState<Messaggio[]>([
    {
      id: 0,
      autore: "assistente",
      testo: "Ciao! Scegli un capo del tuo outfit e dimmi di che colore vuoi vederlo, per esempio: «Vorrei la giacca rossa».",
    },
  ]);
  const capo = capi.find((item) => item.id === capoId);

  function inviaMessaggio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const richiesta = testo.trim();
    if (!richiesta) return;

    const paroleRichiesta = richiesta.toLocaleLowerCase("it").match(/[\p{L}]+/gu) ?? [];
    const coloreRichiesto = COLORI.find((opzione) =>
      opzione.parole.some((parolaColore) =>
        paroleRichiesta.some((parolaRichiesta) => parolaRichiesta === parolaColore),
      ),
    );
    const risposta = !capo
      ? "Prima aggiungi almeno un capo al tuo outfit e poi torna qui per provarne un colore."
      : coloreRichiesto
        ? `Ho impostato ${coloreRichiesto.etichetta.toLowerCase()} per «${capo.nome}». Passa il pennello sulla giacca: verrà ricolorata solo l’area selezionata.`
        : "Non ho riconosciuto un colore. Prova con rosso, blu, verde, nero, bianco, rosa, viola, giallo, arancione, marrone, grigio o beige.";

    if (coloreRichiesto && capo) setColore(coloreRichiesto);
    setMessaggi((precedenti) => [
      ...precedenti,
      { id: Date.now(), autore: "utente", testo: richiesta },
      { id: Date.now() + 1, autore: "assistente", testo: risposta },
    ]);
    setTesto("");
  }

  function scegliCapo(id: string) {
    setCapoId(id);
    setColore(null);
  }

  return (
    <main className="assistant-page page-shell">
      <p className="eyebrow">ASSISTENTE COLORE</p>
      <h1>
        Un colore diverso,
        <br />
        <em>sempre il tuo stile.</em>
      </h1>
      <p className="assistant-copy">
        Scegli un capo del tuo outfit e chiedi di provarlo in un altro colore.
        Seleziona a mano la zona del capo da ricolorare: il resto della foto rimane invariato.
      </p>

      {capi.length ? (
        <section className="color-chat-layout" aria-label="Anteprima e chat per cambiare colore">
          <div className="color-preview">
            <p className="eyebrow">ANTEPRIMA DEL CAPO</p>
            <div className="color-preview-image">
              {capo?.immagine ? (
                <AnteprimaColore
                  colore={colore}
                  immagine={capo.immagine}
                  key={capo.id}
                  nomeCapo={capo.nome}
                />
              ) : (
                <p>Immagine non disponibile</p>
              )}
            </div>
            <h2>{capo?.nome}</h2>
            <p>{capo?.categoria}{colore ? ` · simulazione ${colore.etichetta.toLowerCase()}` : ""}</p>
            <label className="color-item-select">
              <span>Capo da modificare</span>
              <select value={capoId} onChange={(event) => scegliCapo(event.target.value)}>
                {capi.map((item) => (
                  <option key={item.id} value={item.id}>{item.nome} — {item.categoria}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="color-chat">
            <div className="color-chat-messages" aria-live="polite">
              {messaggi.map((messaggio) => (
                <p className={`color-chat-message is-${messaggio.autore}`} key={messaggio.id}>
                  {messaggio.testo}
                </p>
              ))}
            </div>
            <form className="color-chat-form" onSubmit={inviaMessaggio}>
              <label className="sr-only" htmlFor="color-chat-input">Scrivi il colore che vuoi provare</label>
              <input
                autoComplete="off"
                id="color-chat-input"
                onChange={(event) => setTesto(event.target.value)}
                placeholder="Es. Cambia la giacca in rosso"
                value={testo}
              />
              <button className="button button-dark" type="submit">Invia <span aria-hidden="true">↗</span></button>
            </form>
            <p className="color-chat-note">
              Il cambio è una simulazione locale limitata alla zona dipinta. Ombre e dettagli sono mantenuti in modo approssimativo; foto e database non vengono modificati.
            </p>
          </div>
        </section>
      ) : (
        <section className="color-chat-empty">
          <p>Non hai ancora capi selezionati. Scegline qualcuno per iniziare a provare i colori.</p>
          <Link className="button button-dark" href="/selezione">Vai ai reparti <span aria-hidden="true">↗</span></Link>
        </section>
      )}
    </main>
  );
}
