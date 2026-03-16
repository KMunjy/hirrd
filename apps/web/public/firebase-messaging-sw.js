/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications when app is closed/backgrounded
 *
 * MUST be at root (/firebase-messaging-sw.js) — Firebase requirement
 * Uses importScripts to load Firebase compat SDK (no ES modules in SW)
 *
 * POPIA compliance:
 * - No PII stored in service worker
 * - Notifications reference Hirrd explicitly
 * - Click actions open app (not external URLs)
 */

// Firebase compat SDK for service workers
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in SW context
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || '__FIREBASE_API_KEY__',
  authDomain: self.FIREBASE_AUTH_DOMAIN || '__FIREBASE_AUTH_DOMAIN__',
  projectId: self.FIREBASE_PROJECT_ID || '__FIREBASE_PROJECT_ID__',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || '__FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '__FIREBASE_MESSAGING_SENDER_ID__',
  appId: self.FIREBASE_APP_ID || '__FIREBASE_APP_ID__',
});

const messaging = firebase.messaging();

// Handle background messages (app backgrounded or closed)
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received');

  const { title, body, icon, badge, tag, data } = payload.notification || {};
  const targetUrl = payload.data?.url || '/dashboard';

  self.registration.showNotification(title || 'Hirrd', {
    body: body || 'You have new job matches on Hirrd.',
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: tag || 'hirrd-push',
    data: { url: targetUrl },
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'View →' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  });
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing Hirrd tab if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
