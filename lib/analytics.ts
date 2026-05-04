import mixpanel from 'mixpanel-browser'

let initialized = false

function init() {
  if (initialized) return
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  if (!token) return
  mixpanel.init(token, {
    track_pageview: true,
    persistence: 'localStorage',
  })
  initialized = true
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('__no_track') === '1') return
  init()
  if (!initialized) return
  mixpanel.track(event, properties)
}
