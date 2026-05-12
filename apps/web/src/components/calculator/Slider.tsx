'use client'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
  hint?: string
}

export function Slider({ label, value, min, max, step, onChange, format, hint }: Props) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="label !mb-0">{label}</label>
        <span className="text-sm font-semibold text-brand-600">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}
