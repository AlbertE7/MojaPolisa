'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard',     label: 'Dashboard',  icon: '📊' },
  { href: '/admin/klienci',       label: 'Klienci',    icon: '👥' },
  { href: '/admin/wnioski',       label: 'Wnioski',    icon: '📋' },
  { href: '/admin/czat',          label: 'Czat',       icon: '💬' },
  { href: '/admin/biblioteka',    label: 'Biblioteka', icon: '📚' },
  { href: '/admin/konfiguracja',  label: 'Konfiguracja TU', icon: '⚙️' },
]

const SESSION_TIMEOUT_MS = 30 * 60 * 1000  // 30 min

export function AdminShell({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-logout po 30 min bezczynności (wymóg bezpieczeństwa)
  useEffect(() => {
    let timer = setTimeout(logout, SESSION_TIMEOUT_MS)
    function reset() { clearTimeout(timer); timer = setTimeout(logout, SESSION_TIMEOUT_MS) }
    function logout() {
      const supabase = createSupabaseBrowserClient()
      supabase.auth.signOut().then(() => router.push('/admin/logowanie?reason=timeout'))
    }
    ;['mousemove', 'keydown', 'click', 'touchstart'].forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      clearTimeout(timer)
      ;['mousemove', 'keydown', 'click', 'touchstart'].forEach((e) => window.removeEventListener(e, reset))
    }
  }, [router])

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/logowanie')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col bg-brand-900 text-white w-64 min-h-screen">
        <Link href="/admin/dashboard" className="flex items-center gap-2 px-6 py-5 border-b border-brand-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-brand-900 font-bold">M</div>
          <div className="leading-tight">
            <div className="font-bold">MojaPolisa</div>
            <div className="text-xs text-brand-200">Panel admina</div>
          </div>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href)
            return (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${active ? 'bg-brand-700 text-white font-semibold' : 'text-brand-100 hover:bg-brand-800'}`}>
                <span>{n.icon}</span><span>{n.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-brand-800 text-xs text-brand-200">
          <div className="mb-2 truncate">{userEmail}</div>
          <button onClick={handleLogout} className="text-gold-400 hover:underline">Wyloguj</button>
        </div>
      </aside>

      {/* Top bar mobile */}
      <div className="lg:hidden bg-brand-900 text-white flex items-center justify-between px-4 py-3">
        <Link href="/admin/dashboard" className="font-bold">MojaPolisa · Admin</Link>
        <button onClick={() => setMobileOpen((v) => !v)} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden bg-brand-900 text-white p-4 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-brand-800">
              <span>{n.icon}</span><span>{n.label}</span>
            </Link>
          ))}
          <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-gold-400">Wyloguj ({userEmail})</button>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
    </div>
  )
}
