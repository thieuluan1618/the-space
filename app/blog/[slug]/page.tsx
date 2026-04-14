import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import TopAppBar from '../../components/UI/TopAppBar'
import BottomNav from '../../components/UI/BottomNav'
import { getBlogPostBySlug, getBlogPosts } from '../../lib/supabase'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `https://trinhchau.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      url: `https://trinhchau.com/blog/${post.slug}`,
      images: post.featured_image
        ? [{ url: post.featured_image, width: 1200, height: 630, alt: post.title }]
        : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar rightLabel="The Journal" rightHref="/blog" />

      <main className="pt-6 pb-16 px-6 max-w-2xl mx-auto">
        {/* Back */}
        <div className="mb-10">
          <Link
            href="/blog"
            className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40 hover:text-on-surface transition-colors duration-200 no-underline"
          >
            ← The Journal
          </Link>
        </div>

        {/* Header */}
        <section className="mb-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40 mb-4">
            {post.created_at
              ? new Date(post.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'The Journal'}
          </p>
          <h1
            className="text-[2rem] leading-[1.1] font-light text-on-surface"
            style={{ letterSpacing: '-0.64px' }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p
              className="mt-4 text-base font-light leading-relaxed text-on-surface-variant"
              style={{ letterSpacing: '-0.16px' }}
            >
              {post.excerpt}
            </p>
          )}
        </section>

        {/* Featured image */}
        {post.featured_image && (
          <div className="mb-12 w-full aspect-[4/3] bg-surface-container-high overflow-hidden">
            <Image
              src={post.featured_image}
              alt={post.title}
              width={800}
              height={600}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div
            className="prose prose-sm prose-neutral max-w-none font-light text-on-surface leading-relaxed space-y-6"
            style={{ letterSpacing: '-0.14px' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </main>

      <BottomNav active="blog" />
    </div>
  )
}