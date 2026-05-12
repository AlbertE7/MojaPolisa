'use client'

import { useState } from 'react'

interface Props { clientId: string; clientPhone: string; clientName: string }

export function AdminActions({ clientId, clientPhone, clientName }: Props) {
  const [linkMsg, setLinkMsg] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)

  async function generateDeepLink() {
    setLinkLoading(true); setLinkMsg(null)
    try {
      const res = await fetch('/api/admin/deep-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })
      const data = await res.json()
      if (data.url) {
        await navigator.clipboard.writeText(data.url).catch(() => {})
        setLinkMsg(`✓ Link skopiowany do schowka: ${data.url} (wygasa za 48h)`)
      } else throw new Error(data.error)
    } catch (e) {
      setLinkMsg(`Błąd: ${e instanceof Error ? e.message : 'nieznany'}`)
    } finally {
      setLinkLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={generateDeepLink} disabled={linkLoading} className="btn-secondary !py-2 !px-3 text-xs">
          {linkLoading ? '...' : '🔗 Wyślij zaproszenie'}
        </button>
        {clientPhone && (
          <a href={`tel:${clientPhone}`} className="btn-secondary !py-2 !px-3 text-xs">📞 Zadzwoń</a>
        )}
      </div>
      {linkMsg && (
        <p className="text-xs text-gray-600 max-w-xs text-right break-all">{linkMsg}</p>
      )}
    </div>
  )
}
