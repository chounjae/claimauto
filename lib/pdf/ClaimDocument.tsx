/**
 * 서버 사이드 PDF 문서 (@react-pdf/renderer)
 *
 * `app/pdf/PdfClient.tsx` 의 DocumentContent 가 화면에 렌더하던 내용증명을
 * PDF 프리미티브로 옮긴 것이다. 문구는 `lib/refund-doc.ts` / `lib/legal.ts` 를 공유한다.
 *
 * ⚠️ 서버 전용. 클라이언트 번들에 들어가면 안 된다.
 */

import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import {
  BASE_LAW,
  CONTINUING_SERVICE_LAW,
  GOSI_FULL,
  GOSI_SHORT,
  PENALTY_DESC,
} from '@/lib/legal'
import {
  addDays,
  fmt,
  formatDate,
  REASON_BODY,
  REASON_LABEL,
  unitPriceRebuttal,
  type ClaimDocData,
} from '@/lib/refund-doc'
import { PDF_FONT_FAMILY, registerPdfFonts } from './fonts'

const COLOR = {
  ink: '#111827',
  body: '#374151',
  muted: '#6B7280',
  faint: '#9CA3AF',
  line: '#D1D5DB',
  hairline: '#E5E7EB',
  panel: '#F9FAFB',
  blue: '#2563EB',
  blueBg: '#EFF6FF',
  blueLine: '#DBEAFE',
  blueInk: '#1E40AF',
  red: '#DC2626',
  green: '#059669',
  greenBg: '#ECFDF5',
} as const

const s = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 9,
    color: COLOR.ink,
    paddingTop: 30,
    paddingBottom: 32,
    paddingHorizontal: 40,
    lineHeight: 1.45,
  },

  // 제목
  titleBlock: {
    textAlign: 'center',
    marginBottom: 12,
    paddingBottom: 9,
    borderBottomWidth: 2,
    borderBottomColor: COLOR.ink,
  },
  title: { fontSize: 17, fontWeight: 'bold', letterSpacing: -0.3 },
  subtitle: { fontSize: 7.5, color: COLOR.muted, marginTop: 4 },

  // 수신·발신 표
  metaTable: {
    borderWidth: 1,
    borderColor: COLOR.line,
    marginBottom: 11,
  },
  metaRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLOR.hairline },
  metaRowLast: { flexDirection: 'row' },
  metaKey: {
    width: 62,
    backgroundColor: COLOR.panel,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 8,
    fontWeight: 'bold',
    color: COLOR.muted,
  },
  metaValue: { flex: 1, paddingHorizontal: 8, paddingVertical: 4, fontSize: 8 },
  metaValueStrong: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  metaSub: { fontSize: 8, color: COLOR.muted },

  intro: { fontSize: 8, color: COLOR.body, marginBottom: 11, lineHeight: 1.6 },

  // 섹션
  section: { marginBottom: 9 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionNum: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: COLOR.ink,
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 2.2,
    marginRight: 6,
  },
  sectionTitle: { fontSize: 8.5, fontWeight: 'bold', color: COLOR.ink },
  sectionBody: { borderWidth: 1, borderColor: COLOR.hairline, borderRadius: 4 },

  // 항목 행
  docRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3.2,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
  },
  docRowLast: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 3.2 },
  docRowLabel: { width: 92, color: COLOR.muted, fontSize: 8 },
  docRowValue: { flex: 1, fontSize: 8, fontWeight: 'bold' },

  // 계산 내역
  calcBox: { paddingHorizontal: 8, paddingVertical: 6 },
  calcNote: {
    fontSize: 7,
    color: COLOR.green,
    backgroundColor: COLOR.greenBg,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginBottom: 6,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
  },
  calcLabel: { flex: 1, color: COLOR.muted, fontSize: 8, paddingRight: 8 },
  calcSub: { fontSize: 6.8, color: COLOR.faint },
  calcAmount: { fontSize: 8, fontWeight: 'bold' },
  calcTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 7,
  },
  calcTotalLabel: { fontSize: 8.5, fontWeight: 'bold' },
  calcTotalAmount: { fontSize: 12, fontWeight: 'bold', color: COLOR.blue },

  // 본문 문단
  para: { paddingHorizontal: 8, paddingVertical: 6, fontSize: 8, color: COLOR.body },
  legalItem: { fontSize: 8, color: COLOR.body, marginBottom: 3, lineHeight: 1.5 },
  bold: { fontWeight: 'bold' },

  accountBox: {
    marginTop: 6,
    backgroundColor: COLOR.blueBg,
    borderWidth: 1,
    borderColor: COLOR.blueLine,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 8,
    fontWeight: 'bold',
    color: COLOR.blueInk,
  },

  // 서명
  signBlock: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLOR.line },
  signLead: { textAlign: 'center', color: COLOR.muted, fontSize: 8, marginBottom: 7 },
  signDate: { textAlign: 'center', color: COLOR.faint, fontSize: 8 },
  signRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 9 },
  signCol: { alignItems: 'center', marginHorizontal: 34 },
  signCaption: { fontSize: 8, color: COLOR.muted },
  signName: { fontSize: 9, fontWeight: 'bold', color: COLOR.ink, marginTop: 3 },
  signHint: { fontSize: 7.5, color: COLOR.faint },
  signPhone: { fontSize: 8.5, color: COLOR.ink, marginTop: 3 },
})

function DocRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={last ? s.docRowLast : s.docRow}>
      <Text style={s.docRowLabel}>{label}</Text>
      <Text style={s.docRowValue}>{value}</Text>
    </View>
  )
}

function Section({
  num,
  title,
  children,
}: {
  num: string
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={s.section} wrap={false}>
      <View style={s.sectionHead}>
        <Text style={s.sectionNum}>{num}</Text>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <View style={s.sectionBody}>{children}</View>
    </View>
  )
}

export function ClaimDocument({ calc, info, todayIso }: ClaimDocData) {
  const today = formatDate(todayIso)
  const deadlineDate = addDays(todayIso, Number(info.deadline))
  const dailyRate = Math.round(calc.monthlyFee / 30)
  /** 횟수제 회당 단가. 실납부액 ÷ 총횟수 — 정가가 아니다. */
  const sessionRate = calc.totalSessions ? Math.round(calc.contractAmount / calc.totalSessions) : 0
  const isBusinessFault = calc.isBusinessFault ?? false
  const reason = calc.refundReason
  const rebuttal = unitPriceRebuttal(calc)

  return (
    <Document
      title="헬스장 이용계약 환불 요청서"
      author={info.name}
      subject="헬스장 이용계약 중도해지 및 환불 청구의 건"
      creator="ClaimAuto"
      producer="ClaimAuto"
      language="ko"
    >
      <Page size="A4" style={s.page}>
        <View style={s.titleBlock}>
          <Text style={s.title}>헬스장 이용계약 환불 요청서</Text>
          <Text style={s.subtitle}>{GOSI_FULL} 기준 산정</Text>
        </View>

        <View style={s.metaTable}>
          <View style={s.metaRow}>
            <Text style={s.metaKey}>수 신</Text>
            <Text style={s.metaValue}>
              {info.gymName} 귀중{info.staffName ? ` (담당: ${info.staffName})` : ''}
            </Text>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaKey}>발 신</Text>
            <View style={s.metaValue}>
              <Text>
                {info.name}  |  연락처: {info.phone}
              </Text>
              {info.myAddress ? <Text style={s.metaSub}>주소: {info.myAddress}</Text> : null}
            </View>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaKey}>작 성 일</Text>
            <Text style={s.metaValue}>{today}</Text>
          </View>
          <View style={s.metaRowLast}>
            <Text style={s.metaKey}>제 목</Text>
            <Text style={s.metaValueStrong}>헬스장 이용계약 중도해지 및 환불 청구의 건</Text>
          </View>
        </View>

        <Text style={s.intro}>
          안녕하세요. 저는 귀 업체의 헬스장 이용계약 회원으로, 아래 사유로 인해 중도해지 및 환불을
          정중히 요청드립니다. {reason ? `${REASON_BODY[reason]} ` : ''}아래 계산 내역을 확인하시고
          원만한 처리를 부탁드립니다.
        </Text>

        {/*
          단가 산정 반박. 업체가 주장한 단가를 입력한 경우에만 들어간다.
          지식iN 실사례 20건 중 5건이 이 다툼이었다 (ADR-005).
        */}
        {rebuttal ? <Text style={s.intro}>{rebuttal}</Text> : null}

        <Section num="1" title="계약 내용">
          <DocRow label="계약 업체" value={info.gymName} />
          <DocRow label="업체 주소" value={info.gymAddress} />
          <DocRow label="계약 시작일" value={formatDate(calc.startDate)} />
          <DocRow label="중도해지 요청일" value={formatDate(calc.stopDate)} />
          {calc.productType === 'session' ? (
            <DocRow
              label="이용 횟수"
              value={`총 ${calc.totalSessions ?? 0}회 중 ${calc.usedSessions ?? 0}회 이용`}
            />
          ) : (
            <DocRow label="실 이용 일수" value={`${calc.usedDays}일`} />
          )}
          <DocRow label="납부 금액" value={`${fmt(calc.contractAmount)}원`} />
          <DocRow label="납부 방식" value={calc.paymentType} last={!reason} />
          {reason ? <DocRow label="환불 사유" value={REASON_LABEL[reason]} last /> : null}
        </Section>

        <Section num="2" title="환불 청구 금액 계산">
          <View style={s.calcBox}>
            {calc.purchaseType === 'discounted' ? (
              <Text style={s.calcNote}>
                ※ 공정거래위원회 고시 소비자분쟁해결기준에 따라 실 납부액 기준으로 계산합니다.
              </Text>
            ) : null}

            <View style={s.calcRow}>
              <Text style={s.calcLabel}>① 납부 금액</Text>
              <Text style={s.calcAmount}>{fmt(calc.contractAmount)}원</Text>
            </View>

            <View style={s.calcRow}>
              <View style={s.calcLabel}>
                <Text>② 기이용료 차감</Text>
                <Text style={s.calcSub}>
                  {calc.productType === 'session'
                    ? `${fmt(calc.contractAmount)}원 ÷ ${calc.totalSessions ?? 0}회 × ${calc.usedSessions ?? 0}회 (${fmt(sessionRate)}원/회)`
                    : `${fmt(calc.monthlyFee)}원 ÷ 30일 × ${calc.usedDays}일 (${fmt(dailyRate)}원/일)`}
                </Text>
              </View>
              <Text style={[s.calcAmount, { color: COLOR.red }]}>−{fmt(calc.usedFee)}원</Text>
            </View>

            <View style={s.calcRow}>
              <View style={s.calcLabel}>
                <Text>③ 위약금 {isBusinessFault ? '가산' : '차감'}</Text>
                <Text style={s.calcSub}>
                  {isBusinessFault
                    ? '사업자 귀책 사유 → 위약금 가산 (이용료의 1/10)'
                    : '이용료의 1/10'}
                </Text>
              </View>
              <Text style={[s.calcAmount, { color: isBusinessFault ? COLOR.green : COLOR.red }]}>
                {isBusinessFault ? `+${fmt(calc.penalty)}원` : `−${fmt(calc.penalty)}원`}
              </Text>
            </View>

            <View style={s.calcTotalRow}>
              <Text style={s.calcTotalLabel}>청구 환불액 (①−②−③)</Text>
              <Text style={s.calcTotalAmount}>{fmt(calc.refund)}원</Text>
            </View>
          </View>
        </Section>

        <Section num="3" title="법적 근거">
          <View style={s.para}>
            <Text style={s.legalItem}>
              <Text style={s.bold}>가.</Text> {GOSI_SHORT}: 계속적 역무계약에서 소비자 중도해지 시
              기이용료와 {PENALTY_DESC}을 공제한 잔액을 환불하여야 한다. 사업자 귀책 사유 시 위약금
              없이 잔액 전액 환불 의무.
            </Text>
            <Text style={s.legalItem}>
              <Text style={s.bold}>나.</Text> {BASE_LAW}: 체육시설업자는 회원과 약정한 사항을 지켜야
              하며, 회원 모집·계약 및 반환에 관하여 대통령령으로 정하는 사항을 준수하여야 한다.
            </Text>
            <Text style={s.legalItem}>
              <Text style={s.bold}>다.</Text> {CONTINUING_SERVICE_LAW}: 계속적 역무계약의 중도해지 및
              잔액 환불 권리를 보장한다.
            </Text>
          </View>
        </Section>

        <Section num="4" title="환불 처리 요청 기한">
          <View style={s.para}>
            <Text>
              본 요청서 수령일로부터 <Text style={s.bold}>{info.deadline}일 이내</Text>(
              {deadlineDate}까지)에 환불 금액{' '}
              <Text style={s.bold}>{fmt(calc.refund)}원</Text>을 처리해 주시면 감사드리겠습니다.
            </Text>

            {info.bankAccount ? (
              <Text style={s.accountBox}>입금 계좌: {info.bankAccount}</Text>
            ) : (
              <Text style={{ marginTop: 3, color: COLOR.muted }}>
                입금 계좌는 별도 연락으로 안내 드리겠습니다.
              </Text>
            )}

            <Text style={{ marginTop: 9, color: COLOR.body }}>
              금액에 이견이 있으시거나 처리가 어려우신 경우, 편하게 연락 주시기 바랍니다. 원만한
              합의가 어려울 경우 한국소비자원 분쟁조정 절차를 통해 해결하도록 하겠습니다.
            </Text>
          </View>
        </Section>

        <View style={s.signBlock} wrap={false}>
          <Text style={s.signLead}>위 내용을 확인하시고 원만한 처리를 부탁드립니다. 감사합니다.</Text>
          <Text style={s.signDate}>{today}</Text>
          <View style={s.signRow}>
            <View style={s.signCol}>
              <Text style={s.signCaption}>청구인</Text>
              <Text style={s.signName}>{info.name}</Text>
              <Text style={s.signHint}>(서명 또는 날인)</Text>
            </View>
            <View style={s.signCol}>
              <Text style={s.signCaption}>연락처</Text>
              <Text style={s.signPhone}>{info.phone}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

/**
 * 문서를 PDF 바이트로 렌더한다.
 *
 * `renderToBuffer` 는 `ReactElement<DocumentProps>` 를 요구하므로 JSX 로 넘겨야 한다.
 * (`createElement` 로 만들면 props 타입이 좁혀져 타입 오류가 난다.)
 */
export async function renderClaimPdf(data: ClaimDocData): Promise<Uint8Array<ArrayBuffer>> {
  registerPdfFonts()
  const buffer = await renderToBuffer(<ClaimDocument {...data} />)
  // Buffer(=Uint8Array<ArrayBufferLike>) 를 그대로 Response 에 넘기면 BodyInit 타입이 맞지 않는다.
  return new Uint8Array(buffer)
}
