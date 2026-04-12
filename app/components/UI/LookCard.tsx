'use client'

import Link from 'next/link'
import ProtectedImage from './ProtectedImage'
import type { Look } from '../../lib/types'

interface LookCardProps {
  look: Look
  priority?: boolean
}

export default function LookCard({ look, priority = false }: LookCardProps) {
  return (
    <Link
      href={`/works/${look.id}`}
      className="group block no-underline"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-surface-container-high aspect-[3/4] relative overflow-hidden">
        {look.image_url ? (
          <ProtectedImage
            src={look.image_url}
            alt={look.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <span className="text-[0.6875rem] uppercase tracking-label text-on-surface-variant text-center">
              {look.name}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-sm font-light text-on-surface leading-tight group-hover:opacity-60 transition-opacity duration-200" style={{ letterSpacing: '-0.14px' }}>
          {look.name}
        </p>
        {look.materials && look.materials !== 'Details forthcoming' && (
          <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40 truncate">
            {look.materials}
          </p>
        )}
      </div>
    </Link>
  )
}
