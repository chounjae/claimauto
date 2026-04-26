export type RefundReason =
  | 'closure'
  | 'business_fault'
  | 'injury'
  | 'pregnancy'
  | 'relocation'
  | 'user_cancel'

interface Option {
  value: RefundReason
  label: string
  sub: string
}

const BUSINESS_OPTIONS: Option[] = [
  { value: 'closure', label: '헬스장 폐업', sub: '위약금 없음' },
  { value: 'business_fault', label: '사업자 귀책 기타', sub: '시설 불량·서비스 미제공 등 / 위약금 없음' },
]

const PERSONAL_OPTIONS: Option[] = [
  { value: 'injury', label: '부상 / 질병', sub: '위약금 10%' },
  { value: 'pregnancy', label: '임신 / 출산', sub: '위약금 10%' },
  { value: 'relocation', label: '이사 / 이직', sub: '위약금 10%' },
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
