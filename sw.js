const CACHE="soyjordan-v1804";
const STATIC=["./manifest.json","./sj-shield-v1798.jpg","./sj-shield-v1798.svg","./sj-shield-180-v1798.png","./sj-shield-192-v1798.png","./sj-shield-512-v1798.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const isNav=e.request.mode==="navigate"||e.request.destination==="document";if(isNav){e.respondWith(fetch(new Request(e.request,{cache:"no-store"})).catch(()=>caches.match("./index.html")));return;}e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
