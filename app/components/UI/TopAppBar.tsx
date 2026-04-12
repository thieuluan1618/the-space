'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface TopAppBarProps {
  backHref?: string
  rightLabel?: string
  rightHref?: string
}

export default function TopAppBar({ backHref, rightLabel, rightHref }: TopAppBarProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-outline-variant w-full">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {backHref && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-glass-dark text-on-surface active:opacity-70 transition-opacity duration-200"
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <Link href="/" className="text-base font-medium text-on-surface no-underline" style={{ letterSpacing: '-0.26px' }}>
            The Space
          </Link>
        </div>

        {rightLabel && (
          rightHref ? (
            <Link
              href={rightHref}
              className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface no-underline hover:opacity-60 transition-opacity duration-200"
            >
              {rightLabel}
            </Link>
          ) : (
            <span className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface">
              {rightLabel}
            </span>
          )
        )}
      </div>
    </header>
  )
}
