import type { ProductType } from '../types/database'

export const PRODUCT_LABELS: Record<ProductType, string> = {
  life_a: 'Ubezpieczenie na życie i zdrowie',
  life_b: 'Ubezpieczenie na życie i zdrowie (alt.)', // niewidoczne dla klienta, zostawione w bazie
  oc: 'Ubezpieczenie OC',
  ac: 'Ubezpieczenie AC',
  oc_ac: 'Ubezpieczenie OC + AC',
  property: 'Ubezpieczenie majątkowe',
  investment: 'Produkt inwestycyjny',
}

export const PRODUCT_ICONS: Record<ProductType, string> = {
  life_a: '🛡️',
  life_b: '🛡️',
  oc: '🚗',
  ac: '🚙',
  oc_ac: '🚘',
  property: '🏠',
  investment: '📈',
}

export const POLICY_STATUS_LABELS = {
  submitted: 'Wniosek złożony',
  in_review: 'W analizie',
  ready: 'Polisa gotowa – wymaga akceptacji',
  accepted: 'Zaakceptowana',
  active: 'Aktywna',
  expired: 'Wygasła',
  claim_in_progress: 'Szkoda w toku',
} as const

export const POLICY_STATUS_COLORS = {
  submitted: 'yellow',
  in_review: 'blue',
  ready: 'orange',
  accepted: 'green',
  active: 'green',
  expired: 'gray',
  claim_in_progress: 'red',
} as const

export const PAYMENT_FREQUENCY_LABELS = {
  monthly: 'Miesięczna',
  quarterly: 'Kwartalna',
  'semi-annual': 'Półroczna',
  annual: 'Roczna',
} as const

export const PAYMENT_FREQUENCY_DISCOUNTS = {
  monthly: 0,
  quarterly: 0.01,
  'semi-annual': 0.025,
  annual: 0.05,
} as const

export const CLAIM_CONFIG = {
  life_a: {
    link: 'https://viennalife.pl/strefa-klienta/zglos-zdarzenie/',
    phone: '22 460 22 22',
    label: 'Vienna Life',
  },
  life_b: {
    link: 'https://www.ergohestia.pl/zglos-zdarzenie/',
    phone: '58 766 34 44',
    label: 'Ergo Hestia',
  },
  oc: { link: '', phone: '', label: '' },
  ac: { link: '', phone: '', label: '' },
  oc_ac: { link: '', phone: '', label: '' },
  property: { link: '', phone: '', label: '' },
  investment: { link: '', phone: '', label: '' },
} as const

// IKE/IKZE limits 2025
export const IKE_LIMIT_2025 = 23472
export const IKZE_LIMIT_2025 = 14083

export const CALCULATOR_DISCLAIMER =
  'Kalkulator poglądowy – wynik nie stanowi oferty handlowej zgodnie z wymogami KNF'

// Life A base rates (per 1000 PLN SU, 30-year-old reference)
export const LIFE_A_RATES = {
  accidentalDeath: 0.14,
  surgery: 1.25,
  permanentDisabilityAccident: 0.8,
  cancerDiagnosis: 0.19,
  cancerTreatment: 0.18,
  seriousIllness: 0.11,
  permanentIncapacity: 0.12,
} as const

// Per 1 PLN daily benefit
export const LIFE_A_HOSPITALIZATION_RATE = 0.084

// Per 1 PLN monthly pension
export const LIFE_A_DISABILITY_PENSION_RATE = 0.022

// Fixed monthly amounts
export const LIFE_A_FIXED_RATES = {
  treatmentAbroad_I: 27.01,
  medicalOpinion_individual: 22.44,
  eConsultations_individual: 25,
  eConsultations_family: 35,
  medicalAssistance_standard: 5,
  medicalAssistance_premium: 8,
  yourHealth_individual: 70,
  yourHealth_family: 100,
  premiumWaiver: 54.52,
} as const
