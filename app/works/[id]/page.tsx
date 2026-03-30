import { notFound } from 'next/navigation'
import Link from 'next/link'
import TopAppBar from '../../components/UI/TopAppBar'
import BottomNav from '../../components/UI/BottomNav'
import ProtectedImage from '../../components/UI/ProtectedImage'
import { getLook, getLooksByCollection } from '../../lib/supabase'
import type { Look } from '../../lib/types'

interface LookPageProps {
  params: Promise<{ id: string }>
}

export default async function LookPage({ params }: LookPageProps) {
  const { id } = await params
  const look = await getLook(id)

  if (!look) notFound()

  // Fetch siblings for prev/next navigation
  const siblings = await getLooksByCollection(look.collection_id)
  const currentIndex = siblings.findIndex((l) => l.id === look.id)
  const prev: Look | null = currentIndex > 0 ? siblings[currentIndex - 1] : null
  const next: Look | null = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar backHref="/works" />

      <main className="max-w-screen-md mx-auto">
        {/* Art frame — large protected image */}
        <section className="px-6 pt-8 pb-12">
          <div className="bg-surface-container-high p-8 md:p-12">
            <div className="relative aspect-[3/4] w-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
              {look.image_url ? (
                <>
                  <ProtectedImage
                    src={look.image_url}
                    alt={look.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                    priority
                  />
                  {/* Solid overlay: blocks drag-to-save on the detail view */}
                  <div className="absolute inset-0" aria-hidden="true" />
                </>
              ) : (
                <div className="w-full h-full bg-surface-container flex items-center justify-center">
                  <span className="text-[0.6875rem] uppercase tracking-label text-on-surface-variant">
                    {look.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Metadata */}
        <section className="px-6 space-y-12 pb-16">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-[2.5rem] leading-none font-extrabold tracking-display text-inverse-surface">
              {look.name}
            </h1>
          </div>

          {/* Placard grid */}
          <div className="grid grid-cols-2 gap-8 py-8 border-t border-b border-outline-variant/10">
            {look.materials && look.materials !== 'Details forthcoming' && (
              <div className="space-y-1">
                <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary/60">
                  Of What Cloth
                </p>
                <p className="text-on-surface text-sm leading-relaxed">{look.materials}</p>
              </div>
            )}
            {look.inspiration && (
              <div className="space-y-1 col-span-2">
                <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary/60">
                  Whereof it Speaks
                </p>
                <p className="text-on-surface text-sm leading-relaxed italic">{look.inspiration}</p>
              </div>
            )}
          </div>

          {/* Season link */}
          <div className="space-y-1">
            <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary/60">
              From the Season
            </p>
            <Link
              href="/seasons"
              className="text-sm text-secondary border-b border-secondary/30 pb-0.5 hover:border-secondary transition-colors no-underline"
            >
              Enter the Season →
            </Link>
          </div>
        </section>

        {/* Prev / Next */}
        {(prev || next) && (
          <section className="mt-8 mb-12 px-6">
            <div className="flex items-center justify-between border-t border-outline-variant/15 pt-8">
              {prev ? (
                <Link
                  href={`/works/${prev.id}`}
                  className="group flex flex-col items-start gap-3 no-underline active:opacity-70"
                >
                  <div className="flex items-center gap-2 text-secondary/40 group-hover:text-secondary transition-colors">
                    <span className="text-sm">←</span>
                    <span className="text-[0.6875rem] uppercase tracking-label font-medium">Previous</span>
                  </div>
                  <span className="text-base font-medium text-on-surface">{prev.name}</span>
                </Link>
              ) : <div />}

              {next ? (
                <Link
                  href={`/works/${next.id}`}
                  className="group flex flex-col items-end gap-3 no-underline text-right active:opacity-70"
                >
                  <div className="flex items-center gap-2 text-secondary/40 group-hover:text-secondary transition-colors">
                    <span className="text-[0.6875rem] uppercase tracking-label font-medium">Next</span>
                    <span className="text-sm">→</span>
                  </div>
                  <span className="text-base font-medium text-on-surface">{next.name}</span>
                </Link>
              ) : <div />}
            </div>
          </section>
        )}
      </main>

      <BottomNav active="works" />
    </div>
  )
}
