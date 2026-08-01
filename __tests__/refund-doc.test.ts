import { GOSI_SHORT, PENALTY_DESC } from '@/lib/legal'
import {
  addDays,
  buildPdfQuery,
  formatDate,
  parseClaimParams,
  REASON_BODY,
  REFUND_REASONS,
  todayIsoSeoul,
  type CalcData,
  type ClaimantInfo,
} from '@/lib/refund-doc'

const calc: CalcData = {
  contractAmount: 400000,
  monthlyFee: 33333,
  startDate: '2024-01-01',
  stopDate: '2024-03-15',
  paymentType: '신용카드 일시불',
  purchaseType: 'regular',
  usedDays: 74,
  usedFee: 82221,
  penalty: 40000,
  refund: 277779,
  refundReason: 'user_cancel',
  isBusinessFault: false,
}

const info: ClaimantInfo = {
  name: '홍길동',
  phone: '010-1234-5678',
  myAddress: '서울시 강남구 테헤란로 123',
  gymName: '바디쉐이프 헬스장',
  gymAddress: '서울시 관악구 봉천로 45',
  staffName: '김철수',
  bankAccount: '국민 123-456-789012 홍길동',
  deadline: '7',
}

describe('REASON_BODY', () => {
  it('11개 사유가 모두 정의되어 있다', () => {
    expect(Object.keys(REASON_BODY).sort()).toEqual([...REFUND_REASONS].sort())
  })

  it('법령 인용은 lib/legal.ts 상수를 그대로 쓴다 (하드코딩 금지)', () => {
    for (const reason of REFUND_REASONS) {
      expect(REASON_BODY[reason]).toContain(GOSI_SHORT)
      expect(REASON_BODY[reason]).toContain(PENALTY_DESC)
    }
  })
})

describe('날짜 헬퍼', () => {
  it('formatDate 는 한국어 표기로 바꾼다', () => {
    expect(formatDate('2024-03-05')).toBe('2024년 3월 5일')
  })

  it('addDays 는 월·연 경계를 넘어도 정확하다', () => {
    expect(addDays('2026-07-30', 7)).toBe('2026년 8월 6일')
    expect(addDays('2026-12-28', 14)).toBe('2027년 1월 11일')
  })

  it('todayIsoSeoul 은 실행 환경 타임존과 무관하게 한국 날짜를 준다', () => {
    // 2026-07-30 23:30 UTC = 2026-07-31 08:30 KST
    expect(todayIsoSeoul(new Date('2026-07-30T23:30:00Z'))).toBe('2026-07-31')
    // 2026-07-30 00:30 UTC = 2026-07-30 09:30 KST
    expect(todayIsoSeoul(new Date('2026-07-30T00:30:00Z'))).toBe('2026-07-30')
  })
})

describe('parseClaimParams', () => {
  const query = (overrides: Record<string, string> = {}) => {
    const q = new URLSearchParams(buildPdfQuery(calc, info))
    for (const [k, v] of Object.entries(overrides)) {
      if (v === '') q.delete(k)
      else q.set(k, v)
    }
    return q
  }

  it('buildPdfQuery 로 만든 쿼리를 그대로 되돌려 읽는다', () => {
    const result = parseClaimParams(query())
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.calc).toMatchObject({
      contractAmount: 400000,
      refund: 277779,
      refundReason: 'user_cancel',
      isBusinessFault: false,
      purchaseType: 'regular',
      paymentType: '신용카드 일시불',
    })
    expect(result.data.info).toEqual(info)
  })

  it('사업자 귀책 플래그를 보존한다', () => {
    const result = parseClaimParams(query({ isBusinessFault: 'true' }))
    expect(result.ok && result.data.calc.isBusinessFault).toBe(true)
  })

  it.each([
    ['contractAmount', ''],
    ['startDate', '2024/01/01'],
    ['stopDate', ''],
    ['refundReason', 'DROP TABLE'],
    ['deadline', '30'],
    ['name', ''],
    ['phone', ''],
    ['gymName', ''],
    ['gymAddress', ''],
  ])('%s 가 잘못되면 거절한다', (field, value) => {
    const result = parseClaimParams(query({ [field]: value }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe(field)
  })

  it('지나치게 긴 입력은 거절한다', () => {
    const result = parseClaimParams(query({ gymAddress: '가'.repeat(300) }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('gymAddress')
  })

  it('선택 입력이 비어 있어도 통과한다', () => {
    const minimal: ClaimantInfo = {
      ...info,
      myAddress: '',
      staffName: '',
      bankAccount: '',
    }
    const result = parseClaimParams(new URLSearchParams(buildPdfQuery(calc, minimal)))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.info).toEqual(minimal)
  })
})

// ── 단가 산정 반박 (ADR-005) ────────────────────────────────────────
import { unitPriceRebuttal } from '@/lib/refund-doc'

const baseCalc: CalcData = {
  contractAmount: 70_000,
  monthlyFee: 70_000,
  startDate: '2026-07-01',
  stopDate: '2026-07-03',
  paymentType: '신용카드 일시불',
  purchaseType: 'regular',
  usedDays: 2,
  usedFee: 4_667,
  penalty: 7_000,
  refund: 58_333,
  refundReason: 'user_cancel',
}

describe('unitPriceRebuttal', () => {
  it('주장 단가가 없으면 문단을 만들지 않는다', () => {
    expect(unitPriceRebuttal(baseCalc)).toBeNull()
  })

  it('차액이 0 이하면 문단을 만들지 않는다', () => {
    expect(unitPriceRebuttal({ ...baseCalc, claimedUnitPrice: 12_000, claimedGap: 0 })).toBeNull()
  })

  it('기간제 — 1일 단가와 차액을 문장에 담는다', () => {
    const t = unitPriceRebuttal({ ...baseCalc, claimedUnitPrice: 12_000, claimedGap: 19_333 })!
    expect(t).toContain('1일당 12,000원')
    expect(t).toContain('19,333원이 감소')
    expect(t).toContain('계약 기간으로 나눈 금액')
  })

  it('횟수제 — 1회 단가 기준으로 문장이 바뀐다', () => {
    const t = unitPriceRebuttal({
      ...baseCalc,
      productType: 'session',
      totalSessions: 30,
      usedSessions: 15,
      claimedUnitPrice: 55_000,
      claimedGap: 75_000,
    })!
    expect(t).toContain('1회당 55,000원')
    expect(t).toContain('총 계약 횟수로 나눈 금액')
  })

  it('강행규정·무효 같은 단정 표현을 쓰지 않는다 (소비자기본법 §16③)', () => {
    const t = unitPriceRebuttal({ ...baseCalc, claimedUnitPrice: 12_000, claimedGap: 19_333 })!
    expect(t).not.toContain('강행규정')
    expect(t).not.toContain('무효')
  })
})
