import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultDatabasePath = fileURLToPath(new URL("../../negozio.db", import.meta.url));

const budgetPriceRanges = {
  basso: (prezzo) => prezzo <= 100,
  medio: (prezzo) => prezzo > 100 && prezzo <= 180,
  alto: (prezzo) => prezzo > 180,
};

const styleValues = {
  Elegante: "Elegant",
  Classico: "Classic",
  Sportivo: "Sporty",
};

const occasionValues = {
  Lavoro: "Work",
  Serata: "Evening",
  Cerimonia: "Ceremony",
  "Tempo libero": "Leisure",
  Viaggio: "Travel",
};

function matchesFilters(capo, filters) {
  const { sesso, stile, occasione, budget, categoria } = filters;
  if (sesso && capo.sesso !== sesso) return false;
  if (categoria && capo.categoria !== categoria) return false;
  if (stile && !capo.stili.includes(stile)) return false;
  if (occasione && !capo.occasioni.includes(occasione)) return false;
  if (budget && !budgetPriceRanges[budget](capo.prezzo)) return false;
  return true;
}

export function getCatalogo(
  filters = {},
  databasePath = process.env.DATABASE_PATH ?? defaultDatabasePath,
) {
  const db = new Database(path.resolve(databasePath), { readonly: true, fileMustExist: true });

  try {
    const columns = db.prepare("PRAGMA table_info(capi)").all();
    const hasOccasione = columns.some((column) => column.name === "occasione");
    const rows = db.prepare(`
      SELECT id, nome, stile, sesso, categoria, prezzo, immagine${hasOccasione ? ", occasione" : ""}
      FROM capi
    `)
      .all()
      .map((row) => ({
        id: String(row.id),
        nome: row.nome,
        categoria: row.categoria || "Generico",
        sesso: row.sesso || "Unisex",
        stili: row.stile ? [styleValues[row.stile] ?? row.stile] : [],
        occasioni: typeof row.occasione === "string"
          ? row.occasione
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .map((value) => occasionValues[value] ?? value)
          : [],
        prezzo: Number(row.prezzo ?? 0),
        immagine: row.immagine || "",
      }));
    const filtersWithoutCategory = { ...filters };
    delete filtersWithoutCategory.categoria;
    const categorie = Array.from(
      new Set(rows.filter((capo) => matchesFilters(capo, filtersWithoutCategory))
        .map((capo) => capo.categoria)),
    ).sort((first, second) => first.localeCompare(second, "it"));
    return {
      capi: rows.filter((capo) => matchesFilters(capo, filters)),
      categorie,
    };
  } finally {
    db.close();
  }
}

export function getCapi(filters = {}, databasePath = process.env.DATABASE_PATH ?? defaultDatabasePath) {
  return getCatalogo(filters, databasePath).capi;
}
