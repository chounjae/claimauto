/**
 * 전체 페이지 이동.
 *
 * `window.location.href = url` 을 이 한 곳으로 모아 둔다.
 * jsdom 은 `window.location` 을 재정의할 수 없어서 컴포넌트 안에 직접 쓰면
 * "서버 PDF 로 이동하는가"를 테스트로 검증할 수 없다.
 */
export function navigateTo(url: string): void {
  window.location.href = url
}
