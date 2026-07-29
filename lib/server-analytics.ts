/**
 * 서버 사이드 Mixpanel 계측
 *
 * 왜 서버에서 재나:
 * PDF 생성 성공은 서버만 확정적으로 안다. 클라이언트에서 재려면
 * fetch 로 한 번 받고 이동하면서 또 한 번 만들어야 해서 PDF 를 두 번 생성하게 된다.
 *
 * ⚠️ 개인정보 금지
 * 이 함수에 이름·연락처·주소를 넘기지 마라. 사유·금액대 같은 비식별 값만 보낸다.
 */

const ENDPOINT = 'https://api.mixpanel.com/track'

export async function trackServer(
  event: string,
  distinctId: string,
  properties: Record<string, string | number | boolean | null> = {},
): Promise<void> {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  if (!token || !distinctId) return

  const payload = [
    {
      event,
      properties: {
        ...properties,
        token,
        distinct_id: distinctId,
        // 서버 발화임을 구분할 수 있게 표시한다.
        source: 'server',
        time: Date.now(),
      },
    },
  ]

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // 계측 때문에 응답이 늦어지면 안 된다.
      signal: AbortSignal.timeout(2000),
    })
  } catch {
    // 계측 실패가 PDF 생성을 막아서는 안 된다. 조용히 넘어간다.
    // 오류 내용에 개인정보가 섞일 수 있으므로 로깅하지 않는다.
  }
}
