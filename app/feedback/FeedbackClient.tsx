'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import FeedbackSheet from '@/components/FeedbackSheet'

/**
 * 상시 의견 창구.
 *
 * 시트를 바로 열어둔다. 링크를 눌러 들어온 사람은 이미 할 말이 있는 상태라
 * 한 번 더 버튼을 누르게 만들 이유가 없다.
 */
export default function FeedbackClient() {
  const [open, setOpen] = useState(true)
  const [sent, setSent] = useState(false)

  return (
    <main className="flex min-h-screen flex-col px-5 pb-16">
      <header className="pt-6 pb-4">
        <Logo />
      </header>

      <div className="mt-4">
        <h1 className="text-xl font-bold text-gray-900">의견 보내기</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          쓰면서 막혔던 부분, 잘못된 계산, 있었으면 하는 기능 —
          무엇이든 알려주시면 직접 읽고 반영하겠습니다.
        </p>
      </div>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 h-[52px] w-full rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-lg"
        >
          {sent ? '의견 하나 더 보내기' : '의견 쓰기'}
        </button>
      )}

      {sent && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          보내주셔서 감사합니다. 잘 받았습니다.
        </p>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-white px-4 py-4 text-xs leading-6 text-gray-600">
        <p className="font-semibold text-gray-800">직접 연락하고 싶으시면</p>
        <p className="mt-1">
          <a href="mailto:blueskycuj@naver.com" className="text-[#2563EB] underline">
            blueskycuj@naver.com
          </a>
        </p>
        <p className="mt-2 text-gray-400">
          남겨주신 내용은 서비스 개선에만 사용합니다. 자세한 내용은{' '}
          <Link href="/privacy" className="underline">개인정보 처리방침</Link>을 확인해 주세요.
        </p>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm text-[#2563EB] underline">홈으로 돌아가기</Link>
      </div>

      <FeedbackSheet
        open={open}
        onClose={() => { setOpen(false); setSent(true) }}
        place="global"
        title="어떤 점을 알려주시겠어요?"
        choices={[
          '계산 결과가 이상해요',
          'PDF가 안 만들어져요',
          '어디서 뭘 해야 할지 모르겠어요',
          '내 상황에 맞는 안내가 없어요',
          '그냥 응원해요',
        ]}
        placeholder="자세히 적어주시면 큰 도움이 됩니다 (선택)"
      />
    </main>
  )
}
