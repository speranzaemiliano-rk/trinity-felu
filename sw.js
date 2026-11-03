// Service worker: guarda la app para abrirla sin conexión (la voz y el dictado igual necesitan internet)
const CACHE="trinity-felu-v15";
// Sirve al inicio («./», con el menú) y a los tres módulos (Felu en «./felu/», Raphina en «./raphina/» y «Sala de 5» en «./sala5/»). Felu y Raphina comparten motor, estilos y audios; «Sala de 5» trae los suyos.
// («./felu/» va aparte de «./felu/index.html»: la app instalada abre la carpeta, y para el caché es otra dirección)
const ARCHIVOS=["./","./index.html","./manifest.json","./icon.svg","./icon-192.png","./icon-512.png","./estilos.css","./comun.js","./escucha.js","./contenido-g3.js","./contenido-g4.js","./motor.js","./firebase-config.js","./audio/manifest.js","./felu/","./felu/index.html","./felu/manifest.json","./felu/icon.svg","./felu/icon-192.png","./felu/icon-512.png","./raphina/","./raphina/index.html","./raphina/manifest.json","./raphina/icon.svg","./raphina/icon-192.png","./raphina/icon-512.png","./sala5/","./sala5/index.html","./sala5/manifest.json","./sala5/icon.svg","./sala5/icon-192.png","./sala5/icon-512.png","./sala5/sala5.css","./sala5/contenido.js","./sala5/juego.js","./sala5/audio/manifest.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  if(/[?&](c|v)=\d+/.test(new URL(e.request.url).search))return;   // consulta de versión nueva (?c=) y recarga (?v=): directo a la red, sin guardarlas
  if(new URL(e.request.url).pathname.indexOf("/audio/")!==-1&&/\.mp3$/.test(e.request.url))return;   // los mp3 los maneja el navegador solo: Safari exige respuestas parciales (206) y un service worker las rompe
  // primero la red (así siempre ves la última versión). Sin internet: lo guardado con esa misma dirección; si no, el mismo archivo con otra «?b=» (la página pide una versión y puede haber quedado guardada otra); y como último recurso la portada de LO QUE SE ABRIÓ (el módulo de Felu, el de Raphina, «Sala de 5» o el inicio: nunca la de otro)
  const ruta=new URL(e.request.url).pathname,propia=ruta.indexOf("/raphina/")!==-1?"./raphina/index.html":ruta.indexOf("/felu/")!==-1?"./felu/index.html":ruta.indexOf("/sala5/")!==-1?"./sala5/index.html":"./index.html";
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match(e.request,{ignoreSearch:true})).then(r=>r||caches.match(propia))));
});
