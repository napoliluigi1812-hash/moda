import type { FiltriCapi } from "../lib/api";

export type Reparto = {
  slug: string;
  categoria: string;
  titolo: string;
  descrizione: string;
};

export const REPARTI: Reparto[] = [
  {
    slug: "giacche",
    categoria: "Giacche",
    titolo: "Giacche",
    descrizione: "Strati sartoriali, volumi puliti e capispalla da ogni giorno.",
  },
  {
    slug: "camicie",
    categoria: "Camicie",
    titolo: "Camicie",
    descrizione: "Pezzi essenziali da portare da soli o da sovrapporre.",
  },
  {
    slug: "pantaloni",
    categoria: "Pantaloni",
    titolo: "Pantaloni",
    descrizione: "Tagli versatili, pensati per accompagnare ogni movimento.",
  },
  {
    slug: "scarpe",
    categoria: "Scarpe",
    titolo: "Scarpe",
    descrizione: "Il dettaglio che dà direzione a tutto il look.",
  },
];

function slugCategoria(categoria: string) {
  return categoria
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "categoria";
}

export function repartoDaCategoria(categoria: string): Reparto {
  return REPARTI.find((reparto) => reparto.categoria === categoria) ?? {
    slug: slugCategoria(categoria),
    categoria,
    titolo: categoria,
    descrizione: "",
  };
}

export function repartoDaSlug(slug: string, categoria?: string): Reparto | undefined {
  if (categoria) return repartoDaCategoria(categoria);
  return REPARTI.find((reparto) => reparto.slug === slug);
}

export function filtriQuery(filtri: FiltriCapi) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(filtri)) {
    if (key !== "categoria" && value) query.set(key, value);
  }

  return query.toString();
}

export function linkReparto(reparto: Reparto, filtri: FiltriCapi) {
  const query = new URLSearchParams(filtriQuery(filtri));
  query.set("categoria", reparto.categoria);
  return `/selezione/${reparto.slug}?${query}`;
}