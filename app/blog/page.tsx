import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import TopAppBar from '../components/UI/TopAppBar'
import BottomNav from '../components/UI/BottomNav'
import { getBlogPosts } from '../lib/supabase'

export const metadata: Metadata = {
  title: 'Behind the Scenes',
  description: 'Behind-the-scenes stories, process notes, and inspirations from NTK Trinh Chau — Vietnamese fashion designer.',
  alternates: { canonical: 'https://trinhchau.com/blog' },
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar rightLabel="The Seasons" rightHref="/seasons" />

      <main className="pt-6 pb-16 px-6 max-w-2xl mx-auto">
        {/* Header */}
        <section className="mb-16">
          <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40 mb-4">
            The Journal
          </p>
          <h1
            className="text-[2.5rem] leading-[1.05] font-light text-on-surface"
            style={{ letterSpacing: '-0.96px' }}
          >
            Behind the Scenes
          </h1>
        </section>

        {/* List */}
        {posts.length > 0 ? (
          <div className="flex flex-col">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-start justify-between py-8 border-t border-outline-variant no-underline hover:bg-surface-container-low -mx-6 px-6 transition-colors duration-200"
              >
                <div className="flex items-center gap-5">
                  {/* Featured image thumbnail */}
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
                      {post.created_at && (
                        <p className="font-mono text-[0.625rem] uppercase tracking-label text-on-surface/30 pt-1">
                          {new Date(post.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-on-surface/20 group-hover:text-on-surface transition-colors duration-200 shrink-0 ml-4 mt-1">
                  →
                </span>
              </Link>
            ))}
            <div className="border-t border-outline-variant" />
          </div>
        ) : (
          <div className="py-24 text-center text-on-surface-variant">
            <p className="font-mono text-[0.6875rem] uppercase tracking-label">No journal entries have yet been published</p>
          </div>
        )}
      </main>

      <BottomNav active="blog" />
    </div>
  )
}