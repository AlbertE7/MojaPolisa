import { ANK_QUESTIONS, formatValue } from '@/lib/labels'

interface Props {
  answers: Record<string, unknown> | null | undefined
}

const SECTIONS: { title: string; keys: string[] }[] = [
  {
    title: 'Ubezpieczenie i potrzeby',
    keys: ['q1', 'q2', 'q3'],
  },
  {
    title: 'Zakres ochrony – życie i zdrowie',
    keys: [
      'q4_health_close',
      'q4_health_illness', 'q4_health_illness_benefits',
      'q4_health_accident', 'q4_health_accident_benefits',
      'q4_health_disability', 'q4_health_disability_benefits',
      'q4_health_children', 'q4_health_children_benefits',
    ],
  },
  {
    title: 'Oszczędzanie / inwestowanie',
    keys: ['q5', 'q6', 'q7', 'q8', 'q9'],
  },
  {
    title: 'Oświadczenia AML / PEP',
    keys: ['pep_current', 'pep_current_desc', 'pep_past', 'pep_past_desc'],
  },
  {
    title: 'Zgody',
    keys: ['consent_rodo', 'consent_marketing_email', 'consent_marketing_phone', 'consent_ank'],
  },
]

export function AnkDetails({ answers }: Props) {
  if (!answers || Object.keys(answers).length === 0) {
    return <p className="text-sm text-gray-500 italic">Brak odpowiedzi w tej ANK.</p>
  }

  return (
    <div className="space-y-6">
      {SECTIONS.map((sec) => {
        const rows = sec.keys
          .filter((k) => answers[k] !== undefined && answers[k] !== '' && !(Array.isArray(answers[k]) && (answers[k] as unknown[]).length === 0))
          .map((k) => ({ key: k, label: ANK_QUESTIONS[k] ?? k, value: formatValue(k, answers[k]) }))

        if (rows.length === 0) return null

        return (
          <section key={sec.title}>
            <h3 className="text-xs font-bold uppercase tracking-wide text-brand-600 mb-2 pb-1 border-b border-brand-100">
              {sec.title}
            </h3>
            <dl className="divide-y divide-gray-100">
              {rows.map((r) => (
                <div key={r.key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-3 py-2">
                  <dt className="text-sm text-gray-600 md:col-span-2">{r.label}</dt>
                  <dd className="text-sm font-medium text-gray-900 md:text-right">{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </div>
  )
}
