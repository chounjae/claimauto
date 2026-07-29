/**
 * 환불 청구서(내용증명) 문서 데이터 — 단일 출처
 *
 * 화면 미리보기(`app/pdf/PdfClient.tsx`)와 서버 PDF 생성(`app/api/pdf/route.ts`)이
 * 같은 문구·같은 계산 표시를 쓰도록 여기에 모은다.
 * 두 곳에 같은 문장을 복사해 두면 한쪽만 고쳐져 서로 다른 문서가 나간다.
 *
 * ⚠️ 법령 인용은 반드시 `lib/legal.ts` 상수를 조합해서 만든다. 직접 쓰지 말 것.
 */

import { GOSI_SHORT, PENALTY_DESC } from './legal'

export type RefundReason =
  | 'closure'
  | 'facility_defect'
  | 'service_reduction'
  | 'gym_relocation'
  | 'price_increase'
  | 'not_started'
  | 'injury'
  | 'pregnancy'
  | 'relocation'
  | 'job_change'
  | 'user_cancel'

export const REFUND_REASONS: readonly RefundReason[] = [
  'closure',
  'facility_defect',
  'service_reduction',
  'gym_relocation',
  'price_increase',
  'not_started',
  'injury',
  'pregnancy',
  'relocation',
  'job_change',
  'user_cancel',
]

export type PurchaseType = 'regular' | 'discounted'
export type Deadline = '7' | '14'

/** `/result` → `/pdf` 로 넘어오는 계산 결과 */
export interface CalcData {
  contractAmount: number
  monthlyFee: number
  startDate: string
  stopDate: string
  paymentType: string
  purchaseType: PurchaseType
  usedDays: number
  usedFee: number
  penalty: number
  refund: number
  refundReason?: RefundReason
  /** 사업자 귀책 여부. true면 위약금을 차감이 아니라 가산한다 (고시 ④체육시설업 4항).
   *  구 URL 호환을 위해 optional. 없으면 false(소비자 귀책)로 본다. */
  isBusinessFault?: boolean
}

/** `/pdf` 에서 사용자가 직접 입력하는 정보 */
export interface ClaimantInfo {
  name: string
  phone: string
  myAddress: string
  gymName: string
  gymAddress: string
  staffName: string
  bankAccount: string
  deadline: Deadline
}

export const REASON_LABEL: Record<RefundReason, string> = {
  closure: '헬스장 폐업',
  facility_defect: '시설 훼손 / 기구 고장·철거',
  service_reduction: '운영시간·서비스 축소',
  gym_relocation: '헬스장 이전 (접근 불가)',
  price_increase: '약정 외 요금 인상',
  not_started: '이용 개시 전 해지',
  injury: '부상 / 질병',
  pregnancy: '임신 / 출산',
  relocation: '이사 (주거지 이전)',
  job_change: '이직 / 직장 이전',
  user_cancel: '단순 변심',
}

/** 사업자 귀책 사유 — 잔여 이용료에 위약금을 "더해" 청구한다 */
const businessFaultBody = (situation: string) =>
  `${situation} ${GOSI_SHORT}에 따라 사업자 귀책에 해당하므로, 잔여 이용료에 ${PENALTY_DESC}을 더한 금액의 환불을 요청드립니다.`

/** 소비자 사정 사유 — 기이용료와 위약금을 "빼고" 청구한다 */
const userReasonBody = (situation: string) =>
  `${situation} ${GOSI_SHORT}에 따라 기이용료와 ${PENALTY_DESC}을 제외한 잔여금액의 환불을 요청드립니다.`

export const REASON_BODY: Record<RefundReason, string> = {
  closure: businessFaultBody(
    '귀 업체가 폐업하여 계약 서비스를 더 이상 이용할 수 없게 되었습니다.',
  ),
  facility_defect: businessFaultBody(
    '약정 시설의 훼손 또는 주요 기구의 고장·철거로 인해 계약 목적 달성이 어렵습니다.',
  ),
  service_reduction: businessFaultBody(
    '계약 당시 약정된 운영시간이나 서비스 수준이 변경되어 정상적인 이용이 어렵습니다.',
  ),
  gym_relocation: businessFaultBody(
    '헬스장의 이전으로 인해 동일한 방식의 이용이 어렵게 되었습니다.',
  ),
  price_increase: businessFaultBody(
    '계약 당시 약정되지 않은 요금 인상이 이루어져 계약 조건이 변경되었습니다.',
  ),
  injury: userReasonBody('부상·질병으로 인해 헬스장 이용이 어려워 중도해지를 요청드립니다.'),
  pregnancy: userReasonBody('임신·출산으로 인해 헬스장 이용이 어려워 중도해지를 요청드립니다.'),
  relocation: userReasonBody('이사로 인해 헬스장 방문이 어렵게 되어 중도해지를 요청드립니다.'),
  job_change: userReasonBody(
    '이직·직장 이전으로 인해 헬스장 방문이 어렵게 되어 중도해지를 요청드립니다.',
  ),
  user_cancel: userReasonBody('개인 사정으로 인해 계약 기간 중 중도해지를 요청드립니다.'),
  not_started:
    `결제 후 이용을 개시하지 않은 상태에서 계약 해지를 요청드립니다. ${GOSI_SHORT}에 따라 ` +
    `이용 개시 전 해지이므로 기이용료는 발생하지 않으며, ${PENALTY_DESC}만을 제외한 금액의 환불을 요청드립니다.`,
}

export function fmt(n: number) {
  return n.toLocaleString()
}

/** `2024-03-15` → `2024년 3월 15일` */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}

/**
 * ISO 날짜에 일수를 더해 한국어 표기로 돌려준다.
 *
 * 실행 환경의 타임존에 영향받지 않도록 UTC 기준 산술만 쓴다.
 * (서버는 UTC, 사용자는 KST 라서 `new Date()` 지역시간에 기대면 하루가 어긋난다.)
 */
export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return formatDate(dt.toISOString().slice(0, 10))
}

/**
 * 오늘 날짜(한국 시간 기준) `YYYY-MM-DD`.
 *
 * 미리보기(브라우저)와 서버 PDF 가 같은 날짜를 쓰게 하려면 양쪽 다 서울 기준이어야 한다.
 * `new Date().toISOString()` 은 UTC 라 00:00~09:00 KST 사이에 전날로 찍힌다.
 */
export function todayIsoSeoul(now: Date = new Date()): string {
  // en-CA 로케일은 YYYY-MM-DD 형식을 준다.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** 서버 PDF 생성에 필요한 모든 값 */
export interface ClaimDocData {
  calc: CalcData
  info: ClaimantInfo
  /** 문서 작성일 (YYYY-MM-DD, 한국 시간 기준) */
  todayIso: string
}

/** `/api/pdf` 가 받는 쿼리 파라미터 이름 목록 (클라이언트 URL 생성과 공유) */
export const PDF_QUERY_KEYS = [
  'contractAmount',
  'monthlyFee',
  'startDate',
  'stopDate',
  'paymentType',
  'purchaseType',
  'usedDays',
  'usedFee',
  'penalty',
  'refund',
  'refundReason',
  'isBusinessFault',
  'name',
  'phone',
  'myAddress',
  'gymName',
  'gymAddress',
  'staffName',
  'bankAccount',
  'deadline',
] as const

/** 계산 결과 + 입력 정보를 `/api/pdf` 쿼리스트링으로 직렬화한다. */
export function buildPdfQuery(calc: CalcData, info: ClaimantInfo): string {
  const q = new URLSearchParams({
    contractAmount: String(calc.contractAmount),
    monthlyFee: String(calc.monthlyFee),
    startDate: calc.startDate,
    stopDate: calc.stopDate,
    paymentType: calc.paymentType,
    purchaseType: calc.purchaseType,
    usedDays: String(calc.usedDays),
    usedFee: String(calc.usedFee),
    penalty: String(calc.penalty),
    refund: String(calc.refund),
    refundReason: calc.refundReason ?? 'user_cancel',
    isBusinessFault: String(calc.isBusinessFault ?? false),
    name: info.name,
    phone: info.phone,
    gymName: info.gymName,
    gymAddress: info.gymAddress,
    deadline: info.deadline,
  })
  // 선택 입력은 값이 있을 때만 붙인다 (URL 에 불필요한 개인정보를 남기지 않기 위함).
  if (info.myAddress) q.set('myAddress', info.myAddress)
  if (info.staffName) q.set('staffName', info.staffName)
  if (info.bankAccount) q.set('bankAccount', info.bankAccount)
  return q.toString()
}

/** 필드별 최대 길이. 초과하면 400 으로 거절한다 (무한 길이 입력 방어). */
const MAX_LEN: Record<string, number> = {
  name: 50,
  phone: 30,
  myAddress: 200,
  gymName: 100,
  gymAddress: 200,
  staffName: 50,
  bankAccount: 100,
  paymentType: 50,
}

export type ParseResult =
  | { ok: true; data: ClaimDocData }
  | { ok: false; error: string }

function num(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key)
  if (raw === null || raw.trim() === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  return n
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function str(params: URLSearchParams, key: string): string {
  return (params.get(key) ?? '').trim()
}

/**
 * 쿼리 파라미터를 문서 데이터로 변환한다.
 *
 * ⚠️ 개인정보(이름·연락처·주소)를 다루므로 어떤 경우에도 로그로 남기지 않는다.
 *    오류 메시지에도 값을 넣지 말고 필드 이름만 쓴다.
 */
export function parseClaimParams(params: URLSearchParams, now: Date = new Date()): ParseResult {
  const contractAmount = num(params, 'contractAmount')
  const monthlyFee = num(params, 'monthlyFee')
  const startDate = str(params, 'startDate')
  const stopDate = str(params, 'stopDate')

  if (contractAmount === null || contractAmount <= 0) return { ok: false, error: 'contractAmount' }
  if (monthlyFee === null || monthlyFee < 0) return { ok: false, error: 'monthlyFee' }
  if (!ISO_DATE.test(startDate)) return { ok: false, error: 'startDate' }
  if (!ISO_DATE.test(stopDate)) return { ok: false, error: 'stopDate' }

  const usedDays = num(params, 'usedDays')
  const usedFee = num(params, 'usedFee')
  const penalty = num(params, 'penalty')
  const refund = num(params, 'refund')
  if (usedDays === null || usedDays < 0) return { ok: false, error: 'usedDays' }
  if (usedFee === null || usedFee < 0) return { ok: false, error: 'usedFee' }
  if (penalty === null || penalty < 0) return { ok: false, error: 'penalty' }
  if (refund === null) return { ok: false, error: 'refund' }

  const rawReason = str(params, 'refundReason') || 'user_cancel'
  if (!REFUND_REASONS.includes(rawReason as RefundReason)) return { ok: false, error: 'refundReason' }
  const refundReason = rawReason as RefundReason

  const rawDeadline = str(params, 'deadline') || '7'
  if (rawDeadline !== '7' && rawDeadline !== '14') return { ok: false, error: 'deadline' }

  const info: ClaimantInfo = {
    name: str(params, 'name'),
    phone: str(params, 'phone'),
    myAddress: str(params, 'myAddress'),
    gymName: str(params, 'gymName'),
    gymAddress: str(params, 'gymAddress'),
    staffName: str(params, 'staffName'),
    bankAccount: str(params, 'bankAccount'),
    deadline: rawDeadline,
  }

  // 미리보기 화면과 동일한 필수 항목 검증
  for (const key of ['name', 'phone', 'gymName', 'gymAddress'] as const) {
    if (!info[key]) return { ok: false, error: key }
  }

  const paymentType = str(params, 'paymentType')
  for (const [key, max] of Object.entries(MAX_LEN)) {
    const value = key === 'paymentType' ? paymentType : info[key as keyof ClaimantInfo]
    if (typeof value === 'string' && value.length > max) return { ok: false, error: key }
  }

  return {
    ok: true,
    data: {
      calc: {
        contractAmount,
        monthlyFee,
        startDate,
        stopDate,
        paymentType,
        purchaseType: params.get('purchaseType') === 'discounted' ? 'discounted' : 'regular',
        usedDays,
        usedFee,
        penalty,
        refund,
        refundReason,
        isBusinessFault: params.get('isBusinessFault') === 'true',
      },
      info,
      todayIso: todayIsoSeoul(now),
    },
  }
}
