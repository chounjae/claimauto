import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import PdfClient from '@/app/pdf/PdfClient'
import { track, getClientEnv } from '@/lib/analytics'

jest.mock('@/lib/analytics', () => ({
  track: jest.fn(),
  getClientEnv: jest.fn(() => ({ ua: 'UA-STUB', is_inapp: true, is_ios: true })),
  getDistinctId: jest.fn(() => 'DISTINCT-STUB'),
}))

const mockTrack = track as jest.Mock
const mockEnv = getClientEnv as jest.Mock
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
    mockEnv.mockReturnValue(INAPP_ENV)
  })

  it('저장 시 pdf_save_clicked 를 발화하고 폼을 POST 로 제출한다', () => {
    // jsdom 은 form.submit() 을 구현하지 않는다. 호출 여부만 가로챈다.
    const submit = jest
      .spyOn(HTMLFormElement.prototype, 'submit')
      .mockImplementation(() => {})

    gotoPreview()
    mockTrack.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'PDF 저장' }))

    expect(mockTrack).toHaveBeenCalledWith(
      'pdf_save_clicked',
      expect.objectContaining({ refund_reason: 'user_cancel', is_inapp: true }),
    )
    expect(submit).toHaveBeenCalledTimes(1)
    submit.mockRestore()
  })

  it('개인정보를 URL 이 아니라 POST 폼 본문으로 보낸다', () => {
    // GET 쿼리로 보내면 이름·연락처·주소가 Vercel 접속 로그와 브라우저 히스토리에 남는다.
    gotoPreview()

    const form = document.querySelector('form[action="/api/pdf"]') as HTMLFormElement
    expect(form).toBeTruthy()
    expect(form.method.toLowerCase()).toBe('post')

    const values = new Map(
      Array.from(form.querySelectorAll('input[type="hidden"]')).map((el) => {
        const input = el as HTMLInputElement
        return [input.name, input.value]
      }),
    )
    expect(values.get('name')).toBe('홍길동')
    expect(values.get('refundReason')).toBe('user_cancel')
    // 서버가 pdf_generated 를 같은 사용자로 묶으려면 distinct_id 가 필요하다.
    expect(values.get('distinctId')).toBe('DISTINCT-STUB')
  })

  it('생성 성공(pdf_generated)은 클라이언트가 발화하지 않는다', () => {
    // 서버만 PDF 가 실제로 만들어졌는지 안다.
    // 클라이언트에서 재려면 fetch 로 한 번 받고 이동하며 또 만들어 PDF 가 두 번 생성된다.
    const submit = jest
      .spyOn(HTMLFormElement.prototype, 'submit')
      .mockImplementation(() => {})

    gotoPreview()
    mockTrack.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'PDF 저장' }))

    const events = mockTrack.mock.calls.map((c) => c[0])
    expect(events).not.toContain('pdf_generated')
    submit.mockRestore()
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
