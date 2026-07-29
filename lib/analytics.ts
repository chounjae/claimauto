import mixpanel from 'mixpanel-browser'

let initialized = false

/**
 * 인앱 웹뷰 판별용 User-Agent 토큰
 *
 * ⚠️ 2026-07-30 실측으로 드러난 함정:
 * 구글 앱(GSA)의 iOS UA 는 `Safari/604.1` 토큰을 그대로 포함한다.
 *
 *   Mozilla/5.0 (iPhone; ...) AppleWebKit/605.1.15 (KHTML, like Gecko)
 *   GSA/430.3.945886556 Mobile/15E148 Safari/604.1
 *
 * 따라서 "iOS 인데 Safari/ 가 없으면 웹뷰"라는 판정만으로는 잡히지 않는다.
 * 앱 식별 토큰을 명시적으로 나열해야 한다.
 */
const INAPP_UA_TOKENS = [
  // 한국 사용자 비중이 높은 순
  'KAKAOTALK',   // 카카오톡
  'NAVER',       // 네이버 앱
  'DaumApps',    // 다음 앱
  'Whale',       // 웨일 브라우저(iOS 는 WKWebView)
  'Line',        // 라인
  'Everytime',   // 에브리타임
  // 글로벌
  'GSA/',        // Google Search App ← 2026-07-30 실측으로 추가
  'Instagram',
  'FBAV',        // Facebook 앱
  'FB_IAB',      // Facebook in-app browser
  'FBAN',        // Facebook 앱(다른 표기)
  'Twitter',
  'TikTok',
  'MicroMessenger', // 위챗
  'Snapchat',
  'LinkedInApp',
  'Pinterest',
  // iOS 서드파티 브라우저 — 전부 WKWebView 라 window.print() 동작이 Safari 와 다르다
  'CriOS',       // 크롬 iOS
  'FxiOS',       // 파이어폭스 iOS
  'EdgiOS',      // 엣지 iOS
  'OPiOS',       // 오페라 iOS
]

/** 모든 이벤트에 공통으로 붙는 클라이언트 환경 속성 */
export type ClientEnv = {
  ua: string
  is_inapp: boolean
  is_ios: boolean
  /** 어느 앱의 웹뷰인지. 판별되지 않으면 null */
  inapp_app: string | null
}

export function getClientEnv(): ClientEnv {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const is_ios = /iPad|iPhone|iPod/.test(ua)
  const inapp_app = INAPP_UA_TOKENS.find((token) => ua.includes(token)) ?? null
  // 토큰이 없어도, iOS 인데 Safari/ 토큰이 빠져 있으면 WKWebView 로 본다.
  // (토큰을 모르는 앱을 잡기 위한 보조 규칙)
  const is_inapp = inapp_app !== null || (is_ios && !ua.includes('Safari/'))
  return { ua, is_inapp, is_ios, inapp_app }
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
