import {
  LIFE_A_RATES,
  LIFE_A_HOSPITALIZATION_RATE,
  LIFE_A_DISABILITY_PENSION_RATE,
  LIFE_A_FIXED_RATES,
  PAYMENT_FREQUENCY_DISCOUNTS,
} from '../constants/products'
import type { LifeAInputs, LifeAResult } from '../types/calculator'

function ageLoadingFactor(age: number): number {
  if (age <= 30) return 1.0
  if (age <= 35) return 1.15
  if (age <= 40) return 1.35
  if (age <= 45) return 1.65
  if (age <= 50) return 2.1
  if (age <= 55) return 2.8
  return 3.8
}

function smokerLoading(smoker: boolean): number {
  return smoker ? 1.4 : 1.0
}

function baseMainPremium(sumInsured: number, age: number, smoker: boolean, termYears: number | 'whole_life'): number {
  const basePer1000 = 0.327
  const factor = ageLoadingFactor(age) * smokerLoading(smoker)
  const termFactor = termYears === 'whole_life' ? 2.2 : Math.max(0.6, 1 - (Number(termYears) - 10) * 0.012)
  return (sumInsured / 1000) * basePer1000 * factor * termFactor
}

function riderPremium(riders: LifeAInputs['riders'], age: number): number {
  const f = ageLoadingFactor(age)
  let total = 0

  if (riders.accidentalDeath.enabled)
    total += (riders.accidentalDeath.sum / 1000) * LIFE_A_RATES.accidentalDeath

  if (riders.surgery.enabled)
    total += (riders.surgery.sum / 1000) * LIFE_A_RATES.surgery * f

  if (riders.permanentDisabilityAccident.enabled)
    total += (riders.permanentDisabilityAccident.sum / 1000) * LIFE_A_RATES.permanentDisabilityAccident * f

  if (riders.hospitalization.enabled)
    total += riders.hospitalization.dailyBenefit * LIFE_A_HOSPITALIZATION_RATE * f

  if (riders.disabilityPension.enabled)
    total += riders.disabilityPension.monthlyBenefit * LIFE_A_DISABILITY_PENSION_RATE * f

  if (riders.permanentIncapacity.enabled)
    total += (riders.permanentIncapacity.sum / 1000) * LIFE_A_RATES.permanentIncapacity * f

  if (riders.cancerDiagnosis.enabled)
    total += (riders.cancerDiagnosis.sum / 1000) * LIFE_A_RATES.cancerDiagnosis * f

  if (riders.cancerTreatment.enabled)
    total += (riders.cancerTreatment.sum / 1000) * LIFE_A_RATES.cancerTreatment * f

  if (riders.seriousIllness.enabled) {
    const variantMultiplier = { oncological: 1, cardio: 1.4, extended: 2.1 }[riders.seriousIllness.variant]
    total += (riders.seriousIllness.sum / 1000) * LIFE_A_RATES.seriousIllness * f * variantMultiplier
  }

  if (riders.treatmentAbroad.enabled)
    total += riders.treatmentAbroad.variant === 'I'
      ? LIFE_A_FIXED_RATES.treatmentAbroad_I
      : LIFE_A_FIXED_RATES.treatmentAbroad_I * 1.35

  if (riders.medicalOpinion.enabled)
    total += riders.medicalOpinion.variant === 'individual'
      ? LIFE_A_FIXED_RATES.medicalOpinion_individual
      : LIFE_A_FIXED_RATES.medicalOpinion_individual * 1.5

  if (riders.eConsultations.enabled)
    total += riders.eConsultations.variant === 'individual'
      ? LIFE_A_FIXED_RATES.eConsultations_individual
      : LIFE_A_FIXED_RATES.eConsultations_family

  if (riders.medicalAssistance.enabled)
    total += riders.medicalAssistance.variant === 'standard'
      ? LIFE_A_FIXED_RATES.medicalAssistance_standard
      : LIFE_A_FIXED_RATES.medicalAssistance_premium

  if (riders.yourHealth.enabled)
    total += riders.yourHealth.variant === 'individual'
      ? LIFE_A_FIXED_RATES.yourHealth_individual
      : LIFE_A_FIXED_RATES.yourHealth_family

  if (riders.premiumWaiver.enabled)
    total += LIFE_A_FIXED_RATES.premiumWaiver * f

  return total
}

export function calculateLifeA(inputs: LifeAInputs): LifeAResult {
  const mainPremium = Math.round(
    baseMainPremium(inputs.sumInsured, inputs.age, inputs.smoker, inputs.term) * 100
  ) / 100

  const ridersPremiumRaw = riderPremium(inputs.riders, inputs.age)
  const ridersPremium = Math.round(ridersPremiumRaw * 100) / 100

  const discount = PAYMENT_FREQUENCY_DISCOUNTS[inputs.frequency]
  const totalMonthly = Math.round((mainPremium + ridersPremium) * 100) / 100
  const annualSavings = Math.round(totalMonthly * 12 * discount * 100) / 100

  const coverageSummary: string[] = []
  if (inputs.riders.accidentalDeath.enabled)
    coverageSummary.push(`Śmierć w wyniku wypadku: ${inputs.riders.accidentalDeath.sum.toLocaleString('pl-PL')} PLN`)
  if (inputs.riders.cancerDiagnosis.enabled)
    coverageSummary.push(`Nowotwór – zdiagnozowanie: ${inputs.riders.cancerDiagnosis.sum.toLocaleString('pl-PL')} PLN`)
  if (inputs.riders.seriousIllness.enabled)
    coverageSummary.push(`Poważne zachorowanie: ${inputs.riders.seriousIllness.sum.toLocaleString('pl-PL')} PLN`)
  if (inputs.riders.hospitalization.enabled)
    coverageSummary.push(`Pobyt w szpitalu: ${inputs.riders.hospitalization.dailyBenefit} PLN/dzień`)
  if (inputs.riders.permanentIncapacity.enabled)
    coverageSummary.push(`Trwała niezdolność do pracy: ${inputs.riders.permanentIncapacity.sum.toLocaleString('pl-PL')} PLN`)

  return { mainPremium, ridersPremium, totalMonthly, frequencyDiscount: discount, annualSavings, coverageSummary }
}

export function calculateInvestmentGrowth(
  monthlyAmount: number,
  years: number
): { conservative: number; balanced: number; dynamic: number } {
  function futureValue(rate: number): number {
    const monthlyRate = rate / 12
    const n = years * 12
    return Math.round(monthlyAmount * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * 100) / 100
  }
  return {
    conservative: futureValue(0.03),
    balanced: futureValue(0.06),
    dynamic: futureValue(0.09),
  }
}
