const badges = [
  { label: '폐업·중도해지\n변심 모두 가능' },
  { label: 'PDF 즉시\n발급' },
  { label: '소비자원\n바로 연결' },
]

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map(({ label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-4 shadow-sm"
        >
          <span className="text-xl">✅</span>
          <span className="text-center text-xs font-medium leading-tight text-gray-700 whitespace-pre-line">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
