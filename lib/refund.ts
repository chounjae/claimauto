/**
 * 환급액 계산 SSOT.
 *
 * 이전에는 `app/result/page.tsx` 안에 계산이 들어 있었다. 상품 유형이 둘로 늘면서
 * PDF·결과 화면·테스트가 같은 식을 봐야 하므로 여기로 옮겼다.
 *
 * 근거: 공정거래위원회 고시 「소비자분쟁해결기준」(제2025-14호) [별표 Ⅱ] ④체육시설업
 *   4) 사업자의 책임있는 사유로 인한 계약해제
 *      - 이용개시일 이후: 반환금액 = [이용료 − (이용료 × 이용비율)] + 위약금
 *   5) 소비자의 책임있는 사유로 인한 계약해제
 *      - 이용개시일 이후: 반환금액 = [이용료 − (이용료 × 이용비율)] − 위약금
 *   비고: 위약금은 이용료의 1/10에 해당하는 금액
 *
 * 사업자 귀책일 때 위약금은 면제가 아니라 소비자가 **받는** 금액이다.
 *
 * 「이용비율」의 해석
 * - 기간제: 이용일수 ÷ 계약일수  →  기이용료 = (월 이용료 ÷ 30) × 이용일수
 * - 횟수제: 이용횟수 ÷ 총횟수    →  기이용료 = (실납부액 ÷ 총횟수) × 이용횟수
 *
 * 횟수제 단가에 **실납부액**을 쓰는 것이 이 파일의 핵심이다.
 * 사업자는 정가·할인 전 단가를 주장하는 경우가 많다(지식iN 실사례 5건 관측).
 * 그 차액을 보여주는 것이 calcClaimedComparison() 이다.
 */

export type ProductType = 'period' | 'session'

interface Common {
  contractAmount: number
  isBusinessFault: boolean
}

export interface PeriodInput extends Common {
  productType: 'period'
  /** 총 결제금액 ÷ 계약 개월수 */
  monthlyFee: number
  usedDays: number
}

export interface SessionInput extends Common {
  productType: 'session'
  totalSessions: number
  usedSessions: number
}

export type RefundInput = PeriodInput | SessionInput

export interface RefundResult {
  /** 기이용료 — 이미 쓴 만큼의 금액 */
  usedFee: number
  /** 위약금 = 이용료의 1/10 */
  penalty: number
  /** 반환금액 */
  refund: number
}

/** 회당 단가. 총횟수가 0이면 0으로 둔다(0 나누기 방지). */
export function unitPriceOf(contractAmount: number, totalSessions: number): number {
  if (!totalSessions || totalSessions <= 0) return 0
  return Math.round(contractAmount / totalSessions)
}

/** 위약금 = 이용료의 1/10 (고시 비고란) */
export function calcPenalty(contractAmount: number): number {
  return Math.round(contractAmount * 0.1)
}

function usedFeeOf(input: RefundInput): number {
  if (input.productType === 'session') {
    return unitPriceOf(input.contractAmount, input.totalSessions) * Math.max(0, input.usedSessions)
  }
  return Math.round((input.monthlyFee / 30) * Math.max(0, input.usedDays))
}

export function calcRefund(input: RefundInput): RefundResult {
  const usedFee = usedFeeOf(input)
  const penalty = calcPenalty(input.contractAmount)
  const base = input.contractAmount - usedFee
  const refund = Math.max(0, input.isBusinessFault ? base + penalty : base - penalty)
  return { usedFee, penalty, refund }
}

export interface ClaimedComparison {
  /** 사업자가 주장한 단가로 계산한 기이용료 */
  claimedUsedFee: number
  /** 그 경우의 환급액 */
  claimedRefund: number
  /** 고시 기준 환급액 − 사업자 주장 환급액. 항상 양수 */
  gap: number
  /** 사업자 주장 단가 ÷ 고시 기준 단가 */
  multiple: number
}

/**
 * 사업자가 주장하는 1일(1회) 단가를 대입해 차액을 만든다.
 *
 * 지식iN 실사례 20건 중 5건이 이 다툼이었다. 공식은 양쪽이 같고 단가만 다르다.
 * 예) 1개월 70,000원 계약에서 2일 이용:
 *     고시 기준 (70,000÷30)×2 = 4,667원
 *     사업자 주장 하루권 12,000×2 = 24,000원  → 5.1배
 *
 * 주장 단가가 고시 기준보다 낮거나 같으면 다툴 것이 없으므로 null을 반환한다.
 */
export function calcClaimedComparison(
  input: RefundInput,
  claimedUnitPrice: number | null,
): ClaimedComparison | null {
  if (!claimedUnitPrice || claimedUnitPrice <= 0) return null

  const ourUsedFee = usedFeeOf(input)
  const units = input.productType === 'session'
    ? Math.max(0, input.usedSessions)
    : Math.max(0, input.usedDays)
  if (units <= 0) return null

  const claimedUsedFee = claimedUnitPrice * units
  if (claimedUsedFee <= ourUsedFee) return null

  const penalty = calcPenalty(input.contractAmount)
  const claimedBase = input.contractAmount - claimedUsedFee
  const claimedRefund = Math.max(0, input.isBusinessFault ? claimedBase + penalty : claimedBase - penalty)

  const ourRefund = calcRefund(input).refund
  const ourUnitPrice = ourUsedFee / units

  return {
    claimedUsedFee,
    claimedRefund,
    gap: ourRefund - claimedRefund,
    multiple: ourUnitPrice > 0 ? claimedUnitPrice / ourUnitPrice : 0,
  }
}
