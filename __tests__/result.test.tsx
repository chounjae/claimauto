import { render, screen, fireEvent } from '@testing-library/react'
import ResultClient from '@/app/result/ResultClient'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// startDate: 2024-01-01, stopDate: 2024-03-15
// usedDays = 74, usedFee = round(33333/30 * 74) = 82221
// penalty = round(400000 * 0.1) = 40000
// refund = 400000 - 82221 - 40000 = 277779
const baseResult = {
  contractAmount: 400000,
  monthlyFee: 33333,
  startDate: '2024-01-01',
  stopDate: '2024-03-15',
  usedDays: 74,
  usedFee: 82221,
  penalty: 40000,
  refund: 277779,
  paymentType: '신용카드 일시불',
  purchaseType: 'regular' as const,
}

describe('ResultClient', () => {
  it('예상 환급액 섹션을 렌더링한다', () => {
    render(<ResultClient result={baseResult} />)
    expect(screen.getByText('예상 환급액')).toBeInTheDocument()
  })

  it('계산 내역 섹션을 렌더링한다', () => {
    render(<ResultClient result={baseResult} />)
    expect(screen.getByText('계산 내역')).toBeInTheDocument()
    expect(screen.getByText('계약금')).toBeInTheDocument()
    expect(screen.getByText('기이용료')).toBeInTheDocument()
    expect(screen.getByText('위약금')).toBeInTheDocument()
  })

  it('다음 단계 카드 3개를 렌더링한다', () => {
    render(<ResultClient result={baseResult} />)
    expect(screen.getByText('직접 협상')).toBeInTheDocument()
    expect(screen.getByText('소비자원 신고')).toBeInTheDocument()
    expect(screen.getByText('소액소송')).toBeInTheDocument()
  })

  it('환급액을 올바르게 표시한다', () => {
    render(<ResultClient result={baseResult} />)
    expect(screen.getByText(/277,779/)).toBeInTheDocument()
  })

  it('소비자원 바로가기 버튼은 준비 중 상태로 비활성화되어 있다', () => {
    render(<ResultClient result={baseResult} />)
    const btn = screen.getByRole('button', { name: '소비자원 바로가기' })
    expect(btn).toBeDisabled()
  })

  it('현금 결제 시 카드사 안내를 표시하지 않는다', () => {
    render(<ResultClient result={{ ...baseResult, paymentType: '현금' }} />)
    expect(screen.queryByText(/카드사 취소 요청/)).not.toBeInTheDocument()
  })
})
