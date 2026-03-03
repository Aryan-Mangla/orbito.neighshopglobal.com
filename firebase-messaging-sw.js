/* Firebase Cloud Messaging – background handler (config from firebase_data.txt) */
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyChRGHgRGBr2YJEHsMK2HlbuwErO36McRk",
  authDomain: "neighshop-global-crm.firebaseapp.com",
  projectId: "neighshop-global-crm",
  storageBucket: "neighshop-global-crm.firebasestorage.app",
  messagingSenderId: "714821751914",
  appId: "1:714821751914:web:f01ab6fabc1019c91b6613",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || "Notification";
  const body = payload.notification?.body || payload.data?.body || "";
  const data = payload.data || {};
  const tag = data.type || "fcm-notification";
  const requireInteraction = data.notification_type === "urgent";

  return self.registration.showNotification(title, {
    body,
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag,
    requireInteraction,
    data: { url: getClickUrl(data), ...data },
  });
});

function getClickUrl(data) {
  const type = data.type;
  if (type === "task_assigned" && data.task_id) return "/tasks";
  if (type === "lead_assigned" && data.lead_id) return "/leads/" + data.lead_id;
  if (type === "admin_notification") return "/";
  return "/";
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const url = data.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Offline fallback (SPA)
const CACHE = "pm-fcm-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add("/index.html")).then(() => self.skipWaiting()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => caches.match("/index.html")));
});
