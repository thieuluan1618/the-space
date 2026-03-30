'use client'

import Image from 'next/image'
import type { ImageProps } from 'next/image'

interface ProtectedImageProps extends Omit<ImageProps, 'draggable'> {
  /** If true, renders an opaque overlay on top of the image (for detail/hero images).
   *  For grid cards leave false so hover/click still works. */
  withOverlay?: boolean
}

export default function ProtectedImage({ withOverlay = false, className, ...props }: ProtectedImageProps) {
  return (
    <div
      className="contents"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Image
        {...props}
        className={`select-none ${className ?? ''}`}
        draggable={false}
        style={props.style}
      />
      {withOverlay && (
        <div
          className="absolute inset-0"
          aria-hidden="true"
          onContextMenu={(e) => e.preventDefault()}
        />
      )}
    </div>
  )
}
