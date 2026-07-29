import type { Metadata } from 'next'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { DISCLAIMER } from '@/lib/legal'

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: 'ClaimAuto 개인정보 처리방침 및 이용약관 고지',
}

const UPDATED = '2026년 7월 30일'

export default function PrivacyPage() {
  return (
    <main className="flex flex-col min-h-screen px-5 pb-16">
      <header className="pt-6 pb-4">
        <Logo />
      </header>

      <h1 className="text-xl font-bold text-gray-900">개인정보 처리방침</h1>
      <p className="mt-1 text-xs text-gray-500">시행일 {UPDATED}</p>

      <div className="mt-6 flex flex-col gap-6 text-sm leading-6 text-gray-700">
        <Section title="1. 총칙">
          <p>
            ClaimAuto(이하 &ldquo;서비스&rdquo;)는 헬스장 등 체육시설 이용계약의 환급액을 계산하고
            내용증명 서식을 생성해 주는 도구입니다. 서비스는 「개인정보 보호법」을 준수하며,
            아래와 같이 개인정보를 처리합니다.
          </p>
        </Section>

        <Section title="2. 이용자가 입력한 정보는 서버에 저장되지 않습니다">
          <p>
            청구서 작성을 위해 입력하는 <strong>이름, 연락처, 신청인 주소, 업체명, 업체 주소,
            담당자명, 환불 계좌</strong>는 이용자의 브라우저 안에서만 처리되며,
            서비스 서버로 전송되거나 저장되지 않습니다.
          </p>
          <p>
            브라우저를 닫거나 새로고침하면 해당 정보는 즉시 사라집니다.
            생성된 PDF는 이용자의 기기에만 저장됩니다.
          </p>
        </Section>

        <Section title="3. 수집하는 이용 정보 (분석 목적)">
          <p>서비스 개선을 위해 Mixpanel을 통해 아래 정보를 수집합니다.</p>
          <ul className="list-disc pl-5">
            <li>기기 식별자(무작위 생성값), 브라우저·운영체제 종류 및 버전</li>
            <li>화면 크기, 접속 시각, 유입 경로(referrer), 방문한 페이지 주소</li>
            <li>IP 주소에 기반한 대략적 접속 지역(시·구 단위)</li>
            <li>버튼 클릭·입력 단계 진행 등 서비스 이용 행태</li>
            <li>
              계산 입력값 중 <strong>계약금액, 계약일, 해지일, 결제수단, 환불 사유,
              산정된 환급액</strong>
            </li>
          </ul>
          <p className="text-xs text-gray-500">
            위 정보에는 이름·연락처·주소 등 이용자를 직접 식별할 수 있는 정보가 포함되지 않습니다.
          </p>
        </Section>

        <Section title="4. 이용 목적">
          <ul className="list-disc pl-5">
            <li>서비스 이용 현황 분석 및 기능 개선</li>
            <li>오류 및 장애 파악</li>
            <li>이용자에게 더 정확한 계산 결과를 제공하기 위한 통계 분석</li>
          </ul>
          <p>수집한 정보를 광고 목적으로 제3자에게 판매하거나 제공하지 않습니다.</p>
        </Section>

        <Section title="5. 처리 위탁 및 국외 이전">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-2 py-1 text-left">수탁자</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">목적</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">보관 국가</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">Mixpanel, Inc.</td>
                  <td className="border border-gray-200 px-2 py-1">이용 행태 분석</td>
                  <td className="border border-gray-200 px-2 py-1">미국</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-2 py-1">Vercel Inc.</td>
                  <td className="border border-gray-200 px-2 py-1">웹사이트 호스팅</td>
                  <td className="border border-gray-200 px-2 py-1">미국 등</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="6. 보유 및 이용 기간">
          <p>
            분석 정보는 수집일로부터 <strong>1년</strong>이 지나면 파기합니다.
            이용자가 입력한 청구서 정보는 애초에 저장되지 않으므로 별도 파기 절차가 없습니다.
          </p>
        </Section>

        <Section title="7. 이용자의 권리">
          <p>
            이용자는 언제든지 분석 정보 수집을 거부할 수 있습니다.
            브라우저의 광고·분석 차단 기능을 사용하거나, 아래 버튼으로 이 기기에서의 수집을 중지할 수 있습니다.
          </p>
          <OptOutNote />
          <p>
            개인정보 열람·정정·삭제·처리정지를 요구하려면 아래 연락처로 문의하시기 바랍니다.
            다만 서비스는 이용자를 식별할 수 있는 정보를 보관하지 않으므로,
            특정 개인의 기록을 지정해 조회하거나 삭제하는 것은 기술적으로 불가능할 수 있습니다.
          </p>
        </Section>

        <Section title="8. 개인정보 보호책임자">
          <p>
            문의처: <a href="mailto:sw.team.haruharu@gmail.com" className="text-[#2563EB] underline">sw.team.haruharu@gmail.com</a>
          </p>
          <p className="text-xs text-gray-500">
            개인정보 침해에 관한 상담이 필요하시면 개인정보침해신고센터(privacy.kisa.or.kr, 국번없이 118)
            또는 개인정보 분쟁조정위원회(kopico.go.kr, 1833-6972)에 문의하실 수 있습니다.
          </p>
        </Section>

        <Section title="9. 서비스의 성격 고지">
          <p>{DISCLAIMER}</p>
        </Section>

        <Section title="10. 변경 고지">
          <p>
            이 방침을 변경할 경우 시행일 최소 7일 전에 서비스 내에 공지합니다.
            중요한 변경의 경우 30일 전에 공지합니다.
          </p>
        </Section>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-sm text-[#2563EB] underline">
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

function OptOutNote() {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-600">
      브라우저 주소창에 <code className="rounded bg-gray-200 px-1">javascript:localStorage.setItem(&apos;__no_track&apos;,&apos;1&apos;)</code>
      를 실행하거나, 개발자 도구 콘솔에서 같은 명령을 입력하면 이 기기에서의 수집이 중지됩니다.
    </div>
  )
}
