"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const STILI = ["Elegante", "Minimal", "Casual", "Chic", "Streetwear", "Classico", "Sportivo"];
const OCCASIONI = ["Lavoro", "Serata", "Cerimonia", "Tempo libero", "Viaggio"];
const BUDGET = [
  { valore: "basso", titolo: "Fino a 100 €", dettaglio: "Piccoli investimenti" },
  { valore: "medio", titolo: "100–180 €", dettaglio: "Il giusto equilibrio" },
  { valore: "alto", titolo: "Oltre 180 €", dettaglio: "Un capo speciale" },
];

export default function Home() {
  const [sesso, setSesso] = useState("");
  const [stile, setStile] = useState("");
  const [occasione, setOccasione] = useState("");
  const [budget, setBudget] = useState("");

  const parametri = new URLSearchParams({ sesso, stile, occasione, budget });

  return (
    <main>
      <section className="hero page-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> LA MODA, PIÙ TUA</p>
          <h1>
            Il tuo stile,
            <br />
            <em>in una nuova luce.</em>
          </h1>
          <p className="hero-description">
            Meno cose, scelte meglio. Una selezione pensata intorno a te,
            alle occasioni che vivi e a come vuoi sentirti.
          </p>
          <a className="button button-dark" href="#comincia">
            Trova la tua ispirazione <span aria-hidden="true">↘</span>
          </a>
          <div className="hero-footnote">
            <span className="footnote-stars" aria-hidden="true">✳ ✳ ✳</span>
            <span>Il tuo prossimo capo preferito<br />inizia da una buona intuizione.</span>
          </div>
        </div>

        <div className="hero-visual">
          <Image
            alt="Un look sartoriale dai toni caldi, ispirato alla moda italiana"
            className="hero-image"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 50vw"
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=90"
            unoptimized
          />
          <span className="image-caption">ESSENZIALE, MA MAI SCONTATO</span>
          <div className="hero-stamp">
            <span>01</span>
            <span>il tuo<br />guardaroba</span>
          </div>
        </div>
        <span aria-hidden="true" className="hero-index">A / 26</span>
      </section>

      <section className="manifesto" id="metodo">
        <div className="page-shell manifesto-inner">
          <p className="eyebrow">UNA QUESTIONE PERSONALE</p>
          <p className="manifesto-quote">
            Lo stile non è seguire tutto.
            <br />
            È riconoscere <em>ciò che ti appartiene.</em>
          </p>
          <span className="manifesto-mark" aria-hidden="true">✳</span>
        </div>
      </section>

      <section className="discovery page-shell" id="comincia">
        <div className="discovery-heading">
          <div>
            <p className="eyebrow">IL TUO STILE, PASSO DOPO PASSO</p>
            <h2>Comincia da <em>te.</em></h2>
          </div>
          <p>Quattro piccole scelte, una selezione<br />che parla già la tua lingua.</p>
        </div>

        <div className="discovery-layout">
          <div className="discovery-form">
            <section className="preference-step">
              <div className="step-label"><span>01</span><h3>Per chi stai cercando?</h3></div>
              <div className="option-row">
                {["Donna", "Uomo"].map((opzione) => (
                  <button
                    aria-pressed={sesso === opzione}
                    className={`choice-button ${sesso === opzione ? "is-selected" : ""}`}
                    key={opzione}
                    onClick={() => {
                      setSesso(opzione);
                      setStile("");
                      setOccasione("");
                      setBudget("");
                    }}
                    type="button"
                  >
                    {opzione}<span aria-hidden="true">{sesso === opzione ? "✓" : "↗"}</span>
                  </button>
                ))}
              </div>
            </section>

            {sesso && (
              <section className="preference-step">
                <div className="step-label"><span>02</span><h3>Quale stile ti somiglia?</h3></div>
                <div className="option-row option-row-wrap">
                  {STILI.map((opzione) => (
                    <button
                      aria-pressed={stile === opzione}
                      className={`tag-button ${stile === opzione ? "is-selected" : ""}`}
                      key={opzione}
                      onClick={() => {
                        setStile(opzione);
                        setOccasione("");
                        setBudget("");
                      }}
                      type="button"
                    >
                      {opzione}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {sesso && stile && (
              <section className="preference-step">
                <div className="step-label"><span>03</span><h3>Per quale occasione?</h3></div>
                <div className="option-row option-row-wrap">
                  {OCCASIONI.map((opzione) => (
                    <button
                      aria-pressed={occasione === opzione}
                      className={`tag-button ${occasione === opzione ? "is-selected" : ""}`}
                      key={opzione}
                      onClick={() => {
                        setOccasione(opzione);
                        setBudget("");
                      }}
                      type="button"
                    >
                      {opzione}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {sesso && stile && occasione && (
              <section className="preference-step">
                <div className="step-label"><span>04</span><h3>Che budget hai in mente?</h3></div>
                <div className="budget-options">
                  {BUDGET.map((opzione) => (
                    <button
                      aria-pressed={budget === opzione.valore}
                      className={`budget-button ${budget === opzione.valore ? "is-selected" : ""}`}
                      key={opzione.valore}
                      onClick={() => setBudget(opzione.valore)}
                      type="button"
                    >
                      <span>{opzione.titolo}</span>
                      <small>{opzione.dettaglio}</small>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {sesso && stile && occasione && budget && (
              <Link className="button button-dark discover-button" href={`/selezione?${parametri.toString()}`}>
                La tua selezione <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>

          <aside className="discovery-aside">
            <div className="aside-number">A.<br />STUDIO</div>
            <p className="aside-quote">«Eleganza è quando ciò che indossi racconta qualcosa di te.»</p>
            <span className="aside-rule" />
            <p className="aside-caption">UNA SELEZIONE COSTRUITA INTORNO A TE</p>
          </aside>
        </div>
      </section>

      <section className="closing-note page-shell">
        <span className="closing-symbol" aria-hidden="true">✳</span>
        <p>Un guardaroba più tuo,<br /><em>comincia da qui.</em></p>
        <Link href="#comincia" aria-label="Inizia a scegliere il tuo stile">↗</Link>
      </section>
    </main>
  );
}
