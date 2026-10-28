"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCapi, type Capo, type FiltriCapi } from "../lib/api";
import {
  filtriQuery,
  linkReparto,
  repartoDaCategoria,
  type Reparto,
} from "./reparti";
import { useOutfit } from "./outfit-context";

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
    <span aria-hidden="true" className="product-art">
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
      <span className="art-caption art-caption-bottom">{capo.categoria}</span>
    </span>
  );
}

const CATEGORY_ORDER = ["Giacche", "Pantaloni", "Camicie", "Scarpe"];

export default function Catalogo({ filtri, reparto }: { filtri: FiltriCapi; reparto?: Reparto }) {
  const [capi, setCapi] = useState<Capo[]>([]);
  const [categorieDisponibili, setCategorieDisponibili] = useState<string[]>([]);
  const [inCaricamento, setInCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [selectedCapoId, setSelectedCapoId] = useState("");
  const { capi: outfitCapi, confermato, toggleCapo, rimuoviCapo, confermaOutfit } = useOutfit();

  useEffect(() => {
    const controller = new AbortController();

    fetchCapi(filtri, controller.signal)
      .then((risposta) => {
        setCapi(risposta.capi);
        setCategorieDisponibili(risposta.categorie);
        setSelectedCapoId((current) =>
          risposta.capi.some((capo) => capo.id === current)
            ? current
            : (risposta.capi[0]?.id ?? ""),
        );
      })
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

  const selectedCapo = capi.find((capo) => capo.id === selectedCapoId);
  const isSelectedForOutfit = selectedCapo
    ? outfitCapi.some((capo) => capo.id === selectedCapo.id)
    : false;
  const repartiDisponibili = categorieDisponibili.map(repartoDaCategoria);
  const categorieOutfit = Array.from(new Set([
    ...categorieDisponibili,
    ...outfitCapi.map((capo) => capo.categoria),
  ]));
  const outfitGroups = categorieOutfit.map((categoria) => ({
    reparto: repartoDaCategoria(categoria),
    capi: outfitCapi.filter((capo) => capo.categoria === categoria),
  }));
  const query = filtriQuery(filtri);
  const capiPerCategoria = Array.from(
    capi.reduce((groups, capo) => {
      const categoria = capo.categoria || "Altri capi";
      const items = groups.get(categoria) ?? [];
      items.push(capo);
      groups.set(categoria, items);
      return groups;
    }, new Map<string, Capo[]>()),
  ).sort(([first], [second]) => {
    const firstIndex = CATEGORY_ORDER.indexOf(first);
    const secondIndex = CATEGORY_ORDER.indexOf(second);
    if (firstIndex === -1 && secondIndex === -1) return first.localeCompare(second, "it");
    if (firstIndex === -1) return 1;
    if (secondIndex === -1) return -1;
    return firstIndex - secondIndex;
  });

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

      {!reparto ? (
        <section className="departments-section page-shell" aria-labelledby="departments-title">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">ESPLORA PER CATEGORIA</p>
              <h2 id="departments-title">Scegli un reparto</h2>
            </div>
            <span className="result-count">
              {inCaricamento ? " " : `${repartiDisponibili.length} categorie`}
            </span>
          </div>
          {inCaricamento && (
            <p className="catalog-message">Stiamo preparando la tua selezione…</p>
          )}
          {!inCaricamento && errore && (
            <div className="catalog-message error-message" role="alert">
              <p>{errore}</p>
              <p>Verifica che il servizio dati sia avviato e riprova.</p>
            </div>
          )}
          {!inCaricamento && !errore && repartiDisponibili.length === 0 && (
            <p className="catalog-message">
              Nessuna categoria contiene capi per questa combinazione.
            </p>
          )}
          {!inCaricamento && !errore && repartiDisponibili.length > 0 && (
            <nav className="department-directory" aria-label="Reparti disponibili">
              {repartiDisponibili.map((item, index) => (
                <Link
                  className="department-entry"
                  href={linkReparto(item, filtri)}
                  key={item.categoria}
                >
                  <span className="department-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="department-copy">
                    <span className="department-title">{item.titolo}</span>
                    <span className="department-description">
                      {item.descrizione || `Esplora i capi della categoria ${item.titolo}.`}
                    </span>
                  </span>
                  <span aria-hidden="true" className="department-arrow">↗</span>
                </Link>
              ))}
            </nav>
          )}
        </section>
      ) : (
      <section className="catalog-section page-shell" aria-labelledby="catalog-title">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">IL GUARDAROBA, RIVISTO</p>
            <h2 id="catalog-title">{reparto?.titolo ?? "La tua selezione"}</h2>
          </div>
          <span className="result-count">
            {inCaricamento ? " " : `${capi.length} ${capi.length === 1 ? "capo" : "capi"}`}
          </span>
        </div>

        <nav className="department-switcher" aria-label="Vai a un altro reparto">
          <span className="department-switcher-label">CAMBIA REPARTO</span>
          <Link className="department-switcher-all" href={`/selezione${query ? `?${query}` : ""}`}>
            Tutti i reparti
          </Link>
          {repartiDisponibili.map((item) => (
            <Link
              aria-current={item.categoria === reparto?.categoria ? "page" : undefined}
              className="department-switcher-link"
              href={linkReparto(item, filtri)}
              key={item.slug}
            >
              {item.titolo}
            </Link>
          ))}
        </nav>

        <div className="catalog-layout">
          <div className="category-browser" aria-live="polite">
            {inCaricamento && (
              <p className="catalog-message">Stiamo preparando la tua selezione…</p>
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

            {!inCaricamento && !errore && capiPerCategoria.map(([categoria, items]) => (
              <section className="category-group" key={categoria} aria-labelledby={`category-${categoria}`}>
                <div className="category-heading">
                  <h3 id={`category-${categoria}`}>{categoria}</h3>
                  <span>{items.length} {items.length === 1 ? "capo" : "capi"}</span>
                </div>
                <div className="product-grid">
                  {items.map((capo, index) => (
                    <button
                      aria-pressed={selectedCapoId === capo.id}
                      className={`product-card ${selectedCapoId === capo.id ? "is-selected" : ""}`}
                      key={capo.id}
                      onClick={() => setSelectedCapoId(capo.id)}
                      type="button"
                    >
                      <span className="product-image-wrap">
                        <IllustrazioneCapo capo={capo} />
                        {capo.immagine && (
                          <Image
                            alt=""
                            className="product-image"
                            fill
                            sizes="(max-width: 700px) 45vw, (max-width: 1000px) 35vw, 22vw"
                            src={capo.immagine}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                            unoptimized
                          />
                        )}
                        <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
                        <span className="product-category">{capo.categoria}</span>
                      </span>
                      <span className="product-details">
                        <span className="product-copy">
                          <span className="product-name">{capo.nome}</span>
                        </span>
                        <span className="product-price">{formattaPrezzo(capo.prezzo)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="preview-panel" aria-label="Anteprima del capo selezionato">
            <div className="preview-panel-heading">
              <span>ANTEPRIMA</span>
              <span>{outfitCapi.length} NELL’OUTFIT</span>
            </div>
            {selectedCapo ? (
              <>
                <div className="preview-image-wrap">
                  <IllustrazioneCapo capo={selectedCapo} />
                  {selectedCapo.immagine && (
                    <Image
                      alt={selectedCapo.nome}
                      className="preview-image"
                      fill
                      sizes="(max-width: 700px) 80vw, 30vw"
                      src={selectedCapo.immagine}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      unoptimized
                    />
                  )}
                </div>
                <p className="preview-category">{selectedCapo.categoria}</p>
                <div className="preview-title-row">
                  <h3>{selectedCapo.nome}</h3>
                  <span>{formattaPrezzo(selectedCapo.prezzo)}</span>
                </div>
                <dl className="preview-facts">
                  <div><dt>Stile</dt><dd>{selectedCapo.stili.join(", ") || "Non specificato"}</dd></div>
                  <div><dt>Categoria</dt><dd>{selectedCapo.categoria}</dd></div>
                </dl>
                <button
                  aria-pressed={isSelectedForOutfit}
                  className={`preview-action ${isSelectedForOutfit ? "is-added" : ""}`}
                  onClick={() => {
                    if (selectedCapo) toggleCapo(selectedCapo);
                  }}
                  type="button"
                >
                  <span aria-hidden="true">{isSelectedForOutfit ? "−" : "+"}</span>
                  {isSelectedForOutfit ? "Rimuovi dall’outfit" : "Aggiungi all’outfit"}
                </button>
                <p className="outfit-summary" aria-live="polite">
                  {outfitCapi.length === 0
                    ? "Il tuo outfit è vuoto."
                    : `${outfitCapi.length} ${outfitCapi.length === 1 ? "capo selezionato" : "capi selezionati"}`}
                </p>
                <section className="outfit-selection" aria-labelledby="outfit-title">
                  <div className="outfit-heading">
                    <h4 id="outfit-title">I tuoi capi</h4>
                    <span>{outfitCapi.length}</span>
                  </div>
                  <div className="outfit-departments">
                    {outfitGroups.map(({ reparto: item, capi: selected }) => (
                      <section className="outfit-department" key={item.slug}>
                        <div className="outfit-department-heading">
                          <h5>{item.titolo}</h5>
                          <span>{selected.length}</span>
                        </div>
                        {selected.length > 0 ? (
                          <ul className="outfit-list">
                            {selected.map((capo) => (
                              <li className="outfit-item" key={capo.id}>
                                <Link
                                  className="outfit-item-main"
                                  href={linkReparto(item, filtri)}
                                >
                                  <span className="outfit-item-image">
                                    {capo.immagine && (
                                      <Image alt="" fill src={capo.immagine} unoptimized />
                                    )}
                                  </span>
                                  <span className="outfit-item-copy">
                                    <span>{capo.nome}</span>
                                    <small>{formattaPrezzo(capo.prezzo)}</small>
                                  </span>
                                </Link>
                                <button
                                  aria-label={`Rimuovi ${capo.nome} dall’outfit`}
                                  className="outfit-remove"
                                  onClick={() => rimuoviCapo(capo.id)}
                                  type="button"
                                >
                                  <span aria-hidden="true">×</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Link className="outfit-department-empty" href={linkReparto(item, filtri)}>
                            Da scegliere <span aria-hidden="true">↗</span>
                          </Link>
                        )}
                      </section>
                    ))}
                  </div>
                  {outfitCapi.length > 0 ? (
                    <Link
                      className="confirm-outfit"
                      href="/selezione/outfit"
                      onClick={confermaOutfit}
                    >
                      Conferma outfit <span aria-hidden="true">↗</span>
                    </Link>
                  ) : (
                    <button className="confirm-outfit" disabled type="button">
                      Conferma outfit <span aria-hidden="true">↗</span>
                    </button>
                  )}
                  {confermato && (
                    <p className="confirmation-message" role="status">
                      Outfit confermato con {outfitCapi.length} {outfitCapi.length === 1 ? "capo" : "capi"}.
                    </p>
                  )}
                </section>
              </>
            ) : (
              <p className="preview-empty">
                {inCaricamento ? "Caricamento anteprima…" : "Seleziona un capo per vederne i dettagli."}
              </p>
            )}
          </aside>
        </div>
      </section>
      )}

      <section className="catalog-signoff page-shell">
        <span>Non serve avere tutto.</span>
        <em>Serve trovare il proprio.</em>
      </section>
    </main>
  );
}
