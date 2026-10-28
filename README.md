# Atelier — FE e BE

Il progetto è diviso in due applicazioni:

- `app/` e `public/`: interfaccia Next.js.
- `backend/`: API REST Node.js collegata al database SQLite `negozio.db`.

L’interfaccia legge i capi dall’API tramite `GET /api/capi`, che restituisce `{ capi, totale, filtri }`. L’API filtra per sesso e prezzo numerico; gli stili e le occasioni dell’interfaccia vengono associati agli stili e alle categorie presenti nel database. Le cartelle sorgente contengono immagini ma non prezzi, quindi l’import assegna per ora il prezzo placeholder di `49.99 €` a ogni capo: le fasce media e alta richiedono prezzi reali nel database per restituire risultati.

## Importazione dei capi

Le immagini sorgente vengono lette da `~/Desktop/negozio.db` per impostazione predefinita, copiate in `public/capi/` e collegate alle righe SQLite tramite URL pubblici. Per importare o aggiornare il catalogo:

```bash
npm run import:db
```

Configura `IMAGE_SOURCE_DIR` se la cartella immagini si trova altrove. `DATABASE_PATH` permette di cambiare il percorso del database; il valore predefinito è `negozio.db` nella root del progetto.

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
