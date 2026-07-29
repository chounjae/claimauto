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
 * 이름·연락처·주소가 쿼리로 들어온다. 요청 처리 중 메모리에서만 쓰고 응답 후 버린다.
 * 저장·로깅(console.*)·외부 전송 금지. 오류 응답에도 값을 담지 않는다.
 */

import type { NextRequest } from 'next/server'
import { renderClaimPdf } from '@/lib/pdf/ClaimDocument'
import { parseClaimParams } from '@/lib/refund-doc'

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

export async function GET(request: NextRequest): Promise<Response> {
  const parsed = parseClaimParams(request.nextUrl.searchParams)
  if (!parsed.ok) return badRequest(parsed.error)

  const body = await renderClaimPdf(parsed.data)

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      // attachment 가 아니라 inline.
      // iOS 인앱 웹뷰는 다운로드를 막는 경우가 많지만 PDF 인라인 표시는 대체로 동작하고,
      // 표시되면 사용자가 iOS 공유 시트로 파일에 저장할 수 있다.
      'Content-Disposition': `inline; filename="claim.pdf"; filename*=UTF-8''${encodeURIComponent(FILE_NAME)}`,
      'Content-Length': String(body.byteLength),
      // 클라이언트가 성공을 계측(pdf_generated)한 직후 같은 URL 로 이동한다.
      // 짧은 private 캐시를 두어 같은 PDF 를 두 번 생성하지 않게 한다.
      'Cache-Control': 'private, max-age=60',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
      // 개인정보가 담긴 URL 이 외부 사이트로 새 나가지 않도록 한다.
      'Referrer-Policy': 'no-referrer',
    },
  })
}
