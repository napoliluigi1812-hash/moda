"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCapi, type Capo, type FiltriCapi } from "../lib/api";

function formattaPrezzo(prezzo: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(prezzo);
}

function IllustrazioneCapo({ capo }: { capo: Capo }) {
  const tinta = capo.sesso === "Donna" ? "#825b4d" : "#4d554d";
  const telaId = `tela-${capo.id}`;

  return (
    <div aria-hidden="true" className="product-art">
      <span className="art-caption">{capo.sesso === "Donna" ? "ESSENZIALE" : "SARTORIA"}</span>
      <svg className="art-garment" viewBox="0 0 360 420" focusable="false">
        <defs>
          <linearGradient id={telaId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={tinta} />
            <stop offset="100%" stopColor="#3e4035" />
          </linearGradient>
        </defs>
        <circle cx="226" cy="158" r="126" fill="rgb(255 255 255 / 24%)" />
        <ellipse cx="183" cy="359" rx="118" ry="15" fill="rgb(36 36 31 / 10%)" />
        <path
          d="m133 110 31-25 16 17 16-17 31 25 36 46-23 17-20-22 10 178H130l10-178-20 22-23-17z"
          fill={`url(#${telaId})`}
        />
        <path d="m164 85 16 39-23 25-24-39zm32 0-16 39 23 25 24-39z" fill="#e2d8c8" />
        <path d="M180 124v177" fill="none" stroke="rgb(255 255 255 / 32%)" strokeWidth="2" />
        <circle cx="188" cy="202" r="3" fill="#e2d8c8" />
        <circle cx="188" cy="228" r="3" fill="#e2d8c8" />
        <circle cx="188" cy="254" r="3" fill="#e2d8c8" />
      </svg>
      <span className="art-caption art-caption-bottom">{capo.categoria} · {capo.colore}</span>
    </div>
  );
}

export default function Catalogo({ filtri }: { filtri: FiltriCapi }) {
  const [capi, setCapi] = useState<Capo[]>([]);
  const [inCaricamento, setInCaricamento] = useState(true);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetchCapi(filtri, controller.signal)
      .then((risposta) => setCapi(risposta.capi))
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name === "AbortError") return;
        setErrore(
          reason instanceof Error
            ? reason.message
            : "Non è stato possibile caricare la selezione.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setInCaricamento(false);
      });

    return () => controller.abort();
  }, [filtri]);

  const descrizioneFiltri = [
    filtri.sesso,
    filtri.stile,
    filtri.occasione,
    filtri.budget === "basso"
      ? "Fino a 100 €"
      : filtri.budget === "medio"
        ? "100–180 €"
        : filtri.budget === "alto"
          ? "Oltre 180 €"
          : null,
  ].filter(Boolean);

  return (
    <main>
      <section className="selection-intro page-shell">
        <div>
          <p className="eyebrow">UNA SELEZIONE CURATA PER TE</p>
          <h1>
            Un buon inizio
            <br />
            <em>ti somiglia.</em>
          </h1>
          <p className="intro-copy">
            Capi scelti con cura, in linea con il tuo stile e con il tuo modo
            di vivere le giornate.
          </p>
        </div>
        <div className="selection-note">
          <span className="note-symbol" aria-hidden="true">✳</span>
          <span>La tua ricerca</span>
          <p>{descrizioneFiltri.join(" · ")}</p>
          <Link href="/">Modifica le preferenze <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="catalog-section page-shell" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">IL GUARDAROBA, RIVISTO</p>
            <h2 id="catalog-title">Giacca &amp; dintorni</h2>
          </div>
          <span className="result-count">
            {inCaricamento ? " " : `${capi.length} ${capi.length === 1 ? "capo" : "capi"}`}
          </span>
        </div>

        {inCaricamento && (
          <p aria-live="polite" className="catalog-message">Stiamo preparando la tua selezione…</p>
        )}
        {!inCaricamento && errore && (
          <div className="catalog-message error-message" role="alert">
            <p>{errore}</p>
            <p>Verifica che il servizio dati sia avviato e riprova.</p>
          </div>
        )}
        {!inCaricamento && !errore && capi.length === 0 && (
          <div className="catalog-message">
            <p>Questa combinazione non ha ancora capi abbinati.</p>
            <Link className="text-link" href="/">Prova altre preferenze <span aria-hidden="true">↗</span></Link>
          </div>
        )}

        {!inCaricamento && !errore && capi.length > 0 && (
          <div className="product-grid">
            {capi.map((capo, index) => (
              <article className="product-card" key={capo.id}>
                <div className="product-image-wrap">
                  <IllustrazioneCapo capo={capo} />
                  <Image
                    alt={capo.nome}
                    className="product-image"
                    fill
                    priority={index < 2}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={capo.immagine}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    unoptimized
                  />
                  <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="product-category">{capo.categoria}</span>
                </div>
                <div className="product-details">
                  <div>
                    <p className="product-color">{capo.colore}</p>
                    <h3>{capo.nome}</h3>
                  </div>
                  <span className="product-price">{formattaPrezzo(capo.prezzo)}</span>
                </div>
                <p className="product-description">{capo.descrizione}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="catalog-signoff page-shell">
        <span>Non serve avere tutto.</span>
        <em>Serve trovare il proprio.</em>
      </section>
    </main>
  );
}
