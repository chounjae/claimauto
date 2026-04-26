interface NumberInputProps {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function NumberInput({ label, hint, value, onChange, error }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    onChange(raw)
  }

  const formatted = value ? Number(value).toLocaleString('ko-KR') : ''

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-800">{label}</label>
      <div className={`flex h-[52px] items-center rounded-lg border bg-white px-4 gap-2 transition-colors ${
        error ? 'border-[#EF4444]' : 'border-gray-300 focus-within:border-[#2563EB]'
      }`}>
        <input
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          placeholder="0"
          className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-300"
        />
        <span className="text-sm text-gray-400 shrink-0">원</span>
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
