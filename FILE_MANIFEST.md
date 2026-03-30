# The Space — File Manifest

## Active Files

### Configuration
- `package.json` — Dependencies and scripts
- `next.config.js` — Next.js config (image remotePatterns)
- `tailwind.config.js` — Material design color tokens, Inter font, 0px radius
- `tsconfig.json` — TypeScript config
- `postcss.config.js` — PostCSS config
- `.env.example` — Environment variables template

### App Pages
- `app/layout.tsx` — Root layout, Inter font, metadata
- `app/globals.css` — Base styles, safe-area padding
- `app/page.tsx` — Lobby (Server Component)
- `app/seasons/page.tsx` — All seasons list (Server Component)
- `app/seasons/[slug]/page.tsx` — Season detail (Server Component)
- `app/works/page.tsx` — All works with search + pagination (Server Component)
- `app/works/[id]/page.tsx` — Look detail with prev/next (Server Component)

### UI Components (active)
- `app/components/UI/TopAppBar.tsx` — Sticky header with glassmorphism + back button
- `app/components/UI/BottomNav.tsx` — Mobile bottom nav (Lobby · Seasons · Works)
- `app/components/UI/CollectionCard.tsx` — Lobby collection card (alternating alignment)
- `app/components/UI/LookCard.tsx` — Look image card linking to `/works/[id]`
- `app/components/UI/SearchBar.tsx` — Client, updates `?q=` URL param
- `app/components/UI/Pagination.tsx` — Client, updates `?page=` URL param

### Library
- `app/lib/types.ts` — `Collection`, `Look`, `ViewState` interfaces
- `app/lib/supabase.ts` — `getCollections`, `getCollectionBySlug`, `getLooksByCollection`, `getAllLooks`, `getLook`
- `app/lib/imageLoader.ts` — Image loading utilities

### Documentation
- `README.md` — Project overview and setup
- `CLAUDE.md` — AI assistant guidance
- `SUPABASE_SETUP.md` — Database schema and setup SQL
- `FILE_MANIFEST.md` — This file

---

## Parked Files (3D — do not import)

These files are preserved for a future Phase 3 re-introduction of the 3D experience.

- `app/components/Scene.tsx` — React Three Fiber canvas manager
- `app/components/3d/Lobby.tsx` — 3D museum lobby
- `app/components/3d/CollectionRoom.tsx` — 3D gallery room
- `app/components/UI/LookDetail.tsx` — Old modal overlay (superseded by `/works/[id]`)
- `app/components/UI/Navigation.tsx` — Old breadcrumb nav (superseded by TopAppBar)
- `app/components/UI/LoadingScreen.tsx` — Old loading state

---

## Stats

| Category | Files | Notes |
|---|---|---|
| Pages | 5 | All Server Components |
| Active UI components | 6 | 2 Client, 4 Server |
| Library modules | 3 | supabase, types, imageLoader |
| Config | 6 | next, tailwind, ts, postcss, pkg, env |
| Parked (3D) | 6 | Preserved, not imported |
| **Total active** | **20** | |

---

**Last Updated**: 2026-03-30
**Version**: 0.2.0 (2D MVP)
