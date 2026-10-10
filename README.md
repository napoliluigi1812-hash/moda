# Atelier — FE e BE

Il progetto è diviso in due applicazioni indipendenti:

- `app/` e `public/`: interfaccia Next.js.
- `backend/`: API REST Node.js e catalogo mock locale.

L’interfaccia legge i capi dall’API tramite `GET /api/capi`. Il catalogo è filtrabile con `sesso`, `stile`, `occasione` e `budget`; `GET /api/health` verifica lo stato del servizio. L’endpoint restituisce `{ capi, totale, filtri }` e non dipende da servizi esterni. Il modulo `backend/src/catalog.mjs` è il punto da sostituire quando collegheremo la persistenza reale e l’ingestion schedulata.

## Avvio in locale

Prerequisiti: Node.js 20 o superiore e npm.

Avvia il BE e il FE in **due terminali separati**:

```bash
npm run dev:be
```

```bash
npm run dev:fe
```

Apri [http://localhost:3000](http://localhost:3000). Il BE è disponibile su
[http://localhost:4000](http://localhost:4000); verifica il catalogo con
`http://localhost:4000/api/capi` o la salute con
`http://localhost:4000/api/health`.

La variabile `NEXT_PUBLIC_API_URL` permette di configurare l’indirizzo BE
(default `http://localhost:4000`). `PORT` configura la porta del BE (default
`4000`); `CORS_ORIGINS` accetta una lista separata da virgole di origini FE
(default `http://localhost:3000,http://127.0.0.1:3000`).

## Comandi

```bash
npm run build
npm run lint
npm run test:be
```
