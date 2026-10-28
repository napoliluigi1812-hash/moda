"use client";

import Image from "next/image";
import Link from "next/link";
import { useOutfit } from "../outfit-context";
import { linkReparto, REPARTI, repartoDaCategoria } from "../reparti";

function formattaPrezzo(prezzo: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(prezzo);
}

export default function OutfitPage() {
  const { capi, confermato } = useOutfit();
  const totale = capi.reduce((sum, capo) => sum + capo.prezzo, 0);
  const repartiOutfit = Array.from(new Set([
    ...REPARTI.map((reparto) => reparto.categoria),
    ...capi.map((capo) => capo.categoria),
  ])).map(repartoDaCategoria);

  return (
    <main className="confirmed-outfit-page page-shell">
      <header className="confirmed-outfit-header">
        <div>
          <p className="eyebrow">{confermato ? "OUTFIT CONFERMATO" : "IL TUO OUTFIT"}</p>
          <h1>
            I capi che
            <br />
            <em>hai scelto.</em>
          </h1>
          <p className="intro-copy">
            La tua selezione, raccolta reparto per reparto.
          </p>
        </div>
        <div className="confirmed-outfit-summary">
          <span>{capi.length} {capi.length === 1 ? "capo" : "capi"}</span>
          <strong>{formattaPrezzo(totale)}</strong>
          <Link href={linkReparto(REPARTI[0], {})}>Continua a scegliere <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      {capi.length > 0 ? (
        <div className="confirmed-outfit-column">
          {repartiOutfit.map((reparto) => {
            const selected = capi.filter((capo) => capo.categoria === reparto.categoria);

            return (
              <section
                aria-labelledby={`outfit-${reparto.slug}`}
                className="confirmed-department"
                key={reparto.slug}
              >
                <div className="confirmed-department-heading">
                  <div>
                    <p className="eyebrow">REPARTO {String(repartiOutfit.indexOf(reparto) + 1).padStart(2, "0")}</p>
                    <h2 id={`outfit-${reparto.slug}`}>{reparto.titolo}</h2>
                  </div>
                  <span>{selected.length} {selected.length === 1 ? "capo" : "capi"}</span>
                </div>
                {selected.length > 0 ? (
                  <ul className="confirmed-garment-list">
                    {selected.map((capo, index) => (
                      <li className="confirmed-garment" key={capo.id}>
                        <span className="confirmed-garment-number">{String(index + 1).padStart(2, "0")}</span>
                        <div className="confirmed-garment-image">
                          {capo.immagine && (
                            <Image alt={capo.nome} fill sizes="100px" src={capo.immagine} unoptimized />
                          )}
                        </div>
                        <div className="confirmed-garment-copy">
                          <p>{capo.categoria}</p>
                          <h3>{capo.nome}</h3>
                          <span>{capo.stili.join(", ") || "Stile non specificato"}</span>
                        </div>
                        <strong className="confirmed-garment-price">{formattaPrezzo(capo.prezzo)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="confirmed-department-empty">Nessun capo selezionato in questo reparto.</p>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <section className="confirmed-outfit-empty">
          <p>Non hai ancora aggiunto capi al tuo outfit.</p>
          <Link className="text-link" href="/selezione">Torna ai reparti <span aria-hidden="true">↗</span></Link>
        </section>
      )}
    </main>
  );
}