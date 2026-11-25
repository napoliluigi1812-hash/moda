"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { CapoOrdine } from "../lib/ordini";

type CheckoutFormProps = {
  capi: CapoOrdine[];
};

type RispostaOrdine = {
  errore?: string;
  dataConsegna?: string;
};

function formattaPrezzo(prezzo: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(prezzo);
}

export default function CheckoutForm({ capi }: CheckoutFormProps) {
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState("");
  const [dataConsegna, setDataConsegna] = useState("");
  const totale = capi.reduce((somma, capo) => somma + capo.prezzo, 0);

  async function inviaOrdine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInvio(true);
    setErrore("");

    const dati = new FormData(event.currentTarget);
    const payload = {
      nome: String(dati.get("nome") ?? "").trim(),
      cognome: String(dati.get("cognome") ?? "").trim(),
      email: String(dati.get("email") ?? "").trim(),
      via: String(dati.get("via") ?? "").trim(),
      cap: String(dati.get("cap") ?? "").trim(),
      citta: String(dati.get("citta") ?? "").trim(),
      ids: capi.map((capo) => capo.id),
    };

    try {
      const risposta = await fetch("/api/ordini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const risultato = (await risposta.json()) as RispostaOrdine;

      if (!risposta.ok) {
        throw new Error(risultato.errore ?? "Non è stato possibile salvare l’ordine.");
      }
      if (!risultato.dataConsegna) {
        throw new Error("La risposta del server non contiene la data di consegna.");
      }

      setDataConsegna(risultato.dataConsegna);
    } catch (erroreInvio) {
      setErrore(
        erroreInvio instanceof Error
          ? erroreInvio.message
          : "Si è verificato un errore durante l’invio dell’ordine.",
      );
    } finally {
      setInvio(false);
    }
  }

  return (
    <main className="checkout-page page-shell">
      {dataConsegna ? (
        <section className="checkout-confirmation" aria-live="polite">
          <p className="eyebrow">ORDINE CONFERMATO</p>
          <h1>
            Ordine spedito,
            <br />
            <em>in arrivo il {dataConsegna}.</em>
          </h1>
          <p>Grazie per averci scelto!</p>
          <Link className="button button-dark" href="/">
            Torna all’inizio <span aria-hidden="true">↗</span>
          </Link>
        </section>
      ) : (
        <>
          <header className="checkout-header">
            <p className="eyebrow">IL TUO ORDINE</p>
            <h1>
              Quasi tuo.
              <br />
              <em>Consegna a casa.</em>
            </h1>
            <p className="intro-copy">Pagamento alla consegna</p>
          </header>

          <div className="checkout-layout">
            <section className="checkout-summary" aria-labelledby="riepilogo-ordine">
              <div className="checkout-section-heading">
                <h2 id="riepilogo-ordine">Riepilogo</h2>
                <span>{capi.length} {capi.length === 1 ? "capo" : "capi"}</span>
              </div>
              <ul className="checkout-items">
                {capi.map((capo) => (
                  <li className="checkout-item" key={capo.id}>
                    <div className="checkout-item-image">
                      {capo.immagine && (
                        <Image
                          alt={capo.nome}
                          fill
                          sizes="72px"
                          src={capo.immagine}
                          unoptimized
                        />
                      )}
                    </div>
                    <h3>{capo.nome}</h3>
                    <strong>{formattaPrezzo(capo.prezzo)}</strong>
                  </li>
                ))}
              </ul>
              <div className="checkout-total">
                <span>Totale, pagamento alla consegna</span>
                <strong>{formattaPrezzo(totale)}</strong>
              </div>
            </section>

            <form className="checkout-form" onSubmit={inviaOrdine}>
              <div className="checkout-section-heading">
                <h2>Indirizzo di spedizione</h2>
              </div>
              <div className="checkout-fields">
                <label>
                  Nome
                  <input autoComplete="given-name" maxLength={100} name="nome" required />
                </label>
                <label>
                  Cognome
                  <input autoComplete="family-name" maxLength={100} name="cognome" required />
                </label>
                <label className="checkout-field-wide">
                  Email
                  <input
                    autoComplete="email"
                    maxLength={254}
                    name="email"
                    required
                    type="email"
                  />
                </label>
                <label className="checkout-field-wide">
                  Via e numero civico
                  <input
                    autoComplete="street-address"
                    maxLength={200}
                    name="via"
                    placeholder="Es. Via Roma 12"
                    required
                  />
                </label>
                <label>
                  CAP
                  <input
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={5}
                    minLength={5}
                    name="cap"
                    pattern="[0-9]{5}"
                    placeholder="00000"
                    required
                  />
                </label>
                <label>
                  Città
                  <input autoComplete="address-level2" maxLength={100} name="citta" required />
                </label>
              </div>
              {errore && <p className="checkout-error" role="alert">{errore}</p>}
              <button className="button button-dark checkout-submit" disabled={invio} type="submit">
                {invio ? "Invio in corso…" : "Procedi all’ordine"}
                <span aria-hidden="true">↗</span>
              </button>
            </form>
          </div>
        </>
      )}
    </main>
  );
}
