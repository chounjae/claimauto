import ResultClient from './ResultClient'

type RefundReason = 'closure' | 'business_fault' | 'injury' | 'pregnancy' | 'relocation' | 'user_cancel'

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

function calcPenalty(contractAmount: number, reason: RefundReason): number {
  if (reason === 'closure' || reason === 'business_fault') return 0
  return Math.round(contractAmount * 0.1)
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const contractAmount = Number(params.contractAmount)
  const monthlyFee = Number(params.monthlyFee)
  const startDate = String(params.startDate ?? '')
  const stopDate = String(params.stopDate ?? '')
  const paymentType = String(params.paymentType ?? '')
  const refundReason = (params.refundReason ?? 'user_cancel') as RefundReason

  if (!contractAmount || !monthlyFee || !startDate || !stopDate) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-5 text-center">
        <p className="text-lg font-bold text-gray-800">입력 정보가 없습니다</p>
        <a href="/form" className="mt-4 text-sm text-[#2563EB] underline">
          정보 입력으로 돌아가기
        </a>
      </main>
    )
  }

  const usedDays = daysBetween(startDate, stopDate)
  const usedFee = Math.round((monthlyFee / 30) * usedDays)
  const penalty = calcPenalty(contractAmount, refundReason)
  const refund = Math.max(0, contractAmount - usedFee - penalty)

  return (
    <ResultClient
      result={{
        contractAmount, monthlyFee, startDate, stopDate,
        usedDays, usedFee, penalty, refund, paymentType, refundReason,
      }}
    />
  )
}
