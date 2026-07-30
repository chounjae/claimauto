/**
 * 입력 중인 내용을 브라우저에 임시 보관한다.
 *
 * 왜 필요한가:
 * PDF 페이지는 이름·연락처·업체명·업체 주소를 요구한다. 특히 업체 주소는
 * 지도 앱을 열어 찾아와야 하는 값이라 **앱 전환이 사실상 강제된다.**
 * 기존 구현은 `useState` 만 써서, 앱 전환 중 탭이 폐기되면 입력이 전부 날아갔다.
 * 실측에서 한 사용자가 PDF 페이지에 들어갔다 10초 만에 나갔고,
 * 다시 들어와 4분 6초를 들여 채웠다.
 *
 * ⚠️ 개인정보
 * 이름·연락처·주소가 담긴다. **서버로 보내지 않고 이용자 기기에만 둔다.**
 * 제출이 끝나면 지운다. 만료 시간을 둬서 오래 남지 않게 한다.
 */

const PREFIX = 'cf_draft_'
/** 24시간. 그보다 오래된 초안은 남의 기기일 수도 있고 상황이 바뀌었을 수도 있다. */
const TTL_MS = 24 * 60 * 60 * 1000

interface Envelope<T> {
  at: number
  data: T
}

export function saveDraft<T>(key: string, data: T): void {
  try {
    const env: Envelope<T> = { at: Date.now(), data }
    localStorage.setItem(PREFIX + key, JSON.stringify(env))
  } catch {
    // 사파리 프라이빗 모드·용량 초과 등. 저장 실패가 입력을 막아서는 안 된다.
  }
}

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const env = JSON.parse(raw) as Envelope<T>
    if (typeof env?.at !== 'number' || Date.now() - env.at > TTL_MS) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return env.data
  } catch {
    return null
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // 무시
  }
}
