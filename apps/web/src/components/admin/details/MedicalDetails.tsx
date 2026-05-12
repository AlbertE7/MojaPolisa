import { MEDICAL_QUESTIONS, formatYesNo } from '@/lib/labels'

interface Props {
  answers: Record<string, unknown> | null | undefined
}

// Sekcje ankiety medycznej w czytelnej kolejności
const SECTIONS: { title: string; keys: string[]; description?: string }[] = [
  {
    title: '1. Wymiary i podstawowe dane',
    keys: ['height_cm', 'weight_kg'],
  },
  {
    title: '2. Zmiana wagi w ostatnim roku',
    keys: ['weight_change', 'weight_change_kg', 'weight_change_diet'],
  },
  {
    title: '3-7. Czynniki ryzyka',
    description: 'Praca, sporty, używki',
    keys: [
      'hazardous_work', 'hazardous_work_desc',
      'risky_sports', 'risky_sports_desc',
      'alcohol', 'alcohol_beer', 'alcohol_wine', 'alcohol_spirits',
      'smoking_year',
      'drugs', 'drugs_desc',
    ],
  },
  {
    title: '8-11. Historia leczenia',
    keys: [
      'hospital_10y', 'hospital_10y_desc',
      'abnormal_labs', 'abnormal_labs_desc',
      'specialist_tests', 'specialist_tests_desc',
      'long_meds', 'long_meds_desc',
    ],
  },
  {
    title: '12. Dolegliwości i choroby w ciągu ostatnich 10 lat',
    keys: [
      'cond_cancer', 'cond_cancer_desc',
      'cond_cardio', 'cond_cardio_desc',
      'cond_respiratory', 'cond_respiratory_desc',
      'cond_digestive', 'cond_digestive_desc',
      'cond_urinary', 'cond_urinary_desc',
      'cond_metabolic', 'cond_metabolic_desc',
      'cond_infectious', 'cond_infectious_desc',
      'cond_hiv', 'cond_hiv_desc',
      'cond_neuro', 'cond_neuro_desc',
      'cond_musculo', 'cond_musculo_desc',
      'cond_eyes_ears', 'cond_eyes_ears_desc',
      'cond_other', 'cond_other_desc',
    ],
  },
  {
    title: '13-16. Niezdolność, rodzina, odmowy',
    keys: [
      'sick_leave_14d', 'sick_leave_desc',
      'disability_pension', 'disability_pension_desc',
      'family_history', 'family_history_desc',
      'refused_life_insurance', 'refused_desc',
    ],
  },
  {
    title: '17. Lekarz pierwszego kontaktu',
    keys: ['family_doctor'],
  },
  {
    title: 'Oświadczenie',
    keys: ['truthful_declaration'],
  },
]

function formatMedicalValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return formatYesNo(value)
  if (key === 'weight_change') {
    const map: Record<string, string> = { none: 'Brak zmiany', gain: 'Wzrost wagi', loss: 'Spadek wagi' }
    return map[String(value)] ?? String(value)
  }
  if (typeof value === 'number') return String(value)
  return String(value)
}

export function MedicalDetails({ answers }: Props) {
  if (!answers || Object.keys(answers).length === 0) {
    return <p className="text-sm text-gray-500 italic">Brak ankiety medycznej dla tego wniosku.</p>
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-400 p-3 text-xs text-red-900 rounded-r">
        Dane medyczne podlegają szczególnej ochronie (RODO art. 9). Klient wyraził wyraźną zgodę na ich przetwarzanie.
      </div>

      {SECTIONS.map((sec) => {
        const rows = sec.keys
          .filter((k) => {
            const v = answers[k]
            if (v === undefined || v === null || v === '') return false
            // Ukryj "Nie" (false) — pokazujemy tylko Tak / wartości
            if (v === false && !k.includes('truthful')) return false
            return true
          })
          .map((k) => ({
            key: k,
            label: MEDICAL_QUESTIONS[k]?.label ?? k,
            value: formatMedicalValue(k, answers[k]),
            isWarning: answers[k] === true && !k.includes('truthful') && !k.includes('smoking_year') && !k.includes('alcohol'),
          }))

        if (rows.length === 0) {
          return (
            <section key={sec.title}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1 pb-1 border-b border-gray-100">
                {sec.title}
              </h3>
              <p className="text-xs text-gray-400 italic py-1">Brak zaznaczonych odpowiedzi (wszystko „Nie" / nieuzupełnione)</p>
            </section>
          )
        }

        return (
          <section key={sec.title}>
            <h3 className="text-xs font-bold uppercase tracking-wide text-brand-600 mb-1 pb-1 border-b border-brand-100">
              {sec.title}
            </h3>
            {sec.description && <p className="text-xs text-gray-500 mb-1">{sec.description}</p>}
            <dl className="divide-y divide-gray-100">
              {rows.map((r) => (
                <div key={r.key} className={`grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-3 py-2 ${r.isWarning ? 'bg-orange-50/40 -mx-2 px-2 rounded' : ''}`}>
                  <dt className="text-sm text-gray-700 md:col-span-2">
                    {r.isWarning && <span className="text-orange-600 mr-1">⚠</span>}
                    {r.label}
                  </dt>
                  <dd className={`text-sm font-medium md:text-right ${r.isWarning ? 'text-orange-700' : 'text-gray-900'}`}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </div>
  )
}
