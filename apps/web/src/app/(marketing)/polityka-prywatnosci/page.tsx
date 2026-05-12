export const metadata = {
  title: 'Polityka prywatności',
}

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-brand-600 mb-2">Polityka prywatności</h1>
      <p className="text-sm text-gray-500 mb-8">MojaPolisa – Ubezpieczenia Online</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
        <p>
          Pełna treść polityki prywatności znajduje się na{' '}
          <a
            href="https://finvita.pl/polityka-prywatnosci"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 underline"
          >
            finvita.pl/polityka-prywatnosci
          </a>
          . Poniżej skrót dotyczący platformy MojaPolisa.
        </p>

        <h2 className="text-xl font-bold text-brand-600 pt-6">Administrator danych</h2>
        <p>
          EPRO Sp. z o.o., ul. Mikołajska 25, 02-455 Warszawa. Kontakt z Inspektorem Ochrony Danych:{' '}
          <a href="mailto:iod@epropolska.pl" className="text-brand-600 underline">
            iod@epropolska.pl
          </a>
        </p>

        <h2 className="text-xl font-bold text-brand-600 pt-6">Zakres przetwarzania</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Dane osobowe (imię, nazwisko, PESEL, adres, email, telefon)</li>
          <li>Dane dotyczące zdrowia (ankieta medyczna) – na podstawie odrębnej zgody (art. 9 RODO)</li>
          <li>Adres IP i znacznik czasu akceptacji ANK – wymóg ustawy IDD, archiwizacja 5 lat</li>
        </ul>

        <h2 className="text-xl font-bold text-brand-600 pt-6">Bezpieczeństwo</h2>
        <p>
          PESEL i dane medyczne są szyfrowane algorytmem AES-256. Hosting w UE (Frankfurt).
          Stosujemy nagłówki bezpieczeństwa, HTTPS, Content Security Policy.
        </p>

        <h2 className="text-xl font-bold text-brand-600 pt-6">Twoje prawa</h2>
        <p>
          Masz prawo do dostępu, sprostowania, usunięcia, przeniesienia danych, ograniczenia
          przetwarzania, sprzeciwu oraz wycofania zgody w dowolnym momencie.
        </p>

        <h2 className="text-xl font-bold text-brand-600 pt-6">Cookies</h2>
        <p>
          Używamy wyłącznie niezbędnych plików cookie do obsługi sesji logowania. Nie stosujemy
          cookies analitycznych ani marketingowych bez Twojej zgody.
        </p>
      </div>
    </div>
  )
}
