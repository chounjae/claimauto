# 구현 로그 — 온보딩 화면

## 완료 항목
- [x] Next.js 16.2.4 + React 19 + TypeScript + Tailwind v4 프로젝트 초기화
- [x] Jest + @testing-library/react + @types/jest + ts-node 설치
- [x] globals.css — Pretendard CDN + @theme 디자인 토큰
- [x] app/layout.tsx — 메타데이터, 모바일 max-w-[375px] 컨테이너, viewport
- [x] components/Logo.tsx
- [x] components/TrustBadges.tsx
- [x] components/CTAButton.tsx
- [x] app/page.tsx — 온보딩 화면 (히어로 + 신뢰지표 + 하단 고정 CTA)
- [x] __tests__/page.test.tsx — 3개 테스트 통과

## CI Gate
- npx tsc --noEmit: PASS
- npm run build: PASS
- npm test: 3/3 PASS

## 변경 파일
- app/globals.css
- app/layout.tsx
- app/page.tsx
- components/Logo.tsx
- components/TrustBadges.tsx
- components/CTAButton.tsx
- __tests__/page.test.tsx
- jest.config.ts
- jest.setup.ts
- tsconfig.json (types 추가)
- package.json (test 스크립트, devDeps 추가)
