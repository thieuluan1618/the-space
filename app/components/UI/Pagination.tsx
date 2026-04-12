'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between pt-12 border-t border-outline-variant">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-label bg-on-surface text-background px-5 py-2.5 rounded-pill disabled:opacity-20 disabled:cursor-not-allowed hover:opacity-80 transition-opacity duration-200"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
        Previous
      </button>

      <span className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-label bg-on-surface text-background px-5 py-2.5 rounded-pill disabled:opacity-20 disabled:cursor-not-allowed hover:opacity-80 transition-opacity duration-200"
        aria-label="Next page"
      >
        Next
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
