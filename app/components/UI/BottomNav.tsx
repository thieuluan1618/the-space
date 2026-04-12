'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Search, Layers } from 'lucide-react'

const tabs = [
  { label: 'Lobby', href: '/', icon: LayoutGrid },
  { label: 'Seasons', href: '/seasons', icon: Layers },
  { label: 'Works', href: '/works', icon: Search },
]

interface BottomNavProps {
  active?: 'lobby' | 'seasons' | 'works'
}

export default function BottomNav({ active }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (active) {
      const map: Record<string, string> = { lobby: '/', seasons: '/seasons', works: '/works' }
      return map[active] === href
    }
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t border-outline-variant z-50 md:hidden">
      <div className="pb-safe flex w-full px-4 py-2 gap-2">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-1 rounded-pill transition-colors duration-200 no-underline ${
                active
                  ? 'bg-on-surface text-background'
                  : 'text-on-surface/40 hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="font-mono text-[0.625rem] uppercase tracking-label">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
