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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md w-full">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          {backHref && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center p-1 text-secondary active:opacity-70 transition-opacity duration-200"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <Link href="/" className="text-xl font-bold tracking-tighter text-inverse-surface no-underline">
            The Space
          </Link>
        </div>

        {rightLabel && (
          rightHref ? (
            <Link
              href={rightHref}
              className="text-[0.6875rem] font-medium uppercase tracking-label text-secondary no-underline"
            >
              {rightLabel}
            </Link>
          ) : (
            <span className="text-[0.6875rem] font-medium uppercase tracking-label text-secondary">
              {rightLabel}
            </span>
          )
        )}
      </div>
    </header>
  )
}
