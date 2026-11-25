"use client";

import type { ReactNode } from "react";
import { OutfitProvider } from "./selezione/outfit-context";

export default function Providers({ children }: { children: ReactNode }) {
  return <OutfitProvider>{children}</OutfitProvider>;
}
