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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
        <Search size={16} className={isPending ? 'animate-pulse' : ''} />
      </div>
      <input
        type="search"
        defaultValue={query}
        placeholder={placeholder}
        onChange={(e) => updateQuery(e.target.value)}
        className="w-full bg-surface-container-low pl-10 pr-10 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:bg-surface-container transition-colors duration-200 border-0"
        aria-label="Search"
      />
      {query && (
        <button
          onClick={() => updateQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
