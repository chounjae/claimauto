import type { Metadata } from 'next'
import ResultClient from './ResultClient'
import {
  calcRefund,
  calcClaimedComparison,
  unitPriceOf,
  type RefundInput,
  type ProductType,
} from '@/lib/refund'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type RefundReason = 'closure' | 'facility_defect' | 'service_reduction' | 'gym_relocation' | 'price_increase' | 'not_started' | 'injury' | 'pregnancy' | 'relocation' | 'job_change' | 'user_cancel'

const BUSINESS_FAULT_REASONS: RefundReason[] = ['closure', 'facility_defect', 'service_reduction', 'gym_relocation', 'price_increase']

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

/**
 * 계산은 전부 `lib/refund.ts` 가 한다. 이 파일은 URL 파라미터를 그 입력 타입으로 옮기기만 한다.
 * 2026-08-01 이전에는 계산식이 여기 인라인으로 있었다 — PDF·결과 화면·테스트가
 * 같은 식을 봐야 해서 SSOT로 분리했다.
 */
export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const num = (k: string) => Number(params[k])

  const productType = (params.productType === 'session' ? 'session' : 'period') as ProductType
  const contractAmount = num('contractAmount')
  const stopDate = String(params.stopDate ?? '')
  const paymentType = String(params.paymentType ?? '')
  const purchaseType = (params.purchaseType === 'discounted' ? 'discounted' : 'regular') as 'regular' | 'discounted'
  const refundReason = (params.refundReason ?? 'user_cancel') as RefundReason
  const claimedUnitPrice = params.claimedUnitPrice ? num('claimedUnitPrice') : null

  const isSession = productType === 'session'
  const isNotStarted = refundReason === 'not_started'
  const isBusinessFault = BUSINESS_FAULT_REASONS.includes(refundReason)

  // 기간제 전용. 횟수제에서는 넘어오지 않으므로 0으로 둔다
  // (PDF 쿼리 직렬화에서 NaN 이 되면 서버가 400 으로 거절한다).
  const monthlyFee = isSession ? 0 : num('monthlyFee')
  const startDate = String(params.startDate ?? '')
  // 횟수제 전용
  const totalSessions = num('totalSessions')
  const usedSessionsRaw = params.usedSessions === undefined ? NaN : num('usedSessions')

  const missing = isSession
    ? !contractAmount || !totalSessions || Number.isNaN(usedSessionsRaw) || !startDate || !stopDate
    : !contractAmount || !monthlyFee || !startDate || !stopDate

  if (missing) {
    return (
      <main className="flex flex-col items-center justify-center min-h-dvh px-5 text-center">
        <p className="text-lg font-bold text-gray-800">입력 정보가 없습니다</p>
        <a href="/form" className="mt-4 text-sm text-[#2563EB] underline">
          정보 입력으로 돌아가기
        </a>
      </main>
    )
  }

  const usedDays = isNotStarted || isSession ? 0 : daysBetween(startDate, stopDate)
  const usedSessions = isNotStarted ? 0 : Math.max(0, usedSessionsRaw)

  const input: RefundInput = isSession
    ? { productType: 'session', contractAmount, totalSessions, usedSessions, isBusinessFault }
    : { productType: 'period', contractAmount, monthlyFee, usedDays, isBusinessFault }

  const { usedFee, penalty, refund } = calcRefund(input)
  const comparison = calcClaimedComparison(input, claimedUnitPrice)

  return (
    <ResultClient
      result={{
        productType,
        contractAmount, monthlyFee, startDate, stopDate,
        usedDays, usedFee, penalty, refund, paymentType, purchaseType, refundReason,
        isBusinessFault,
        totalSessions, usedSessions,
        unitPrice: isSession ? unitPriceOf(contractAmount, totalSessions) : Math.round(monthlyFee / 30),
        claimedUnitPrice,
        comparison,
      }}
    />
  )
}
