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

function init() {
  if (initialized) return
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  if (!token) return
  mixpanel.init(token, {
    track_pageview: true,
    persistence: 'localStorage',
  })
  // super properties 로 등록하면 이후 모든 이벤트(자동 pageview 포함)에 자동 첨부된다.
  mixpanel.register(getClientEnv())
  initialized = true
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('__no_track') === '1') return
  init()
  if (!initialized) return
  mixpanel.track(event, properties)
}
