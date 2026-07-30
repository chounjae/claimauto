import type { Metadata } from 'next'
import ResultClient from './ResultClient'

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
 * 위약금 = 이용료의 1/10
 *
 * 공정거래위원회 고시 「소비자분쟁해결기준」(제2025-14호) [별표 Ⅱ] ④체육시설업 비고란:
 * "위약금은 이용료의 1/10에 해당하는 금액을 말함"
 *
 * 부호는 귀책 주체에 따라 달라진다. calcRefund() 참조.
 */
function calcPenalty(contractAmount: number): number {
  return Math.round(contractAmount * 0.1)
}

/**
 * 반환금액 산정. 위 고시 원문:
 *
 *   4) 사업자의 책임있는 사유로 인한 계약해제
 *      - 이용개시일 이후: 반환금액 = [이용료 - (이용료 × 이용비율)] + 위약금
 *   5) 소비자의 책임있는 사유로 인한 계약해제
 *      - 이용개시일 이후: 반환금액 = [이용료 - (이용료 × 이용비율)] - 위약금
 *
 * 즉 사업자 귀책일 때 위약금은 면제되는 것이 아니라 소비자가 **받는** 금액이다.
 * (2026-07-30 정정. 이전 구현은 사업자 귀책 시 위약금을 0으로 처리해
 *  소비자가 받을 수 있는 금액을 이용료의 10%만큼 과소 산정하고 있었다.)
 */
function calcRefund(
  contractAmount: number,
  usedFee: number,
  penalty: number,
  isBusinessFault: boolean,
): number {
  const base = contractAmount - usedFee
  return Math.max(0, isBusinessFault ? base + penalty : base - penalty)
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const contractAmount = Number(params.contractAmount)
  const monthlyFee = Number(params.monthlyFee)
  const startDate = String(params.startDate ?? '')
  const stopDate = String(params.stopDate ?? '')
  const paymentType = String(params.paymentType ?? '')
  const purchaseType = (params.purchaseType === 'discounted' ? 'discounted' : 'regular') as 'regular' | 'discounted'
  const refundReason = (params.refundReason ?? 'user_cancel') as RefundReason

  if (!contractAmount || !monthlyFee || !startDate || !stopDate) {
    return (
      <main className="flex flex-col items-center justify-center min-h-dvh px-5 text-center">
        <p className="text-lg font-bold text-gray-800">입력 정보가 없습니다</p>
        <a href="/form" className="mt-4 text-sm text-[#2563EB] underline">
          정보 입력으로 돌아가기
        </a>
      </main>
    )
  }

  const isNotStarted = refundReason === 'not_started'
  const isBusinessFault = BUSINESS_FAULT_REASONS.includes(refundReason)
  const usedDays = isNotStarted ? 0 : daysBetween(startDate, stopDate)
  const usedFee = isNotStarted ? 0 : Math.round((monthlyFee / 30) * usedDays)
  const penalty = calcPenalty(contractAmount)
  const refund = calcRefund(contractAmount, usedFee, penalty, isBusinessFault)

  return (
    <ResultClient
      result={{
        contractAmount, monthlyFee, startDate, stopDate,
        usedDays, usedFee, penalty, refund, paymentType, purchaseType, refundReason,
        isBusinessFault,
      }}
    />
  )
}
