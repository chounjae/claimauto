import { render, screen, fireEvent } from '@testing-library/react'
import PdfClient from '@/app/pdf/PdfClient'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams({
    contractAmount: '400000',
    monthlyFee: '33333',
    startDate: '2024-01-01',
    stopDate: '2024-03-15',
    paymentType: '신용카드 일시불',
    usedDays: '74',
    usedFee: '82221',
    penalty: '40000',
    refund: '277779',
  }),
}))
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

const baseCalc = {
  contractAmount: 400000,
  monthlyFee: 33333,
  startDate: '2024-01-01',
  stopDate: '2024-03-15',
  paymentType: '신용카드 일시불',
  purchaseType: 'regular' as const,
  usedDays: 74,
  usedFee: 82221,
  penalty: 40000,
  refund: 277779,
}

describe('PdfClient', () => {
  it('추가 정보 입력 폼을 렌더링한다', () => {
    render(<PdfClient calc={baseCalc} />)
    expect(screen.getByText('청구서 정보 입력')).toBeInTheDocument()
    expect(screen.getByLabelText('신청인 이름')).toBeInTheDocument()
    expect(screen.getByLabelText('연락처')).toBeInTheDocument()
    expect(screen.getByLabelText('업체명')).toBeInTheDocument()
    expect(screen.getByLabelText('업체 주소')).toBeInTheDocument()
  })

  it('필수 필드 미입력 시 미리보기로 이동하지 않는다', () => {
    render(<PdfClient calc={baseCalc} />)
    fireEvent.click(screen.getByRole('button', { name: '미리보기' }))
    expect(screen.getByText('이름을 입력해주세요')).toBeInTheDocument()
  })

  it('필수 정보 입력 후 미리보기 화면으로 전환된다', () => {
    render(<PdfClient calc={baseCalc} />)
    fireEvent.change(screen.getByLabelText('신청인 이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('연락처'), { target: { value: '010-1234-5678' } })
    fireEvent.change(screen.getByLabelText('업체명'), { target: { value: '테스트헬스장' } })
    fireEvent.change(screen.getByLabelText('업체 주소'), { target: { value: '서울시 강남구' } })
    fireEvent.click(screen.getByRole('button', { name: '미리보기' }))
    expect(screen.getByText('청구서 미리보기')).toBeInTheDocument()
  })

  it('미리보기에서 청구금액을 표시한다', () => {
    render(<PdfClient calc={baseCalc} />)
    fireEvent.change(screen.getByLabelText('신청인 이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('연락처'), { target: { value: '010-1234-5678' } })
    fireEvent.change(screen.getByLabelText('업체명'), { target: { value: '테스트헬스장' } })
    fireEvent.change(screen.getByLabelText('업체 주소'), { target: { value: '서울시 강남구' } })
    fireEvent.click(screen.getByRole('button', { name: '미리보기' }))
    expect(screen.getAllByText(/277,779/).length).toBeGreaterThan(0)
  })

  it('미리보기에서 수정하기 버튼으로 폼으로 돌아온다', () => {
    render(<PdfClient calc={baseCalc} />)
    fireEvent.change(screen.getByLabelText('신청인 이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('연락처'), { target: { value: '010-1234-5678' } })
    fireEvent.change(screen.getByLabelText('업체명'), { target: { value: '테스트헬스장' } })
    fireEvent.change(screen.getByLabelText('업체 주소'), { target: { value: '서울시 강남구' } })
    fireEvent.click(screen.getByRole('button', { name: '미리보기' }))
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }))
    expect(screen.getByText('청구서 정보 입력')).toBeInTheDocument()
  })
})
