import { CALCULATOR_DISCLAIMER } from '@mojapolisa/shared'

export function CalculatorDisclaimer() {
  return (
    <div className="text-xs italic text-gray-500 border-l-4 border-gold-400 bg-gold-50 px-4 py-2 rounded-r">
      {CALCULATOR_DISCLAIMER}
    </div>
  )
}
