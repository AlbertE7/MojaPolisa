'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: err, data } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err

      // Sprawdź czy ma rolę admin (raw_app_meta_data.role === 'admin')
      const role = data.user?.app_metadata?.role
      if (role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('To konto nie ma uprawnień administratora.')
      }

      // Zaloguj próbę dostępu
      await fetch('/api/admin/log-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, success: true }),
      }).catch(() => {})

      router.push('/admin/dashboard')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd logowania')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-xl">M</div>
          <div>
            <div className="font-bold text-brand-700">MojaPolisa</div>
            <div className="text-xs text-gray-500">Panel administratora</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-brand-700 mb-2">Zaloguj się</h1>
        <p className="text-sm text-gray-600 mb-6">Dostęp do panelu administracyjnego MojaPolisa.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label className="label">Hasło</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Loguję...' : 'Zaloguj'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500">
          <p className="mb-2"><strong>Próby logowania są rejestrowane.</strong></p>
          <p>Sesja wygasa po 30 min bezczynności (wymóg bezpieczeństwa).</p>
        </div>
      </div>
    </div>
  )
}
