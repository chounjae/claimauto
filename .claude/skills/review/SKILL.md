---
name: review
description: "ClaimAuto 코드 리뷰 단독 실행. '리뷰해줘', '코드 확인해', '이 파일 점검해', '변경사항 검토', '품질 체크', '보안 검토', 구현 없이 리뷰만 필요할 때 reviewer 에이전트를 직접 호출한다."
---

# ClaimAuto Review

## 역할
reviewer 에이전트를 직접 호출해 코드 리뷰를 수행한다.

## 실행
1. reviewer 에이전트 호출
2. `git diff --name-only HEAD` 또는 지정된 파일 범위로 리뷰
3. _workspace/03_review.md 에 결과 저장

## 글로벌 에이전트 병렬 호출 (선택)
- `code-reviewer`: 범용 코드 품질
- `security-reviewer`: 보안 취약점

## 발동 조건
- 구현 없이 리뷰만 필요
- 특정 파일/범위 점검
- 보안 취약점 검토
- PR 생성 전 사전 리뷰
