'use client'

import Link from 'next/link'

interface CTAButtonProps {
  href: string
  label: string
}

export default function CTAButton({ href, label }: CTAButtonProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[375px] p-4 bg-gradient-to-t from-[#F8FAFC] to-transparent">
      <Link
        href={href}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#10B981] text-white text-base font-bold shadow-lg active:scale-[0.98] transition-transform"
      >
        {label}
      </Link>
    </div>
  )
}
