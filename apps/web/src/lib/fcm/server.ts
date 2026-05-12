/**
 * FCM server-side: wysyłanie push z API routes.
 *
 * Wymaga FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL w .env.local.
 * Bez nich – stub loguje do konsoli.
 */

interface PushPayload {
  token: string
  title: string
  body: string
  data?: Record<string, string>
}

let adminInitialized = false

async function getAdmin() {
  const pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  if (!pk || pk.includes('TODO')) return null

  if (!adminInitialized) {
    const admin = await import('firebase-admin').catch(() => null)
    if (!admin) {
      console.warn('[fcm/server] firebase-admin not installed – install if you need server push')
      return null
    }
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: pk.replace(/\\n/g, '\n'),
        }),
      })
    }
    adminInitialized = true
    return admin
  }
  return (await import('firebase-admin')).default
}

export async function sendPush(payload: PushPayload): Promise<{ ok: boolean; stub?: boolean }> {
  const admin = await getAdmin()
  if (!admin) {
    console.warn(`[fcm/server STUB] push to ${payload.token.slice(0, 12)}…: ${payload.title} – ${payload.body}`)
    return { ok: true, stub: true }
  }
  try {
    await admin.messaging().send({
      token: payload.token,
      notification: { title: payload.title, body: payload.body },
      data: payload.data ?? {},
    })
    return { ok: true }
  } catch (err) {
    console.error('[fcm/server] send failed', err)
    return { ok: false }
  }
}
