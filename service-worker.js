const CACHE_NAME = "diario-de-bordo-v3";
const ARQUIVOS_CACHE = [
  "./index.html",
  "./estilo.min.css",
  "./script.min.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  console.log("[SW] Instalando cache:", CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARQUIVOS_CACHE))
      .then(() => self.skipWaiting())
      .catch((erro) => {
        console.error("[SW] Falha ao salvar arquivos essenciais no cache offline.", erro);
        throw erro;
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Ativando service worker e removendo caches antigos.");

  event.waitUntil(
    caches.keys()
      .then((nomesCaches) => Promise.all(
        nomesCaches
          .filter((nomeCache) => nomeCache !== CACHE_NAME)
          .map((nomeCache) => caches.delete(nomeCache))
      ))
      .then(() => self.clients.claim())
      .catch((erro) => {
        console.error("[SW] Falha ao limpar caches antigos.", erro);
        throw erro;
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
          );
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((respostaCache) => {
        if (respostaCache) {
          return respostaCache;
        }

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response;
            }

            const responseClone = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
            );
            return response;
          })
          .catch((erro) => {
            console.warn("[SW] Recurso não encontrado em cache e rede indisponível:", request.url, erro);
            return Response.error();
          });
      })
      .catch((erro) => {
        console.error("[SW] Falha ao responder requisição pelo Service Worker.", erro);
        throw erro;
      })
  );
});
