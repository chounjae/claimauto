import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FeedbackSheet from '@/components/FeedbackSheet'
import { track } from '@/lib/analytics'

jest.mock('@/lib/analytics', () => ({
  track: jest.fn(),
  getDistinctId: jest.fn(() => 'DISTINCT-STUB'),
}))

const mockTrack = track as jest.Mock

function open(extra: Partial<React.ComponentProps<typeof FeedbackSheet>> = {}) {
  const onClose = jest.fn()
  render(
    <FeedbackSheet
      open
      onClose={onClose}
      place="result_exit"
      title="왜 안 만드셨나요?"
      choices={['금액이 적어서', '복잡해 보여서']}
      {...extra}
    />,
  )
  return { onClose }
}

beforeEach(() => {
  mockTrack.mockClear()
  localStorage.clear()
  globalThis.fetch = jest.fn(async () => ({ ok: true })) as unknown as typeof fetch
})

describe('FeedbackSheet', () => {
  it('아무것도 고르지 않으면 보낼 수 없다', () => {
    open()
    expect(screen.getByRole('button', { name: '보내기' })).toBeDisabled()
  })

  it('칩만 골라도 보낼 수 있다 — 타이핑을 강제하지 않는다', () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: '금액이 적어서' }))
    expect(screen.getByRole('button', { name: '보내기' })).toBeEnabled()
  })

  it('자유 입력만으로도 보낼 수 있다', () => {
    open()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '버튼이 안 눌려요' } })
    expect(screen.getByRole('button', { name: '보내기' })).toBeEnabled()
  })

  it('전송 시 선택지·본문·지점·distinctId 를 함께 보낸다', async () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: '복잡해 보여서' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '단계가 많아요' } })
    fireEvent.click(screen.getByRole('button', { name: '보내기' }))

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled())
    const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('/api/feedback')
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body).toMatchObject({
      place: 'result_exit',
      choice: '복잡해 보여서',
      message: '단계가 많아요',
      distinctId: 'DISTINCT-STUB',
    })
  })

  it('이메일 입력창은 기본으로 숨어 있다 — 처음부터 보이면 마찰이 된다', () => {
    open()
    expect(screen.queryByPlaceholderText('hong@example.com')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /답변을 받고 싶어요/ }))
    expect(screen.getByPlaceholderText('hong@example.com')).toBeInTheDocument()
  })

  it('전송 후 감사 화면을 보여주고 재노출을 막는다', async () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: '금액이 적어서' }))
    fireEvent.click(screen.getByRole('button', { name: '보내기' }))

    await waitFor(() => expect(screen.getByText('보내주셔서 감사합니다')).toBeInTheDocument())
    expect(localStorage.getItem('cf_done_result_exit')).toBe('1')
  })

  it('전송이 실패해도 사용자에게 되묻지 않는다', async () => {
    globalThis.fetch = jest.fn(async () => { throw new Error('network') }) as unknown as typeof fetch
    open()
    fireEvent.click(screen.getByRole('button', { name: '금액이 적어서' }))
    fireEvent.click(screen.getByRole('button', { name: '보내기' }))
    // 애써 쓴 내용을 다시 쓰게 만드는 편이 더 나쁘다.
    await waitFor(() => expect(screen.getByText('보내주셔서 감사합니다')).toBeInTheDocument())
  })

  it('닫으면 feedback_dismissed 를 남긴다 — 무응답도 정보다', () => {
    const { onClose } = open()
    fireEvent.click(screen.getByRole('button', { name: '괜찮아요' }))
    expect(mockTrack).toHaveBeenCalledWith('feedback_dismissed', expect.objectContaining({ place: 'result_exit' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('열릴 때 feedback_opened 를 남긴다', () => {
    open()
    expect(mockTrack).toHaveBeenCalledWith('feedback_opened', expect.objectContaining({ place: 'result_exit' }))
  })
})

describe('PDF 입력 초안 보관', () => {
  // 업체 주소를 찾으려면 지도 앱을 열어야 한다. 앱 전환으로 탭이 폐기되면 입력이 날아갔다.
  const { saveDraft, loadDraft, clearDraft } = jest.requireActual('@/lib/draft')

  beforeEach(() => localStorage.clear())

  it('저장한 초안을 다시 읽을 수 있다', () => {
    saveDraft('pdf_form', { name: '홍길동', gymAddress: '서울시 강남구' })
    expect(loadDraft('pdf_form')).toEqual({ name: '홍길동', gymAddress: '서울시 강남구' })
  })

  it('24시간이 지난 초안은 버린다', () => {
    const stale = JSON.stringify({ at: Date.now() - 25 * 60 * 60 * 1000, data: { name: '홍길동' } })
    localStorage.setItem('cf_draft_pdf_form', stale)
    expect(loadDraft('pdf_form')).toBeNull()
    // 만료된 개인정보를 기기에 남겨두지 않는다
    expect(localStorage.getItem('cf_draft_pdf_form')).toBeNull()
  })

  it('제출 후 지우면 남지 않는다', () => {
    saveDraft('pdf_form', { name: '홍길동' })
    clearDraft('pdf_form')
    expect(loadDraft('pdf_form')).toBeNull()
  })

  it('깨진 값이 들어 있어도 예외를 던지지 않는다', () => {
    localStorage.setItem('cf_draft_pdf_form', '{not json')
    expect(loadDraft('pdf_form')).toBeNull()
  })
})
