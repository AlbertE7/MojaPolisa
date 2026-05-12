import { CalculatorWariantA } from '@/components/calculator/CalculatorWariantA'

export const metadata = {
  title: 'Kalkulator – Ubezpieczenie na życie i zdrowie',
  description: 'Oblicz orientacyjną składkę ubezpieczenia na życie i zdrowie. Kalkulator poglądowy.',
}

export default function WariantAPage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold text-gold-500 mb-2">KALKULATOR</p>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-700">
            Ubezpieczenie na życie i zdrowie
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Kompleksowa ochrona z możliwością dopasowania ponad 15 umów dodatkowych —
            ryzyka wypadkowe, onkologia, hospitalizacja, niezdolność do pracy, opieka medyczna.
            Agent dobierze finalny produkt po analizie Twoich potrzeb.
          </p>
        </div>
        <CalculatorWariantA />
      </div>
    </div>
  )
}
