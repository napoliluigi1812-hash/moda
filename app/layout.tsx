import type { Metadata } from "next";
import SiteFooter from "./components/site-footer";
import SiteHeader from "./components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atelier — il tuo stile personale",
  description:
    "Una selezione di capi curata intorno a te, alle occasioni che vivi e al tuo modo di vestire.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html data-scroll-behavior="smooth" lang="it">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
