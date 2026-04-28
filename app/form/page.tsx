import type { Metadata } from 'next'
import FormClient from './FormClient'

export const metadata: Metadata = {
  title: '환불액 계산하기',
  description: '헬스장 계약금·이용 기간만 입력하면 공정위 소비자분쟁해결기준 기반 환급액을 자동 계산합니다. 3분이면 청구서까지 완성.',
  alternates: {
    canonical: 'https://claimauto.app/form',
  },
  openGraph: {
    title: '헬스장 환불액 계산하기 | ClaimAuto',
    description: '헬스장 계약금·이용 기간만 입력하면 공정위 소비자분쟁해결기준 기반 환급액을 자동 계산합니다.',
    url: 'https://claimauto.app/form',
  },
}

export default function FormPage() {
  return <FormClient />
}
