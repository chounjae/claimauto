'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import ProgressBar from '@/components/ProgressBar'
import CountUp from '@/components/CountUp'

type RefundReason = 'closure' | 'facility_defect' | 'service_reduction' | 'gym_relocation' | 'price_increase' | 'injury' | 'pregnancy' | 'relocation' | 'job_change' | 'user_cancel'

interface CalcResult {
  contractAmount: number
  monthlyFee: number
  startDate: string
  stopDate: string
  usedDays: number
  usedFee: number
  penalty: number
  refund: number
  paymentType: string
  refundReason?: RefundReason
}

const REASON_LABEL: Record<RefundReason, string> = {
  closure: '헬스장 폐업',
  facility_defect: '시설 훼손 / 기구 고장·철거',
  service_reduction: '운영시간·서비스 축소',
  gym_relocation: '헬스장 이전 (접근 불가)',
  price_increase: '약정 외 요금 인상',
  injury: '부상 / 질병',
  pregnancy: '임신 / 출산',
  relocation: '이사 (주거지 이전)',
  job_change: '이직 / 직장 이전',
  user_cancel: '단순 변심',
}

const PERSONAL_REASONS = new Set<RefundReason>(['injury', 'pregnancy', 'relocation', 'job_change', 'user_cancel'])

export default function ResultClient({ result }: { result: CalcResult }) {
  const fmt = (n: number) => n.toLocaleString()
  const noPenalty = result.penalty === 0
  const isPersonal = result.refundReason ? PERSONAL_REASONS.has(result.refundReason) : false

  const pdfParams = new URLSearchParams({
    contractAmount: String(result.contractAmount),
    monthlyFee: String(result.monthlyFee),
    startDate: result.startDate,
    stopDate: result.stopDate,
    paymentType: result.paymentType,
    usedDays: String(result.usedDays),
    usedFee: String(result.usedFee),
    penalty: String(result.penalty),
    refund: String(result.refund),
    ...(result.refundReason && { refundReason: result.refundReason }),
  })

  return (
    <main className="flex flex-col min-h-screen px-5 pb-24">
      <header className="pt-6 pb-4">
        <Logo />
      </header>

      <div className="mb-6">
        <ProgressBar current={2} total={3} />
      </div>

      {/* 환급액 카드 */}
      <div className="rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] px-5 py-6 text-white shadow-lg mb-5">
        <p className="text-sm font-medium opacity-80">예상 환급액</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight">
          <CountUp target={result.refund} />
          <span className="ml-1 text-2xl font-semibold">원</span>
        </p>
        <p className="mt-2 text-xs opacity-70">공정거래위원회 고시 제56조 기준</p>
      </div>

      {/* 계산 내역 */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">계산 내역</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {result.refundReason && <Row label="환불 사유" value={REASON_LABEL[result.refundReason]} />}
          <Row label="계약금" value={`${fmt(result.contractAmount)}원`} />
          <Row
            label="기이용료"
            sub={`${result.usedDays}일 × ${fmt(Math.round(result.monthlyFee / 30))}원/일`}
            value={`−${fmt(result.usedFee)}원`}
            neg
          />
          <Row
            label="위약금"
            sub={noPenalty ? '사업자 귀책 → 위약금 없음' : '계약금의 10% (법정 상한)'}
            value={noPenalty ? '없음' : `−${fmt(result.penalty)}원`}
            neg={!noPenalty}
            accent={noPenalty}
          />
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50">
            <span className="text-sm font-bold text-blue-700">환급액</span>
            <span className="text-base font-extrabold text-blue-700">{fmt(result.refund)}원</span>
          </div>
        </div>
      </section>

      {/* 법적 근거 안내 (개인 사정) */}
      {isPersonal && (
        <div className="mb-4 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-600 leading-5">
          <p className="font-semibold text-gray-800 mb-1">위약금 10% 적용 근거</p>
          <p>
            공정거래위원회 고시 소비자분쟁해결기준 제56조(체육시설업)는 소비자 사정에 의한 중도해지 시
            납부금의 10% 이내 위약금 공제를 규정합니다. 부상·임신·이사 등 개인 사정에 대한 별도 면제
            조항은 없으므로 위약금이 동일하게 적용됩니다.
          </p>
        </div>
      )}

      {/* 다음 단계 */}
      <h2 className="mb-3 text-sm font-bold text-gray-800">다음 단계 선택</h2>
      <div className="flex flex-col gap-3">

        {/* 1. 직접 협상 — 추천 */}
        <div className="rounded-2xl border-2 border-[#2563EB] bg-blue-50 px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-[#2563EB]">직접 협상</span>
            <span className="rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">추천</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">기간: 1~2주 &nbsp;|&nbsp; 비용: 무료</p>
          <p className="text-xs text-gray-600 mb-3">
            PDF 청구서를 업체에 직접 제출하세요. 법적 근거가 명시된 내용증명 형식으로 생성됩니다.
          </p>
          <Link
            href={`/pdf?${pdfParams.toString()}`}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-[#2563EB] text-white text-sm font-semibold"
          >
            청구서 PDF 만들기
          </Link>
        </div>

        {/* 2. 소비자원 신고 */}
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-900">소비자원 신고</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">준비 중</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">기간: 2~4주 &nbsp;|&nbsp; 비용: 무료 &nbsp;|&nbsp; 공적 기관 압박 효과</p>
          <p className="text-xs text-gray-600 mb-3">
            직접 협상 실패 후 진행하세요. 소비자원이 업체에 공문을 보내면 70% 이상이 해결됩니다.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled
              className="flex-1 h-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold flex cursor-not-allowed"
            >
              소비자원 바로가기
            </button>
            <Link
              href="/guide"
              className="flex-1 h-10 flex items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700"
            >
              신고 흐름 보기
            </Link>
          </div>
        </div>

        {/* 3. 소액소송 */}
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-900">소액소송</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">준비 중</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">기간: 3~6주 &nbsp;|&nbsp; 비용: 인지대 1만원 내외</p>
          <p className="text-xs text-gray-600 mb-3">
            소비자원 조정 불성립 후 최후 수단. 변호사 없이 직접 신청 가능합니다.
          </p>
          <button
            type="button"
            disabled
            className="flex h-10 w-full items-center justify-center rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
          >
            나홀로소송 바로가기
          </button>
        </div>
      </div>

      {/* 다시 계산 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] p-4 bg-gradient-to-t from-[#F8FAFC] to-transparent">
        <Link
          href="/form"
          className="flex h-[52px] w-full items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700"
        >
          다시 계산하기
        </Link>
      </div>
    </main>
  )
}

function Row({
  label, sub, value, neg, accent,
}: {
  label: string
  sub?: string
  value: string
  neg?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <span className={`text-sm font-semibold ${neg ? 'text-red-500' : accent ? 'text-emerald-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}
