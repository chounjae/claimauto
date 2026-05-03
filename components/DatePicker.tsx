'use client'

import { useState, useEffect, useMemo } from 'react'

interface DatePickerProps {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 2018 }, (_, i) => currentYear - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function DatePicker({ label, hint, value, onChange, error }: DatePickerProps) {
  const [y, setY] = useState(0)
  const [m, setM] = useState(0)
  const [d, setD] = useState(0)

  useEffect(() => {
    if (value) {
      const parts = value.split('-').map(Number)
      setY(parts[0] ?? 0)
      setM(parts[1] ?? 0)
      setD(parts[2] ?? 0)
    } else {
      setY(0); setM(0); setD(0)
    }
  }, [value])

  const days = useMemo(
    () => (y && m ? Array.from({ length: daysInMonth(y, m) }, (_, i) => i + 1) : []),
    [y, m],
  )

  const handleYear = (val: number) => {
    setY(val)
    setD(0)
    if (val && m && d) {
      const mm = String(m).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      onChange(`${val}-${mm}-${dd}`)
    } else {
      onChange('')
    }
  }

  const handleMonth = (val: number) => {
    setM(val)
    setD(0)
    onChange('')
  }

  const handleDay = (val: number) => {
    setD(val)
    if (y && m && val) {
      const mm = String(m).padStart(2, '0')
      const dd = String(val).padStart(2, '0')
      onChange(`${y}-${mm}-${dd}`)
    } else {
      onChange('')
    }
  }

  const sel = (hasValue: boolean) =>
    `h-[52px] rounded-lg border bg-white px-3 text-sm outline-none appearance-none cursor-pointer transition-colors ${
      error
        ? 'border-[#EF4444]'
        : hasValue
          ? 'border-[#2563EB] text-gray-900 font-medium'
          : 'border-gray-300 text-gray-400'
    }`

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-semibold text-gray-800">{label}</span>}
      <div className="flex gap-2">
        <div className="relative flex-[2]">
          <select value={y || ''} onChange={(e) => handleYear(Number(e.target.value))} className={`${sel(!!y)} w-full pr-7`}>
            <option value="">년도</option>
            {YEARS.map((yr) => <option key={yr} value={yr}>{yr}년</option>)}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
        </div>
        <div className="relative flex-1">
          <select value={m || ''} onChange={(e) => handleMonth(Number(e.target.value))} className={`${sel(!!m)} w-full pr-7`}>
            <option value="">월</option>
            {MONTHS.map((mo) => <option key={mo} value={mo}>{mo}월</option>)}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
        </div>
        <div className="relative flex-1">
          <select value={d || ''} onChange={(e) => handleDay(Number(e.target.value))} disabled={!y || !m} className={`${sel(!!d)} w-full pr-7 disabled:opacity-40`}>
            <option value="">일</option>
            {days.map((day) => <option key={day} value={day}>{day}일</option>)}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
        </div>
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
