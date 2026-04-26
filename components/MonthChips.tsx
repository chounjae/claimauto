'use client'

import { useState } from 'react'

const PRESETS = [3, 6, 12, 24]

interface MonthChipsProps {
  value: number | null
  onChange: (months: number | null) => void
  error?: string
}

export default function MonthChips({ value, onChange, error }: MonthChipsProps) {
  const [custom, setCustom] = useState(false)
  const [inputVal, setInputVal] = useState('')

  const handlePreset = (months: number) => {
    setCustom(false)
    setInputVal('')
    onChange(months)
  }

  const handleCustomToggle = () => {
    setCustom(true)
    onChange(null)
    setInputVal('')
  }

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setInputVal(raw)
    onChange(raw ? Number(raw) : null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-800">계약 기간</span>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handlePreset(m)}
            className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
              !custom && value === m
                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                : 'border-gray-300 bg-white text-gray-600 active:bg-gray-50'
            }`}
          >
            {m}개월
          </button>
        ))}
        <button
          type="button"
          onClick={handleCustomToggle}
          className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
            custom
              ? 'border-[#2563EB] bg-[#2563EB] text-white'
              : 'border-gray-300 bg-white text-gray-600 active:bg-gray-50'
          }`}
        >
          직접입력
        </button>
      </div>
      {custom && (
        <div className={`flex h-[52px] items-center rounded-lg border bg-white px-4 gap-2 ${
          error ? 'border-[#EF4444]' : 'border-gray-300 focus-within:border-[#2563EB]'
        }`}>
          <input
            autoFocus
            type="text"
            inputMode="numeric"
            value={inputVal}
            onChange={handleCustomInput}
            placeholder="예: 18"
            className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-300"
          />
          <span className="text-sm text-gray-400 shrink-0">개월</span>
        </div>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
