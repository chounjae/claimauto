/**
 * 사용자 의견 수집
 *
 * 왜 별도 인프라를 안 쓰나:
 * 이미 Mixpanel 이 붙어 있다. 월 예상 유입이 1~2건 규모라(ADR-001) 메일 발송 서비스나
 * DB 를 새로 붙이는 비용이 이득보다 크다. 이벤트로 남기면 기존 분석 파이프라인에서 함께 읽힌다.
 *
 * ⚠️ 개인정보 취급
 * 이메일은 '답변을 원하는 사람'만 남기는 선택 항목이다. 서버에 저장하지 않고
 * Mixpanel 이벤트 속성으로만 전달한다. 처리방침(§3)에 이 사실을 명시했다.
 * 로깅(console.*) 금지 — 의견 본문에 개인정보가 섞일 수 있다.
 */

import type { NextRequest } from 'next/server'
import { trackServer } from '@/lib/server-analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** 본문 길이 상한. 이보다 길면 잘라서 저장한다(거부하지 않는다 — 애써 쓴 걸 버리지 않는다). */
const MAX_MESSAGE = 1000
const MAX_EMAIL = 254
/** 노출 지점 화이트리스트. 오타나 조작된 값이 집계를 오염시키지 않게 한다. */
const PLACES = ['reason_missing', 'result_exit', 'pdf_done', 'global'] as const
type Place = (typeof PLACES)[number]

function isPlace(v: string): v is Place {
  return (PLACES as readonly string[]).includes(v)
}

/** 아주 느슨한 형식 확인. 오탈자를 막으려는 것이지 검증이 목적이 아니다. */
function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 })
  }

  const input = body as Record<string, unknown>
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  const choice = typeof input.choice === 'string' ? input.choice.trim().slice(0, 80) : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const placeRaw = typeof input.place === 'string' ? input.place : ''
  const distinctId = typeof input.distinctId === 'string' ? input.distinctId : ''
  const context = typeof input.context === 'string' ? input.context.slice(0, 80) : ''

  // 선택지만 고르고 본문을 비워도 유효한 응답이다. 둘 다 비면 보낼 게 없다.
  if (!message && !choice) {
    return Response.json({ ok: false, error: 'empty' }, { status: 400 })
  }
  const place: Place = isPlace(placeRaw) ? placeRaw : 'global'

  await trackServer('feedback_submitted', distinctId || 'anonymous', {
    place,
    choice: choice || null,
    message: message.slice(0, MAX_MESSAGE) || null,
    message_length: message.length,
    has_email: Boolean(email) && looksLikeEmail(email),
    // 답변을 원한 사람만 남긴다. 없으면 아예 속성을 비운다.
    email: email && looksLikeEmail(email) ? email.slice(0, MAX_EMAIL) : null,
    context: context || null,
  })

  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
