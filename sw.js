const CACHE='soyjordan-v1804';
const FILES=['./index.html','./css/styles.css?v=1804','./js/app-1804.js?v=1804','./manifest.json','./logo.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);const isNav=req.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
 const isCode=url.pathname.endsWith('.js')||url.pathname.endsWith('.css');
 if(isNav||isCode){event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res}).catch(()=>caches.match(req).then(x=>x||caches.match('./index.html'))));return;}
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res})));
});
