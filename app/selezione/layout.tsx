import type { ReactNode } from "react";
import { OutfitProvider } from "./outfit-context";

export default function SelezioneLayout({ children }: { children: ReactNode }) {
  return <OutfitProvider>{children}</OutfitProvider>;
}