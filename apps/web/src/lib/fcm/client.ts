'use client'

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

let app: FirebaseApp | null = null
let messaging: Messaging | null = null

function getFirebase(): FirebaseApp | null {
  if (typeof window === 'undefined') return null
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSy_TODO') return null
  if (app) return app
  if (getApps().length > 0) { app = getApps()[0]; return app }
  app = initializeApp({
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  })
  return app
}

export async function requestPushPermission(): Promise<string | null> {
  const a = getFirebase()
  if (!a) {
    console.warn('[fcm] Firebase nie skonfigurowany (FIREBASE_API_KEY brakuje w .env.local)')
    return null
  }
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null

  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return null

  if (!messaging) messaging = getMessaging(a)

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
    return token
  } catch (err) {
    console.error('[fcm] getToken failed', err)
    return null
  }
}

export function listenForeground(cb: (payload: any) => void): (() => void) | null {
  const a = getFirebase()
  if (!a) return null
  if (!messaging) messaging = getMessaging(a)
  return onMessage(messaging, cb)
}
