import mixpanel from 'mixpanel-browser'

let initialized = false

/** 인앱 웹뷰 판별용 User-Agent 토큰 */
const INAPP_UA_TOKENS = [
  'KAKAOTALK',
  'Instagram',
  'FBAV',
  'FB_IAB',
  'NAVER',
  'DaumApps',
  'Everytime',
]

/** 모든 이벤트에 공통으로 붙는 클라이언트 환경 속성 */
export type ClientEnv = {
  ua: string
  is_inapp: boolean
  is_ios: boolean
}

export function getClientEnv(): ClientEnv {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const is_ios = /iPad|iPhone|iPod/.test(ua)
  const hasInappToken = INAPP_UA_TOKENS.some((token) => ua.includes(token))
  // iOS 인데 UA 에 Safari/ 토큰이 없으면 WKWebView(인앱 브라우저)로 간주한다.
  const is_inapp = hasInappToken || (is_ios && !ua.includes('Safari/'))
  return { ua, is_inapp, is_ios }
}

/**
 * 쿼리스트링을 제거한 경로만 남긴다.
 *
 * /result 와 /pdf 는 계약금액·계약일·해지일·결제수단·환급액을 쿼리스트링으로 받는다.
 * Mixpanel 은 기본적으로 $current_url 을 자동 첨부하므로, 그대로 두면 이 값들이
 * 분석 서버에 전송·저장된다. 분석에 필요한 값은 이미 이벤트 속성으로 따로 보내므로
 * URL 에서는 경로만 남기고 전부 잘라낸다.
 */
function sanitizeUrl(raw: string): string {
  try {
    const u = new URL(raw)
    return `${u.origin}${u.pathname}`
  } catch {
    return raw.split('?')[0]
  }
}

function init() {
  if (initialized) return
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  if (!token) return
  mixpanel.init(token, {
    track_pageview: true,
    persistence: 'localStorage',
    // 자동 수집되는 URL 계열 속성에서 쿼리스트링을 제거한다.
    loaded: () => {
      const href = typeof location === 'undefined' ? '' : location.href
      mixpanel.register({
        $current_url: sanitizeUrl(href),
        current_url_path: typeof location === 'undefined' ? '' : location.pathname,
      })
    },
  })
  // super properties 로 등록하면 이후 모든 이벤트(자동 pageview 포함)에 자동 첨부된다.
  mixpanel.register({
    ...getClientEnv(),
    $current_url: sanitizeUrl(typeof location === 'undefined' ? '' : location.href),
  })
  initialized = true
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('__no_track') === '1') return
  init()
  if (!initialized) return
  // 페이지 이동마다 경로가 바뀌므로 발화 시점의 값으로 갱신한다.
  mixpanel.track(event, {
    ...properties,
    $current_url: sanitizeUrl(location.href),
    current_url_path: location.pathname,
  })
}
