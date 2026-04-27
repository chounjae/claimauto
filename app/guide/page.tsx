'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import ExternalLinkModal from '@/components/ExternalLinkModal'

/* ─── 소비자원 신청서 작성 템플릿 ─────────────────── */
const TEMPLATE_OVERVIEW =
  `[헬스장명]과 [계약일]에 헬스장 이용계약을 체결하고 [금액]원을 납부하였습니다. [중단일]에 중도해지를 요청하였으나 업체 측이 환불을 거부/묵살하였습니다. 공정거래위원회 고시 제56조에 따라 환불금 [금액]원 지급을 요청합니다.`

const TEMPLATE_DEMAND =
  `공정거래위원회 고시 소비자분쟁해결기준 제56조(체육시설업)에 따라 계산된 환불금 [금액]원의 즉시 지급을 요구합니다.`

/* ─── 스텝 데이터 ─────────────────────────────────── */
type Step = {
  num: number
  title: string
  desc: string
  substeps?: string[]
  hint?: string
  template?: { label: string; text: string }[]
  checklist?: string[]
  action?: { label: string; href: string }
  timeline?: string
}

const STEPS: Step[] = [
  {
    num: 1,
    title: '직접 협상 기록 남기기',
    desc: '소비자원 신청 전, 직접 협상 시도 증거를 반드시 확보하세요. 소비자원이 "업체에 먼저 연락했는가"를 확인합니다.',
    substeps: [
      '문자 또는 카카오톡으로 환불 요청 메시지 발송',
      '발송 내역 스크린샷 저장 (날짜·시각 포함)',
      '업체가 거부·무응답 시 그 화면도 캡처',
      'ClaimAuto에서 생성한 PDF 청구서를 업체에 전달',
    ],
    hint: '구두(전화) 거절은 증거가 없습니다. 반드시 문자·문서로 남기세요.',
  },
  {
    num: 2,
    title: '소비자24 접속 및 회원가입',
    desc: '한국소비자원이 운영하는 공식 피해구제 창구입니다.',
    substeps: [
      'ccn.go.kr 접속',
      '상단 메뉴 "피해구제" → "피해구제 신청" 클릭',
      '본인인증 (카카오·네이버 간편인증 가능)',
    ],
    action: { label: '소비자24 바로가기', href: 'https://www.ccn.go.kr' },
    hint: '공인인증서 없이도 카카오·네이버 인증으로 신청 가능합니다.',
  },
  {
    num: 3,
    title: '피해 분야 및 내용 입력',
    desc: '신청서 양식에 아래 내용을 정확히 입력하세요.',
    substeps: [
      '피해 분야: "체육시설" 또는 "헬스장" 선택',
      '피해 유형: "계속거래 → 중도해지" 선택',
      '사건 개요 입력 (아래 템플릿 참고)',
      '요구사항 입력 (아래 템플릿 참고)',
    ],
    template: [
      { label: '사건 개요 (복사해서 수정)', text: TEMPLATE_OVERVIEW },
      { label: '요구사항 (복사해서 수정)', text: TEMPLATE_DEMAND },
    ],
  },
  {
    num: 4,
    title: '증빙 서류 첨부',
    desc: '서류가 많을수록 처리가 빠릅니다. 아래 항목을 최대한 준비하세요.',
    checklist: [
      'ClaimAuto 환불 청구서 PDF (필수)',
      '업체에 환불 요청한 문자/카톡 내역 캡처 (필수)',
      '결제 영수증 또는 카드 내역서 (필수)',
      '계약서 또는 등록증 사진',
      '폐업 공지 캡처 또는 폐업 확인 자료',
      '기타 피해 증거 (시설 불량 사진 등)',
    ],
  },
  {
    num: 5,
    title: '제출 후 처리 흐름',
    desc: '신청 후 다음 순서로 진행됩니다.',
    substeps: [
      '접수 즉시 → 접수번호 발급 (이메일/문자 통보)',
      '1~3일 → 담당 조사관 배정',
      '3~7일 → 소비자원이 업체에 공문 발송 (이 단계에서 대부분 해결)',
      '2~4주 → 합의 권고 또는 조정 결정',
      '조정 불성립 시 → 법원 소액소송 경로로 이동',
    ],
    timeline: '평균 처리 기간: 2~4주 | 비용: 무료',
    hint: '소비자원 공문이 업체에 발송되면 70% 이상이 자진 환불로 해결됩니다.',
  },
]

/* ─── 소액소송 경로 ─────────────────────────────── */
const LAWSUIT_STEPS = [
  '소비자원 조정 불성립 확인서 발급 요청',
  '법원 전자소송(ecfs.scourt.go.kr) 또는 나홀로소송 접속',
  '소액사건 신청 (청구금액 3,000만원 이하)',
  '인지대 납부 (10만원 청구 시 약 1,000원 수준)',
  '피고: 업체 사업자등록번호로 법인명 확인 후 기재',
  '증거 첨부: 소비자원 불성립 확인서 + ClaimAuto 청구서',
]

/* ─── FAQ ───────────────────────────────────────── */
const FAQS = [
  {
    q: '폐업해서 사업주를 못 찾으면 소비자원 신청이 가능한가요?',
    a: '가능합니다. 폐업 사실을 확인할 수 있는 자료(공지 캡처, 국세청 사업자 폐업 조회 결과 등)를 첨부하면 됩니다. 단, 업체가 폐업한 경우 조정 결과 이행이 어려울 수 있어 카드사 차지백 또는 소액소송이 더 실효적일 수 있습니다.',
  },
  {
    q: '카드로 결제했으면 카드사 차지백도 병행할 수 있나요?',
    a: '네. 카드사에 "서비스 미이행" 사유로 이의신청하면 결제 취소를 요청할 수 있습니다. 소비자원 신청과 동시에 진행하면 더 효과적입니다. 단, 차지백은 일반적으로 결제일로부터 120일 이내에 신청해야 합니다.',
  },
  {
    q: '소비자원 조정이 불성립되면 어떻게 되나요?',
    a: '소비자원 조정이 불성립되더라도 포기하지 마세요. 소액소송(나홀로소송)을 통해 법원에 직접 청구할 수 있습니다. 소비자원의 조정 불성립 확인서가 법원에서 강력한 증거로 활용됩니다. 청구금액이 3,000만원 이하이면 소액사건심판으로 간단히 진행됩니다.',
  },
  {
    q: '소비자원 신청과 카드사 이의신청을 동시에 해도 되나요?',
    a: '동시 진행 가능합니다. 다만, 한 쪽에서 환불이 완료되면 다른 쪽은 취하하는 것이 원칙입니다. 카드사 차지백이 승인되면 소비자원 신청은 취하 처리하시면 됩니다.',
  },
  {
    q: 'PT(개인 레슨)도 환불이 되나요?',
    a: 'PT 이용권도 일반 헬스장 이용권과 동일하게 공정거래위원회 고시 제56조 적용 대상입니다. 잔여 횟수 기준으로 계산하며, 이미 진행한 횟수를 단가(총액 ÷ 총 횟수)로 계산해 공제한 후 환불받을 수 있습니다. PT와 헬스장 이용권을 묶음 구매한 경우에는 각각 분리해서 계산해야 합니다. 업체가 "진행한 수업료가 비싸다"며 임의로 단가를 높여 적용하는 것은 소비자분쟁해결기준 위반입니다.',
  },
  {
    q: '할인·프로모션으로 가입했는데 환불 기준은 어떻게 되나요?',
    a: '환불 계산의 기준은 실제 납부한 금액입니다. 100만원짜리를 50% 할인받아 50만원을 냈다면, 50만원 기준으로 기이용료와 위약금을 계산합니다. 업체가 "정상가 기준으로 기이용료를 계산해야 한다"고 주장하는 경우가 있는데, 이는 소비자분쟁해결기준에 위배됩니다. 실제 납부 금액 기준으로 계산해 달라고 명시적으로 요구하세요.',
  },
  {
    q: '"환불 불가" 조항이 계약서에 있는데 환불받을 수 있나요?',
    a: '받을 수 있습니다. 공정거래위원회 고시 소비자분쟁해결기준과 체육시설의 설치·이용에 관한 법률은 강행규정으로, 이와 다른 계약 조항은 효력이 없습니다. "환불 불가" 특약은 소비자에게 불리한 약관으로 약관의 규제에 관한 법률 제6조·제9조에 따라 무효입니다. ClaimAuto에서 생성한 청구서에 이 법적 근거가 포함되어 있으니, 업체가 계약서 조항을 이유로 거부하더라도 소비자원에 신고하세요.',
  },
  {
    q: '영수증(결제 증빙)을 잃어버렸는데 어떻게 하나요?',
    a: '영수증이 없어도 환불 신청은 가능합니다. 대체 증빙으로 ① 카드 결제 시: 카드사 앱·홈페이지에서 거래내역 출력 또는 캡처, ② 계좌이체 시: 은행 앱의 이체 내역 캡처, ③ 현금 결제 시: 문자 영수증(카카오페이 등) 또는 업체 가입 확인서를 사용할 수 있습니다. 소비자원 신청 시 이 자료들을 첨부하면 됩니다.',
  },
  {
    q: '헬스장이 "환불해줄 돈이 없다"고 하면 어떻게 하나요?',
    a: '"돈이 없다"는 것은 환불 거부 사유가 되지 않습니다. 즉시 소비자원에 피해구제를 신청하세요. 소비자원이 업체에 공문을 발송하면 대부분 해결됩니다. 카드로 결제했다면 카드사에 차지백(이의신청)을 동시 진행하는 것이 효과적입니다. 그래도 해결이 안 되면 소액소송을 통해 확정판결을 받은 후 업체 재산에 강제집행을 신청할 수 있습니다.',
  },
]

/* ─── 컴포넌트 ──────────────────────────────────── */
export default function GuidePage() {
  const router = useRouter()
  const [externalModal, setExternalModal] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const toggleCheck = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <main className="flex flex-col min-h-screen px-5 pb-24">
      <header className="pt-6 pb-4">
        <Logo />
      </header>

      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">소비자원 신고 가이드</h1>
        <p className="mt-1 text-sm text-gray-500">직접 협상 실패 후 소비자원에 신고하는 전체 흐름</p>
      </div>

      {/* 전체 흐름 요약 배너 */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-4 mb-6">
        <p className="text-xs font-bold text-blue-700 mb-2">전체 흐름</p>
        <div className="flex items-center gap-1 flex-wrap text-xs text-blue-800">
          {['청구서 발송', '거절/무응답', '소비자원 신청', '업체 공문 발송', '환불 완료'].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-1">
              <span className="font-semibold">{s}</span>
              {i < arr.length - 1 && <span className="text-blue-400">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-blue-600">
          소비자원 공문 발송 후 70% 이상이 자진 환불로 해결됩니다
        </p>
      </div>

      {/* 스텝 카드 */}
      <div className="flex flex-col gap-4 mb-8">
        {STEPS.map((step) => (
          <StepCard
            key={step.num}
            step={step}
            checked={checked}
            copied={copied}
            onToggleCheck={toggleCheck}
            onCopy={copyText}
            onExternalLink={() => setExternalModal(true)}
          />
        ))}
      </div>

      {/* 소액소송 섹션 */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">조정 불성립 시</span>
          <h2 className="text-sm font-bold text-amber-800">소액소송으로 법원에 직접 청구</h2>
        </div>
        <p className="text-xs text-amber-700 mb-3">
          소비자원 조정이 실패해도 포기하지 마세요. 소액소송은 변호사 없이도 진행 가능합니다.
        </p>
        <ol className="flex flex-col gap-2">
          {LAWSUIT_STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white shrink-0 mt-0.5">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => window.open('https://pro-se.scourt.go.kr', '_blank', 'noopener,noreferrer')}
          className="mt-4 w-full h-10 rounded-xl border border-amber-400 text-amber-800 text-xs font-semibold"
        >
          나홀로소송 바로가기
        </button>
      </div>

      {/* FAQ */}
      <h2 className="mb-3 text-sm font-bold text-gray-800">자주 묻는 질문</h2>
      <div className="flex flex-col gap-2 mb-8">
        {FAQS.map((faq, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setFaqOpen((prev) => (prev === i ? null : i))}
              className="flex w-full items-center justify-between px-4 py-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-800 pr-2">{faq.q}</span>
              <span className={`text-gray-400 shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {faqOpen === i && (
              <div className="px-4 pb-4">
                <p className="text-xs text-gray-600 leading-5">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] p-4 bg-gradient-to-t from-[#F8FAFC] to-transparent">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-[52px] w-full items-center justify-center rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700"
        >
          ← 결과로 돌아가기
        </button>
      </div>

      {externalModal && (
        <ExternalLinkModal
          url="https://www.ccn.go.kr"
          name="소비자24"
          onConfirm={() => {
            window.open('https://www.ccn.go.kr', '_blank', 'noopener,noreferrer')
            setExternalModal(false)
          }}
          onCancel={() => setExternalModal(false)}
        />
      )}
    </main>
  )
}

function StepCard({
  step, checked, copied, onToggleCheck, onCopy, onExternalLink,
}: {
  step: Step
  checked: Record<string, boolean>
  copied: string | null
  onToggleCheck: (key: string) => void
  onCopy: (text: string, id: string) => void
  onExternalLink: () => void
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white shrink-0">
          {step.num}
        </span>
        <span className="text-sm font-bold text-gray-900">{step.title}</span>
      </div>

      <p className="text-xs text-gray-600 mb-3 leading-5">{step.desc}</p>

      {step.substeps && (
        <ul className="flex flex-col gap-1.5 mb-3">
          {step.substeps.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-[#2563EB] font-bold shrink-0 mt-0.5">·</span>
              {s}
            </li>
          ))}
        </ul>
      )}

      {step.template && (
        <div className="flex flex-col gap-2 mb-3">
          {step.template.map((t) => (
            <div key={t.label} className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold text-gray-500">{t.label}</p>
                <button
                  type="button"
                  onClick={() => onCopy(t.text, t.label)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                    copied === t.label
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {copied === t.label ? '복사됨 ✓' : '복사'}
                </button>
              </div>
              <p className="text-[11px] text-gray-700 leading-4">{t.text}</p>
            </div>
          ))}
        </div>
      )}

      {step.checklist && (
        <ul className="flex flex-col gap-2 mb-3">
          {step.checklist.map((item) => {
            const key = `${step.num}-${item}`
            return (
              <li key={key} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleCheck(key)}
                  className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    checked[key] ? 'border-[#2563EB] bg-[#2563EB]' : 'border-gray-300 bg-white'
                  }`}
                  aria-label={item}
                >
                  {checked[key] && (
                    <svg viewBox="0 0 10 8" className="h-3 w-3">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`text-xs ${checked[key] ? 'line-through text-gray-400' : item.includes('필수') ? 'text-gray-800 font-semibold' : 'text-gray-700'}`}>
                  {item}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {step.hint && (
        <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2">
          💡 {step.hint}
        </p>
      )}

      {step.timeline && (
        <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-2">
          ⏱ {step.timeline}
        </p>
      )}

      {step.action && (
        <button
          type="button"
          onClick={onExternalLink}
          className="w-full h-10 rounded-xl bg-[#2563EB] text-white text-sm font-semibold"
        >
          {step.action.label}
        </button>
      )}
    </div>
  )
}
