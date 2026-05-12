import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-brand-900 font-bold text-lg">
                M
              </div>
              <div className="leading-tight">
                <div className="text-white font-bold">MojaPolisa</div>
                <div className="text-xs text-gray-400">Ubezpieczenia Online</div>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Platforma ubezpieczeniowa Finvita. Bezpiecznie zarządzaj swoimi polisami online.
            </p>
          </div>

          {/* Produkty */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produkty</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/kalkulator/wariant-a" className="hover:text-white">
                  Ubezpieczenie na życie i zdrowie
                </Link>
              </li>
              <li>
                <Link href="/kalkulator/inwestycje" className="hover:text-white">
                  Inwestycje (IKE / IKZE)
                </Link>
              </li>
              <li>
                <Link href="/kalkulator/oc-ac" className="hover:text-white">
                  Ubezpieczenie OC/AC
                </Link>
              </li>
              <li>
                <Link href="/kalkulator/majatek" className="hover:text-white">
                  Ubezpieczenie majątkowe
                </Link>
              </li>
            </ul>
          </div>

          {/* Pomoc */}
          <div>
            <h3 className="text-white font-semibold mb-4">Pomoc</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Moje polisy
                </Link>
              </li>
              <li>
                <Link href="/szkoda" className="hover:text-white">
                  Zgłoś szkodę
                </Link>
              </li>
              <li>
                <Link href="/logowanie" className="hover:text-white">
                  Logowanie
                </Link>
              </li>
              <li>
                <a
                  href="https://finvita.pl/kontakt"
                  className="hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kontakt z agentem
                </a>
              </li>
            </ul>
          </div>

          {/* Prawne */}
          <div>
            <h3 className="text-white font-semibold mb-4">Prawne</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://finvita.pl/polityka-prywatnosci"
                  className="hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Polityka prywatności
                </a>
              </li>
              <li>
                <a
                  href="https://finvita.pl/regulamin"
                  className="hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Regulamin
                </a>
              </li>
              <li>
                <a
                  href="https://finvita.pl/o-nas"
                  className="hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  O nas
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Pasek dolny */}
        <div className="mt-10 pt-6 border-t border-brand-800 text-xs text-gray-400 space-y-3">
          <p>
            Administrator danych: EPRO Sp. z o.o., ul. Mikołajska 25, 02-455 Warszawa.
            Kontakt z IOD:{' '}
            <a href="mailto:iod@epropolska.pl" className="text-gold-400 hover:underline">
              iod@epropolska.pl
            </a>
          </p>
          <p className="italic">
            Kalkulatory dostępne na tej stronie mają charakter wyłącznie poglądowy. Wyniki nie
            stanowią oferty handlowej w rozumieniu Kodeksu Cywilnego ani rekomendacji zgodnie z
            wymogami KNF. Dokładną ofertę przedstawi agent po analizie potrzeb klienta.
          </p>
          <p>© {year} Finvita. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}
