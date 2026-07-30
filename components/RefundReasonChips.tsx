'use client'

import { useState } from 'react'

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
  { value: 'closure', label: '헬스장 폐업', sub: '+10% 더 받음' },
  { value: 'facility_defect', label: '시설 훼손 / 기구 고장·철거', sub: '+10% 더 받음' },
  { value: 'service_reduction', label: '운영시간·서비스 축소', sub: '+10% 더 받음' },
  { value: 'gym_relocation', label: '헬스장 이전 (접근 불가)', sub: '+10% 더 받음' },
  { value: 'price_increase', label: '약정 외 요금 인상', sub: '+10% 더 받음' },
]

const PERSONAL_OPTIONS: Option[] = [
  { value: 'not_started', label: '이용 개시 전 해지', sub: '기이용료 없음 · −10%' },
  { value: 'injury', label: '부상 / 질병', sub: '−10% 공제' },
  { value: 'pregnancy', label: '임신 / 출산', sub: '−10% 공제' },
  { value: 'relocation', label: '이사 (주거지 이전)', sub: '−10% 공제' },
  { value: 'job_change', label: '이직 / 직장 이전', sub: '−10% 공제' },
  { value: 'user_cancel', label: '단순 변심', sub: '−10% 공제' },
]

type Group = 'business' | 'personal'

interface RefundReasonChipsProps {
  value: RefundReason | null
  onChange: (value: RefundReason) => void
  error?: string
  /**
   * "목록에 내 사유가 없다"를 눌렀을 때.
   * 폼 미제출자 17명 중 9명(53%)이 이 필드에서 멈춘다. 지표로는 이유를 알 수 없어
   * 이탈 직전에 직접 묻는다.
   */
  onMissingReason?: () => void
}

export default function RefundReasonChips({ value, onChange, error, onMissingReason }: RefundReasonChipsProps) {
  /*
    2단계로 나눈다.

    이전에는 11개 카드를 한 화면에 세로로 다 펼쳐 420px 기준 약 2화면을 차지했다.
    폼 미제출자의 53%(9/17)가 이 필드에서 멈추는데, 원인은 UI 마찰이 아니라
    "11개를 다 읽고 내가 자격이 되는지 판단해야 한다"는 인지 부담으로 보인다.

    먼저 "누구 때문인가?" 3개만 묻고, 고른 뒤 해당 그룹만 펼친다.
    첫 화면에 3개만 보이면 읽어야 할 양이 1/4로 줄어든다.
  */
  const preselected: Group | null =
    value === null ? null : BUSINESS_OPTIONS.some((o) => o.value === value) ? 'business' : 'personal'
  const [group, setGroup] = useState<Group | null>(preselected)

  const options = group === 'business' ? BUSINESS_OPTIONS : group === 'personal' ? PERSONAL_OPTIONS : []

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-800">환불 사유</span>
      <p className="mb-1 text-xs text-gray-400">해지하려는 이유가 어느 쪽에 가까운가요?</p>

      <div className="flex flex-col gap-2">
        <GroupButton
          selected={group === 'business'}
          onSelect={() => setGroup('business')}
          title="헬스장 쪽 문제예요"
          desc="폐업 · 시설 고장 · 이전 · 요금 인상 등"
          badge="+10% 더 받음"
          badgeTone="good"
        />
        <GroupButton
          selected={group === 'personal'}
          onSelect={() => setGroup('personal')}
          title="제 사정이에요"
          desc="부상 · 이사 · 이직 · 단순 변심 등"
          badge="−10% 공제"
          badgeTone="neutral"
        />
        {onMissingReason && (
          <GroupButton
            selected={false}
            onSelect={onMissingReason}
            title="잘 모르겠어요"
            desc="상황을 알려주시면 기준을 찾아 안내해드립니다"
            badge="알려주세요"
            badgeTone="muted"
            dashed
          />
        )}
      </div>

      {group && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-gray-400">
            {group === 'business' ? '구체적으로 어떤 상황인가요?' : '어떤 사정인가요?'}
          </p>
          {options.map((opt) => (
            <OptionButton key={opt.value} opt={opt} selected={value === opt.value} onSelect={onChange} />
          ))}
          <button
            type="button"
            onClick={() => setGroup(group === 'business' ? 'personal' : 'business')}
            className="mt-1 self-start text-xs text-[#2563EB] underline underline-offset-2"
          >
            {group === 'business' ? '제 사정으로 바꾸기' : '헬스장 쪽 문제로 바꾸기'}
          </button>
        </div>
      )}

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

function GroupButton({
  selected, onSelect, title, desc, badge, badgeTone, dashed,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  desc: string
  badge: string
  badgeTone: 'good' | 'neutral' | 'muted'
  dashed?: boolean
}) {
  const tone =
    badgeTone === 'good'
      ? 'bg-emerald-50 text-emerald-700'
      : badgeTone === 'neutral'
        ? 'bg-gray-100 text-gray-500'
        : 'bg-gray-100 text-gray-400'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-[#2563EB] bg-blue-50'
          : dashed
            ? 'border-dashed border-gray-300 bg-gray-50 active:bg-gray-100'
            : 'border-gray-200 bg-white active:bg-gray-50'
      }`}
    >
      <span className="flex flex-col">
        <span className={`text-sm font-semibold ${selected ? 'text-[#2563EB]' : 'text-gray-800'}`}>{title}</span>
        <span className="mt-0.5 text-xs text-gray-400">{desc}</span>
      </span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}>{badge}</span>
    </button>
  )
}
