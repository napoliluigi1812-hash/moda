import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { after, before, describe, it } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getCapi, getCatalogo } from "../src/catalog.mjs";
import { createAppServer } from "../src/server.mjs";

describe("catalogo SQLite", () => {
  let directory;
  let databasePath;

  before(() => {
    directory = mkdtempSync(path.join(tmpdir(), "moda-catalog-"));
    databasePath = path.join(directory, "negozio.db");
    const db = new Database(databasePath);
    db.exec(`
      CREATE TABLE capi (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        stile TEXT,
        sesso TEXT,
        categoria TEXT,
        occasione TEXT,
        prezzo REAL,
        immagine TEXT
      );
      INSERT INTO capi VALUES
        (1, 'Top 01', 'Elegant', 'Donna', 'Body', 'Work,Ceremony', 49.99, '/capi/ELEGANTE/DONNA/BODY/top_01.jpg'),
        (2, 'Giacca 01', 'Casual', 'Uomo', 'Giacche', 'Evening', 149.99, '/capi/CASUAL/UOMO/GIACCHE/giacca_01.jpg'),
        (3, 'Abito 01', 'Elegant', 'Donna', 'Abiti', 'Evening', 89.99, '/capi/ELEGANTE/DONNA/ABITI/abito_01.jpg'),
        (4, 'Top Lavoro', 'Elegante', 'Donna', 'Body', 'Lavoro', 49.99, '/capi/ELEGANTE/DONNA/BODY/top_lavoro.jpg'),
        (5, 'Abito Serata', 'Elegante', 'Donna', 'Abiti', 'Serata', 89.99, '/capi/ELEGANTE/DONNA/ABITI/abito_serata.jpg'),
        (6, 'Top Evening', 'Elegant', 'Donna', 'Top', 'Evening', 49.99, '/capi/ELEGANTE/DONNA/TOP/top_evening.jpg');
    `);
    db.close();
  });

  after(() => rmSync(directory, { recursive: true, force: true }));

  it("legge e filtra i capi importati", () => {
    const results = getCapi({
      sesso: "Donna",
      stile: "Elegant",
      occasione: "Work",
      budget: "basso",
    }, databasePath);

    assert.equal(results.length, 2);
    assert.equal(results[0].id, "1");
    assert.equal(results[0].immagine, "/capi/ELEGANTE/DONNA/BODY/top_01.jpg");
    assert.deepEqual(results[0].occasioni, ["Work", "Ceremony"]);
    assert.equal("colore" in results[0], false);
    assert.equal("descrizione" in results[0], false);
  });

  it("filtra occasioni esattamente e riconosce valori separati da virgole", () => {
    assert.deepEqual(
      getCapi({ occasione: "Evening" }, databasePath).map((capo) => capo.id),
      ["2", "3", "5", "6"],
    );
    assert.deepEqual(
      getCapi({ occasione: "Work" }, databasePath).map((capo) => capo.id),
      ["1", "4"],
    );
    assert.deepEqual(
      getCapi({ occasione: "Ceremony" }, databasePath).map((capo) => capo.id),
      ["1"],
    );
    assert.deepEqual(getCapi({ occasione: "Unknown" }, databasePath), []);
  });

  it("filtra lo stile con corrispondenza esatta", () => {
    assert.deepEqual(
      getCapi({ stile: "Elegant" }, databasePath).map((capo) => capo.id),
      ["1", "3", "4", "5", "6"],
    );
    assert.deepEqual(
      getCapi({ stile: "Minimal" }, databasePath).map((capo) => capo.id),
      [],
    );
  });

  it("non richiede la colonna occasione nei database precedenti", () => {
    const legacyDatabasePath = path.join(directory, "legacy.db");
    const db = new Database(legacyDatabasePath);
    db.exec(`
      CREATE TABLE capi (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        stile TEXT,
        sesso TEXT,
        categoria TEXT,
        prezzo REAL,
        immagine TEXT
      );
      INSERT INTO capi VALUES
        (1, 'Top 01', 'Elegant', 'Donna', 'Body', 49.99, '/capi/top_01.jpg');
    `);
    db.close();

    assert.deepEqual(getCapi({}, legacyDatabasePath)[0].occasioni, []);
    assert.deepEqual(getCapi({ occasione: "Evening" }, legacyDatabasePath), []);
  });

  it("filtra il budget sul prezzo numerico memorizzato", () => {
    const results = getCapi({ budget: "medio" }, databasePath);

    assert.deepEqual(results.map((capo) => capo.id), ["2"]);
  });

  it("seleziona un singolo reparto dal database", () => {
    const results = getCapi({ categoria: "Giacche" }, databasePath);

    assert.deepEqual(results.map((capo) => capo.categoria), ["Giacche"]);
    assert.deepEqual(results.map((capo) => capo.id), ["2"]);
  });

  it("calcola le categorie disponibili per l'occasione ignorando il reparto aperto", () => {
    const catalogo = getCatalogo({ occasione: "Evening", categoria: "Abiti" }, databasePath);

    assert.deepEqual(catalogo.capi.map((capo) => capo.id), ["3", "5"]);
    assert.deepEqual(catalogo.categorie, ["Abiti", "Giacche", "Top"]);
  });
});

describe("API REST", () => {
  let server;
  let baseUrl;
  let databasePath;

  before(async () => {
    const directory = mkdtempSync(path.join(tmpdir(), "moda-api-"));
    databasePath = path.join(directory, "negozio.db");
    const db = new Database(databasePath);
    db.exec(`
      CREATE TABLE capi (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        stile TEXT,
        sesso TEXT,
        categoria TEXT,
        occasione TEXT,
        prezzo REAL,
        immagine TEXT
      );
      INSERT INTO capi VALUES
        (1, 'Top Work', 'Elegant', 'Donna', 'Body', 'Work', 49.99, '/capi/ELEGANTE/DONNA/BODY/top_work.jpg'),
        (2, 'Top Evening', 'Elegant', 'Donna', 'Body', 'Evening', 49.99, '/capi/ELEGANTE/DONNA/BODY/top_evening.jpg'),
        (3, 'Dress Ceremony', 'Elegant', 'Donna', 'Abiti', 'Ceremony', 89.99, '/capi/ELEGANTE/DONNA/ABITI/dress_ceremony.jpg'),
        (4, 'Top Leisure', 'Elegant', 'Donna', 'Body', 'Leisure', 49.99, '/capi/ELEGANTE/DONNA/BODY/top_leisure.jpg'),
        (5, 'Jacket Travel', 'Elegant', 'Donna', 'Giacche', 'Travel', 99.99, '/capi/ELEGANTE/DONNA/GIACCHE/jacket_travel.jpg'),
        (6, 'Top Category Evening', 'Elegant', 'Donna', 'Top', 'Evening', 49.99, '/capi/ELEGANTE/DONNA/TOP/top_category_evening.jpg'),
        (7, 'Jacket Evening', 'Elegant', 'Donna', 'Giacche', 'Evening', 99.99, '/capi/ELEGANTE/DONNA/GIACCHE/jacket_evening.jpg');
    `);
    db.close();
    server = createAppServer({ allowedOrigins: ["http://localhost:3000"], databasePath });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    rmSync(path.dirname(databasePath), { recursive: true, force: true });
  });

  it("espone il catalogo e applica i filtri ricevuti", async () => {
    const response = await fetch(
      `${baseUrl}/api/capi?sesso=Donna&stile=Elegant&occasione=Work&budget=basso`,
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body.capi.map((capo) => capo.id), ["1"]);
    assert.ok(body.capi.every((capo) => capo.sesso === "Donna" && capo.prezzo < 100));
    assert.deepEqual(body.capi[0].occasioni, ["Work"]);
    assert.equal(body.capi[0].immagine, "/capi/ELEGANTE/DONNA/BODY/top_work.jpg");
    assert.equal(body.totale, body.capi.length);
    assert.deepEqual(body.categorie, ["Body"]);
  });

  it("accetta e filtra le occasioni supportate esattamente", async () => {
    for (const occasione of ["Work", "Evening", "Ceremony", "Leisure", "Travel"]) {
      const response = await fetch(
        `${baseUrl}/api/capi?occasione=${encodeURIComponent(occasione)}`,
      );
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.ok(body.capi.length > 0);
      assert.ok(body.capi.every((capo) => capo.occasioni.includes(occasione)));
      assert.deepEqual(
        body.categorie,
        [...new Set(body.capi.map((capo) => capo.categoria))].sort((a, b) => a.localeCompare(b, "it")),
      );
    }
  });

  it("rifiuta filtri non validi", async () => {
    const response = await fetch(`${baseUrl}/api/capi?sesso=altro`);

    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, "string");
  });

  it("accetta categorie provenienti dal database e restituisce tutte quelle disponibili", async () => {
    const response = await fetch(
      `${baseUrl}/api/capi?occasione=Evening&categoria=Giacche`,
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body.capi.map((capo) => capo.categoria), ["Giacche"]);
    assert.deepEqual(body.categorie, ["Body", "Giacche", "Top"]);
    const topResponse = await fetch(`${baseUrl}/api/capi?categoria=Top`);
    const topBody = await topResponse.json();
    assert.equal(topResponse.status, 200);
    assert.deepEqual(topBody.capi.map((capo) => capo.categoria), ["Top"]);
  });

  it("limita le richieste browser alle origini configurate", async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "https://example.invalid" },
    });

    assert.equal(response.status, 403);
  });
});