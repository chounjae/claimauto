'use client'

import type { ProductType } from '@/lib/refund'

/**
 * 상품 유형 선택 — 기간제 / 횟수제
 *
 * 왜 필요한가.
 * 지식iN 최근 20건 중 본문 확보 18건에서 9건(50%)이 PT·필라테스 횟수제였다.
 * 기존 폼은 `월 이용료`만 받아 "30회 중 15회 사용"을 표현할 수 없었고,
 * 그 절반의 사용자는 계산 자체가 불가능했다.
 * (`docs/03-research/2026-08-01-kin-20-case-analysis.md`, ADR-002 개정)
 *
 * 기본값은 `period` 다. 기존 사용자 흐름을 바꾸지 않는다.
 */

interface Props {
  value: ProductType
  onChange: (v: ProductType) => void
}

const OPTIONS: { value: ProductType; label: string; sub: string }[] = [
  { value: 'period', label: '기간제', sub: '3개월·6개월권 등' },
  { value: 'session', label: '횟수제', sub: 'PT·필라테스 10회 등' },
]

export default function ProductTypeChips({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-gray-800">어떤 상품인가요?</span>
      <div className="flex gap-2" role="radiogroup" aria-label="상품 유형">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition-colors ${
              value === opt.value ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <span className={`text-sm font-semibold ${value === opt.value ? 'text-[#2563EB]' : 'text-gray-800'}`}>
              {opt.label}
            </span>
            <span className="mt-0.5 text-xs text-gray-400">{opt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
