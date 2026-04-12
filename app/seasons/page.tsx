import Link from 'next/link'
import Image from 'next/image'
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
          <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40 mb-4">
            The Collections
          </p>
          <h1 className="text-[2.5rem] leading-[1.05] font-light text-on-surface" style={{ letterSpacing: '-0.96px' }}>
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
                className="group flex items-start justify-between py-8 border-t border-outline-variant no-underline hover:bg-surface-container-low -mx-6 px-6 transition-colors duration-200"
              >
                <div className="flex items-center gap-5">
                  {/* Cover thumbnail */}
                  <div className="shrink-0 w-16 h-20 bg-surface-container-high overflow-hidden">
                    {collection.cover_image ? (
                      <Image
                        src={collection.cover_image}
                        alt={collection.name}
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
                      <h2 className="text-xl font-light text-on-surface group-hover:opacity-60 transition-opacity duration-200" style={{ letterSpacing: '-0.26px' }}>
                        {collection.name}
                      </h2>
                      {collection.description && (
                        <p className="text-sm font-light leading-relaxed text-on-surface-variant max-w-sm line-clamp-2" style={{ letterSpacing: '-0.14px' }}>
                          {collection.description}
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
            <p className="font-mono text-[0.6875rem] uppercase tracking-label">No seasons have yet been unveiled</p>
          </div>
        )}
      </main>

      <BottomNav active="seasons" />
    </div>
  )
}
