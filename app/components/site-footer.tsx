import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="footer-wordmark" href="/">
        atelier
      </Link>
      <p>Il piacere di trovare ciò che ti somiglia.</p>
      <span>Un capo alla volta · 2026</span>
    </footer>
  );
}
