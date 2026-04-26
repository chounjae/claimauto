---
name: implement
description: "ClaimAuto 빠른 단일 구현 + 검증. '바로 만들어', '플래닝 없이 구현', '간단한 수정', '스타일 수정', '타이포 수정', 소규모 변경이나 플래닝 단계 없이 바로 구현이 필요할 때 implementer 에이전트를 직접 호출한다."
---

# ClaimAuto Implement

## 역할
플래닝 단계 없이 implementer 에이전트를 직접 호출해 빠른 구현을 수행한다.

## 실행 순서
1. implementer 에이전트 호출
2. 구현 완료 후 자동 검증:
   - `npx tsc --noEmit`
   - `npm run build`
   - `npm test`
3. 모두 통과 시 완료 보고

## 실패 시
`~/.claude/skill-templates/build-fix.md` 방법론으로 오류 수정 후 재검증

## 발동 조건
- 플래닝 없이 바로 구현 필요
- 소규모 수정 (스타일, 타이포, 설정 변경 등)
- orchestrate 파이프라인이 오버헤드인 경우
