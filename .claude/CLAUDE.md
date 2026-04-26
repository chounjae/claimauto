# ClaimAuto — Claude 하네스 가이드

> 전역 `~/.claude/CLAUDE.md` 를 상속하며, 이 파일로 프로젝트별 규칙 override

## 언어
**항상 한국어로 응답하라.** auto-compact 후에도 동일하게 적용된다.

## 서비스 컨텍스트
헬스장 환불 청구 자동화 모바일 웹앱.
사용자가 4가지 정보 입력 → 공정위 고시 기반 환급액 계산 → PDF 청구서 생성 → 소비자원/소액소송 안내.

## 하네스 컨텍스트

| 항목 | 값 |
|------|----|
| 스택 | Next.js + TypeScript + Tailwind CSS |
| 빌드 | `npm run build` |
| 테스트 | `npm test` |
| 타입체크 | `npx tsc --noEmit` |
| 기본 브랜치 | main (prod) / develop (stg+dev) / feature/* (구현) |
| 하네스 구성일 | 2026-04-21 |
| 파이프라인 | orchestrator → planner → implementer → CI Gate → reviewer |

## 5개 화면 구조
| 화면 | 경로 | 핵심 기능 |
|------|------|----------|
| 온보딩 | `/` | 히어로, 신뢰 지표, CTA |
| 정보입력 폼 | `/form` | 4개 필드 입력, 납부방식 선택 |
| 환급액 결과 | `/result` | 계산 결과, 카운트업 애니메이션, 다음 단계 카드 |
| PDF 생성 | `/pdf` | 추가 정보 입력, 미리보기, 다운로드 |
| 소비자원 가이드 | `/guide` | 스텝 카드, FAQ 아코디언 |

## 에이전트 구조

| 에이전트 | 파일 | 역할 | tools |
|----------|------|------|-------|
| orchestrator | .claude/agents/orchestrator.md | 파이프라인 지휘 | Agent, Bash, Read, Glob, TaskCreate |
| planner | .claude/agents/planner.md | 계획 수립 (읽기 전용) | Read, Grep, Glob, Bash |
| implementer | .claude/agents/implementer.md | 코드 구현 | Read, Write, Edit, Bash, Grep, Glob |
| reviewer | .claude/agents/reviewer.md | 코드 리뷰 (읽기 전용) | Read, Grep, Glob, Bash |

## 스킬 발동 방법

> 슬래시 명령 불필요 — 자연어로 말하면 자동 발동

| 스킬 | 발동 예시 |
|------|-----------|
| orchestrate | "온보딩 화면 만들어줘", "환급액 계산 로직 구현해줘" |
| implement | "바로 수정해줘", "간단한 스타일 수정" |
| review | "코드 리뷰해줘", "이 파일 검토해줘" |
| issue | "이슈 등록해줘", "버그 리포트 만들어" |
| pr | "PR 만들어줘", "풀 리퀘스트 올려" |

## 반드시 지킬 규칙
- main 브랜치 직접 푸시 절대 금지 (pre-guard.sh 차단)
- 모든 변경 전 관련 테스트 먼저 작성 (TDD)
- `npm run build` 실패 시 커밋 금지
- 기능 구현 시 `npm run dev` 로 실제 동작 확인 필수
- develop → main PR 시 `npm test -- --coverage` (통합 테스트) 필수
- reviewer CRITICAL/HIGH 없을 때만 PR 생성
- `~/.claude/` 는 읽기 전용 — 절대 수정하지 않음

## 디자인 시스템 (빠른 참조)
- Primary: `#2563EB` → `blue-600`
- Accent: `#10B981` → `emerald-500`
- 버튼: `rounded-xl h-[52px]` | 카드: `rounded-2xl shadow-sm border border-gray-200`
- 모바일 기준: 375px | 하단 고정 CTA: `fixed bottom-0 left-0 right-0 p-4`

## 환급액 계산 공식 (공정거래위원회 고시 제56조)
```
환급액 = 계약금 - 기이용료 - 위약금
기이용료 = (월이용료 ÷ 30) × 이용일수
위약금 = 계약금 × 10% 이내
```

## 금지 사항
- .env* 파일 커밋 금지
- main 직접 푸시 금지
- force push 금지
- `any` 타입 사용 금지
- `'use client'` 불필요한 남용 금지
- 글로벌 ~/.claude/ 수정 금지

## _workspace/ 활용
- `_workspace/01_plan.md` — planner 산출물 (사용자 확인용)
- `_workspace/02_implement.md` — implementer 진행 로그
- `_workspace/03_review.md` — reviewer 최종 판정
