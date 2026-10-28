"use client";

import { createContext, useContext, useState } from "react";
import type { Capo } from "../lib/api";

type OutfitContextValue = {
  capi: Capo[];
  confermato: boolean;
  toggleCapo: (capo: Capo) => void;
  rimuoviCapo: (id: string) => void;
  confermaOutfit: () => void;
};

const OutfitContext = createContext<OutfitContextValue | null>(null);

export function OutfitProvider({ children }: { children: React.ReactNode }) {
  const [capi, setCapi] = useState<Capo[]>([]);
  const [confermato, setConfermato] = useState(false);

  function toggleCapo(capo: Capo) {
    setConfermato(false);
    setCapi((current) =>
      current.some((item) => item.id === capo.id)
        ? current.filter((item) => item.id !== capo.id)
        : [...current, capo],
    );
  }

  function rimuoviCapo(id: string) {
    setConfermato(false);
    setCapi((current) => current.filter((capo) => capo.id !== id));
  }

  return (
    <OutfitContext.Provider
      value={{
        capi,
        confermato,
        toggleCapo,
        rimuoviCapo,
        confermaOutfit: () => setConfermato(true),
      }}
    >
      {children}
    </OutfitContext.Provider>
  );
}

export function useOutfit() {
  const context = useContext(OutfitContext);
  if (!context) throw new Error("useOutfit deve essere usato dentro OutfitProvider.");
  return context;
}