// Service worker dla FCM web push.
// Uruchamiany przez przeglądarkę poza basePath – musi być w katalogu /public.
// UWAGA: aby ten plik został podany pod /mojapolisa/firebase-messaging-sw.js,
// należy go również skopiować do publicznego root'a serwera. Na Netlify
// odbywa się to automatycznie dzięki basePath i konfiguracji w `next.config.js`.

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

// TODO: uzupełnij na czas buildu (skrypt podstawia z process.env – tu placeholder)
firebase.initializeApp({
  apiKey: 'TODO',
  projectId: 'TODO',
  messagingSenderId: 'TODO',
  appId: 'TODO',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title ?? 'MojaPolisa'
  const options = {
    body: payload?.notification?.body ?? '',
    icon: '/mojapolisa/icon-192.png',
    badge: '/mojapolisa/badge-72.png',
    data: payload?.data,
  }
  self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification?.data?.url ?? '/mojapolisa/dashboard'
  event.waitUntil(clients.openWindow(url))
})
