'use client'

import { useEffect, useState } from 'react'
import { requestPushPermission } from '@/lib/fcm/client'

export function PushPermissionPrompt() {
  const [hidden, setHidden] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      const dismissed = window.localStorage.getItem('mojapolisa_push_dismissed')
      if (!dismissed) setHidden(false)
    }
  }, [])

  async function enable() {
    setRegistering(true)
    const token = await requestPushPermission()
    if (token) {
      await fetch('/api/push/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    }
    setHidden(true)
    setRegistering(false)
  }

  function dismiss() {
    window.localStorage.setItem('mojapolisa_push_dismissed', '1')
    setHidden(true)
  }

  if (hidden) return null

  return (
    <div className="card bg-brand-50 border-brand-200 flex items-start gap-3">
      <div className="text-2xl">🔔</div>
      <div className="flex-1 text-sm">
        <strong className="block text-brand-700">Włącz powiadomienia</strong>
        <span className="text-gray-700">Otrzymasz natychmiastową informację o gotowej polisie, statusie szkody i nowych wiadomościach.</span>
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={enable} disabled={registering} className="btn-primary !py-1.5 !px-3 text-xs">
          {registering ? '...' : 'Włącz'}
        </button>
        <button type="button" onClick={dismiss} className="text-xs text-gray-500 hover:underline">Nie teraz</button>
      </div>
    </div>
  )
}
