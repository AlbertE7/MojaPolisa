import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: {
    default: 'MojaPolisa – Ubezpieczenia Online | Finvita',
    template: '%s | MojaPolisa – Finvita',
  },
  description:
    'Sprawdź swoją polisę, złóż wniosek i skontaktuj się z agentem online. Bezpieczna platforma ubezpieczeniowa.',
  metadataBase: new URL('https://app.finvita.pl'),
  robots: 'noindex, nofollow',  // panel klienta – nie indeksować
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'MojaPolisa – Finvita',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
