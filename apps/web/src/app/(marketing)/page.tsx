import Link from 'next/link'

const PRODUCTS = [
  {
    icon: '🛡️',
    title: 'Życie i zdrowie',
    subtitle: 'Ochrona dla Ciebie i bliskich',
    description:
      'Pełna ochrona na wypadek śmierci, choroby i wypadku. Ponad 15 umów dodatkowych: nowotwór, hospitalizacja, niezdolność do pracy, opieka medyczna.',
    href: '/kalkulator/wariant-a',
    cta: 'Oblicz składkę',
  },
  {
    icon: '🚗',
    title: 'OC i AC',
    subtitle: 'Ubezpieczenie samochodu',
    description:
      'Porównaj składki OC, AC, Assistance i NNW kierowcy. Wgraj skan dowodu rejestracyjnego — wypełnimy dane automatycznie.',
    href: '/kalkulator/oc-ac',
    cta: 'Sprawdź cenę',
  },
  {
    icon: '🏠',
    title: 'Majątek',
    subtitle: 'Dom i mieszkanie',
    description:
      'Ochrona murów, wyposażenia, OC w życiu prywatnym, zalania, kradzieży. Pełny pakiet pod jednym dachem.',
    href: '/kalkulator/majatek',
    cta: 'Oblicz składkę',
  },
  {
    icon: '📈',
    title: 'Inwestycje',
    subtitle: 'IKE / IKZE / Standard',
    description:
      'Oszczędzaj długoterminowo z korzyścią podatkową. Limity IKE/IKZE 2025, 3 scenariusze wzrostu kapitału.',
    href: '/kalkulator/inwestycje',
    cta: 'Oblicz potencjał',
  },
]

const STEPS = [
  {
    n: 1,
    title: 'Wypełnij kalkulator',
    text: 'Podaj kilka informacji i otrzymaj orientacyjną składkę w mniej niż 2 minuty.',
  },
  {
    n: 2,
    title: 'Złóż wniosek online',
    text: 'Bezpieczna platforma, dane szyfrowane AES-256. Możesz przerwać i wrócić później.',
  },
  {
    n: 3,
    title: 'Czekaj na potwierdzenie',
    text: 'Agent zweryfikuje wniosek i przygotuje polisę. Status śledzisz w aplikacji.',
  },
  {
    n: 4,
    title: 'Akceptuj polisę',
    text: 'Otrzymasz polisę mailem i w aplikacji. Po akceptacji jesteś ubezpieczony(a).',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-gold-400 font-semibold mb-3 text-sm tracking-wide uppercase">
              MojaPolisa · Finvita
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Ubezpieczenia online,{' '}
              <span className="text-gold-400">jak Ci wygodnie</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-100 mb-8 leading-relaxed">
              Oblicz składkę, złóż wniosek i zarządzaj swoimi polisami w jednym miejscu.
              Bezpiecznie, prosto, bez papierologii.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/kalkulator/wariant-a" className="btn-gold">
                Rozpocznij kalkulator
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-lg border border-white/20 transition-colors"
              >
                Mam już polisę
              </Link>
            </div>
            <p className="text-xs text-brand-200 mt-6 italic">
              Kalkulatory poglądowe – wynik nie stanowi oferty handlowej zgodnie z wymogami KNF.
            </p>
          </div>
        </div>
      </section>

      {/* Produkty */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="section-title">Wybierz produkt</h2>
            <p className="section-subtitle">
              Skorzystaj z naszych kalkulatorów, aby porównać warianty ochrony i poznać orientacyjną
              składkę.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((p) => (
              <Link key={p.href} href={p.href} className="card-hover group flex flex-col">
                <div className="text-4xl mb-4">{p.icon}</div>
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-brand-600 group-hover:text-brand-700">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500">{p.subtitle}</p>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex-1">{p.description}</p>
                <span className="inline-flex items-center text-sm font-semibold text-gold-500 group-hover:text-gold-600">
                  {p.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Jak to działa */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="section-title">Jak to działa?</h2>
            <p className="section-subtitle">
              Cztery kroki dzielą Cię od ubezpieczenia. Wszystko online, bez wizyty w oddziale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="card">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xl mb-4">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold text-brand-600 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bezpieczeństwo */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Twoje dane są bezpieczne</h2>
              <p className="section-subtitle mb-6">
                Spełniamy wszystkie wymogi RODO i IDD. PESEL oraz dane zdrowotne są szyfrowane
                algorytmem AES-256. Hosting w Unii Europejskiej (Frankfurt).
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="text-gold-500 font-bold">✓</span>
                  Szyfrowanie AES-256 dla danych wrażliwych
                </li>
                <li className="flex gap-3">
                  <span className="text-gold-500 font-bold">✓</span>
                  Hosting w UE – pełna zgodność z RODO
                </li>
                <li className="flex gap-3">
                  <span className="text-gold-500 font-bold">✓</span>
                  Archiwizacja Analizy Potrzeb Klienta przez 5 lat (wymóg IDD)
                </li>
                <li className="flex gap-3">
                  <span className="text-gold-500 font-bold">✓</span>
                  Połączenie HTTPS, nagłówki bezpieczeństwa, Content Security Policy
                </li>
              </ul>
            </div>
            <div className="bg-brand-50 rounded-2xl p-8 border border-brand-100">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-brand-600 mb-3">Pełna kontrola nad danymi</h3>
              <p className="text-sm text-gray-700 mb-4">
                Zgodnie z RODO masz prawo do dostępu, sprostowania, usunięcia i przeniesienia
                swoich danych. W dowolnym momencie możesz wycofać zgodę.
              </p>
              <p className="text-xs text-gray-500">
                Administrator: EPRO Sp. z o.o., ul. Mikołajska 25, 02-455 Warszawa.
                <br />
                IOD:{' '}
                <a
                  href="mailto:iod@epropolska.pl"
                  className="text-brand-600 hover:underline font-medium"
                >
                  iod@epropolska.pl
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Gotowy na rozmowę z agentem?</h2>
          <p className="text-brand-100 mb-8 max-w-2xl mx-auto">
            Wypełnij kalkulator, złóż wniosek online lub skontaktuj się z naszym agentem
            bezpośrednio. Pomożemy dobrać optymalną ochronę.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/kalkulator/wariant-a" className="btn-gold">
              Rozpocznij kalkulator
            </Link>
            <a
              href="https://finvita.pl/kontakt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold rounded-lg border border-white/20 transition-colors"
            >
              Skontaktuj się z agentem
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
