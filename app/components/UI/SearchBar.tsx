'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
}

export default function SearchBar({ placeholder = 'Search works...' }: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const query = searchParams.get('q') ?? ''

  const updateQuery = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    params.delete('page') // reset to page 1 on new search
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }, [router, pathname, searchParams])

  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 pointer-events-none">
        <Search size={16} className={isPending ? 'animate-pulse' : ''} />
      </div>
      <input
        type="search"
        defaultValue={query}
        placeholder={placeholder}
        onChange={(e) => updateQuery(e.target.value)}
        className="w-full border border-outline-variant rounded-pill bg-background pl-10 pr-10 py-3 text-sm font-light text-on-surface placeholder:text-on-surface/30 outline-none focus:border-on-surface transition-colors duration-200"
        style={{ letterSpacing: '-0.14px' }}
        aria-label="Search"
      />
      {query && (
        <button
          onClick={() => updateQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
