import { render, screen, fireEvent } from '@testing-library/react'
import FormPage from '@/app/form/page'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

function fillDate(selects: HTMLElement[], offset: number, year: string, month: string, day: string) {
  fireEvent.change(selects[offset], { target: { value: year } })
  fireEvent.change(selects[offset + 1], { target: { value: month } })
  fireEvent.change(selects[offset + 2], { target: { value: day } })
}

describe('FormPage', () => {
  beforeEach(() => mockPush.mockClear())

  it('모든 필드와 버튼을 렌더링한다', () => {
    render(<FormPage />)
    expect(screen.getByText('기본 정보 입력')).toBeInTheDocument()
    expect(screen.getByText('총 결제금액')).toBeInTheDocument()
    expect(screen.getByText('계약 기간')).toBeInTheDocument()
    expect(screen.getByText('계약 시작일')).toBeInTheDocument()
    expect(screen.getByText('환불 요청일 / 폐업 확인일')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '계산하기' })).toBeInTheDocument()
  })

  it('빈 폼 제출 시 에러를 표시한다', () => {
    render(<FormPage />)
    fireEvent.click(screen.getByRole('button', { name: '계산하기' }))
    expect(screen.getByText('총 결제금액을 입력해주세요')).toBeInTheDocument()
    expect(screen.getByText('계약 기간을 선택해주세요')).toBeInTheDocument()
    expect(screen.getByText('계약 시작일을 선택해주세요')).toBeInTheDocument()
    // 환불 요청일은 오늘 날짜로 미리 채워지므로 비어 있을 수 없다.
    // 비어 있는 필수 필드는 환불 사유다.
    expect(screen.getByText('환불 사유를 선택해주세요')).toBeInTheDocument()
  })

  it('계약 기간 칩 선택 시 월 환산금액이 자동 계산된다', () => {
    render(<FormPage />)
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '400000' } })
    fireEvent.click(screen.getByRole('button', { name: '12개월' }))
    expect(screen.getByText(/33,333원\/월/)).toBeInTheDocument()
  })

  it('환불일이 시작일보다 이전이면 에러를 표시한다', () => {
    render(<FormPage />)
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '400000' } })
    fireEvent.click(screen.getByRole('button', { name: '12개월' }))
    const selects = screen.getAllByRole('combobox')
    fillDate(selects, 0, '2024', '3', '1')
    fillDate(selects, 3, '2024', '2', '1')
    fireEvent.click(screen.getByRole('button', { name: '계산하기' }))
    expect(screen.getByText('환불 요청일은 계약 시작일 이후여야 합니다')).toBeInTheDocument()
  })

  it('정상 입력 시 /result 로 이동한다', () => {
    render(<FormPage />)
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '400000' } })
    fireEvent.click(screen.getByRole('button', { name: '12개월' }))
    const selects = screen.getAllByRole('combobox')
    fillDate(selects, 0, '2024', '1', '1')
    fillDate(selects, 3, '2024', '3', '15')
    // 환불 사유는 2단계다 — 먼저 그룹, 그다음 세부 사유
    fireEvent.click(screen.getByText('헬스장 쪽 문제예요'))
    fireEvent.click(screen.getByRole('button', { name: /헬스장 폐업/ }))
    fireEvent.click(screen.getByRole('button', { name: '계산하기' }))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/result'))
  })
})
