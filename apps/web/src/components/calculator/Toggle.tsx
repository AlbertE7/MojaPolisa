'use client'

interface Props {
  label: string
  description?: string
  enabled: boolean
  onChange: (v: boolean) => void
  children?: React.ReactNode
}

export function Toggle({ label, description, enabled, onChange, children }: Props) {
  return (
    <div className={`border rounded-lg p-4 transition-colors ${enabled ? 'border-brand-300 bg-brand-50/30' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 mt-1 ${
            enabled ? 'bg-brand-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex-1">
          <button
            type="button"
            onClick={() => onChange(!enabled)}
            className="text-left w-full"
          >
            <div className="font-semibold text-gray-900">{label}</div>
            {description && <div className="text-sm text-gray-600 mt-0.5">{description}</div>}
          </button>
        </div>
      </div>
      {enabled && children && <div className="mt-4 pl-15 pl-[3.75rem] space-y-3 animate-fade-in">{children}</div>}
    </div>
  )
}
