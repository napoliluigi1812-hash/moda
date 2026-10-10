import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link aria-label="Atelier, pagina iniziale" className="wordmark" href="/">
        <span className="wordmark-name">atelier</span>
        <span className="wordmark-caption">STILE PERSONALE</span>
      </Link>

      <nav aria-label="Navigazione principale" className="main-nav">
        <Link href="/">Scopri</Link>
        <Link href="/#metodo">Il metodo</Link>
        <Link href="/assistente">L’assistente</Link>
      </nav>

      <Link aria-label="Inizia a scegliere" className="header-action" href="/">
        <span>La tua selezione</span>
        <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}
