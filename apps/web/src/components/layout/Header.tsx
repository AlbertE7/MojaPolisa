'use client'

import Link from 'next/link'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/kalkulator/wariant-a', label: 'Życie i zdrowie' },
  { href: '/kalkulator/oc-ac', label: 'OC/AC' },
  { href: '/kalkulator/majatek', label: 'Majątek' },
  { href: '/kalkulator/inwestycje', label: 'Inwestycje' },
  { href: '/szkoda', label: 'Zgłoś szkodę' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              M
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-brand-600 group-hover:text-brand-700">
                MojaPolisa
              </span>
              <span className="text-[10px] text-gray-500 -mt-0.5">
                Ubezpieczenia Online · Finvita
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/logowanie"
              className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
            >
              Logowanie
            </Link>
            <Link href="/dashboard" className="btn-gold !py-2 !px-4 text-sm">
              Moje polisy
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Menu"
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3 space-y-1 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 rounded-md"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-3 flex flex-col gap-2 px-3">
              <Link
                href="/logowanie"
                className="text-sm font-medium text-gray-700 py-2"
                onClick={() => setMobileOpen(false)}
              >
                Logowanie
              </Link>
              <Link href="/dashboard" className="btn-gold !py-2 text-sm w-full">
                Moje polisy
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
