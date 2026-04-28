import type { Metadata } from 'next'
import GuideClient from './GuideClient'

export const metadata: Metadata = {
  title: '소비자원 신고 가이드',
  description: '헬스장 환불 거부 시 한국소비자원 피해구제 신청부터 소액소송까지 전체 절차를 단계별로 안내합니다. 무료, 평균 2~4주 처리.',
  alternates: {
    canonical: 'https://claimauto.app/guide',
  },
  openGraph: {
    title: '소비자원 신고 가이드 | ClaimAuto',
    description: '헬스장 환불 거부 시 한국소비자원 피해구제 신청부터 소액소송까지 전체 절차를 단계별로 안내합니다.',
    url: 'https://claimauto.app/guide',
  },
}

export default function GuidePage() {
  return <GuideClient />
}
