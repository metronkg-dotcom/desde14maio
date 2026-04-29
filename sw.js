const CACHE = 'desde14maio-v1';
const ASSETS = [
  './index.html',
  './lua.html',
  './thoseeyes.html',
  './manifest.json',
  './foto1.jpg','./foto2.jpg','./foto3.jpg','./foto4.jpg',
  './foto5.jpg','./foto6.jpg','./foto7.jpg','./foto8.jpg',
  './foto9.jpg','./foto10.jpg','./foto11.jpg','./foto12.jpg',
  './foto13.jpg','./foto14.jpg','./foto15.jpg','./foto16.jpg',
  './lua-preto-e-branco.jpg',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400&display=swap'
];

// Instala e faz cache dos assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Intercepta requests — cache first, fallback network
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// Notificações agendadas
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    agendarNotificacoes();
  }
});

function agendarNotificacoes() {
  const agora = new Date();
  const aniversario = new Date(agora.getFullYear(), 4, 14); // maio = 4
  if (agora > aniversario) aniversario.setFullYear(agora.getFullYear() + 1);
  const ms = aniversario.getTime() - agora.getTime();

  // Notificação no aniversário do namoro
  setTimeout(() => {
    self.registration.showNotification('💜 Feliz aniversário de namoro!', {
      body: `Hoje fazem ${new Date().getFullYear() - 2025} ano(s) juntos. Que venham muitos mais! 🌙`,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'aniversario',
      renotify: true
    });
  }, ms);
}

// Clique na notificação abre o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('./index.html');
    })
  );
});
