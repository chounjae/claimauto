'use client'

interface ExternalLinkModalProps {
  url: string
  name: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ExternalLinkModal({ url, name, onConfirm, onCancel }: ExternalLinkModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0">
      <div className="w-full max-w-[375px] rounded-t-2xl bg-white px-5 pb-8 pt-6 shadow-xl">
        <div className="mb-1 h-1 w-10 rounded-full bg-gray-200 mx-auto" />
        <h3 className="mt-4 text-base font-bold text-gray-900">외부 사이트로 이동합니다</h3>
        <p className="mt-1.5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">{name}</span>으로 연결됩니다.
          <br />계속 진행할까요?
        </p>
        <p className="mt-2 truncate text-xs text-gray-400">{url}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-[48px] rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-[48px] rounded-xl bg-[#2563EB] text-sm font-bold text-white"
          >
            이동하기
          </button>
        </div>
      </div>
    </div>
  )
}
