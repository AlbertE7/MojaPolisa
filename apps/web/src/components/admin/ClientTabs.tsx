'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  clientId: string
  active: string
  counts: { policies: number; applications: number; ank: number; chat: number }
}

export function ClientTabs({ clientId, active, counts }: Props) {
  const pathname = usePathname()
  const tabs = [
    { id: 'dane', label: 'Dane' },
    { id: 'polisy', label: `Polisy (${counts.policies})` },
    { id: 'wnioski', label: `Wnioski (${counts.applications})` },
    { id: 'ank', label: `ANK (${counts.ank})` },
    { id: 'notatki', label: 'Notatki' },
    { id: 'historia', label: 'Historia' },
    { id: 'czat', label: `Czat (${counts.chat})` },
  ]

  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav className="flex gap-1 min-w-max">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`${pathname}?tab=${t.id}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:text-brand-600'}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
