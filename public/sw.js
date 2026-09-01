self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        self.registration.unregister().then(() => {
            return self.clients.matchAll();
        }).then((clients) => {
            clients.forEach((client) => {
                if (client.url && !client.url.includes('/admin/reloj-checador/kiosko')) {
                    client.navigate(client.url);
                }
            });
        })
    );
});
