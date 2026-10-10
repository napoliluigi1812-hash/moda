import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { getCapi } from "../src/catalog.mjs";
import { createAppServer } from "../src/server.mjs";

describe("catalogo mock", () => {
  it("filtra i capi per genere, stile, occasione e budget", () => {
    const results = getCapi({
      sesso: "Donna",
      stile: "Elegante",
      occasione: "Lavoro",
      budget: "alto",
    });

    assert.ok(results.length > 0);
    assert.ok(
      results.every(
        (capo) =>
          capo.sesso === "Donna" &&
          capo.stili.includes("Elegante") &&
          capo.occasioni.includes("Lavoro") &&
          capo.prezzo > 180,
      ),
    );
  });

  it("restituisce tutti i capi quando non ci sono filtri", () => {
    assert.equal(getCapi().length, 16);
  });
});

describe("API REST", () => {
  let server;
  let baseUrl;

  before(async () => {
    server = createAppServer({ allowedOrigins: ["http://localhost:3000"] });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it("espone il catalogo e applica i filtri ricevuti", async () => {
    const response = await fetch(
      `${baseUrl}/api/capi?sesso=Donna&stile=Elegante&budget=alto`,
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.capi.length > 0);
    assert.ok(body.capi.every((capo) => capo.sesso === "Donna" && capo.prezzo > 180));
    assert.equal(body.totale, body.capi.length);
  });

  it("rifiuta filtri non validi", async () => {
    const response = await fetch(`${baseUrl}/api/capi?sesso=altro`);

    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, "string");
  });

  it("limita le richieste browser alle origini configurate", async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "https://example.invalid" },
    });

    assert.equal(response.status, 403);
  });
});
