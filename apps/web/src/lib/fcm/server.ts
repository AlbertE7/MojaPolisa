/**
 * FCM server-side: wysyłanie push z API routes.
 *
 * Wymaga FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL w .env.local
 * oraz zainstalowanego pakietu `firebase-admin` w apps/web/package.json.
 * Bez nich – funkcja zwraca stub i loguje do konsoli (NIE blokuje aplikacji).
 *
 * Aby aktywować prawdziwy push w produkcji:
 *   1. cd apps/web && npm install firebase-admin
 *   2. uzupełnij FIREBASE_ADMIN_* w env
 *   3. redeploy
 */

interface PushPayload {
  token: string
  title: string
  body: string
  data?: Record<string, string>
}

let adminInitialized = false
let adminModule: any = null

async function loadFirebaseAdmin(): Promise<any> {
  if (adminModule) return adminModule
  try {
    // @ts-ignore - firebase-admin to opcjonalna zależność, może nie być zainstalowana
    const mod = await import('firebase-admin')
    adminModule = mod.default ?? mod
    return adminModule
  } catch {
    return null
  }
}

async function getAdmin(): Promise<any> {
  const pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  if (!pk || pk.includes('TODO')) return null

  const admin = await loadFirebaseAdmin()
  if (!admin) {
    console.warn('[fcm/server] firebase-admin not installed – install if you need server push')
    return null
  }

  if (!adminInitialized && admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: pk.replace(/\\n/g, '\n'),
      }),
    })
    adminInitialized = true
  }
  return admin
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
