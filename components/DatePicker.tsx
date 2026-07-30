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

  /**
   * 바깥에서 들어온 값을 내부 선택 상태에 반영한다.
   *
   * ⚠️ `value` 가 비었을 때 내부 상태를 지우면 안 된다.
   *
   * 연/월을 바꾸면 날짜가 일시적으로 불완전해지므로 `handleYear`·`handleMonth` 가
   * `onChange('')` 를 부른다. 그때 내부 상태까지 초기화하면
   * **방금 고른 연도가 즉시 지워진다.** 값이 이미 채워진 필드(예: 오늘로 미리 채워진
   * 환불 요청일)에서 연도만 바꾸려 해도 세 칸을 처음부터 다시 골라야 했다.
   *
   * 따라서 비어 있는 값은 무시하고, 실제로 다른 날짜가 들어올 때만 동기화한다.
   */
  useEffect(() => {
    if (!value) return
    const parts = value.split('-').map(Number)
    const [ny, nm, nd] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
    if (ny === y && nm === m && nd === d) return
    // 세 개의 select 를 하나의 날짜 문자열과 양방향으로 맞추는 구조라
    // 파생 상태로는 표현되지 않는다. 위 비교로 재귀 렌더는 막았다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setY(ny); setM(nm); setD(nd)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <svg
            aria-hidden="true"
            viewBox="0 0 12 8"
            className="pointer-events-none absolute right-2.5 top-1/2 h-2 w-3 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </div>
        <div className="relative flex-1">
          <select value={m || ''} onChange={(e) => handleMonth(Number(e.target.value))} className={`${sel(!!m)} w-full pr-7`}>
            <option value="">월</option>
            {MONTHS.map((mo) => <option key={mo} value={mo}>{mo}월</option>)}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 12 8"
            className="pointer-events-none absolute right-2.5 top-1/2 h-2 w-3 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
        </div>
        <div className="relative flex-1">
          <select value={d || ''} onChange={(e) => handleDay(Number(e.target.value))} disabled={!y || !m} className={`${sel(!!d)} w-full pr-7 disabled:opacity-40`}>
            <option value="">일</option>
            {days.map((day) => <option key={day} value={day}>{day}일</option>)}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 12 8"
            className="pointer-events-none absolute right-2.5 top-1/2 h-2 w-3 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 1.5 6 6.5 11 1.5" />
          </svg>
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
