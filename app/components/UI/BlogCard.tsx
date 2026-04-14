import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '../../lib/types'

interface BlogCardProps {
  post: BlogPost
  index: number
}

export default function BlogCard({ post, index }: BlogCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group flex items-start justify-between py-8 border-t border-outline-variant no-underline hover:bg-surface-container-low -mx-6 px-6 transition-colors duration-200"
    >
      <div className="flex items-center gap-5">
        {/* Cover thumbnail */}
        <div className="shrink-0 w-16 h-20 bg-surface-container-high overflow-hidden">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt={post.title}
              width={64}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>

        <div className="flex items-baseline gap-4">
          <span className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/30 shrink-0 w-8">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="space-y-1">
            <h2
              className="text-xl font-light text-on-surface group-hover:opacity-60 transition-opacity duration-200"
              style={{ letterSpacing: '-0.26px' }}
            >
              {post.title}
            </h2>
            {post.excerpt && (
              <p
                className="text-sm font-light leading-relaxed text-on-surface-variant max-w-sm line-clamp-2"
                style={{ letterSpacing: '-0.14px' }}
              >
                {post.excerpt}
              </p>
            )}
            <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/30 pt-1">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>
      <span className="text-on-surface/20 group-hover:text-on-surface transition-colors duration-200 shrink-0 ml-4 mt-1">
        →
      </span>
    </Link>
  )
}