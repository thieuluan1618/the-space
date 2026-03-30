'use client'

import Link from 'next/link'
import ProtectedImage from './ProtectedImage'
import type { Collection } from '../../lib/types'

interface CollectionCardProps {
  collection: Collection
  index: number
  lookCount?: number
}

export default function CollectionCard({ collection, index, lookCount }: CollectionCardProps) {
  const isEven = index % 2 === 0
  const roomLabel = `Room ${String(index + 1).padStart(2, '0')}`

  return (
    <article className="group">
      {/* Image frame */}
      <Link
        href={`/seasons/${collection.slug}`}
        className="block no-underline"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="bg-surface-container-high mb-8 aspect-[4/5] relative overflow-hidden">
          {collection.cover_image ? (
            <ProtectedImage
              src={collection.cover_image}
              alt={collection.name}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-12">
              <span className="text-[0.6875rem] uppercase tracking-label text-on-surface-variant text-center">
                {collection.name}
              </span>
            </div>
          )}
          {/* Room label */}
          <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur px-4 py-2 z-10 pointer-events-none">
            <span className="text-[0.6875rem] uppercase tracking-label font-bold text-on-surface">
              {roomLabel}
            </span>
          </div>
        </div>
      </Link>

      {/* Text — alternating alignment */}
      <div className={`space-y-4 ${!isEven ? 'text-right' : ''}`}>
        <div className={`flex justify-between items-baseline ${!isEven ? 'flex-row-reverse' : ''}`}>
          <Link href={`/seasons/${collection.slug}`} className="no-underline">
            <h3 className="text-[1.75rem] font-bold tracking-tight text-inverse-surface leading-tight hover:text-secondary transition-colors duration-300">
              {collection.name}
            </h3>
          </Link>
          {lookCount !== undefined && (
            <span className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary shrink-0 ml-4">
              {String(lookCount).padStart(2, '0')} Pieces
            </span>
          )}
        </div>

        {collection.description && (
          <p className="text-base leading-relaxed text-on-surface-variant">
            {collection.description}
          </p>
        )}

        <Link
          href={`/seasons/${collection.slug}`}
          className={`inline-block text-[0.6875rem] font-medium uppercase tracking-label text-secondary border-b border-secondary/30 pb-1 hover:border-secondary transition-colors duration-300 no-underline ${!isEven ? 'ml-auto' : ''}`}
        >
          Enter this Chamber
        </Link>
      </div>
    </article>
  )
}
