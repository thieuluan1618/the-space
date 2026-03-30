import Link from 'next/link'
import TopAppBar from './components/UI/TopAppBar'
import BottomNav from './components/UI/BottomNav'
import CollectionCard from './components/UI/CollectionCard'
import { getCollections } from './lib/supabase'

export default async function LobbyPage() {
  const collections = await getCollections()

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar rightLabel="About" rightHref="/about" />

      <main className="pt-6 pb-16 px-6 max-w-2xl mx-auto">
        {/* Hero */}
        <section className="mb-20">
          <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary mb-4">
            A Curated Showing
          </p>
          <h1 className="text-[3.5rem] leading-[1.05] font-bold tracking-display text-inverse-surface mb-8">
            Works Now<br />Showing
          </h1>
          <p className="text-lg leading-relaxed text-on-surface-variant max-w-md">
            Each season a testament to form and fabric. These works are shown as they deserve — without commerce, without haste, in quiet witness to the art of Trinh Chau.
          </p>
          <div className="mt-8 flex gap-6">
            <Link
              href="/works"
              className="text-[0.6875rem] font-medium uppercase tracking-label text-secondary border-b border-secondary/30 pb-1 hover:border-secondary transition-colors duration-300 no-underline"
            >
              Peruse the Archive
            </Link>
            <Link
              href="/seasons"
              className="text-[0.6875rem] font-medium uppercase tracking-label text-secondary border-b border-secondary/30 pb-1 hover:border-secondary transition-colors duration-300 no-underline"
            >
              Browse the Seasons
            </Link>
          </div>
        </section>

        {/* Collections */}
        {collections.length > 0 ? (
          <div className="flex flex-col gap-24">
            {collections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-on-surface-variant">
            <p className="text-[0.6875rem] uppercase tracking-label">No works are yet displayed</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-32 mb-4 text-center border-t border-outline-variant/10 pt-10">
          <p className="text-[0.6875rem] uppercase tracking-[0.2em] font-bold text-primary mb-2">
            The Space
          </p>
          <p className="text-[0.6rem] text-on-surface-variant/50 uppercase tracking-label">
            Trinh Chau
          </p>
        </footer>
      </main>

      <BottomNav active="lobby" />
    </div>
  )
}
