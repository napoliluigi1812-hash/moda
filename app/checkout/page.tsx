import { redirect } from "next/navigation";
import { leggiCapiOrdine } from "../lib/ordini";
import CheckoutForm from "./checkout-form";

type CheckoutPageProps = {
  searchParams: Promise<{ capi?: string | string[] }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const parametri = await searchParams;
  const valori = Array.isArray(parametri.capi)
    ? parametri.capi
    : parametri.capi
      ? [parametri.capi]
      : [];
  const ids = Array.from(new Set(valori.map((valore) => {
    if (!/^[1-9]\d*$/.test(valore)) return Number.NaN;
    const id = Number(valore);
    return Number.isSafeInteger(id) ? id : Number.NaN;
  })));

  if (ids.length === 0 || ids.some((id) => !Number.isSafeInteger(id))) {
    redirect("/");
  }

  const capi = leggiCapiOrdine(ids);
  if (capi.length !== ids.length) redirect("/");

  return <CheckoutForm capi={capi} />;
}
