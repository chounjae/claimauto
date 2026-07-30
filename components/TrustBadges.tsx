/**
 * 첫 화면 신뢰 지표
 *
 * 이전 버전은 ✅ 이모지 + "폐업·중도해지 변심 모두 가능 / PDF 즉시 발급 / 소비자원 바로 연결"
 * 이었다. 셋 다 **우리가 우리에 대해 하는 주장**이라 신뢰 근거가 되지 못한다.
 *
 * 제3자 통계로 바꿨다. 출처 없는 숫자는 쓰지 않는다 (프로젝트 규칙 6.3).
 * - 26만원: 평균 미환불 금액 262,388원. 헤럴드경제 2026-01-22
 * - 연 5,000건: 전국 체육시설 피해구제 2023년 4,874 / 2024년 5,148 / 2025년 4,987.
 *   매일신문 2026-01-21
 *
 * 검증이 엇갈리는 수치는 넣지 않았다 (체인 부당약관 비율은 20/20 과 14/20 로 보고가 갈렸다).
 */

const badges = [
  { stat: '26만원', label: '평균 미환불 금액', source: '소비자원' },
  { stat: '연 5,000건', label: '접수되는 헬스장 분쟁', source: '소비자원' },
  { stat: '무료', label: '회원가입·결제 없음', source: null },
]

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {badges.map(({ stat, label, source }) => (
        <div
          key={stat}
          className="flex flex-col items-center gap-1 rounded-2xl border border-gray-200 bg-white px-2 py-3 shadow-sm"
        >
          <span className="text-base font-extrabold tracking-tight text-[#2563EB]">{stat}</span>
          <span className="text-center text-[11px] font-medium leading-tight text-gray-700">
            {label}
          </span>
          {source && <span className="text-[10px] text-gray-400">{source}</span>}
        </div>
      ))}
    </div>
  )
}
