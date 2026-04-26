export type PaymentType = '신용카드 일시불' | '체크카드' | '현금' | '할부'

const OPTIONS: PaymentType[] = ['신용카드 일시불', '체크카드', '현금', '할부']

interface PaymentChipsProps {
  value: PaymentType
  onChange: (value: PaymentType) => void
}

export default function PaymentChips({ value, onChange }: PaymentChipsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-800">납부 방식</span>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
              value === option
                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                : 'border-gray-300 bg-white text-gray-600 active:bg-gray-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
