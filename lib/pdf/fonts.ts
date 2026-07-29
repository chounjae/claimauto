/**
 * PDF 한글 폰트 등록
 *
 * 폰트를 등록하지 않으면 @react-pdf/renderer 는 Helvetica 로 떨어지고 한글이 전부 깨진다.
 * 원격 URL 을 쓰면 서버리스 콜드스타트마다 네트워크에 의존하게 되므로 저장소에 vendoring 한다.
 *
 * 폰트: Pretendard v1.3.9 (SIL Open Font License 1.1) — `fonts/Pretendard-LICENSE.txt`
 * - 완성형 한글 11,172자를 모두 포함한다. KS X 1001 서브셋(PretendardStd)은
 *   "쉐"·"휘" 같은 외래어 표기 음절이 빠져 업체명·주소에서 두부 글자가 난다.
 * - Regular 2.7MB + Bold 2.6MB = 5.4MB (gzip 약 2.3MB).
 *
 * ⚠️ 번들 포함은 `next.config.ts` 의 `outputFileTracingIncludes` 로 강제한다.
 *    설정을 지우면 Vercel 배포본에서 폰트 파일이 사라져 런타임에 실패한다.
 */

import fs from 'node:fs'
import path from 'node:path'
import { Font } from '@react-pdf/renderer'

export const PDF_FONT_FAMILY = 'Pretendard'

const FONT_FILES = {
  regular: 'Pretendard-Regular.ttf',
  bold: 'Pretendard-Bold.ttf',
} as const

/** 실행 환경에 따라 cwd 가 달라질 수 있어 후보 경로를 순서대로 확인한다. */
function resolveFontPath(file: string): string {
  const candidates = [
    path.join(process.cwd(), 'fonts', file),
    path.join(process.cwd(), 'app', 'fonts', file),
  ]
  const found = candidates.find((p) => fs.existsSync(p))
  if (!found) {
    throw new Error(
      `PDF 한글 폰트를 찾을 수 없습니다: ${file}. ` +
        `next.config.ts 의 outputFileTracingIncludes 설정과 fonts/ 디렉터리를 확인하세요.`,
    )
  }
  return found
}

let registered = false

/** 프로세스당 1회만 등록한다. fontkit 파싱이 무거워 매 요청 등록하면 느려진다. */
export function registerPdfFonts(): void {
  if (registered) return

  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: resolveFontPath(FONT_FILES.regular), fontWeight: 'normal' },
      { src: resolveFontPath(FONT_FILES.bold), fontWeight: 'bold' },
    ],
  })

  // 한글은 어절 중간에서도 줄바꿈이 가능하다. 기본 하이픈 분해기는 공백 기준이라
  // 공백 없는 긴 한글(주소·업체명)이 상자 밖으로 삐져나간다.
  Font.registerHyphenationCallback((word) =>
    /[ᄀ-ᇿ㄰-㆏가-힣]/.test(word) ? Array.from(word) : [word],
  )

  registered = true
}
