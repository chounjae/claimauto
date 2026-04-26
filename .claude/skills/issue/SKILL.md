---
name: issue
description: "ClaimAuto GitHub 이슈 생성. '이슈 만들어', '버그 리포트', '기능 요청 등록', '이슈 등록해줘', '이슈 추가', GitHub 이슈를 생성해야 할 때 이 스킬로 gh issue create를 실행한다."
---

# ClaimAuto Issue 생성

## 역할
GitHub 이슈를 생성한다.

## 실행 순서
1. 이슈 제목과 내용 초안 작성
2. 사용자 확인 (제목, 내용, 레이블 확인)
3. `gh issue create` 실행

## 이슈 생성 명령
```bash
gh issue create \
  --title "[이슈 제목]" \
  --body "[이슈 내용]"
```

## 발동 조건
- 버그 리포트 등록
- 기능 요청 이슈 생성
- 작업 추적용 이슈 등록
- PR 연결용 이슈 생성 필요
