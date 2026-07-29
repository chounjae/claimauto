'use client'

import { useEffect, useRef, useState } from 'react'
import { getDistinctId, track } from '@/lib/analytics'

/**
 * 의견 수집 바텀시트
 *
 * 설계 근거
 * - **칩 + 자유입력.** 자유입력만 두면 대부분 아무것도 안 쓴다. 칩만 눌러도 제출되게 해
 *   최소 마찰 경로를 만들고, 하고 싶은 말이 있는 사람만 타이핑하게 한다.
 * - **1단계.** 화면 375px 에 단계를 나누면 이탈이 는다. 필수는 칩 하나뿐이다.
 * - **이메일은 접어둔다.** 처음부터 보이면 "왜 내 이메일을 달라는거지"로 읽힌다.
 *   답변을 원하는 사람만 펼쳐서 남긴다.
 * - **바텀시트.** 모바일에서 모달보다 도달 거리가 짧고 닫기 제스처가 자연스럽다.
 * - **한 번 보낸 사람에게 다시 묻지 않는다.** localStorage 로 지점별 기록.
 *
 * iOS 키보드 대응
 * 인앱 웹뷰·Safari 에서 `position: fixed` 요소는 키보드가 올라오면 가려진다.
 * 입력창 포커스 시 `scrollIntoView` 로 끌어올린다.
 */

export type FeedbackPlace = 'reason_missing' | 'result_exit' | 'pdf_done' | 'global'

interface Props {
  place: FeedbackPlace
  title: string
  /** 칩 라벨. 빈 배열이면 자유입력만 노출한다. */
  choices?: string[]
  placeholder?: string
  /** 분석용 부가 맥락 (환불 사유 등). 개인정보를 넣지 마라. */
  context?: string
  open: boolean
  onClose: () => void
}

const DONE_KEY = 'cf_done_'

export function markAsked(place: FeedbackPlace): void {
  try {
    localStorage.setItem(DONE_KEY + place, '1')
  } catch {
    // 사파리 프라이빗 모드 등에서 실패할 수 있다. 재노출될 뿐 기능에는 영향 없다.
  }
}

export function alreadyAsked(place: FeedbackPlace): boolean {
  try {
    return localStorage.getItem(DONE_KEY + place) === '1'
  } catch {
    return false
  }
}

export default function FeedbackSheet({
  place, title, choices = [], placeholder = '자유롭게 적어주세요 (선택)', context, open, onClose,
}: Props) {
  const [choice, setChoice] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const messageRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) track('feedback_opened', { place, context })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // 열려 있는 동안 배경 스크롤을 막는다.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  const canSubmit = (choice !== '' || message.trim() !== '') && state === 'idle'

  const submit = async () => {
    if (!canSubmit) return
    setState('sending')
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place, choice, message, email, context, distinctId: getDistinctId(),
        }),
      })
    } catch {
      // 전송 실패해도 사용자에게 되묻지 않는다. 다시 쓰게 하는 편이 더 나쁘다.
    }
    markAsked(place)
    setState('done')
  }

  const close = () => {
    if (state === 'idle') track('feedback_dismissed', { place, context })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={close}
        className="absolute inset-0 bg-black/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[375px] max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white px-5 pb-6 pt-3 shadow-2xl"
      >
        {/* 드래그 핸들 — 시각적으로 '내려서 닫는 것'임을 알린다 */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />

        {state === 'done' ? (
          <div className="py-8 text-center">
            <p className="text-2xl">🙏</p>
            <p className="mt-3 text-base font-bold text-gray-900">보내주셔서 감사합니다</p>
            <p className="mt-1 text-sm text-gray-500">
              {email ? '답변이 필요하면 남겨주신 메일로 연락드리겠습니다.' : '더 나은 서비스를 만드는 데 쓰겠습니다.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-[46px] w-full rounded-xl bg-gray-100 text-sm font-semibold text-gray-700"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>

            {choices.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {choices.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChoice(choice === c ? '' : c)}
                    className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                      choice === c
                        ? 'border-[#2563EB] bg-blue-50 font-semibold text-[#2563EB]'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={messageRef}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              onFocus={() => {
                // iOS 키보드가 입력창을 가리는 것을 막는다.
                setTimeout(() => messageRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)
              }}
              placeholder={placeholder}
              rows={3}
              className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-300 focus:border-[#2563EB]"
            />

            {showEmail ? (
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => {
                  setTimeout(() => messageRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)
                }}
                placeholder="hong@example.com"
                className="mt-2 h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none placeholder:text-gray-300 focus:border-[#2563EB]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="mt-2 text-xs text-[#2563EB] underline"
              >
                답변을 받고 싶어요 (이메일 남기기)
              </button>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className="mt-4 h-[52px] w-full rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
              {state === 'sending' ? '보내는 중...' : '보내기'}
            </button>

            <button
              type="button"
              onClick={close}
              className="mt-2 h-[44px] w-full text-sm text-gray-400"
            >
              괜찮아요
            </button>
          </>
        )}
      </div>
    </div>
  )
}
