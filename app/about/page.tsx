import TopAppBar from '../components/UI/TopAppBar'
import BottomNav from '../components/UI/BottomNav'
import Link from 'next/link'

const journey = [
  {
    index: '01',
    era: 'The Beginning',
    title: 'The First Stitch',
    body: 'Born into a world of fabric and form, Trinh Chau discovered fashion as a language — a way to speak without words. Each early piece was a sentence, hand-sewn in silence.',
    align: 'left',
  },
  {
    index: '02',
    era: 'Formal Study',
    title: 'The Atelier Years',
    body: 'Rigorous training honed her eye for construction and proportion. She learned that restraint is the highest form of craft — that what is left out defines the work as much as what remains.',
    align: 'right',
  },
  {
    index: '03',
    era: 'First Collections',
    title: 'The Seasonal Debut',
    body: 'Her debut collections drew on the textures of Vietnamese landscapes — the blurred margins between monsoon and dry season, the layered greens of the delta — translated into silhouette and drape.',
    align: 'left',
  },
  {
    index: '04',
    era: 'Now',
    title: 'The Ongoing Work',
    body: 'Each new season is a continuation, not a reinvention. The vocabulary deepens, the silhouettes evolve, and the commitment to garments that outlast their moment remains absolute.',
    align: 'right',
  },
]

const press = [
  {
    quote: '"A designer who understands that fashion is, at its core, an act of patience."',
    source: 'Vogue Vietnam',
  },
  {
    quote: '"Her work achieves what few can — a quietness that commands the room."',
    source: 'L\'Officiel',
  },
  {
    quote: '"Each piece is an argument for slowness in an industry that never stops moving."',
    source: 'Harper\'s Bazaar',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar backHref="/" rightLabel="The Works" rightHref="/works" />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Portrait block */}
          <div className="w-full aspect-[3/4] max-h-[70vh] bg-surface-container-high relative overflow-hidden">
            {/* Placeholder frame — replace with <Image> once a portrait is available */}
            <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent">
              <div>
                <p className="text-[0.6875rem] uppercase tracking-label font-medium text-on-secondary/60 mb-2">
                  The Designer
                </p>
              </div>
            </div>
          </div>

          {/* Name + quote overlay card */}
          <div className="px-6 -mt-12 relative z-10">
            <div className="bg-background pt-10 pb-8">
              <h1 className="text-[3.5rem] leading-[1.0] font-bold tracking-display text-inverse-surface mb-1">
                Trinh
              </h1>
              <h1 className="text-[3.5rem] leading-[1.0] font-bold tracking-display text-secondary mb-6">
                Chau
              </h1>
              <p className="text-sm leading-relaxed text-on-surface-variant max-w-xs italic">
                &ldquo;Fabric is the medium. Silence is the method. The garment is what remains when both are removed.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* ── Statement ── */}
        <section className="bg-surface-container-low px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary mb-10">
              On the Work
            </p>
            <p className="text-lg leading-[1.7] text-on-surface mb-6">
              Trinh Chau works at the intersection of heritage and restraint. Her collections are not seasonal products — they are arguments. Arguments for craft over trend, for material honesty over spectacle, for the body as the final arbiter of form.
            </p>
            <p className="text-base leading-[1.7] text-on-surface-variant mb-6">
              Trained in both Western tailoring traditions and deeply informed by the textile cultures of Vietnam, her work holds these two inheritances in productive tension. A jacket may be cut with European precision and finished with Vietnamese silk that carries a century of weaving knowledge in its hand.
            </p>
            <p className="text-base leading-[1.7] text-on-surface-variant">
              The result is clothing that rewards extended attention — that reveals itself slowly, the way a room does when you sit in it long enough for your eyes to adjust.
            </p>
          </div>
        </section>

        {/* ── The Journey ── */}
        <section className="bg-background px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary mb-3">
              A Life in Cloth
            </p>
            <h2 className="text-[2rem] leading-[1.05] font-bold tracking-display text-inverse-surface mb-16">
              The Designer&rsquo;s Journey
            </h2>

            <div className="flex flex-col gap-0">
              {journey.map((item, i) => (
                <div
                  key={i}
                  className={`py-10 border-t border-outline-variant/15 ${
                    item.align === 'right' ? 'pl-10' : ''
                  }`}
                >
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-[0.6875rem] uppercase tracking-label text-on-surface-variant/30 shrink-0 w-6">
                      {item.index}
                    </span>
                    <span className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary">
                      {item.era}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-inverse-surface mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant max-w-sm">
                    {item.body}
                  </p>
                </div>
              ))}
              <div className="border-t border-outline-variant/15" />
            </div>
          </div>
        </section>

        {/* ── Press ── */}
        <section className="bg-surface-container-low px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary mb-3">
              Press & Recognition
            </p>
            <h2 className="text-[2rem] leading-[1.05] font-bold tracking-display text-inverse-surface mb-12">
              In Their Words
            </h2>

            <div className="flex flex-col gap-6">
              {press.map((item, i) => (
                <div key={i} className="bg-background p-8">
                  <p className="text-base leading-[1.7] text-on-surface mb-4 italic">
                    {item.quote}
                  </p>
                  <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary">
                    {item.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Archive CTA ── */}
        <section className="bg-background px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <p className="text-[0.6875rem] uppercase tracking-label font-medium text-secondary mb-6">
              The Work Itself
            </p>
            <h2 className="text-[2rem] leading-[1.05] font-bold tracking-display text-inverse-surface mb-8">
              Enter the Archive
            </h2>
            <p className="text-base leading-relaxed text-on-surface-variant max-w-xs mb-10">
              The collections are best experienced without commentary. Browse them in the order they were made, or follow your eye.
            </p>
            <div className="flex gap-6 flex-wrap">
              <Link
                href="/seasons"
                className="inline-block bg-secondary text-on-secondary text-[0.6875rem] uppercase tracking-label font-medium px-6 py-4 hover:bg-secondary-dim transition-colors duration-300 no-underline"
              >
                Browse the Seasons
              </Link>
              <Link
                href="/works"
                className="text-[0.6875rem] font-medium uppercase tracking-label text-secondary border-b border-secondary/30 pb-1 hover:border-secondary transition-colors duration-300 no-underline self-end mb-[1px]"
              >
                Peruse the Archive
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-surface-container px-6 py-10">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <p className="text-[0.6875rem] uppercase tracking-[0.2em] font-bold text-primary">
              The Space
            </p>
            <p className="text-[0.6rem] text-on-surface-variant/50 uppercase tracking-label">
              A curated showing — Trinh Chau
            </p>
          </div>
        </footer>
      </main>

      <BottomNav />
    </div>
  )
}
