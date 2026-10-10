import { createServer } from "node:http";
import { getCapi } from "./catalog.mjs";

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function readFilters(searchParams) {
  const filters = {};

  for (const key of ["sesso", "stile", "occasione", "budget"]) {
    const value = searchParams.get(key);
    if (value === null) continue;

    const normalizedValue = value.trim();
    if (!normalizedValue || normalizedValue.length > 60) {
      return { error: `Il filtro "${key}" non è valido.` };
    }
    filters[key] = normalizedValue;
  }

  if (filters.sesso && !["Donna", "Uomo"].includes(filters.sesso)) {
    return { error: 'Il filtro "sesso" deve essere "Donna" oppure "Uomo".' };
  }
  if (filters.budget && !Object.hasOwn({ basso: true, medio: true, alto: true }, filters.budget)) {
    return { error: 'Il filtro "budget" deve essere "basso", "medio" oppure "alto".' };
  }

  return { filters };
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

export function createAppServer({
  allowedOrigins = process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) ??
    defaultOrigins,
} = {}) {
  return createServer((request, response) => {
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      sendJson(response, 403, { error: "Origine non autorizzata." });
      return;
    }

    const corsHeaders = origin
      ? {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Accept, Content-Type",
          Vary: "Origin",
        }
      : {};

    if (request.method === "OPTIONS") {
      response.writeHead(204, corsHeaders);
      response.end();
      return;
    }

    const url = new URL(request.url ?? "/", "http://localhost");

    if (url.pathname === "/api/health" && request.method === "GET") {
      sendJson(
        response,
        200,
        { status: "ok", service: "moda-api", dataSource: "mock" },
        corsHeaders,
      );
      return;
    }

    if (url.pathname === "/api/capi" && request.method === "GET") {
      const parsed = readFilters(url.searchParams);
      if (parsed.error) {
        sendJson(response, 400, { error: parsed.error }, corsHeaders);
        return;
      }

      const results = getCapi(parsed.filters);
      sendJson(
        response,
        200,
        { capi: results, totale: results.length, filtri: parsed.filters },
        corsHeaders,
      );
      return;
    }

    if (url.pathname === "/api/capi" || url.pathname === "/api/health") {
      sendJson(response, 405, { error: "Metodo non supportato." }, {
        ...corsHeaders,
        Allow: "GET, OPTIONS",
      });
      return;
    }

    sendJson(response, 404, { error: "Endpoint non trovato." }, corsHeaders);
  });
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll("\\", "/")}`).href) {
  const port = Number(process.env.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT deve essere un numero intero tra 1 e 65535.");
  }

  const server = createAppServer();
  server.listen(port, "0.0.0.0", () => {
    console.log(`Moda API in ascolto su http://localhost:${port}`);
  });
}
