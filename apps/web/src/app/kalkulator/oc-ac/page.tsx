import { CalculatorOcAc } from '@/components/calculator/CalculatorOcAc'

export const metadata = { title: 'Kalkulator OC/AC' }

export default function OcAcPage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold text-gold-500 mb-2">KALKULATOR</p>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-700">Ubezpieczenie OC i AC</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Porównaj szacunkowe składki. Wgraj skan dowodu rejestracyjnego, a my wypełnimy
            dane automatycznie.
          </p>
        </div>
        <CalculatorOcAc />
      </div>
    </div>
  )
}
