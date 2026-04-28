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

interface Option {
  value: RefundReason
  label: string
  sub: string
}

const BUSINESS_OPTIONS: Option[] = [
  { value: 'closure', label: '헬스장 폐업', sub: '위약금 없음' },
  { value: 'facility_defect', label: '시설 훼손 / 기구 고장·철거', sub: '위약금 없음' },
  { value: 'service_reduction', label: '운영시간·서비스 축소', sub: '위약금 없음' },
  { value: 'gym_relocation', label: '헬스장 이전 (접근 불가)', sub: '위약금 없음' },
  { value: 'price_increase', label: '약정 외 요금 인상', sub: '위약금 없음' },
]

const PERSONAL_OPTIONS: Option[] = [
  { value: 'not_started', label: '이용 개시 전 해지', sub: '기이용료 없음 · 위약금 10%' },
  { value: 'injury', label: '부상 / 질병', sub: '위약금 10%' },
  { value: 'pregnancy', label: '임신 / 출산', sub: '위약금 10%' },
  { value: 'relocation', label: '이사 (주거지 이전)', sub: '위약금 10%' },
  { value: 'job_change', label: '이직 / 직장 이전', sub: '위약금 10%' },
  { value: 'user_cancel', label: '단순 변심', sub: '위약금 10%' },
]

interface RefundReasonChipsProps {
  value: RefundReason | null
  onChange: (value: RefundReason) => void
  error?: string
}

export default function RefundReasonChips({ value, onChange, error }: RefundReasonChipsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-800">환불 사유</span>

      <p className="text-xs text-gray-400 mb-0.5">사업자 귀책 — 위약금 없음</p>
      <div className="flex flex-col gap-2 mb-3">
        {BUSINESS_OPTIONS.map((opt) => (
          <OptionButton key={opt.value} opt={opt} selected={value === opt.value} onSelect={onChange} />
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-0.5">개인 사정 — 위약금 10%</p>
      <div className="flex flex-col gap-2">
        {PERSONAL_OPTIONS.map((opt) => (
          <OptionButton key={opt.value} opt={opt} selected={value === opt.value} onSelect={onChange} />
        ))}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

function OptionButton({
  opt,
  selected,
  onSelect,
}: {
  opt: Option
  selected: boolean
  onSelect: (v: RefundReason) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(opt.value)}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
        selected ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 bg-white active:bg-gray-50'
      }`}
    >
      <span className={`text-sm font-semibold ${selected ? 'text-[#2563EB]' : 'text-gray-800'}`}>
        {opt.label}
      </span>
      <span className="text-xs text-gray-400">{opt.sub}</span>
    </button>
  )
}
