'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { track } from '@/lib/analytics'
import Logo from '@/components/Logo'
import ProgressBar from '@/components/ProgressBar'
import NumberInput from '@/components/NumberInput'
import MonthChips from '@/components/MonthChips'
import DatePicker from '@/components/DatePicker'
import PaymentChips, { type PaymentType } from '@/components/PaymentChips'
import RefundReasonChips, { type RefundReason } from '@/components/RefundReasonChips'
import FeedbackSheet from '@/components/FeedbackSheet'
import ProductTypeChips from '@/components/ProductTypeChips'
import type { ProductType } from '@/lib/refund'

const START_DATE_SHORTCUTS = [
  { label: '1개월 전', months: 1 },
  { label: '3개월 전', months: 3 },
  { label: '6개월 전', months: 6 },
  { label: '1년 전', months: 12 },
] as const

function dateMonthsAgo(months: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - months)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

interface FormErrors {
  totalAmount?: string
  months?: string
  startDate?: string
  stopDate?: string
  refundReason?: string
  totalSessions?: string
  usedSessions?: string
}

interface ValidateInput {
  productType: ProductType
  totalAmount: string
  months: number | null
  startDate: string
  stopDate: string
  refundReason: RefundReason | null
  totalSessions: string
  usedSessions: string
}

/**
 * 상품 유형에 따라 필수 필드가 갈린다.
 * - 기간제: 계약 기간 + 시작일 (이용일수를 날짜로 센다)
 * - 횟수제: 총 횟수 + 사용 횟수 (날짜와 무관하다)
 *
 * 환불 요청일은 두 유형 모두 필요하다. 내용증명에 들어가는 기준일이다.
 */
function validate(input: ValidateInput): FormErrors {
  const errors: FormErrors = {}
  const isSession = input.productType === 'session'

  if (!input.totalAmount || Number(input.totalAmount) <= 0)
    errors.totalAmount = '총 결제금액을 입력해주세요'

  if (isSession) {
    const total = Number(input.totalSessions)
    const used = Number(input.usedSessions)
    if (!input.totalSessions || total <= 0)
      errors.totalSessions = '전체 횟수를 입력해주세요'
    if (input.usedSessions === '' || used < 0)
      errors.usedSessions = '사용한 횟수를 입력해주세요 (안 썼으면 0)'
    else if (total > 0 && used > total)
      errors.usedSessions = '사용 횟수가 전체 횟수보다 많습니다'
  } else {
    if (!input.months || input.months <= 0)
      errors.months = '계약 기간을 선택해주세요'
  }

  // 계약일은 두 유형 모두 필요하다. 계산에는 기간제만 쓰지만
  // 내용증명 본문의 「계약 시작일」 항목에 들어간다.
  // 오류 문구는 화면에 보이는 라벨과 같은 말을 쓴다.
  if (!input.startDate)
    errors.startDate = isSession ? '계약일을 선택해주세요' : '계약 시작일을 선택해주세요'

  if (!input.stopDate)
    errors.stopDate = '환불 요청일을 선택해주세요'
  else if (!isSession && input.startDate && input.stopDate <= input.startDate)
    errors.stopDate = '환불 요청일은 계약 시작일 이후여야 합니다'

  if (!input.refundReason)
    errors.refundReason = '환불 사유를 선택해주세요'

  return errors
}

export default function FormClient() {
  const [askMissingReason, setAskMissingReason] = useState(false)
  const router = useRouter()
  const [totalAmount, setTotalAmount] = useState('')
  const [months, setMonths] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [stopDate, setStopDate] = useState(() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  })
  const [paymentType, setPaymentType] = useState<PaymentType>('신용카드 일시불')
  const [purchaseType, setPurchaseType] = useState<'regular' | 'discounted'>('regular')
  const [refundReason, setRefundReason] = useState<RefundReason | null>(null)
  const [productType, setProductType] = useState<ProductType>('period')
  const [totalSessions, setTotalSessions] = useState('')
  const [usedSessions, setUsedSessions] = useState('')
  /** 업체가 주장한 1일(1회) 단가. 선택 입력 — 비워두면 기존 흐름 그대로다. */
  const [claimedUnitPrice, setClaimedUnitPrice] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const fieldsTrackedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    track('form_started')
  }, [])

  const trackField = (field: string) => {
    if (fieldsTrackedRef.current.has(field)) return
    fieldsTrackedRef.current.add(field)
    track('form_field_filled', { field })
  }

  const isSession = productType === 'session'

  const monthlyFee = useMemo(() => {
    if (!totalAmount || !months) return null
    return Math.round(Number(totalAmount) / months)
  }, [totalAmount, months])

  /** 회당 단가 = 실납부액 ÷ 총횟수. 정가가 아니라 실제 낸 금액이 기준이다. */
  const unitPrice = useMemo(() => {
    const total = Number(totalSessions)
    if (!totalAmount || !total || total <= 0) return null
    return Math.round(Number(totalAmount) / total)
  }, [totalAmount, totalSessions])

  const handleSubmit = () => {
    const newErrors = validate({
      productType, totalAmount, months, startDate, stopDate, refundReason, totalSessions, usedSessions,
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const params = new URLSearchParams({
      productType,
      contractAmount: totalAmount,
      stopDate,
      paymentType,
      purchaseType,
      refundReason: refundReason!,
      startDate,
      ...(isSession
        ? { totalSessions, usedSessions }
        : { monthlyFee: String(monthlyFee) }),
      ...(claimedUnitPrice ? { claimedUnitPrice } : {}),
    })
    const amount = Number(totalAmount)
    track('form_submitted', {
      product_type: productType,
      has_claimed_unit_price: Boolean(claimedUnitPrice),
      refund_reason: refundReason,
      purchase_type: purchaseType,
      payment_type: paymentType,
      amount_range: amount < 100000 ? 'under_100k' : amount < 300000 ? '100k_300k' : 'over_300k',
    })
    router.push(`/result?${params.toString()}`)
  }

  return (
    <main id="main" className="flex flex-col min-h-dvh px-5 pb-32 md:min-h-0 md:px-10">
      <header className="pt-6 pb-4">
        <Logo />
      </header>

      <div className="mb-6">
        <ProgressBar current={1} total={3} />
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">기본 정보 입력</h1>
        <p className="mt-1 text-sm text-gray-500">아래 정보만 입력하면 자동으로 계산됩니다</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* 상품 유형 — 기간제 / 횟수제 */}
        <ProductTypeChips
          value={productType}
          onChange={v => { setProductType(v); trackField('product_type') }}
        />

        {/* 총 결제금액 */}
        <NumberInput
          label="총 결제금액"
          hint="실제 낸 전체 금액 (예: 400,000). 할인받았으면 할인 후 금액"
          value={totalAmount}
          onChange={v => { setTotalAmount(v); if (v) trackField('total_amount') }}
          error={errors.totalAmount}
        />

        {isSession ? (
          <>
            <NumberInput
              label="전체 횟수"
              unit="회"
              hint="계약한 총 횟수 (예: 30)"
              value={totalSessions}
              onChange={v => { setTotalSessions(v); if (v) trackField('total_sessions') }}
              error={errors.totalSessions}
            />
            <NumberInput
              label="사용한 횟수"
              unit="회"
              hint="지금까지 받은 횟수. 한 번도 안 받았으면 0"
              value={usedSessions}
              onChange={v => { setUsedSessions(v); if (v) trackField('used_sessions') }}
              error={errors.usedSessions}
            />
            {unitPrice !== null && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="mb-0.5 text-xs text-blue-500">회당 단가 (자동 계산)</p>
                <p className="text-sm font-semibold text-blue-700">
                  {Number(totalAmount).toLocaleString()}원 ÷ {Number(totalSessions).toLocaleString()}회
                  {' = '}
                  <span className="text-base">{unitPrice.toLocaleString()}원/회</span>
                </p>
                <p className="mt-1.5 text-xs leading-5 text-blue-600">
                  <strong>실제 낸 금액</strong> 기준입니다. 업체가 정가나 할인 전 단가로 차감하려 하면
                  아래 칸에 그 금액을 적어보세요.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* 계약 기간 */}
            <MonthChips
              value={months}
              onChange={v => { setMonths(v); if (v) trackField('months') }}
              error={errors.months}
            />

            {/* 월 환산금액 자동 계산 */}
            {monthlyFee !== null && (
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-xs text-blue-500 mb-0.5">월 환산금액 (자동 계산)</p>
                <p className="text-sm font-semibold text-blue-700">
                  {Number(totalAmount).toLocaleString()}원 ÷ {months}개월
                  {' = '}
                  <span className="text-base">{monthlyFee.toLocaleString()}원/월</span>
                </p>
              </div>
            )}
          </>
        )}

        {/*
          업체 주장 단가 — 선택 입력.
          지식iN 20건 중 5건이 이 다툼이었다. 공식은 양쪽이 같고 단가만 다르다.
          비워두면 기존 흐름 그대로다. 폼 이탈 위험 때문에 필수로 두지 않았다 (ADR-005 §4).
        */}
        <NumberInput
          label={isSession ? '업체가 말한 1회 단가 (선택)' : '업체가 말한 1일 단가 (선택)'}
          hint={
            isSession
              ? '"1회 12만원씩 빼겠다"고 하면 120000. 모르면 비워두세요'
              : '"하루 12,000원씩 빼겠다"고 하면 12000. 모르면 비워두세요'
          }
          value={claimedUnitPrice}
          onChange={v => { setClaimedUnitPrice(v); if (v) trackField('claimed_unit_price') }}
        />

        {/* 계약 시작일 — 횟수제는 계산에 쓰지 않지만 내용증명에 들어간다 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              {isSession ? '계약일' : '계약 시작일'}
            </span>
            <span className="text-xs text-gray-400">정확하지 않아도 됩니다</span>
          </div>
          <div className="flex gap-2">
            {START_DATE_SHORTCUTS.map(({ label, months: m }) => {
              const val = dateMonthsAgo(m)
              const isSelected = startDate.slice(0, 7) === val.slice(0, 7)
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setStartDate(val); trackField('start_date') }}
                  className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-semibold'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <DatePicker
            label=""
            hint="위에서 선택하거나 직접 날짜를 입력하세요"
            value={startDate}
            onChange={v => { setStartDate(v); trackField('start_date') }}
            error={errors.startDate}
          />
        </div>

        {/* 환불 요청일 */}
        <DatePicker
          label="환불 요청일 / 폐업 확인일"
          value={stopDate}
          onChange={v => { setStopDate(v); trackField('stop_date') }}
          error={errors.stopDate}
        />

        <div className="flex flex-col gap-1.5">
          <PaymentChips value={paymentType} onChange={v => { setPaymentType(v); trackField('payment_type') }} />
          {(paymentType === '신용카드 일시불' || paymentType === '할부') && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 leading-5">
              업체 방문 시 <strong>결제한 신용카드를 지참</strong>하세요. 카드 거래내역 확인에 필요할 수 있습니다. 카드사 차지백 신청도 가능합니다 (결제일로부터 120일 이내).
            </p>
          )}
          {paymentType === '체크카드' && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 leading-5">
              업체 방문 시 <strong>결제한 체크카드를 지참</strong>하세요. 환불 금액은 원칙적으로 결제한 카드로 돌려받습니다.
            </p>
          )}
          {paymentType === '현금' && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 leading-5">
              <strong>결제 영수증 또는 계좌 이체 내역서</strong>를 준비하세요. 영수증이 없으면 은행 앱에서 이체 내역을 캡처해두세요.
            </p>
          )}
        </div>

        {/* 구매 방식 */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-800">구매 방식</span>
          <div className="flex gap-2">
            {([
              { value: 'regular', label: '정상가 구매', sub: '할인 없음' },
              { value: 'discounted', label: '할인가 구매', sub: '이벤트·프로모션' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setPurchaseType(opt.value); trackField('purchase_type') }}
                className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition-colors ${
                  purchaseType === opt.value
                    ? 'border-[#2563EB] bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <span className={`text-sm font-semibold ${purchaseType === opt.value ? 'text-[#2563EB]' : 'text-gray-800'}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">{opt.sub}</span>
              </button>
            ))}
          </div>
          {purchaseType === 'discounted' && (
            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 leading-5">
              공정위 기준으로 <strong>실 납부액</strong> 기준으로 계산됩니다.
              헬스장이 정상가 기준을 주장하더라도 공정위 소비자분쟁해결기준이 우선합니다.
            </p>
          )}
        </div>

        <RefundReasonChips
          onMissingReason={() => setAskMissingReason(true)}
          value={refundReason}
          onChange={(v) => {
            setRefundReason(v)
            setErrors((prev) => ({ ...prev, refundReason: undefined }))
            if (v) trackField('refund_reason')
          }}
          error={errors.refundReason}
        />
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[375px] -translate-x-1/2 p-4 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent md:static md:left-auto md:max-w-none md:translate-x-0 md:bg-none md:p-0 md:pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-200 hover:bg-[#1D4ED8] active:scale-[0.98]"
        >
          계산하기
        </button>
      </div>

      <FeedbackSheet
        open={askMissingReason}
        onClose={() => setAskMissingReason(false)}
        place="reason_missing"
        title="어떤 상황이신가요?"
        choices={[
          '목록에 없는 사유예요',
          '두 가지 이상 해당돼요',
          '내 경우가 되는지 모르겠어요',
          'PT·필라테스 등 다른 종목이에요',
        ]}
        placeholder="상황을 적어주시면 기준을 찾아 안내해드리겠습니다 (선택)"
      />
    </main>
  )
}
