export type LifeVariant = 'A' | 'B'

export type SumVariant = 'fixed' | 'decreasing'

export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual'

export interface LifeAInputs {
  age: number
  gender: 'M' | 'K'
  height: number
  weight: number
  smoker: boolean
  occupation: string
  sumInsured: number
  term: number | 'whole_life'
  sumVariant: SumVariant
  terminalIllness: boolean
  frequency: PaymentFrequency
  riders: LifeARiders
}

export interface LifeARiders {
  accidentalDeath: { enabled: boolean; sum: number }
  surgery: { enabled: boolean; sum: number }
  permanentDisabilityAccident: { enabled: boolean; sum: number }
  hospitalization: { enabled: boolean; dailyBenefit: number }
  disabilityPension: { enabled: boolean; monthlyBenefit: number }
  permanentIncapacity: { enabled: boolean; sum: number }
  cancerDiagnosis: { enabled: boolean; sum: number }
  cancerTreatment: { enabled: boolean; sum: number }
  seriousIllness: { enabled: boolean; sum: number; variant: 'oncological' | 'cardio' | 'extended' }
  treatmentAbroad: { enabled: boolean; variant: 'I' | 'II' }
  medicalOpinion: { enabled: boolean; variant: 'individual' | 'family' }
  eConsultations: { enabled: boolean; variant: 'individual' | 'family' }
  medicalAssistance: { enabled: boolean; variant: 'standard' | 'premium' }
  yourHealth: { enabled: boolean; variant: 'individual' | 'family' }
  premiumWaiver: { enabled: boolean }
}

export interface LifeAResult {
  mainPremium: number
  ridersPremium: number
  totalMonthly: number
  frequencyDiscount: number
  annualSavings: number
  coverageSummary: string[]
}

export interface LifeBFilars {
  filar1: { enabled: boolean; variant: 'accident_only' | 'credit' | 'full'; sum: number }
  filar2: { enabled: boolean; variant: 'accident' | 'credit_accident' | 'full'; sum: number }
  filar3: { enabled: boolean; variant: 'oncological' | 'basic' | 'extended'; sum: number }
  filar4: { enabled: boolean; variant: 'injury' | 'illness_20' | 'full'; sum: number }
}

export interface OcAcInputs {
  registrationNumber?: string
  brand: string
  model: string
  year: number
  engineCapacity: number
  vehicleValue: number
  vin?: string
  driverAge: number
  licenseYears: number
  claimsLast3Years: 0 | 1 | 2 | 3
  currentInsurer?: string
  currentBmDiscount: 0 | 10 | 20 | 30 | 40 | 50
  scope: 'oc' | 'oc_ac' | 'oc_ac_assistance' | 'full'
  deductible: 0 | 500 | 1000 | 1500
  windowsCoverage: boolean
  nnwDriver: boolean
}

export interface PropertyInputs {
  propertyType: 'apartment' | 'house' | 'house_under_construction'
  postalCode: string
  area: number
  buildYear: number
  propertyValue: number
  furnitureValue: number
  scope: 'walls' | 'walls_furniture' | 'full'
}

export interface InvestmentInputs {
  monthlyContribution: number
  savingPeriod: 10 | 15 | 20 | 25 | 30
  variant: 'standard' | 'ike' | 'ikze'
  taxBracket?: 12 | 32
}

export interface InvestmentResult {
  conservative: number
  balanced: number
  dynamic: number
  taxSaving?: number
  effectiveCost?: number
}
