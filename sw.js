'use strict';
/* Service Worker — GitHub Pages対応（すべて相対パス）
 * ・アプリ本体(HTML/CSS/JS/SVG/アイコン)：Stale-While-Revalidate（高速起動＆オフライン表示）
 * ・Google Fonts：Stale-While-Revalidate（オフラインでも文字を崩さないため別キャッシュ）
 * ・Yahoo!路線情報／CORSプロキシなど上記以外の外部通信：Service Workerは介入せず常にネットワーク（キャッシュ一切なし）
 * 更新時は CACHE_NAME のバージョンを上げる（古いキャッシュは activate で自動削除） */
const CACHE_NAME = 'train-info-lcd-v8';
const FONT_CACHE = 'train-info-lcd-fonts-v1';
const KEEP = [CACHE_NAME, FONT_CACHE];

const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './tokyo_ja.svg',
  './manifest.json',
  './icon.svg',
  './icon-512.png',
  './apple-touch-icon.png'
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// 絶対にキャッシュしない通信（念のための明示。ここに無い外部ホストも同様に素通しする）
const NETWORK_ONLY_HOSTS = ['transit.yahoo.co.jp', 'train-info-proxy.xiongdayiteng4.workers.dev'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // 1ファイル欠けても(例：PNG未配置)インストール全体が失敗しないよう個別に追加
    await Promise.allSettled(APP_SHELL.map(url => cache.add(new Request(url, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => !KEEP.includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

async function staleWhileRevalidate(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  if (cached) return cached;
  const res = await network;
  if (res) return res;
  if (fallbackUrl) { const fb = await cache.match(fallbackUrl); if (fb) return fb; }
  return Response.error();
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (NETWORK_ONLY_HOSTS.includes(url.hostname)) return; // ブラウザ標準のネットワーク取得に任せる

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, CACHE_NAME, req.mode === 'navigate' ? './index.html' : null));
    return;
  }
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE, null));
    return;
  }
  // それ以外の外部通信は介入しない（＝常にネットワーク・キャッシュなし）
});
