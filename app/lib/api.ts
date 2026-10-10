export type FiltriCapi = {
  sesso?: string;
  stile?: string;
  occasione?: string;
  budget?: string;
};

export type Capo = {
  id: string;
  nome: string;
  categoria: string;
  sesso: string;
  stili: string[];
  occasioni: string[];
  prezzo: number;
  colore: string;
  descrizione: string;
  immagine: string;
};

export type RispostaCapi = {
  capi: Capo[];
  totale: number;
  filtri: FiltriCapi;
};

function isCapo(value: unknown): value is Capo {
  if (!value || typeof value !== "object") return false;

  const capo = value as Record<string, unknown>;
  return (
    typeof capo.id === "string" &&
    typeof capo.nome === "string" &&
    typeof capo.categoria === "string" &&
    typeof capo.sesso === "string" &&
    Array.isArray(capo.stili) &&
    capo.stili.every((stile) => typeof stile === "string") &&
    Array.isArray(capo.occasioni) &&
    capo.occasioni.every((occasione) => typeof occasione === "string") &&
    typeof capo.prezzo === "number" &&
    typeof capo.colore === "string" &&
    typeof capo.descrizione === "string" &&
    typeof capo.immagine === "string"
  );
}

function isRispostaCapi(value: unknown): value is RispostaCapi {
  if (!value || typeof value !== "object") return false;
  const risposta = value as Record<string, unknown>;
  return (
    Array.isArray(risposta.capi) &&
    risposta.capi.every(isCapo) &&
    typeof risposta.totale === "number" &&
    Boolean(risposta.filtri) &&
    typeof risposta.filtri === "object"
  );
}

export async function fetchCapi(
  filtri: FiltriCapi,
  signal?: AbortSignal,
): Promise<RispostaCapi> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filtri)) {
    if (value) query.set(key, value);
  }

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(
    /\/$/,
    "",
  );
  const response = await fetch(`${apiUrl}/api/capi?${query.toString()}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Il catalogo non è disponibile (errore ${response.status}).`);
  }

  const data: unknown = await response.json();
  if (!isRispostaCapi(data)) {
    throw new Error("Il servizio ha restituito una risposta non valida.");
  }

  return data;
}
