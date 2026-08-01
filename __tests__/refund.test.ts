import { calcRefund, calcClaimedComparison, unitPriceOf } from '@/lib/refund'

/**
 * 계산 로직 SSOT 테스트.
 *
 * 근거: 공정거래위원회 고시 「소비자분쟁해결기준」(제2025-14호) [별표 Ⅱ] ④체육시설업
 *   4) 사업자 귀책: 반환금액 = [이용료 − (이용료 × 이용비율)] + 위약금
 *   5) 소비자 귀책: 반환금액 = [이용료 − (이용료 × 이용비율)] − 위약금
 *   비고: 위약금 = 이용료의 1/10
 */

describe('기간제 (period)', () => {
  it('소비자 귀책 — 위약금을 뺀다', () => {
    // 60만원 6개월, 91일 이용
    const r = calcRefund({
      productType: 'period',
      contractAmount: 600_000,
      monthlyFee: 100_000,
      usedDays: 91,
      isBusinessFault: false,
    })
    expect(r.usedFee).toBe(303_333) // (100000/30)*91
    expect(r.penalty).toBe(60_000)
    expect(r.refund).toBe(236_667)
  })

  it('사업자 귀책 — 위약금을 더한다 (차감이 아니다)', () => {
    const r = calcRefund({
      productType: 'period',
      contractAmount: 600_000,
      monthlyFee: 100_000,
      usedDays: 91,
      isBusinessFault: true,
    })
    expect(r.refund).toBe(356_667)
  })

  it('이용 개시 전이면 기이용료가 0이다', () => {
    const r = calcRefund({
      productType: 'period',
      contractAmount: 600_000,
      monthlyFee: 100_000,
      usedDays: 0,
      isBusinessFault: false,
    })
    expect(r.usedFee).toBe(0)
    expect(r.refund).toBe(540_000)
  })

  it('환급액은 음수가 되지 않는다', () => {
    const r = calcRefund({
      productType: 'period',
      contractAmount: 100_000,
      monthlyFee: 100_000,
      usedDays: 300,
      isBusinessFault: false,
    })
    expect(r.refund).toBe(0)
  })
})

describe('횟수제 (session) — PT·필라테스', () => {
  it('회당 단가는 실납부액 ÷ 총횟수다 (정가 아님)', () => {
    // 지식iN #2 실제 사례: 150만원 30회 결제, 15회 사용
    // 헬스장은 정가 165만 기준 55,000원을 주장했다
    expect(unitPriceOf(1_500_000, 30)).toBe(50_000)
  })

  it('소비자 귀책 — 잔여 횟수분에서 위약금을 뺀다', () => {
    const r = calcRefund({
      productType: 'session',
      contractAmount: 1_500_000,
      totalSessions: 30,
      usedSessions: 15,
      isBusinessFault: false,
    })
    expect(r.usedFee).toBe(750_000) // 50,000 × 15
    expect(r.penalty).toBe(150_000)
    expect(r.refund).toBe(600_000)
  })

  it('사업자 귀책 — 위약금을 더한다', () => {
    const r = calcRefund({
      productType: 'session',
      contractAmount: 1_500_000,
      totalSessions: 30,
      usedSessions: 15,
      isBusinessFault: true,
    })
    expect(r.refund).toBe(900_000)
  })

  it('1회도 사용하지 않았으면 기이용료가 0이다', () => {
    const r = calcRefund({
      productType: 'session',
      contractAmount: 1_540_000,
      totalSessions: 20,
      usedSessions: 0,
      isBusinessFault: false,
    })
    expect(r.usedFee).toBe(0)
    expect(r.refund).toBe(1_386_000)
  })

  it('총횟수가 0이면 단가는 0으로 처리한다 (0 나누기 방지)', () => {
    expect(unitPriceOf(100_000, 0)).toBe(0)
  })
})

describe('단가 비교 — 헬스장 주장과의 차액', () => {
  it('기간제: 하루권 단가를 주장하면 차액이 나온다 (지식iN #17)', () => {
    // 1개월권 7만원, 2일 이용. 헬스장은 하루권 12,000원 기준 주장
    const base = calcRefund({
      productType: 'period',
      contractAmount: 70_000,
      monthlyFee: 70_000,
      usedDays: 2,
      isBusinessFault: false,
    })
    const cmp = calcClaimedComparison(
      { productType: 'period', contractAmount: 70_000, monthlyFee: 70_000, usedDays: 2, isBusinessFault: false },
      12_000,
    )!
    expect(base.usedFee).toBe(4_667) // (70000/30)*2
    expect(cmp.claimedUsedFee).toBe(24_000) // 12,000 × 2일
    expect(cmp.gap).toBe(19_333)
    expect(cmp.multiple).toBeCloseTo(5.1, 1)
  })

  it('횟수제: 정가 회당 단가를 주장하면 차액이 나온다 (지식iN #2)', () => {
    const cmp = calcClaimedComparison(
      {
        productType: 'session',
        contractAmount: 1_500_000,
        totalSessions: 30,
        usedSessions: 15,
        isBusinessFault: false,
      },
      55_000,
    )!
    expect(cmp.claimedUsedFee).toBe(825_000) // 55,000 × 15회
    expect(cmp.gap).toBe(75_000) // 825,000 − 750,000
  })

  it('주장 단가가 우리 계산보다 낮거나 같으면 비교를 만들지 않는다', () => {
    const cmp = calcClaimedComparison(
      { productType: 'period', contractAmount: 70_000, monthlyFee: 70_000, usedDays: 2, isBusinessFault: false },
      1_000,
    )
    expect(cmp).toBeNull()
  })

  it('주장 단가가 없으면 null이다', () => {
    const cmp = calcClaimedComparison(
      { productType: 'period', contractAmount: 70_000, monthlyFee: 70_000, usedDays: 2, isBusinessFault: false },
      null,
    )
    expect(cmp).toBeNull()
  })

  it('주장 단가를 적용해도 환급액은 음수가 되지 않는다', () => {
    const cmp = calcClaimedComparison(
      { productType: 'period', contractAmount: 70_000, monthlyFee: 70_000, usedDays: 2, isBusinessFault: false },
      999_999,
    )!
    expect(cmp.claimedRefund).toBe(0)
    // 차액은 우리 계산 환급액 전액이 된다
    expect(cmp.gap).toBe(58_333)
  })
})
