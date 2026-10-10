import Link from "next/link";

export default function Assistente() {
  return (
    <main className="assistant-page page-shell">
      <p className="eyebrow">UNA NOTA DI STILE</p>
      <h1>
        Vestirsi bene
        <br />
        <em>comincia da una domanda.</em>
      </h1>
      <p className="assistant-copy">
        Quale parte di te vuoi portare con te oggi? Parti dalle tue preferenze:
        la nostra selezione mock ti aiuta a esplorare capi, occasioni e budget.
      </p>
      <Link className="button button-dark" href="/">
        Raccontaci il tuo stile <span aria-hidden="true">↗</span>
      </Link>
    </main>
  );
}