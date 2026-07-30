/**
 * 첫 화면 신뢰 지표
 *
 * 변경 이력
 * - v1: ✅ 이모지 + 자기 주장 3개. 신뢰 근거가 되지 못했다
 * - v2: 소비자원 통계로 교체. 다만 3열 균등 카드 레이아웃을 유지했다
 * - v3(현재): 3열 균등 카드는 가장 흔한 AI 레이아웃이라 가로 스탯 바로 바꿨다.
 *   숫자를 왼쪽에 세로로 쌓아 눈이 한 줄로 훑히게 한다.
 *
 * 출처 (프로젝트 규칙 6.3 — 출처 없는 숫자 금지)
 * - 26만원: 평균 미환불 금액 262,388원. 헤럴드경제 2026-01-22
 * - 연 5,000건: 전국 체육시설 피해구제 2023년 4,874 / 2024년 5,148 / 2025년 4,987.
 *   매일신문 2026-01-21
 *
 * 검증이 엇갈린 수치는 넣지 않았다 (체인 부당약관 비율이 20/20 과 14/20 으로 갈렸다).
 */

const stats = [
  { value: '26만원', label: '평균 미환불 금액', source: '소비자원' },
  { value: '연 5,000건', label: '접수되는 헬스장 분쟁', source: '소비자원' },
  { value: '무료', label: '회원가입·결제 없음', source: null },
]

export default function TrustBadges() {
  return (
    <dl className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_16px_-6px_rgba(37,99,235,0.12)]">
      {stats.map(({ value, label, source }) => (
        <div key={value} className="flex items-baseline gap-3 px-4 py-3">
          <dd className="tnum w-[86px] shrink-0 text-[15px] font-bold tracking-tight text-[#2563EB] md:w-[110px] md:text-lg">
            {value}
          </dd>
          <dt className="flex-1 text-xs text-gray-600 md:text-sm">{label}</dt>
          {source && (
            <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              {source}
            </span>
          )}
        </div>
      ))}
    </dl>
  )
}
