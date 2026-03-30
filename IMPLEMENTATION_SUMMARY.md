# The Space — Implementation Summary

**Version**: 0.2.0 — 2D Mobile-First Gallery
**Date**: 2026-03-30
**Status**: ✅ Build passing, ready to deploy

---

## What Changed in v0.2.0

The 3D React Three Fiber experience was **parked** in favour of a fast, mobile-first 2D gallery. The goal: ship live immediately, then re-introduce 3D as an optional layer in a future phase.

### Removed from active codebase
- React Three Fiber canvas and 3D scenes
- SPA view-state pattern (`'lobby' | 'collection' | 'detail'`)
- Georgia serif font + old Tailwind colour tokens

### Added
- **5 new pages** using Next.js App Router and Server Components
- **6 new UI components** (TopAppBar, BottomNav, CollectionCard, LookCard, SearchBar, Pagination)
- **Inter font** via `next/font/google`
- **Material Design warm-neutral palette** (full token set in `tailwind.config.js`)
- **URL-driven search + pagination** (`?q=`, `?page=`) — SSR-friendly, shareable
- **2 new Supabase functions**: `getAllLooks` (paginated search) + `getCollectionBySlug`

---

## Architecture

```
Client browser
    │
    ▼
Next.js App Router (Server Components by default)
    │
    ├── / (Lobby)              → getCollections()
    ├── /seasons               → getCollections()
    ├── /seasons/[slug]        → getCollectionBySlug() + getLooksByCollection()
    ├── /works?q=&page=        → getAllLooks(search, page, pageSize=24)
    └── /works/[id]            → getLook() + getLooksByCollection() (for prev/next)
         │
         ▼
    Supabase (PostgreSQL) — read-only, RLS public
```

**Client Components**: `SearchBar` (updates `?q=`), `Pagination` (updates `?page=`), `BottomNav` (reads pathname for active state), `TopAppBar` (uses router.back()).

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `background` | `#faf9f6` | Page background |
| `surface-container-high` | `#e6e9e4` | Image frames |
| `surface-container-low` | `#f4f4f0` | Search input, curator notes |
| `inverse-surface` | `#0d0f0d` | Primary headings |
| `secondary` | `#6a5e45` | Labels, CTAs, accents |
| `on-surface-variant` | `#5c605c` | Body / description text |
| `secondary-container` | `#f2e1c1` | Active bottom nav tab |

- Font: Inter (not Georgia)
- Border radius: `0px` everywhere — `9999px` only for `full`
- No 1px divider lines — section transitions via background shifts

---

## Performance

Build output (Next.js 14):

| Route | First Load JS |
|---|---|
| `/` | 103 kB |
| `/seasons` | 98 kB |
| `/seasons/[slug]` | 103 kB |
| `/works` | 104 kB |
| `/works/[id]` | 103 kB |

- 3D deps (`three`, `@react-three/fiber`, `@react-three/drei`) remain in `package.json` but are tree-shaken — they don't appear in any active import chain.
- Images: `next/image` with `loading="lazy"`, `priority` only on above-the-fold images.

---

## What's Still Needed Before Launch

1. **Supabase data** — add collections and looks with `status = 'published'`
2. **Image uploads** — upload to Supabase Storage, populate `photos[].storage_url`
3. **`.env.local`** — fill in `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Vercel deploy** — push to GitHub, import to Vercel, add env vars

### Optional before launch
- `cover_image` field on `collections` table for lobby card images (currently shows placeholder)
- Per-page `generateMetadata()` for SEO (look name, image in OG tags)

---

## Phase Roadmap

### Phase 1 — 2D MVP ✅ (current)
- Mobile-first gallery with Server Components
- Lobby, Seasons, Works, Look Detail
- Search + pagination
- Supabase read integration

### Phase 2 — Polish
- `generateMetadata` per look/season for SEO
- About / contact page
- Vercel Analytics
- Email signup

### Phase 3 — 3D Re-introduction
- 3D experience as optional desktop overlay (parked files ready)
- Feature flag: show 3D lobby on desktop, 2D on mobile
