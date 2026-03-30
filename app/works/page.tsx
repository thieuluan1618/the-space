import { Suspense } from 'react'
import TopAppBar from '../components/UI/TopAppBar'
import BottomNav from '../components/UI/BottomNav'
import LookCard from '../components/UI/LookCard'
import SearchBar from '../components/UI/SearchBar'
import Pagination from '../components/UI/Pagination'
import { getAllLooks } from '../lib/supabase'

const PAGE_SIZE = 24

interface WorksPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function WorksPage({ searchParams }: WorksPageProps) {
  const params = await searchParams
  const query = params.q ?? ''
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const { looks, total } = await getAllLooks(query, page, PAGE_SIZE)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar />

      <main className="pt-6 pb-16 px-6 max-w-2xl mx-auto">
        {/* Header */}
        <section className="mb-10">
          <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary mb-4">
            All Works
          </p>
          <h1 className="text-[2.5rem] leading-[1.05] font-bold tracking-display text-inverse-surface mb-2">
            The Archive
          </h1>
          {total > 0 && (
            <p className="text-[0.6875rem] uppercase tracking-label text-on-surface-variant">
              {total} {total === 1 ? 'piece' : 'pieces'}
              {query && ` answering "${query}"`}
            </p>
          )}
        </section>

        {/* Search */}
        <div className="mb-10">
          <Suspense fallback={<div className="h-12 bg-surface-container-low" />}>
            <SearchBar placeholder="Seek by name..." />
          </Suspense>
        </div>

        {/* Grid */}
        {looks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
            {looks.map((look, i) => (
              <LookCard key={look.id} look={look} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-on-surface-variant">
            <p className="text-[0.6875rem] uppercase tracking-label mb-2">
              No pieces answer this search
            </p>
            {query && (
              <p className="text-sm italic text-on-surface-variant/60 mt-2">
                Seek another word, or browse all works below
              </p>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16">
            <Suspense fallback={null}>
              <Pagination currentPage={page} totalPages={totalPages} />
            </Suspense>
          </div>
        )}
      </main>

      <BottomNav active="works" />
    </div>
  )
}
