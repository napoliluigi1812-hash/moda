"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

type Colore = {
  nome: string;
  parole: string[];
  etichetta: string;
  tinta: number;
  saturazione: number;
  tono: "colore" | "chiaro" | "scuro";
};

type Props = {
  immagine: string;
  nomeCapo: string;
  colore: Colore | null;
};

function limita(valore: number, minimo: number, massimo: number) {
  return Math.min(massimo, Math.max(minimo, valore));
}

function daHsl(tinta: number, saturazione: number, luminosita: number) {
  const c = (1 - Math.abs(2 * luminosita - 1)) * saturazione;
  const x = c * (1 - Math.abs((tinta / 60) % 2 - 1));
  const m = luminosita - c / 2;
  const [rosso, verde, blu] =
    tinta < 60 ? [c, x, 0]
      : tinta < 120 ? [x, c, 0]
        : tinta < 180 ? [0, c, x]
          : tinta < 240 ? [0, x, c]
            : tinta < 300 ? [x, 0, c]
              : [c, 0, x];
  return [(rosso + m) * 255, (verde + m) * 255, (blu + m) * 255];
}

function mostraAnteprima(
  immagine: HTMLImageElement,
  tela: HTMLCanvasElement,
  maschera: HTMLCanvasElement,
  colore: Colore | null,
) {
  const contesto = tela.getContext("2d", { willReadFrequently: true });
  const contestoMaschera = maschera.getContext("2d", { willReadFrequently: true });
  if (!contesto || !contestoMaschera) return;

  contesto.clearRect(0, 0, tela.width, tela.height);
  contesto.drawImage(immagine, 0, 0, tela.width, tela.height);
  const pixel = contesto.getImageData(0, 0, tela.width, tela.height);
  const selezione = contestoMaschera.getImageData(0, 0, tela.width, tela.height);

  for (let indice = 0; indice < pixel.data.length; indice += 4) {
    const copertura = selezione.data[indice + 3] / 255;
    if (copertura === 0) continue;

    if (colore) {
      const rosso = pixel.data[indice];
      const verde = pixel.data[indice + 1];
      const blu = pixel.data[indice + 2];
      const luminositaOriginale = (0.2126 * rosso + 0.7152 * verde + 0.0722 * blu) / 255;
      const luminosita = colore.tono === "chiaro"
        ? 0.48 + luminositaOriginale * 0.44
        : colore.tono === "scuro"
          ? 0.055 + luminositaOriginale * 0.32
          : 0.09 + luminositaOriginale * 0.76;
      const [nuovoRosso, nuovoVerde, nuovoBlu] = daHsl(
        colore.tinta,
        colore.saturazione,
        limita(luminosita, 0.04, 0.94),
      );
      pixel.data[indice] = rosso * (1 - copertura) + nuovoRosso * copertura;
      pixel.data[indice + 1] = verde * (1 - copertura) + nuovoVerde * copertura;
      pixel.data[indice + 2] = blu * (1 - copertura) + nuovoBlu * copertura;
    } else {
      pixel.data[indice] = pixel.data[indice] * (1 - copertura) + 145 * copertura;
      pixel.data[indice + 1] = pixel.data[indice + 1] * (1 - copertura) + 54 * copertura;
      pixel.data[indice + 2] = pixel.data[indice + 2] * (1 - copertura) + 64 * copertura;
    }
  }

  contesto.putImageData(pixel, 0, 0);
}

export default function AnteprimaColore({ immagine, nomeCapo, colore }: Props) {
  const telaRef = useRef<HTMLCanvasElement>(null);
  const mascheraRef = useRef<HTMLCanvasElement | null>(null);
  const immagineRef = useRef<HTMLImageElement | null>(null);
  const coloreRef = useRef<Colore | null>(null);
  const staDisegnandoRef = useRef(false);
  const [pennello, setPennello] = useState<"aggiungi" | "cancella">("aggiungi");
  const [dimensionePennello, setDimensionePennello] = useState(30);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [areaSelezionata, setAreaSelezionata] = useState(false);

  useEffect(() => {
    coloreRef.current = colore;
  }, [colore]);

  useEffect(() => {
    const tela = telaRef.current;
    if (!tela) return;

    setCaricamento(true);
    setErrore("");
    setAreaSelezionata(false);
    const sorgente = new window.Image();
    sorgente.onload = () => {
      const scala = Math.min(1, 720 / Math.max(sorgente.naturalWidth, sorgente.naturalHeight));
      tela.width = Math.max(1, Math.round(sorgente.naturalWidth * scala));
      tela.height = Math.max(1, Math.round(sorgente.naturalHeight * scala));
      const maschera = document.createElement("canvas");
      maschera.width = tela.width;
      maschera.height = tela.height;
      mascheraRef.current = maschera;
      immagineRef.current = sorgente;
      mostraAnteprima(sorgente, tela, maschera, coloreRef.current);
      setCaricamento(false);
    };
    sorgente.onerror = () => {
      setErrore("Non è stato possibile caricare la foto del capo.");
      setCaricamento(false);
    };
    sorgente.src = immagine;
  }, [immagine]);

  useEffect(() => {
    const tela = telaRef.current;
    const maschera = mascheraRef.current;
    const sorgente = immagineRef.current;
    if (tela && maschera && sorgente) mostraAnteprima(sorgente, tela, maschera, colore);
  }, [colore]);

  function dipingi(event: PointerEvent<HTMLCanvasElement>) {
    const tela = telaRef.current;
    const maschera = mascheraRef.current;
    if (!tela || !maschera) return;

    const rettangolo = tela.getBoundingClientRect();
    const x = ((event.clientX - rettangolo.left) / rettangolo.width) * tela.width;
    const y = ((event.clientY - rettangolo.top) / rettangolo.height) * tela.height;
    const contesto = maschera.getContext("2d");
    if (!contesto) return;

    contesto.globalCompositeOperation = pennello === "cancella" ? "destination-out" : "source-over";
    contesto.strokeStyle = "#ffffff";
    contesto.fillStyle = "#ffffff";
    contesto.lineWidth = dimensionePennello * (tela.width / rettangolo.width);
    contesto.lineCap = "round";
    contesto.lineJoin = "round";
    if (staDisegnandoRef.current) {
      const precedenteX = event.nativeEvent.offsetX;
      const precedenteY = event.nativeEvent.offsetY;
      contesto.lineTo(precedenteX * tela.width / rettangolo.width, precedenteY * tela.height / rettangolo.height);
      contesto.stroke();
    } else {
      contesto.beginPath();
      contesto.arc(x, y, contesto.lineWidth / 2, 0, Math.PI * 2);
      contesto.fill();
      contesto.beginPath();
      contesto.moveTo(x, y);
    }

    const sorgente = immagineRef.current;
    if (sorgente) mostraAnteprima(sorgente, tela, maschera, colore);
    if (pennello === "aggiungi") setAreaSelezionata(true);
  }

  function iniziaDisegno(event: PointerEvent<HTMLCanvasElement>) {
    staDisegnandoRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    dipingi(event);
  }

  function terminaDisegno(event: PointerEvent<HTMLCanvasElement>) {
    staDisegnandoRef.current = false;
    const contesto = mascheraRef.current?.getContext("2d");
    contesto?.beginPath();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function cancellaSelezione() {
    const tela = telaRef.current;
    const maschera = mascheraRef.current;
    const sorgente = immagineRef.current;
    if (!tela || !maschera || !sorgente) return;
    maschera.getContext("2d")?.clearRect(0, 0, maschera.width, maschera.height);
    mostraAnteprima(sorgente, tela, maschera, colore);
    setAreaSelezionata(false);
  }

  return (
    <div className="color-preview-editor">
      {caricamento && <p className="color-preview-status">Caricamento della foto…</p>}
      {errore ? (
        <p className="color-preview-error" role="alert">{errore}</p>
      ) : (
        <canvas
          aria-label={`Foto di ${nomeCapo}. Passa il pennello sulle parti del capo da ricolorare.`}
          className="color-preview-canvas"
          onPointerCancel={terminaDisegno}
          onPointerDown={iniziaDisegno}
          onPointerMove={(event) => {
            if (staDisegnandoRef.current) dipingi(event);
          }}
          onPointerUp={terminaDisegno}
          ref={telaRef}
          role="img"
          style={{ touchAction: "none", visibility: caricamento ? "hidden" : "visible" }}
        />
      )}
      {!caricamento && !errore && (
        <div className="color-mask-tools">
          <p>
            {areaSelezionata
              ? "Area selezionata: il colore verrà applicato solo qui."
              : "Passa il pennello sulla giacca per selezionare solo l’area da ricolorare."}
          </p>
          <div className="color-mask-buttons">
            <button
              aria-pressed={pennello === "aggiungi"}
              className={pennello === "aggiungi" ? "is-active" : ""}
              onClick={() => setPennello("aggiungi")}
              type="button"
            >
              Seleziona
            </button>
            <button
              aria-pressed={pennello === "cancella"}
              className={pennello === "cancella" ? "is-active" : ""}
              onClick={() => setPennello("cancella")}
              type="button"
            >
              Cancella parti
            </button>
            <button onClick={cancellaSelezione} type="button">Azzera</button>
          </div>
          <label className="color-brush-size">
            Dimensione pennello
            <input
              max="72"
              min="8"
              onChange={(event) => setDimensionePennello(Number(event.target.value))}
              type="range"
              value={dimensionePennello}
            />
          </label>
        </div>
      )}
    </div>
  );
}
