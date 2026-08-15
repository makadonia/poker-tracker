const C='pokerlog-v2';
const ASSETS=['./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>self.clients.claim())
)});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const isDoc = e.request.mode==='navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  if(isDoc){
    // ネット優先：新しい版があれば必ずそちらを表示。オフライン時だけキャッシュを使う
    e.respondWith(fetch(e.request).then(res=>{
      const cp=res.clone(); caches.open(C).then(c=>c.put(e.request,cp)); return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    const cp=res.clone(); caches.open(C).then(c=>c.put(e.request,cp)); return res;
  })));
});