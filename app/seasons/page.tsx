import Link from 'next/link'
import TopAppBar from '../components/UI/TopAppBar'
import BottomNav from '../components/UI/BottomNav'
import { getCollections } from '../lib/supabase'

export default async function SeasonsPage() {
  const collections = await getCollections()

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar rightLabel="The Archive" rightHref="/works" />

      <main className="pt-6 pb-16 px-6 max-w-2xl mx-auto">
        {/* Header */}
        <section className="mb-16">
          <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary mb-4">
            The Collections
          </p>
          <h1 className="text-[2.5rem] leading-[1.05] font-bold tracking-display text-inverse-surface">
            The Seasons
          </h1>
        </section>

        {/* List */}
        {collections.length > 0 ? (
          <div className="flex flex-col">
            {collections.map((collection, index) => (
              <Link
                key={collection.id}
                href={`/seasons/${collection.slug}`}
                className="group flex items-start justify-between py-8 border-t border-outline-variant/15 no-underline hover:bg-surface-container-low -mx-6 px-6 transition-colors duration-200"
              >
                <div className="flex items-baseline gap-6">
                  <span className="text-[0.6875rem] uppercase tracking-label text-on-surface-variant/40 shrink-0 w-8">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-inverse-surface group-hover:text-secondary transition-colors duration-200">
                      {collection.name}
                    </h2>
                    {collection.description && (
                      <p className="text-sm leading-relaxed text-on-surface-variant max-w-sm line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-secondary/30 group-hover:text-secondary transition-colors duration-200 shrink-0 ml-4 mt-1">
                  →
                </span>
              </Link>
            ))}
            <div className="border-t border-outline-variant/15" />
          </div>
        ) : (
          <div className="py-24 text-center text-on-surface-variant">
            <p className="text-[0.6875rem] uppercase tracking-label">No seasons have yet been unveiled</p>
          </div>
        )}
      </main>

      <BottomNav active="seasons" />
    </div>
  )
}
