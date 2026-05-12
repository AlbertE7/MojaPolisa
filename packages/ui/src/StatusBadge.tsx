import type { PolicyStatus } from '@mojapolisa/shared'

const LABELS: Record<PolicyStatus, string> = {
  submitted: '🟡 Wniosek złożony',
  in_review: '🔵 W analizie',
  ready: '🟠 Polisa gotowa – wymaga akceptacji',
  accepted: '🟢 Zaakceptowana',
  active: '🟢 Aktywna',
  expired: '⚪ Wygasła',
  claim_in_progress: '🔴 Szkoda w toku',
}

const STYLES: Record<PolicyStatus, string> = {
  submitted: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  ready: 'bg-orange-100 text-orange-800',
  accepted: 'bg-green-100 text-green-800',
  active: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-600',
  claim_in_progress: 'bg-red-100 text-red-800',
}

interface Props {
  status: PolicyStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
