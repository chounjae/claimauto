---
name: orchestrate
description: "ClaimAuto 신규 화면·기능 구현 파이프라인. '온보딩 화면 만들어줘', '환급 계산 기능 추가해줘', '새 페이지 구현해줘'처럼 여러 파일에 걸친 신규 기능을 처음부터 설계·구현할 때만 사용한다. 기존 코드 버그 수정·스타일 수정·텍스트 변경·단순 개선은 implement 스킬을 쓴다."
---

# ClaimAuto Orchestrate

## 역할
orchestrator 에이전트를 호출해 전체 파이프라인을 시작한다.

## 파이프라인 흐름
1. orchestrator 에이전트 호출
2. planner → _workspace/01_plan.md (사용자 확인 대기)
3. 확인 후 implementer → 구현
4. **실제 기능 테스트**: `npm run dev` 로 로컬 실행, 해당 화면/기능 동작 확인
5. CI Gate: `npm run build && npm test`
6. reviewer → _workspace/03_review.md
7. 승인 시 pr 스킬 발동 (feature/* → develop PR)

## 발동 조건 (신규 기능만)
- 새 페이지/화면 구현 (없던 route 추가)
- 여러 파일에 걸친 신규 기능 설계부터 구현
- 플래닝이 필요한 복잡한 아키텍처 변경

## 발동 금지 (→ implement 사용)
- 버그 수정, 텍스트/스타일 변경
- 기존 컴포넌트 단순 수정
- 단일 파일 변경
