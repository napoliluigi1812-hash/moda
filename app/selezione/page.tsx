import Catalogo from "./catalogo";
import type { FiltriCapi } from "../lib/api";

const FILTRI_PREDEFINITI: FiltriCapi = { sesso: "Donna", stile: "Elegante" };

export default async function Selezione({
  searchParams,
}: PageProps<"/selezione">) {
  const parametri = await searchParams;
  const filtri: FiltriCapi = {};

  for (const key of ["sesso", "stile", "occasione", "budget"] as const) {
    const value = parametri[key];
    if (typeof value === "string") filtri[key] = value;
  }

  const selezione = Object.keys(filtri).length ? filtri : FILTRI_PREDEFINITI;
  return <Catalogo filtri={selezione} key={JSON.stringify(selezione)} />;
}
