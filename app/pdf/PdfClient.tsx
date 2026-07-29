'use client'

import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'
import ProgressBar from '@/components/ProgressBar'
import { track, getClientEnv } from '@/lib/analytics'

type RefundReason = 'closure' | 'facility_defect' | 'service_reduction' | 'gym_relocation' | 'price_increase' | 'not_started' | 'injury' | 'pregnancy' | 'relocation' | 'job_change' | 'user_cancel'

interface CalcData {
  contractAmount: number
  monthlyFee: number
  startDate: string
  stopDate: string
  paymentType: string
  purchaseType: 'regular' | 'discounted'
  usedDays: number
  usedFee: number
  penalty: number
  refund: number
  refundReason?: RefundReason
}

interface FormData {
  name: string
  phone: string
  myAddress: string
  gymName: string
  gymAddress: string
  staffName: string
  bankAccount: string
  deadline: '7' | '14'
}

interface FormErrors {
  name?: string
  phone?: string
  gymName?: string
  gymAddress?: string
}

const REASON_LABEL: Record<RefundReason, string> = {
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

const REASON_BODY: Record<RefundReason, string> = {
  closure:
    '귀 업체가 폐업하여 계약 서비스를 더 이상 이용할 수 없게 되었습니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 사업자 귀책에 해당하므로, 위약금 없이 잔여 이용료 전액의 환불을 요청드립니다.',
  facility_defect:
    '약정 시설의 훼손 또는 주요 기구의 고장·철거로 인해 계약 목적 달성이 어렵습니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 사업자 귀책에 해당하므로, 위약금 없이 잔여 이용료 전액의 환불을 요청드립니다.',
  service_reduction:
    '계약 당시 약정된 운영시간이나 서비스 수준이 변경되어 정상적인 이용이 어렵습니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 사업자 귀책에 해당하므로, 위약금 없이 잔여 이용료 전액의 환불을 요청드립니다.',
  gym_relocation:
    '헬스장의 이전으로 인해 동일한 방식의 이용이 어렵게 되었습니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 사업자 귀책에 해당하므로, 위약금 없이 잔여 이용료 전액의 환불을 요청드립니다.',
  price_increase:
    '계약 당시 약정되지 않은 요금 인상이 이루어져 계약 조건이 변경되었습니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 사업자 귀책에 해당하므로, 위약금 없이 잔여 이용료 전액의 환불을 요청드립니다.',
  injury:
    '부상·질병으로 인해 헬스장 이용이 어려워 중도해지를 요청드립니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 기이용료와 위약금(납부액의 10% 이내)을 제외한 잔여금액의 환불을 요청드립니다.',
  pregnancy:
    '임신·출산으로 인해 헬스장 이용이 어려워 중도해지를 요청드립니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 기이용료와 위약금(납부액의 10% 이내)을 제외한 잔여금액의 환불을 요청드립니다.',
  relocation:
    '이사로 인해 헬스장 방문이 어렵게 되어 중도해지를 요청드립니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 기이용료와 위약금(납부액의 10% 이내)을 제외한 잔여금액의 환불을 요청드립니다.',
  job_change:
    '이직·직장 이전으로 인해 헬스장 방문이 어렵게 되어 중도해지를 요청드립니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 기이용료와 위약금(납부액의 10% 이내)을 제외한 잔여금액의 환불을 요청드립니다.',
  not_started:
    '결제 후 이용을 개시하지 않은 상태에서 계약 해지를 요청드립니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 이용 개시 전 해지이므로 기이용료는 발생하지 않으며, 위약금(납부액의 10% 이내)만을 제외한 금액의 환불을 요청드립니다.',
  user_cancel:
    '개인 사정으로 인해 계약 기간 중 중도해지를 요청드립니다. 공정거래위원회 고시 소비자분쟁해결기준 제56조에 따라 기이용료와 위약금(납부액의 10% 이내)을 제외한 잔여금액의 환불을 요청드립니다.',
}

function validate(f: FormData): FormErrors {
  const e: FormErrors = {}
  if (!f.name.trim()) e.name = '이름을 입력해주세요'
  if (!f.phone.trim()) e.phone = '연락처를 입력해주세요'
  if (!f.gymName.trim()) e.gymName = '업체명을 입력해주세요'
  if (!f.gymAddress.trim()) e.gymAddress = '업체 주소를 입력해주세요'
  return e
}

function fmt(n: number) { return n.toLocaleString() }

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}

function addDays(iso: string, days: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function PdfClient({ calc }: { calc: CalcData }) {
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [form, setForm] = useState<FormData>({
    name: '', phone: '', myAddress: '', gymName: '', gymAddress: '',
    staffName: '', bankAccount: '', deadline: '7',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // PDF 페이지 '도달' 계측. 입력폼 완료 여부와 무관하게 마운트 즉시 1회 발화한다.
  useEffect(() => {
    track('pdf_page_arrived', { refund_reason: calc.refundReason })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handlePreview = () => {
    const e = validate(form)
    setErrors(e)
    if (Object.keys(e).length === 0) setStep('preview')
  }

  // 인쇄 시트가 실제로 떴는지 감지한다.
  // iOS 인앱 웹뷰에서는 window.print() 가 무반응이라 beforeprint 가 발화하지 않는다.
  // afterprint 는 최신 Safari 에서 인쇄와 무관하게 즉시 발화할 수 있어 판정에 쓰지 않는다.
  const handlePrint = () => {
    const env = getClientEnv()
    let settled = false

    // 한 번만 발화하고 리스너·타이머를 반드시 정리한다.
    function settle(event: string) {
      if (settled) return
      settled = true
      window.removeEventListener('beforeprint', handleBeforePrint)
      clearTimeout(timer)
      track(event, env)
    }

    function handleBeforePrint() {
      settle('pdf_print_sheet_shown')
    }

    window.addEventListener('beforeprint', handleBeforePrint)
    const timer = setTimeout(() => settle('pdf_print_no_sheet'), 500)

    window.print()
  }

  if (step === 'preview') {
    return (
      <Preview
        calc={calc}
        form={form}
        onBack={() => setStep('form')}
        onPrint={handlePrint}
      />
    )
  }

  return (
    <main className="flex flex-col min-h-screen px-5 pb-32">
      <header className="pt-6 pb-4">
        <Logo />
      </header>
      <div className="mb-6">
        <ProgressBar current={3} total={3} />
      </div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">청구서 정보 입력</h1>
        <p className="mt-1 text-sm text-gray-500">내용증명 형식의 환불 청구서가 생성됩니다</p>
      </div>

      {/* 환불 사유 읽기 전용 표시 */}
      <div className="mb-5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex items-center gap-2">
        <span className="text-xs font-bold text-blue-500">환불 사유</span>
        <span className="text-sm font-semibold text-blue-800">{calc.refundReason ? REASON_LABEL[calc.refundReason] : ''}</span>
        {calc.penalty === 0 && (
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">위약금 없음</span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <Field label="신청인 이름" id="name" value={form.name} onChange={set('name')} placeholder="홍길동" error={errors.name} required />
        <Field label="연락처" id="phone" value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" inputMode="tel" error={errors.phone} required />
        <Field
          label="신청인 주소 (선택)"
          id="myAddress"
          value={form.myAddress}
          onChange={set('myAddress')}
          placeholder="서울시 강남구 ..."
          hint="우체국 내용증명으로 발송할 경우 필요합니다"
        />
        <Field label="업체명" id="gymName" value={form.gymName} onChange={set('gymName')} placeholder="○○헬스장" error={errors.gymName} required />
        <Field label="업체 주소" id="gymAddress" value={form.gymAddress} onChange={set('gymAddress')} placeholder="서울시 강남구 ..." error={errors.gymAddress} required />
        <Field label="담당자 / 대표자 이름 (선택)" id="staffName" value={form.staffName} onChange={set('staffName')} placeholder="없으면 비워두세요" />
        <Field
          label="환불 받을 계좌 (선택)"
          id="bankAccount"
          value={form.bankAccount}
          onChange={set('bankAccount')}
          placeholder="국민 123-456-789012 홍길동"
          hint="입력하면 청구서에 입금 계좌가 포함됩니다"
        />

        {/* 이행 기한 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">이행 기한</label>
          <div className="flex gap-2">
            {(['7', '14'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, deadline: d }))}
                className={`flex-1 h-11 rounded-xl border text-sm font-semibold transition-colors ${
                  form.deadline === d
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {d}일 이내
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">수령 후 며칠 이내에 환불할 것을 요구할지 선택하세요</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] p-4 bg-gradient-to-t from-[#F8FAFC] to-transparent">
        <button
          type="button"
          onClick={handlePreview}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#2563EB] text-white text-base font-bold shadow-lg"
        >
          미리보기
        </button>
      </div>
    </main>
  )
}

function VisitChecklist({ paymentType }: { paymentType: string }) {
  const items: string[] = ['이 PDF (인쇄 또는 저장)']

  if (paymentType === '신용카드 일시불' || paymentType === '할부') {
    items.push('결제한 신용카드')
    items.push('카드 결제 내역서 또는 문자 영수증')
  } else if (paymentType === '체크카드') {
    items.push('결제한 체크카드')
    items.push('카드 결제 내역서 또는 문자 영수증')
  } else if (paymentType === '현금') {
    items.push('현금 영수증 또는 계좌 이체 내역 캡처')
  }

  items.push('업체에 환불 요청한 카카오톡·문자 내역 스크린샷')
  items.push('계약서 또는 회원 등록증 (있는 경우)')

  return (
    <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-800 mb-3 leading-5">
      <p className="font-bold mb-2">업체 방문·전달 시 지참물 체크리스트</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">☐</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Field({
  label, id, value, onChange, placeholder, inputMode, error, hint, required,
}: {
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  error?: string
  hint?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center">
        <label htmlFor={id} className="text-sm font-semibold text-gray-800">
          {label}
        </label>
        {required && <span className="ml-0.5 text-[#EF4444]"> *</span>}
      </div>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-[52px] rounded-lg border bg-white px-4 text-sm outline-none transition-colors placeholder:text-gray-300 ${
          error ? 'border-[#EF4444]' : 'border-gray-300 focus:border-[#2563EB]'
        }`}
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

function Preview({
  calc, form, onBack, onPrint,
}: {
  calc: CalcData
  form: FormData
  onBack: () => void
  onPrint: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 주의: 이 이벤트는 페이지 도달이 아니라 PDF 입력폼 완료(미리보기 진입) 시점에 발화한다.
    // 과거 데이터와의 연속성을 위해 이름을 유지한다. 페이지 도달 계측은 pdf_page_arrived 를 사용하라.
    track('pdf_page_viewed', { refund_reason: calc.refundReason })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const todayIso = new Date().toISOString().split('T')[0]

  const copyKakaoMessage = async () => {
    const deadlineDate = addDays(todayIso, Number(form.deadline))
    const reasonLabel = REASON_LABEL[calc.refundReason ?? 'user_cancel']
    const dailyRate = Math.round(calc.monthlyFee / 30)
    const noPenalty = calc.penalty === 0

    const lines = [
      `안녕하세요, ${form.gymName} 담당자님.`,
      `헬스장 이용계약 중도해지 및 환불을 요청드립니다.`,
      '',
      `■ 청구인: ${form.name}`,
      `■ 연락처: ${form.phone}`,
      `■ 환불 사유: ${reasonLabel}`,
      `■ 납부 금액: ${fmt(calc.contractAmount)}원`,
      `■ 실 이용 일수: ${calc.usedDays}일 (${fmt(dailyRate)}원/일 × ${calc.usedDays}일)`,
      `■ 기이용료 차감: -${fmt(calc.usedFee)}원`,
      `■ 위약금 차감: ${noPenalty ? '없음 (사업자 귀책 사유)' : `-${fmt(calc.penalty)}원 (납부액의 10%)`}`,
      `■ 청구 환불액: ${fmt(calc.refund)}원`,
      '',
      '[근거] 공정거래위원회 고시 소비자분쟁해결기준 제56조(체육시설업)',
      '',
      `수령일로부터 ${form.deadline}일 이내(${deadlineDate}까지) 환불 요청드립니다.`,
    ]

    if (form.bankAccount) {
      lines.push(`입금 계좌: ${form.bankAccount}`)
    }

    lines.push('', '원만한 처리 부탁드립니다. 금액이나 처리 방법에 이견이 있으시면 편하게 연락 주세요. 감사합니다.')

    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="print:hidden flex flex-col min-h-screen px-5 pb-[260px]">
        <div className="pt-6 mb-4">
          <h1 className="text-xl font-bold text-gray-900">청구서 미리보기</h1>
          <p className="mt-1 text-sm text-gray-500">PDF를 저장해 카카오톡으로 전송하거나 직접 전달하세요</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-2">
          <DocumentContent calc={calc} form={form} today={today} todayIso={todayIso} />
        </div>

        <VisitChecklist paymentType={calc.paymentType} />

        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700 mb-32 leading-5 space-y-1.5">
          <p>💬 <strong>카카오톡 전송 추천</strong> — 읽음 표시가 발송 증거가 됩니다. 스크린샷을 저장해두세요.</p>
          <p>📮 우체국 내용증명으로 발송하려면 <strong>인터넷우체국(epost.go.kr)</strong>을 이용하세요. 신청인 주소를 미리 입력해두면 편리합니다.</p>
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-10 w-full max-w-[375px] p-4 bg-gradient-to-t from-[#F8FAFC] to-transparent flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              track('pdf_save_clicked', { refund_reason: calc.refundReason })
              onPrint()
            }}
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#10B981] text-white text-base font-bold shadow-lg"
          >
            PDF 저장 / 인쇄
          </button>
          <button
            type="button"
            onClick={async () => {
              await copyKakaoMessage()
              track('kakao_copied', { refund_reason: calc.refundReason })
            }}
            className="flex h-[44px] w-full items-center justify-center rounded-xl bg-[#FAE100] text-[#3A1D1D] text-sm font-bold"
          >
            {copied ? '복사 완료!' : '카카오톡 메시지 복사'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex h-[44px] w-full items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700"
          >
            수정하기
          </button>
        </div>
      </div>

      <div className="hidden print:block">
        <DocumentContent calc={calc} form={form} today={today} todayIso={todayIso} />
      </div>

      <style>{`
        @page { margin: 0; }
        @media print {
          /* 인쇄 시 배경 그라디언트·여백 제거 */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            background: #fff !important;
            background-image: none !important;
          }
          /* app/layout.tsx 래퍼의 모바일(375px) 제약 해제.
             해제하지 않으면 아래 .print\\:block 의 width:100% 가 A4 폭이 아니라 375px 로 잡힌다. */
          .layout-wrapper {
            max-width: none !important;
            min-height: 0 !important;
            position: static !important;
            margin: 0 !important;
            background: #fff !important;
            box-shadow: none !important;
          }
          /* visibility 기반 대신 display 기반.
             화면용 컨테이너에는 이미 print:hidden(display:none)이 걸려 있으므로
             body * { visibility: hidden } 이 필요 없다.
             position:absolute 를 쓰면 정상 흐름에서 빠져 페이지네이션이 깨지므로 쓰지 않는다. */
          .print\\:block {
            display: block !important;
            width: 100%;
            padding: 40px;
            box-sizing: border-box;
          }
        }
      `}</style>
    </>
  )
}

function DocumentContent({
  calc, form, today, todayIso,
}: {
  calc: CalcData
  form: FormData
  today: string
  todayIso: string
}) {
  const dailyRate = Math.round(calc.monthlyFee / 30)
  const deadlineDate = addDays(todayIso, Number(form.deadline))
  const noPenalty = calc.penalty === 0

  return (
    <div className="px-6 py-7 text-gray-900 text-sm leading-relaxed">

      {/* 문서 제목 */}
      <div className="text-center mb-6 pb-5 border-b-2 border-gray-900">
        <h1 className="text-xl font-extrabold tracking-tight">헬스장 이용계약 환불 요청서</h1>
        <p className="mt-1 text-xs text-gray-500">
          소비자분쟁해결기준 제56조(체육시설업) 기준 산정
        </p>
      </div>

      {/* 수신·발신·제목 */}
      <table className="w-full text-xs mb-5 border border-gray-300">
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="w-16 px-3 py-2 bg-gray-50 font-bold text-gray-600 shrink-0">수&nbsp;&nbsp;&nbsp;신</td>
            <td className="px-3 py-2">
              {form.gymName} 귀중{form.staffName ? ` (담당: ${form.staffName})` : ''}
            </td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="px-3 py-2 bg-gray-50 font-bold text-gray-600">발&nbsp;&nbsp;&nbsp;신</td>
            <td className="px-3 py-2">
              {form.name}&nbsp;&nbsp;|&nbsp;&nbsp;연락처: {form.phone}
              {form.myAddress && <span className="block text-gray-500">주소: {form.myAddress}</span>}
            </td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="px-3 py-2 bg-gray-50 font-bold text-gray-600">작 성 일</td>
            <td className="px-3 py-2">{today}</td>
          </tr>
          <tr>
            <td className="px-3 py-2 bg-gray-50 font-bold text-gray-600">제&nbsp;&nbsp;&nbsp;목</td>
            <td className="px-3 py-2 font-semibold">헬스장 이용계약 중도해지 및 환불 청구의 건</td>
          </tr>
        </tbody>
      </table>

      {/* 인사 + 사유 */}
      <p className="text-xs text-gray-700 mb-5 leading-6">
        안녕하세요. 저는 귀 업체의 헬스장 이용계약 회원으로, 아래 사유로 인해 중도해지 및 환불을 정중히 요청드립니다.{' '}
        {calc.refundReason ? REASON_BODY[calc.refundReason] : ''}{' '}
        아래 계산 내역을 확인하시고 원만한 처리를 부탁드립니다.
      </p>

      {/* 1. 계약 내용 */}
      <DocSection num="1" title="계약 내용">
        <DocRow label="계약 업체" value={form.gymName} />
        <DocRow label="업체 주소" value={form.gymAddress} />
        <DocRow label="계약 시작일" value={formatDate(calc.startDate)} />
        <DocRow label="중도해지 요청일" value={formatDate(calc.stopDate)} />
        <DocRow label="실 이용 일수" value={`${calc.usedDays}일`} />
        <DocRow label="납부 금액" value={`${fmt(calc.contractAmount)}원`} />
        <DocRow label="납부 방식" value={calc.paymentType} />
        {calc.refundReason && <DocRow label="환불 사유" value={REASON_LABEL[calc.refundReason]} />}
      </DocSection>

      {/* 2. 환불 청구 금액 */}
      <DocSection num="2" title="환불 청구 금액 계산">
        <div className="px-3 py-3 text-xs leading-7">
        {calc.purchaseType === 'discounted' && (
          <p className="text-[10px] text-emerald-700 bg-emerald-50 rounded px-2 py-1 mb-2">
            ※ 공정거래위원회 고시 소비자분쟁해결기준에 따라 실 납부액 기준으로 계산합니다.
          </p>
        )}
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="text-gray-600">① 납부 금액</span>
            <span className="font-semibold">{fmt(calc.contractAmount)}원</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1">
            <span className="text-gray-600">
              ② 기이용료 차감
              <span className="block text-gray-400 text-[10px]">
                {fmt(calc.monthlyFee)}원 ÷ 30일 × {calc.usedDays}일 ({fmt(dailyRate)}원/일)
              </span>
            </span>
            <span className="font-semibold text-red-600">−{fmt(calc.usedFee)}원</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1">
            <span className="text-gray-600">
              ③ 위약금 차감
              <span className="block text-gray-400 text-[10px]">
                {noPenalty ? '사업자 귀책 사유 → 위약금 없음' : '납부 금액의 10% 이내 (법정 상한)'}
              </span>
            </span>
            <span className={`font-semibold ${noPenalty ? 'text-emerald-600' : 'text-red-600'}`}>
              {noPenalty ? '없음' : `−${fmt(calc.penalty)}원`}
            </span>
          </div>
          <div className="flex justify-between pt-2 font-bold">
            <span>청구 환불액 (①−②−③)</span>
            <span className="text-base text-[#2563EB]">{fmt(calc.refund)}원</span>
          </div>
        </div>
      </DocSection>

      {/* 3. 법적 근거 */}
      <DocSection num="3" title="법적 근거">
        <div className="px-3 py-3 text-xs leading-6 text-gray-700 space-y-1">
          <p><span className="font-semibold">가.</span> 공정거래위원회 고시 소비자분쟁해결기준 제56조(체육시설업): 계속적 역무계약에서 소비자 중도해지 시 기이용료와 위약금(납부액의 10% 이내)을 공제한 잔액을 환불하여야 한다. 사업자 귀책 사유 시 위약금 없이 잔액 전액 환불 의무.</p>
          <p><span className="font-semibold">나.</span> 체육시설의 설치·이용에 관한 법률 제27조: 체육시설 이용계약은 소비자 요청 시 언제든지 해지 가능하며, 사업자는 잔여 이용료를 반환할 의무를 부담한다.</p>
          <p><span className="font-semibold">다.</span> 방문판매 등에 관한 법률 제31조·제32조: 계속적 역무계약의 중도해지 및 잔액 환불 권리를 보장한다.</p>
        </div>
      </DocSection>

      {/* 4. 이행 기한 */}
      <DocSection num="4" title="환불 처리 요청 기한">
        <div className="px-3 py-3 text-xs leading-6 text-gray-700">
          <p>
            본 요청서 수령일로부터 <strong>{form.deadline}일 이내</strong>({deadlineDate}까지)에
            환불 금액 <strong>{fmt(calc.refund)}원</strong>을 처리해 주시면 감사드리겠습니다.
          </p>
          {form.bankAccount ? (
            <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 font-semibold text-blue-800">
              입금 계좌: {form.bankAccount}
            </div>
          ) : (
            <p className="mt-1 text-gray-500">입금 계좌는 별도 연락으로 안내 드리겠습니다.</p>
          )}
          <p className="mt-3 text-gray-600">
            금액에 이견이 있으시거나 처리가 어려우신 경우, 편하게 연락 주시기 바랍니다.
            원만한 합의가 어려울 경우 한국소비자원 분쟁조정 절차를 통해 해결하도록 하겠습니다.
          </p>
        </div>
      </DocSection>

      {/* 서명 */}
      <div className="mt-6 pt-5 border-t border-gray-300 text-xs">
        <p className="text-center text-gray-500 mb-4">위 내용을 확인하시고 원만한 처리를 부탁드립니다. 감사합니다.</p>
        <p className="text-center text-gray-400">{today}</p>
        <div className="mt-3 flex justify-center gap-16">
          <div className="text-center">
            <p className="text-gray-500">청구인</p>
            <p className="mt-1 font-bold text-gray-900">{form.name}</p>
            <p className="text-gray-400">(서명 또는 날인)</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">연락처</p>
            <p className="mt-1 font-medium text-gray-900">{form.phone}</p>
          </div>
        </div>
      </div>

    </div>
  )
}

function DocSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white shrink-0">
          {num}
        </span>
        <p className="text-xs font-bold text-gray-800">{title}</p>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </div>
  )
}

function DocRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-xs px-3 py-2 bg-white">
      <span className="w-28 shrink-0 text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
