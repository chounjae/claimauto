import { getClientEnv } from '@/lib/analytics'

function withUA(ua: string) {
  Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true })
  return getClientEnv()
}

const CASES: Array<[string, string, boolean, boolean]> = [
  ['카카오톡 인앱', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 KAKAOTALK 10.4.5', true, false],
  ['인스타그램 인앱(iOS)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Instagram 302.0', true, true],
  ['페이스북 인앱(FBAV)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 [FBAV/450.0]', true, true],
  ['페이스북 인앱(FB_IAB)', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 [FB_IAB/FB4A;]', true, false],
  ['네이버 인앱', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 NAVER(inapp)', true, false],
  ['다음 인앱', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 DaumApps/3.0', true, false],
  ['에브리타임 인앱', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Everytime/1.0', true, false],
  ['iOS WKWebView (Safari/ 토큰 없음)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', true, true],
  ['iOS Safari', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', false, true],
  ['iPad Safari', 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/604.1', false, true],
  ['안드로이드 Chrome', 'Mozilla/5.0 (Linux; Android 13; SM-S918N) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36', false, false],
  ['데스크톱 Chrome', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', false, false],
]

describe('getClientEnv', () => {
  it.each(CASES)('%s', (_label, ua, expectInapp, expectIos) => {
    const env = withUA(ua)
    expect(env.ua).toBe(ua)
    expect(env.is_inapp).toBe(expectInapp)
    expect(env.is_ios).toBe(expectIos)
  })
})

describe('인앱 웹뷰 판별 — 실측 회귀 케이스', () => {
  const set = (ua: string) =>
    Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true })

  it('구글 앱(GSA)은 Safari/ 토큰이 있어도 인앱으로 판별한다', () => {
    // 2026-07-30 실측 UA. 이 케이스를 놓쳐 인앱 유입이 순정 브라우저로 집계됐다.
    set('Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/430.3.945886556 Mobile/15E148 Safari/604.1')
    const e = getClientEnv()
    expect(e.is_inapp).toBe(true)
    expect(e.is_ios).toBe(true)
    expect(e.inapp_app).toBe('GSA/')
  })

  it('순정 iOS Safari 는 인앱이 아니다', () => {
    set('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
    const e = getClientEnv()
    expect(e.is_inapp).toBe(false)
    expect(e.inapp_app).toBeNull()
  })

  it('크롬 iOS(CriOS)는 인앱으로 판별한다', () => {
    set('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/120.0 Mobile/15E148 Safari/604.1')
    expect(getClientEnv().inapp_app).toBe('CriOS')
  })

  it('안드로이드 크롬은 인앱이 아니다', () => {
    set('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36')
    const e = getClientEnv()
    expect(e.is_inapp).toBe(false)
    expect(e.is_ios).toBe(false)
  })
})
