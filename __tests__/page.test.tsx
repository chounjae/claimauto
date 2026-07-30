import { render, screen } from '@testing-library/react'
import OnboardingPage from '@/app/page'

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('OnboardingPage', () => {
  it('히어로 텍스트를 렌더링한다', () => {
    render(<OnboardingPage />)
    expect(screen.getByText(/헬스장 환불/)).toBeInTheDocument()
    expect(screen.getByText(/계약서에 「환불 불가」라고 써 있어도/)).toBeInTheDocument()
    expect(screen.getByText(/내 환급액을 1분 만에/)).toBeInTheDocument()
  })

  it('신뢰 지표 3개를 렌더링한다', () => {
    render(<OnboardingPage />)
    expect(screen.getByText('평균 미환불 금액')).toBeInTheDocument()
    expect(screen.getByText('26만원')).toBeInTheDocument()
    expect(screen.getByText('연 5,000건')).toBeInTheDocument()
  })

  it('CTA 버튼이 /form 으로 연결된다', () => {
    render(<OnboardingPage />)
    const cta = screen.getByRole('link', { name: '무료 환급액 계산하기' })
    expect(cta).toBeInTheDocument()
    expect(cta).toHaveAttribute('href', '/form')
  })
})
