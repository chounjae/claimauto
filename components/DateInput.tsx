interface DateInputProps {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  error?: string
  min?: string
  max?: string
}

export default function DateInput({ label, hint, value, onChange, error, min, max }: DateInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-800">{label}</label>
      <div className={`flex h-[52px] items-center rounded-lg border bg-white px-4 transition-colors ${
        error ? 'border-[#EF4444]' : 'border-gray-300 focus-within:border-[#2563EB]'
      }`}>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className="flex-1 bg-transparent text-base text-gray-900 outline-none"
        />
      </div>
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
