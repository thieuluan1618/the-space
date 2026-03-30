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
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 bg-background z-50 shadow-[0_-4px_20px_0_rgba(0,0,0,0.04)] md:hidden">
      <div className="pb-safe flex w-full">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors duration-200 no-underline ${
                active
                  ? 'text-inverse-surface bg-secondary-container'
                  : 'text-secondary/50 hover:bg-surface-container'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[0.6875rem] uppercase tracking-label font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
