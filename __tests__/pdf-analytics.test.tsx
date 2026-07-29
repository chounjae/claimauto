import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import PdfClient from '@/app/pdf/PdfClient'
import { track, getClientEnv } from '@/lib/analytics'
import { navigateTo } from '@/lib/navigate'

jest.mock('@/lib/analytics', () => ({
  track: jest.fn(),
  getClientEnv: jest.fn(() => ({ ua: 'UA-STUB', is_inapp: true, is_ios: true })),
}))
// jsdom 은 window.location 을 재정의할 수 없어 이동만 별도 모듈로 분리해 두고 여기서 가로챈다.
jest.mock('@/lib/navigate', () => ({ navigateTo: jest.fn() }))

const mockTrack = track as jest.Mock
const mockEnv = getClientEnv as jest.Mock
const mockNavigate = navigateTo as jest.Mock
const INAPP_ENV = { ua: 'UA-STUB', is_inapp: true, is_ios: true }
const DESKTOP_ENV = { ua: 'UA-DESKTOP', is_inapp: false, is_ios: false }

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
    mockEnv.mockReturnValue(INAPP_ENV)
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
})

describe('PDF 저장 — 서버 생성 방식', () => {
  beforeEach(() => {
    mockTrack.mockClear()
    mockNavigate.mockClear()
    mockEnv.mockReturnValue(INAPP_ENV)
  })

  afterEach(() => {
    delete (globalThis as { fetch?: unknown }).fetch
  })

  it('저장 성공 시 pdf_save_clicked → pdf_generated 를 발화하고 서버 PDF 로 이동한다', async () => {
    // jsdom 환경에는 fetch/Response 전역이 없다. 필요한 부분만 흉내 낸다.
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      blob: async () => ({ size: 41669 }),
    })) as unknown as typeof fetch

    gotoPreview()
    mockTrack.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'PDF 저장' }))

    expect(mockTrack).toHaveBeenCalledWith('pdf_save_clicked', { refund_reason: 'user_cancel' })

    await waitFor(() => {
      expect(mockTrack).toHaveBeenCalledWith(
        'pdf_generated',
        expect.objectContaining({ refund_reason: 'user_cancel', is_inapp: true }),
      )
    })

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1))
    const target = mockNavigate.mock.calls[0][0] as string
    expect(target).toContain('/api/pdf?')
    // 입력한 정보가 쿼리에 실려야 서버가 문서를 만들 수 있다
    expect(decodeURIComponent(target)).toContain('name=홍길동')
  })

  it('서버가 실패해도 pdf_generate_failed 를 남기고 이동은 시도한다', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status: 400,
      blob: async () => ({ size: 0 }),
    })) as unknown as typeof fetch

    gotoPreview()
    mockTrack.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'PDF 저장' }))

    await waitFor(() => {
      expect(mockTrack).toHaveBeenCalledWith(
        'pdf_generate_failed',
        expect.objectContaining({ status: 400 }),
      )
    })
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1))
  })

  it('인앱 웹뷰에서는 인쇄 버튼을 노출하지 않는다 (눌러도 무동작이라 죽은 버튼)', () => {
    gotoPreview()
    expect(screen.queryByRole('button', { name: '인쇄' })).not.toBeInTheDocument()
  })
})

describe('인쇄 버튼 — 순정 브라우저 전용', () => {
  beforeEach(() => {
    mockTrack.mockClear()
    mockEnv.mockReturnValue(DESKTOP_ENV)
  })

  it('beforeprint 가 500ms 내에 발화하지 않으면 pdf_print_no_sheet 를 발화한다', () => {
    jest.useFakeTimers()
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {})

    gotoPreview()
    mockTrack.mockClear()
    fireEvent.click(screen.getByRole('button', { name: '인쇄' }))

    expect(printSpy).toHaveBeenCalled()
    expect(mockTrack).not.toHaveBeenCalledWith('pdf_print_no_sheet', expect.anything())

    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(mockTrack).toHaveBeenCalledWith('pdf_print_no_sheet', DESKTOP_ENV)

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
    fireEvent.click(screen.getByRole('button', { name: '인쇄' }))

    expect(mockTrack).toHaveBeenCalledWith('pdf_print_sheet_shown', DESKTOP_ENV)

    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(mockTrack).not.toHaveBeenCalledWith('pdf_print_no_sheet', expect.anything())

    printSpy.mockRestore()
    jest.useRealTimers()
  })
})
