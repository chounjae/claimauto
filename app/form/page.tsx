'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import ProgressBar from '@/components/ProgressBar'
import NumberInput from '@/components/NumberInput'
import MonthChips from '@/components/MonthChips'
import DatePicker from '@/components/DatePicker'
import PaymentChips, { type PaymentType } from '@/components/PaymentChips'
import RefundReasonChips, { type RefundReason } from '@/components/RefundReasonChips'

interface FormErrors {
  totalAmount?: string
  months?: string
  startDate?: string
  stopDate?: string
  refundReason?: string
}

function validate(
  totalAmount: string,
  months: number | null,
  startDate: string,
  stopDate: string,
  refundReason: RefundReason | null,
): FormErrors {
  const errors: FormErrors = {}
  if (!totalAmount || Number(totalAmount) <= 0)
    errors.totalAmount = '총 결제금액을 입력해주세요'
  if (!months || months <= 0)
    errors.months = '계약 기간을 선택해주세요'
  if (!startDate)
    errors.startDate = '계약 시작일을 선택해주세요'
  if (!stopDate)
    errors.stopDate = '환불 요청일을 선택해주세요'
  else if (startDate && stopDate <= startDate)
    errors.stopDate = '환불 요청일은 계약 시작일 이후여야 합니다'
  if (!refundReason)
    errors.refundReason = '환불 사유를 선택해주세요'
  return errors
}

export default function FormPage() {
  const router = useRouter()
  const [totalAmount, setTotalAmount] = useState('')
  const [months, setMonths] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [stopDate, setStopDate] = useState(() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  })
  const [paymentType, setPaymentType] = useState<PaymentType>('신용카드 일시불')
  const [refundReason, setRefundReason] = useState<RefundReason | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const monthlyFee = useMemo(() => {
    if (!totalAmount || !months) return null
    return Math.round(Number(totalAmount) / months)
  }, [totalAmount, months])

  const handleSubmit = () => {
    const newErrors = validate(totalAmount, months, startDate, stopDate, refundReason)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const params = new URLSearchParams({
      contractAmount: totalAmount,
      monthlyFee: String(monthlyFee),
      startDate,
      stopDate,
      paymentType,
      refundReason: refundReason!,
    })
    router.push(`/result?${params.toString()}`)
  }

  return (
    <main className="flex flex-col min-h-screen px-5 pb-32">
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
        {/* 총 결제금액 */}
        <NumberInput
          label="총 결제금액"
          hint="헬스장에 실제 낸 전체 금액 (예: 400,000)"
          value={totalAmount}
          onChange={setTotalAmount}
          error={errors.totalAmount}
        />

        {/* 계약 기간 */}
        <MonthChips
          value={months}
          onChange={setMonths}
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

        {/* 계약 시작일 */}
        <DatePicker
          label="계약 시작일"
          value={startDate}
          onChange={setStartDate}
          error={errors.startDate}
        />

        {/* 환불 요청일 */}
        <DatePicker
          label="환불 요청일 / 폐업 확인일"
          hint="오늘 날짜로 자동 설정됩니다. 다른 날짜면 변경하세요"
          value={stopDate}
          onChange={setStopDate}
          error={errors.stopDate}
        />

        <PaymentChips value={paymentType} onChange={setPaymentType} />

        <RefundReasonChips
          value={refundReason}
          onChange={(v) => {
            setRefundReason(v)
            setErrors((prev) => ({ ...prev, refundReason: undefined }))
          }}
          error={errors.refundReason}
        />
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] p-4 bg-gradient-to-t from-[#F8FAFC] to-transparent">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#2563EB] text-white text-base font-bold shadow-lg active:scale-[0.98] transition-transform"
        >
          계산하기
        </button>
      </div>
    </main>
  )
}
