/**
 * Service Worker
 */
declare var self: ServiceWorkerGlobalScope;

import composeNotification from '@/sw/compose-notification';

const version = _VERSION_;
const cacheName = `mk-cache-${version}`;

const apiUrl = `${location.origin}/api/`;

// インストールされたとき
self.addEventListener('install', ev => {
	console.info('installed');

	ev.waitUntil(
		caches.open(cacheName)
			.then(cache => {
				return cache.addAll([
					`/?v=${version}`
				]);
			})
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', ev => {
	ev.waitUntil(
		caches.keys()
			.then(cacheNames => Promise.all(
				cacheNames
					.filter((v) => v !== cacheName)
					.map(name => caches.delete(name))
			))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', ev => {
	if (ev.request.method !== 'GET' || ev.request.url.startsWith(apiUrl)) return;
	ev.respondWith(
		caches.match(ev.request)
			.then(response => {
				return response || fetch(ev.request);
			})
			.catch(() => {
				return caches.match(`/?v=${version}`);
			})
	);
});

// プッシュ通知を受け取ったとき
self.addEventListener('push', ev => {
	// クライアント取得
	ev.waitUntil(self.clients.matchAll({
		includeUncontrolled: true
	}).then(async clients => {
		// クライアントがあったらストリームに接続しているということなので通知しない
		if (clients.length != 0) return;

		const { type, body } = ev.data.json();

		return self.registration.showNotification(...(await composeNotification(type, body)));
	}));
});

self.addEventListener('notificationclick', event => {
	event.notification.close();
  
	// Web Push 通知が指定した URL に遷移する
	event.waitUntil(self.clients.openWindow(event.notification.data.url));
  });
