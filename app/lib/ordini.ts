import Database from "better-sqlite3";
import path from "node:path";

export type CapoOrdine = {
  id: number;
  nome: string;
  prezzo: number;
  immagine: string;
};

export function leggiCapiOrdine(ids: number[]): CapoOrdine[] {
  if (ids.length === 0) return [];

  const database = new Database(path.resolve(process.cwd(), "negozio.db"), {
    fileMustExist: true,
    readonly: true,
  });

  try {
    const segnaposto = ids.map(() => "?").join(", ");
    const righe = database
      .prepare(
        `SELECT id, nome, prezzo, immagine FROM capi WHERE id IN (${segnaposto})`,
      )
      .all(...ids) as Array<{
      id: number;
      nome: string;
      prezzo: number | null;
      immagine: string | null;
    }>;
    const capiPerId = new Map(
      righe.map((riga) => [
        riga.id,
        {
          id: riga.id,
          nome: riga.nome,
          prezzo: Number(riga.prezzo),
          immagine: riga.immagine ?? "",
        },
      ]),
    );

    return ids.flatMap((id) => {
      const capo = capiPerId.get(id);
      return capo ? [capo] : [];
    });
  } finally {
    database.close();
  }
}
