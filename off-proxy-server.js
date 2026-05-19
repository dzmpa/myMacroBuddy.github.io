const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");

const PORT = 3001;
const OFF_SEARCH_URL = "https://search.openfoodfacts.org/search";
const OFF_HEADERS = {
  Accept: "application/json",
  "User-Agent": "V6Fitness/6.0 (support@v6fitness.app)",
};

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://127.0.0.1:${PORT}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    });
    response.end();
    return;
  }

  if (requestUrl.pathname === "/health") {
    writeJson(response, 200, {
      ok: true,
      service: "open-food-facts-search-proxy",
    });
    return;
  }

  if (request.method !== "GET" || requestUrl.pathname !== "/openfoodfacts/search") {
    writeJson(response, 404, {
      error: "Route not found.",
    });
    return;
  }

  const upstreamUrl = new URL(OFF_SEARCH_URL);
  requestUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  https
    .get(
      upstreamUrl,
      {
        headers: OFF_HEADERS,
      },
      (upstreamResponse) => {
        let rawBody = "";

        upstreamResponse.setEncoding("utf8");
        upstreamResponse.on("data", (chunk) => {
          rawBody += chunk;
        });
        upstreamResponse.on("end", () => {
          const statusCode = upstreamResponse.statusCode || 502;

          response.writeHead(statusCode, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "no-store",
            "Content-Type":
              upstreamResponse.headers["content-type"] ||
              "application/json; charset=utf-8",
          });
          response.end(rawBody);
        });
      },
    )
    .on("error", () => {
      writeJson(response, 502, {
        error: "Could not reach Open Food Facts.",
      });
    });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Open Food Facts proxy listening on http://127.0.0.1:${PORT}`);
});
