import { render, screen, fireEvent } from '@testing-library/react'
import RefundReasonChips from '@/components/RefundReasonChips'

describe('환불 사유 선택 — 2단계', () => {
  it('처음에는 그룹 3개만 보인다 (11개를 한 번에 펼치지 않는다)', () => {
    render(<RefundReasonChips value={null} onChange={jest.fn()} onMissingReason={jest.fn()} />)
    expect(screen.getByText('헬스장 쪽 문제예요')).toBeInTheDocument()
    expect(screen.getByText('제 사정이에요')).toBeInTheDocument()
    expect(screen.getByText('잘 모르겠어요')).toBeInTheDocument()
    // 세부 사유는 아직 안 보여야 한다
    expect(screen.queryByText('헬스장 폐업')).not.toBeInTheDocument()
    expect(screen.queryByText('부상 / 질병')).not.toBeInTheDocument()
  })

  it('헬스장 쪽을 고르면 사업자 귀책 사유만 펼친다', () => {
    render(<RefundReasonChips value={null} onChange={jest.fn()} />)
    fireEvent.click(screen.getByText('헬스장 쪽 문제예요'))
    expect(screen.getByText('헬스장 폐업')).toBeInTheDocument()
    expect(screen.queryByText('부상 / 질병')).not.toBeInTheDocument()
  })

  it('제 사정을 고르면 개인 사유만 펼친다', () => {
    render(<RefundReasonChips value={null} onChange={jest.fn()} />)
    fireEvent.click(screen.getByText('제 사정이에요'))
    expect(screen.getByText('부상 / 질병')).toBeInTheDocument()
    expect(screen.queryByText('헬스장 폐업')).not.toBeInTheDocument()
  })

  it('세부 사유를 고르면 onChange 로 값을 올린다', () => {
    const onChange = jest.fn()
    render(<RefundReasonChips value={null} onChange={onChange} />)
    fireEvent.click(screen.getByText('제 사정이에요'))
    fireEvent.click(screen.getByText('부상 / 질병'))
    expect(onChange).toHaveBeenCalledWith('injury')
  })

  it('이미 값이 있으면 해당 그룹이 펼쳐진 상태로 시작한다 (뒤로 왔을 때 다시 안 고르게)', () => {
    render(<RefundReasonChips value="closure" onChange={jest.fn()} />)
    expect(screen.getByText('헬스장 폐업')).toBeInTheDocument()
  })

  it('그룹을 잘못 골랐으면 반대쪽으로 바꿀 수 있다', () => {
    render(<RefundReasonChips value={null} onChange={jest.fn()} />)
    fireEvent.click(screen.getByText('헬스장 쪽 문제예요'))
    fireEvent.click(screen.getByText('제 사정으로 바꾸기'))
    expect(screen.getByText('부상 / 질병')).toBeInTheDocument()
  })

  it('"잘 모르겠어요"는 목록과 같은 무게의 카드다 — 미제출자 53%가 막히는 지점이다', () => {
    const onMissing = jest.fn()
    render(<RefundReasonChips value={null} onChange={jest.fn()} onMissingReason={onMissing} />)
    fireEvent.click(screen.getByText('잘 모르겠어요'))
    expect(onMissing).toHaveBeenCalled()
  })

  it('위약금을 법률 용어가 아니라 부호와 숫자로 보여준다', () => {
    render(<RefundReasonChips value={null} onChange={jest.fn()} />)
    expect(screen.getByText('+10% 더 받음')).toBeInTheDocument()
    expect(screen.getByText('−10% 공제')).toBeInTheDocument()
    expect(screen.queryByText('위약금 가산')).not.toBeInTheDocument()
  })
})
