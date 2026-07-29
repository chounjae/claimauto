import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * PDF 한글 폰트를 서버 트레이스에 강제로 포함시킨다.
   *
   * `lib/pdf/fonts.ts` 는 `fs` 로 폰트 파일을 읽는데, 이런 동적 파일 접근은
   * Next 의 파일 트레이싱이 잡아내지 못한다. 이 설정이 없으면 배포본에서
   * 폰트가 빠져 `/api/pdf` 가 런타임에 실패한다 (로컬 빌드에서는 드러나지 않는다).
   *
   * 키는 라우트 경로 글로브, 값은 프로젝트 루트 기준 글로브다.
   * 참고: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/output.md
   */
  outputFileTracingIncludes: {
    '/api/pdf': ['./fonts/**/*.ttf'],
  },
};

export default nextConfig;
