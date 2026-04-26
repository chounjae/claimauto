---
name: pr
description: "ClaimAuto GitHub PR 생성. 'PR 만들어', '풀 리퀘스트 올려', 'PR 생성', '코드 리뷰 요청', 'merge 요청', reviewer 승인 후 PR을 생성해야 할 때 이 스킬로 CI 검증 후 gh pr create를 실행한다."
---

# ClaimAuto PR 생성

## 역할
CI 통과 여부를 확인한 후 GitHub PR을 생성한다.

## 브랜치 전략
- feature/* → develop: 기능 구현 PR
- develop → main: 배포 PR (통합 테스트 필수)
- main 직접 푸시 절대 금지

## 실행 순서

### 1. 선행 조건 확인
```bash
cat .claude/_workspace/03_review.md | grep "최종 판정"
```
→ CHANGES_REQUIRED 이면 중단, implementer 재호출 요청

### 2. CI Gate 확인 (항상 필수)
```bash
npm run build 2>&1 | tail -20
```
→ 빌드 실패 시 중단

### 3. develop → main PR인 경우 통합 테스트 추가 실행
```bash
npm test -- --coverage
```
→ 커버리지 80% 미만 시 경고

### 4. 변경 이력 확인
```bash
git log develop...HEAD --oneline
git diff develop...HEAD --stat
```

### 5. PR 생성
```bash
gh pr create \
  --base develop \
  --title "[커밋 타입]: [변경 요약]" \
  --body "$(cat <<'EOF'
## 변경 내용
[변경 사항 요약]

## 관련 화면
- [ ] 온보딩
- [ ] 정보입력 폼
- [ ] 환급액 결과
- [ ] PDF 생성
- [ ] 소비자원 가이드

## 테스트 확인
- [ ] npx tsc --noEmit 통과
- [ ] npm run build 통과
- [ ] npm test 통과
- [ ] 실제 기능 동작 확인 (npm run dev)
- [ ] 모바일 375px 레이아웃 확인

## 관련 이슈
closes #[이슈 번호]
EOF
)"
```

## 발동 조건
- 구현 완료 후 PR 생성 필요
- reviewer APPROVED 판정 후
- CI 통과 확인이 필요한 시점
