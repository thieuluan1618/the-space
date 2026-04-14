import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Trinh Chau — The Space',
  description: 'NTK Trinh Chau — thời trang đương đại lấy cảm hứng từ di sản Việt Nam. Browse the seasonal collections of fashion designer Trinh Chau.',
  alternates: { canonical: 'https://trinhchau.com' },
}
import TopAppBar from './components/UI/TopAppBar'
import BottomNav from './components/UI/BottomNav'
import CollectionCard from './components/UI/CollectionCard'
import EmailSignupForm from './components/UI/EmailSignupForm'
import { getCollections } from './lib/supabase'

export default async function LobbyPage() {
  const collections = await getCollections()

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar rightLabel="About" rightHref="/about" />

      <main className="pt-6 pb-16 px-6 max-w-2xl mx-auto">
        {/* Hero */}
        <section className="mb-20">
          <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40 mb-6">
            A Curated Showing
          </p>
          <h1 className="text-[3.5rem] leading-[1.0] font-light text-on-surface mb-8" style={{ letterSpacing: '-1.72px' }}>
            Works Now<br />Showing
          </h1>
          <p className="text-lg font-light leading-relaxed text-on-surface-variant max-w-md" style={{ letterSpacing: '-0.14px' }}>
            Each season a testament to form and fabric. These works are shown as they deserve — without commerce, without haste, in quiet witness to the art of Trinh Chau.
          </p>
          <div className="mt-10 flex gap-3">
            <Link
              href="/works"
              className="inline-flex items-center font-mono text-[0.6875rem] uppercase tracking-label bg-on-surface text-background px-5 py-2.5 rounded-pill hover:opacity-80 transition-opacity duration-200 no-underline"
            >
              Peruse the Archive
            </Link>
            <Link
              href="/seasons"
              className="inline-flex items-center font-mono text-[0.6875rem] uppercase tracking-label border border-on-surface text-on-surface px-5 py-2.5 rounded-pill hover:bg-on-surface hover:text-background transition-colors duration-200 no-underline"
            >
              Browse Seasons
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
        <footer className="mt-32 mb-4 text-center border-t border-outline-variant pt-10">
          <Image
            src="/logo/Black.svg"
            alt="Trinh Chau"
            width={120}
            height={36}
            className="h-9 w-auto opacity-80 mx-auto"
          />
          <EmailSignupForm />
        </footer>
      </main>

      <BottomNav active="lobby" />
    </div>
  )
}