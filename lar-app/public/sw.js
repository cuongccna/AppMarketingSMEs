// LAR - Local AI Responder Service Worker
// Basic service worker for PWA support

const CACHE_NAME = 'lar-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch event - pass through for now
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
