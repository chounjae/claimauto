import PdfClient from './PdfClient'

export default async function PdfPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const p = await searchParams

  const contractAmount = Number(p.contractAmount)
  const monthlyFee = Number(p.monthlyFee)
  const startDate = String(p.startDate ?? '')
  const stopDate = String(p.stopDate ?? '')
  const paymentType = String(p.paymentType ?? '')
  const usedDays = Number(p.usedDays)
  const usedFee = Number(p.usedFee)
  const penalty = Number(p.penalty)
  const refund = Number(p.refund)
  const refundReason = String(p.refundReason ?? 'user_cancel') as 'closure' | 'business_fault' | 'user_cancel'

  if (!contractAmount || !startDate || !stopDate) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
        <p className="text-lg font-bold text-gray-800">계산 결과가 없습니다</p>
        <a href="/form" className="mt-4 text-sm text-[#2563EB] underline">
          처음으로 돌아가기
        </a>
      </main>
    )
  }

  return (
    <PdfClient
      calc={{ contractAmount, monthlyFee, startDate, stopDate, paymentType, usedDays, usedFee, penalty, refund, refundReason }}
    />
  )
}
