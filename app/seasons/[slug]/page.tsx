import { notFound } from 'next/navigation'
import Link from 'next/link'
import TopAppBar from '../../components/UI/TopAppBar'
import BottomNav from '../../components/UI/BottomNav'
import LookCard from '../../components/UI/LookCard'
import { getCollectionBySlug, getLooksByCollection } from '../../lib/supabase'

interface SeasonPageProps {
  params: Promise<{ slug: string }>
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)

  if (!collection) notFound()

  const looks = await getLooksByCollection(collection.id)

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar backHref="/seasons" rightLabel="The Seasons" rightHref="/seasons" />

      <main className="pt-6 pb-16 px-6 max-w-2xl mx-auto">
        {/* Season header */}
        <section className="mb-16">
          <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary mb-4">
            <Link href="/seasons" className="no-underline text-secondary hover:text-secondary/70 transition-colors">
              The Seasons
            </Link>
            {' '}·{' '}
            {collection.name}
          </p>
          <h1 className="text-[2.5rem] leading-[1.05] font-bold tracking-display text-inverse-surface mb-6">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-lg leading-relaxed text-on-surface-variant max-w-md">
              {collection.description}
            </p>
          )}
          <p className="mt-4 text-[0.6875rem] uppercase tracking-label text-on-surface-variant">
            {looks.length} {looks.length === 1 ? 'piece' : 'pieces'} within
          </p>
        </section>

        {/* Masonry grid using CSS columns */}
        {looks.length > 0 ? (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {looks.map((look, i) => (
              <div key={look.id} className="break-inside-avoid">
                <LookCard look={look} priority={i < 2} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-on-surface-variant">
            <p className="text-[0.6875rem] uppercase tracking-label">This season holds no pieces as yet</p>
          </div>
        )}
      </main>

      <BottomNav active="seasons" />
    </div>
  )
}
