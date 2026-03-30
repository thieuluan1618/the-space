# The Space — Trinh Chau

A mobile-first 2D digital gallery for Trinh Chau's fashion design work. Visitors explore curated collections and individual looks in a clean, editorial gallery experience.

## Vision

- **Whitespace** is not emptiness. It is respect for the work.
- **The absence of a "Buy" button** is not an oversight. It is the philosophy.
- **The typography** is not decoration. It is the voice.

## Tech Stack

- **Framework**: Next.js 14 (React 18, App Router)
- **Styling**: Tailwind CSS — material design warm neutrals, Inter font
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Project Structure

```
app/
├── page.tsx                    # Lobby — hero + collection cards
├── seasons/
│   ├── page.tsx                # All seasons
│   └── [slug]/page.tsx         # Season detail
├── works/
│   ├── page.tsx                # All works (search + pagination)
│   └── [id]/page.tsx           # Look detail
├── components/UI/
│   ├── TopAppBar.tsx           # Sticky header
│   ├── BottomNav.tsx           # Mobile bottom nav
│   ├── CollectionCard.tsx      # Lobby card
│   ├── LookCard.tsx            # Look grid card
│   ├── SearchBar.tsx           # URL-param search
│   └── Pagination.tsx          # URL-param pagination
└── lib/
    ├── supabase.ts             # Data queries
    └── types.ts                # TypeScript types
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Set up database
See **SUPABASE_SETUP.md** for the full SQL schema.

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000

## Pages

| Route | Description |
|---|---|
| `/` | Lobby — hero + vertical collection cards |
| `/seasons` | All seasons list |
| `/seasons/[slug]` | Season detail with masonry look grid |
| `/works` | All works — search + pagination |
| `/works/[id]` | Look detail — art frame + metadata + prev/next |

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Content Management

All content is managed in Supabase.

### Add a collection
Insert into `collections` table: `name`, `description`, `slug`, `sort_order`, `status = 'published'`

### Add a look
Insert into `looks` table: `name`, `description`, `tags` (array), `photos` (array of `{storage_url}`), `collection_id`, `sort_order`, `status = 'published'`

### Upload images
Upload to Supabase Storage → copy the public URL → use as `storage_url` in the `photos` array.

## Design System

- **Font**: Inter
- **Colors**: Material Design warm neutrals (`background: #faf9f6`, `secondary: #6a5e45`, `inverse-surface: #0d0f0d`)
- **Radius**: 0px everywhere (architectural aesthetic)
- **No borders** — sections separated by background color shifts only

## Phase Roadmap

### Phase 1 (Live) ✅
- Mobile-first 2D gallery
- Lobby, Seasons, All Works, Look Detail
- Search and pagination
- Supabase integration

### Phase 2 (Next)
- Per-look and per-season SEO metadata (`generateMetadata`)
- Email signup for collection updates
- Analytics (Vercel Analytics)
- About / contact page

### Phase 3 (Future)
- 3D experience re-introduced as an optional desktop mode
- Behind-the-scenes content / blog
