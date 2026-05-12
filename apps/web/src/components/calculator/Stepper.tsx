interface Props {
  steps: string[]
  current: number
}

export function Stepper({ steps, current }: Props) {
  return (
    <ol className="flex items-center w-full mb-8">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={label}
            className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  done
                    ? 'bg-brand-600 text-white'
                    : active
                      ? 'bg-gold-400 text-brand-900 ring-4 ring-gold-100'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium hidden sm:block ${
                  active ? 'text-brand-700' : done ? 'text-brand-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${done ? 'bg-brand-600' : 'bg-gray-200'}`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
