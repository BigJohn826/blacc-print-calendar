importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
const CACHE="bpe-calendar-static-v3";
const CORE=["./","./index.html","./manifest.json","./assets/bpe-logo.jpg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==self.location.origin||req.headers.has("Authorization"))return;
  if(!["/blacc-print-calendar/","/blacc-print-calendar/index.html","/blacc-print-calendar/manifest.json","/blacc-print-calendar/assets/bpe-logo.jpg"].includes(url.pathname))return;
  e.respondWith(fetch(req).then(resp=>{if(resp.ok){const clone=resp.clone();caches.open(CACHE).then(c=>c.put(req,clone))}return resp}).catch(()=>caches.match(req).then(r=>r||Response.error())));
});