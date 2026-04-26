import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClaimAuto — 헬스장 환불 청구 자동화',
  description: '3분 만에 법적 근거가 담긴 환급 청구서를 만드세요. 공정위 고시 기반 계산, PDF 즉시 발급, 소비자원 바로 연결.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="mx-auto max-w-[375px] min-h-screen relative bg-[#F8FAFC] shadow-[0_0_60px_rgba(0,0,0,0.08)]">
          {children}
        </div>
      </body>
    </html>
  )
}
