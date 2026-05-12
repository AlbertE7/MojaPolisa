'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mojapolisa_cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const consent = window.localStorage.getItem(STORAGE_KEY)
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    window.localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-brand-900 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-sm flex-1">
          Używamy wyłącznie niezbędnych plików cookie do obsługi sesji logowania i zapamiętania
          Twoich wyborów w formularzach. Nie używamy cookies analitycznych ani marketingowych bez
          Twojej zgody. Szczegóły w{' '}
          <a
            href="https://finvita.pl/polityka-prywatnosci"
            className="text-gold-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Polityce prywatności
          </a>
          .
        </p>
        <button onClick={accept} type="button" className="btn-gold !py-2 !px-4 text-sm">
          Rozumiem
        </button>
      </div>
    </div>
  )
}
