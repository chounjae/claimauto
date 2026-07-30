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
    expect(screen.getByText(/1분이면 얼마 받을 수 있는지/)).toBeInTheDocument()
    expect(screen.getByText(/폐업 · 중도해지/)).toBeInTheDocument()
  })

  it('신뢰 지표 3개를 렌더링한다', () => {
    render(<OnboardingPage />)
    expect(screen.getByText(/폐업·중도해지/)).toBeInTheDocument()
    expect(screen.getByText(/PDF 즉시/)).toBeInTheDocument()
    expect(screen.getAllByText(/소비자원\s*바로 연결/).length).toBeGreaterThanOrEqual(1)
  })

  it('CTA 버튼이 /form 으로 연결된다', () => {
    render(<OnboardingPage />)
    const cta = screen.getByRole('link', { name: '무료 환급액 계산하기' })
    expect(cta).toBeInTheDocument()
    expect(cta).toHaveAttribute('href', '/form')
  })
})
