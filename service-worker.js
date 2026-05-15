const CACHE_NAME = "diario-de-bordo-v2";
const ARQUIVOS_CACHE = [
  "./",
  "./index.html",
  "./estilo.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ARQUIVOS_CACHE))
      .catch((erro) => {
        console.error("Falha ao salvar arquivos essenciais no cache offline.", erro);
        throw erro;
      })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomesCaches) => {
        return Promise.all(
          nomesCaches
            .filter((nomeCache) => nomeCache !== CACHE_NAME)
            .map((nomeCache) => caches.delete(nomeCache))
        );
      })
      .catch((erro) => {
        console.error("Falha ao limpar caches antigos do Diário de Bordo.", erro);
        throw erro;
      })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      return respostaCache || fetch(event.request).catch((erro) => {
        console.warn("Falha ao buscar recurso na rede. Tentando fallback offline.", event.request.url, erro);

        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return Response.error();
      });
    }).catch((erro) => {
      console.error("Falha ao responder requisição pelo Service Worker.", erro);
      throw erro;
    })
  );
});
