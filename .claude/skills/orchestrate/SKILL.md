---
name: orchestrate
description: "ClaimAuto 전체 구현 파이프라인 실행. '새 기능 만들어줘', '이 버그 고쳐줘', '리팩토링 해줘', '기능 추가', '화면 구현', '컴포넌트 만들어', 구현 요청이 오면 이 스킬로 orchestrator 에이전트를 통해 planner→implementer→CI→reviewer 파이프라인을 시작한다."
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

## 발동 조건
- 새 기능, 피처 구현 요청
- 버그 수정 요청
- 리팩토링 요청
- 화면/컴포넌트 구현 요청
- 코드 변경을 수반하는 모든 구현 작업
