'use client'

import { useState } from 'react'

export function RequestAcceptanceButton({ policyId }: { policyId: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handle() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/policies/request-acceptance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="card bg-green-50 border-green-200">
        <h3 className="font-bold text-green-800 mb-1">✓ Email wysłany</h3>
        <p className="text-sm text-green-900">
          Sprawdź swoją skrzynkę. Kliknij link w wiadomości, aby zaakceptować polisę.
          Po Twojej akceptacji agent ustawi finalny status w systemie.
        </p>
      </div>
    )
  }

  return (
    <div className="card bg-orange-50 border-orange-200">
      <h3 className="font-bold text-orange-800 mb-2">🟠 Twoja polisa jest gotowa</h3>
      <p className="text-sm text-orange-900 mb-4">
        Aby zaakceptować polisę, wyślemy Ci email z linkiem potwierdzającym.
        Po Twojej akceptacji agent ustawi finalny status polisy.
      </p>
      <button type="button" onClick={handle} disabled={loading} className="btn-primary">
        {loading ? 'Wysyłam...' : '📧 Wyślij mi link akceptacji na email'}
      </button>
      {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
    </div>
  )
}
