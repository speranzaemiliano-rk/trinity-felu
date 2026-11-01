// Service worker: guarda la app para abrirla sin conexión (la voz y el dictado igual necesitan internet)
const CACHE="trinity-felu-v3";
const ARCHIVOS=["./","./index.html","./manifest.json","./firebase-config.js","./audio/manifest.js","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  if(new URL(e.request.url).pathname.indexOf("/audio/")!==-1&&/\.mp3$/.test(e.request.url))return;   // los mp3 los maneja el navegador solo: Safari exige respuestas parciales (206) y un service worker las rompe
  // primero la red (así siempre ves la última versión); si no hay internet, lo guardado
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
});
