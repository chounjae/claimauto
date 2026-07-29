/**
 * 서버 사이드 PDF 생성
 *
 * 왜 서버에서 만드나:
 * iOS 인앱 웹뷰(WKWebView)에서 `window.print()` 는 아무 동작도 하지 않는다.
 * 2026-07-30 실측에서 `pdf_print_no_sheet` 7건 / `pdf_print_sheet_shown` 0건 —
 * 인쇄 시트가 한 번도 뜨지 않았다. 유입의 70%가 에브리타임 앱(인앱 웹뷰)이므로
 * 클라이언트 인쇄에 의존하는 한 대부분의 사용자는 PDF 를 저장할 수 없다.
 *
 * ⚠️ 개인정보 취급
 * 이름·연락처·주소가 들어온다. 요청 처리 중 메모리에서만 쓰고 응답 후 버린다.
 * 저장·로깅(console.*)·외부 전송 금지. 오류 응답에도 값을 담지 않는다.
 *
 * **POST 를 정규 경로로 쓴다.** GET 쿼리에 개인정보를 실으면
 * Vercel 접속 로그와 브라우저 히스토리에 이름·연락처·주소가 남는다.
 * 우리 코드가 로깅하지 않아도 플랫폼 로그는 통제 밖이다.
 * GET 은 이전 링크 호환을 위해 남겨두되 신규 경로로 쓰지 않는다.
 */

import type { NextRequest } from 'next/server'
import { renderClaimPdf } from '@/lib/pdf/ClaimDocument'
import { parseClaimParams } from '@/lib/refund-doc'
import { trackServer } from '@/lib/server-analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
/** 콜드스타트에 폰트 5.4MB 파싱이 들어간다. 기본 10초로는 빠듯할 수 있다. */
export const maxDuration = 30

const FILE_NAME = '환불청구서.pdf'

function badRequest(field: string): Response {
  // 필드 "이름"만 알린다. 사용자가 입력한 값은 절대 응답에 담지 않는다.
  return Response.json(
    { error: 'invalid_parameter', field },
    { status: 400, headers: { 'Cache-Control': 'no-store' } },
  )
}

async function respondWithPdf(params: URLSearchParams): Promise<Response> {
  const parsed = parseClaimParams(params)
  if (!parsed.ok) return badRequest(parsed.error)

  const body = await renderClaimPdf(parsed.data)

  // PDF 가 실제로 만들어졌을 때만 발화한다. 지금까지 "저장 성공"을 잴 수단이 없었다.
  // 개인정보는 넘기지 않는다 — 사유와 바이트 수만 보낸다.
  await trackServer('pdf_generated', params.get('distinctId') ?? '', {
    refund_reason: params.get('refundReason'),
    is_business_fault: params.get('isBusinessFault') === 'true',
    bytes: body.byteLength,
  })

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      // attachment 가 아니라 inline.
      // iOS 인앱 웹뷰는 다운로드를 막는 경우가 많지만 PDF 인라인 표시는 대체로 동작하고,
      // 표시되면 사용자가 iOS 공유 시트로 파일에 저장할 수 있다.
      'Content-Disposition': `inline; filename="claim.pdf"; filename*=UTF-8''${encodeURIComponent(FILE_NAME)}`,
      'Content-Length': String(body.byteLength),
      // 개인정보가 담긴 응답이다. 공유 캐시에 남기지 않는다.
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

/**
 * 정규 경로. 폼 POST 로 받아 개인정보가 URL 에 남지 않게 한다.
 * `<form method="POST">` 제출은 인앱 웹뷰에서도 GET 이동과 동일하게 동작한다.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const form = await request.formData()
  const params = new URLSearchParams()
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') params.set(key, value)
  }
  return respondWithPdf(params)
}

/** 이전 링크 호환용. 개인정보가 URL 에 남으므로 신규 경로로 쓰지 않는다. */
export async function GET(request: NextRequest): Promise<Response> {
  return respondWithPdf(request.nextUrl.searchParams)
}
