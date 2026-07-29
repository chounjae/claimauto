import type { Metadata } from 'next'
import FeedbackClient from './FeedbackClient'

export const metadata: Metadata = {
  title: '의견 보내기',
  description: 'ClaimAuto를 쓰면서 불편했던 점이나 개선 의견을 보내주세요.',
}

export default function FeedbackPage() {
  return <FeedbackClient />
}
