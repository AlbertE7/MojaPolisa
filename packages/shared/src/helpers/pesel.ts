export interface PeselData {
  birthDate: Date
  gender: 'M' | 'K'
  valid: boolean
}

export function validatePeselPL(pesel: string): PeselData | null {
  if (!/^\d{11}$/.test(pesel)) return null

  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
  const checksum = weights.reduce((sum, w, i) => sum + w * parseInt(pesel[i]!), 0)
  const control = (10 - (checksum % 10)) % 10

  if (control !== parseInt(pesel[10]!)) return null

  const year2digit = parseInt(pesel.slice(0, 2))
  const month = parseInt(pesel.slice(2, 4))
  const day = parseInt(pesel.slice(4, 6))

  let fullYear: number
  let realMonth: number

  if (month >= 81 && month <= 92) {
    fullYear = 1800 + year2digit
    realMonth = month - 80
  } else if (month >= 1 && month <= 12) {
    fullYear = 1900 + year2digit
    realMonth = month
  } else if (month >= 21 && month <= 32) {
    fullYear = 2000 + year2digit
    realMonth = month - 20
  } else if (month >= 41 && month <= 52) {
    fullYear = 2100 + year2digit
    realMonth = month - 40
  } else if (month >= 61 && month <= 72) {
    fullYear = 2200 + year2digit
    realMonth = month - 60
  } else {
    return null
  }

  const birthDate = new Date(fullYear, realMonth - 1, day)
  const genderDigit = parseInt(pesel[9]!)
  const gender: 'M' | 'K' = genderDigit % 2 === 1 ? 'M' : 'K'

  return { birthDate, gender, valid: true }
}

export function validatePeselUA(pesel: string): boolean {
  return /^\d{10}$/.test(pesel)
}

export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function calculateBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
