const CACHE="value-pick-v1-5-3";
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","./index.html","./manifest.json"])).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("value-pick-v1-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 if(event.request.mode==="navigate"){
  event.respondWith(fetch(event.request,{cache:"no-store"}).then(r=>{
   const c=r.clone(); caches.open(CACHE).then(x=>x.put("./index.html",c)).catch(()=>{}); return r;
  }).catch(()=>caches.match("./index.html")));
 }else{
  event.respondWith(fetch(event.request).then(r=>{
   const c=r.clone(); caches.open(CACHE).then(x=>x.put(event.request,c)).catch(()=>{}); return r;
  }).catch(()=>caches.match(event.request)));
 }
});
