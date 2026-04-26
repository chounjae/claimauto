# 구현 계획 — 정보입력 폼 (SCREEN 2)

## 요청 재진술
SCREEN 2: 사용자가 환급액 계산에 필요한 4가지 정보를 입력하는 폼 화면.
진행률 바(1/3) → 필드 입력 → "계산하기" 버튼 → /result 이동.

## 영향 화면/컴포넌트
- 화면: 정보입력 폼 (`/form` → `app/form/page.tsx`)
- 신규 컴포넌트:
  - `components/ProgressBar.tsx` — 상단 진행률 바
  - `components/NumberInput.tsx` — 숫자 입력 (원 단위 포맷)
  - `components/DateInput.tsx` — 날짜 피커
  - `components/PaymentChips.tsx` — 납부방식 칩 선택
  - `components/FormError.tsx` — 인라인 에러 메시지

## 상태 관리
- 폼 상태는 페이지 컴포넌트에서 useState로 관리 (서버 불필요, 'use client')
- 계산 결과를 /result로 전달: URL searchParams 사용
  - `?contractAmount=500000&monthlyFee=80000&startDate=2024-01-01&stopDate=2024-02-25&paymentType=card`

## 입력 검증 규칙
- 계약금: 필수, 양수 정수
- 월 이용료: 필수, 양수 정수
- 계약 시작일: 필수
- 중단/폐업 확인일: 필수, 계약 시작일 이후
- 납부방식: 필수 (기본값 '신용카드 일시불')

## 구현 단계

### Step 1. 라우트 생성
- `app/form/page.tsx` — 'use client' 폼 페이지
- 검증: 라우팅 동작 확인

### Step 2. ProgressBar 컴포넌트
- props: `current`, `total`
- 파란색 바, 상단 고정 없음 (스크롤과 함께)
- 검증: tsc 통과

### Step 3. NumberInput 컴포넌트
- 숫자만 입력, 쉼표 포맷 (1,000,000)
- 단위 "원" 우측 표시
- error prop으로 인라인 에러
- 검증: tsc 통과

### Step 4. DateInput 컴포넌트
- type="date" 네이티브 인풋
- error prop으로 인라인 에러
- 검증: tsc 통과

### Step 5. PaymentChips 컴포넌트
- 4개 옵션: 신용카드 일시불 / 체크카드 / 현금 / 할부
- 선택된 칩 파란색 강조
- 검증: tsc 통과

### Step 6. 폼 페이지 완성
- 전체 레이아웃 조합
- 검증 로직 + 에러 상태
- "계산하기" 클릭 → 검증 통과 시 /result로 searchParams 전달
- 검증: tsc 통과, 실제 동작 확인

### Step 7. 테스트
- `__tests__/form.test.tsx`
  - 필드 렌더링 확인
  - 빈 폼 제출 시 에러 표시
  - 날짜 순서 오류 에러 표시
  - 정상 제출 시 /result 이동

## 예상 변경 파일
- `app/form/page.tsx` (신규)
- `components/ProgressBar.tsx` (신규)
- `components/NumberInput.tsx` (신규)
- `components/DateInput.tsx` (신규)
- `components/PaymentChips.tsx` (신규)
- `__tests__/form.test.tsx` (신규)
