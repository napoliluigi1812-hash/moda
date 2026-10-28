import { notFound } from "next/navigation";
import type { FiltriCapi } from "../../lib/api";
import Catalogo from "../catalogo";
import { repartoDaSlug } from "../reparti";

const FILTRI_PREDEFINITI: FiltriCapi = { sesso: "Donna", stile: "Elegante" };

export default async function RepartoPage({
  params,
  searchParams,
}: PageProps<"/selezione/[reparto]">) {
  const [{ reparto: slug }, query] = await Promise.all([params, searchParams]);
  const categoria = typeof query.categoria === "string" ? query.categoria : undefined;
  const reparto = repartoDaSlug(slug, categoria);
  if (!reparto) notFound();

  const filtri: FiltriCapi = {};
  for (const key of ["sesso", "stile", "occasione", "budget"] as const) {
    const value = query[key];
    if (typeof value === "string") filtri[key] = value;
  }

  const selezione = Object.keys(filtri).length ? filtri : FILTRI_PREDEFINITI;
  const filtriReparto = { ...selezione, categoria: reparto.categoria };

  return <Catalogo filtri={filtriReparto} reparto={reparto} key={JSON.stringify(filtriReparto)} />;
}