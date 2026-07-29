import { render, screen, fireEvent, act } from '@testing-library/react'
import PdfClient from '@/app/pdf/PdfClient'
import { track } from '@/lib/analytics'

jest.mock('@/lib/analytics', () => ({
  track: jest.fn(),
  getClientEnv: () => ({ ua: 'UA-STUB', is_inapp: true, is_ios: true }),
}))

const mockTrack = track as jest.Mock
const STUB_ENV = { ua: 'UA-STUB', is_inapp: true, is_ios: true }

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
  refundReason: 'user_cancel' as const,
}

function gotoPreview() {
  render(<PdfClient calc={baseCalc} />)
  fireEvent.change(screen.getByLabelText('신청인 이름'), { target: { value: '홍길동' } })
  fireEvent.change(screen.getByLabelText('연락처'), { target: { value: '010-1234-5678' } })
  fireEvent.change(screen.getByLabelText('업체명'), { target: { value: '테스트헬스장' } })
  fireEvent.change(screen.getByLabelText('업체 주소'), { target: { value: '서울시 강남구' } })
  fireEvent.click(screen.getByRole('button', { name: '미리보기' }))
}

describe('PdfClient 계측', () => {
  beforeEach(() => {
    mockTrack.mockClear()
  })

  it('마운트 즉시 pdf_page_arrived 를 발화한다 (폼 입력 이전)', () => {
    render(<PdfClient calc={baseCalc} />)
    expect(mockTrack).toHaveBeenCalledWith('pdf_page_arrived', { refund_reason: 'user_cancel' })
    expect(mockTrack).not.toHaveBeenCalledWith('pdf_page_viewed', expect.anything())
  })

  it('pdf_page_viewed 는 입력폼 완료 후에만 발화한다 (기존 동작 유지)', () => {
    gotoPreview()
    expect(mockTrack).toHaveBeenCalledWith('pdf_page_viewed', { refund_reason: 'user_cancel' })
  })

  it('beforeprint 가 500ms 내에 발화하지 않으면 pdf_print_no_sheet 를 발화한다', () => {
    jest.useFakeTimers()
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {})

    gotoPreview()
    mockTrack.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'PDF 저장 / 인쇄' }))

    expect(printSpy).toHaveBeenCalled()
    expect(mockTrack).not.toHaveBeenCalledWith('pdf_print_no_sheet', expect.anything())

    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(mockTrack).toHaveBeenCalledWith('pdf_print_no_sheet', STUB_ENV)

    // 리스너가 정리되어 뒤늦은 beforeprint 로는 추가 발화가 없어야 한다
    mockTrack.mockClear()
    act(() => {
      window.dispatchEvent(new Event('beforeprint'))
    })
    expect(mockTrack).not.toHaveBeenCalled()

    printSpy.mockRestore()
    jest.useRealTimers()
  })

  it('beforeprint 가 발화하면 pdf_print_sheet_shown 만 발화한다', () => {
    jest.useFakeTimers()
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {
      window.dispatchEvent(new Event('beforeprint'))
    })

    gotoPreview()
    mockTrack.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'PDF 저장 / 인쇄' }))

    expect(mockTrack).toHaveBeenCalledWith('pdf_print_sheet_shown', STUB_ENV)

    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(mockTrack).not.toHaveBeenCalledWith('pdf_print_no_sheet', expect.anything())

    printSpy.mockRestore()
    jest.useRealTimers()
  })
})
