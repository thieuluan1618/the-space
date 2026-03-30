# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Space** is a mobile-first 2D digital gallery for fashion designer Trinh Chau. Built with Next.js 14, Tailwind CSS, and Supabase. Multi-page app with Server Components, search, and pagination.

> The 3D React Three Fiber experience is **parked** — do not re-activate or import those components.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

Multi-page app with Next.js App Router:

```
app/
├── page.tsx                    ← Lobby (Server Component)
├── seasons/
│   ├── page.tsx                ← All seasons list
│   └── [slug]/page.tsx         ← Season detail (masonry grid)
├── works/
│   ├── page.tsx                ← All works (search + pagination)
│   └── [id]/page.tsx           ← Look detail (prev/next nav)
├── components/
│   ├── UI/
│   │   ├── TopAppBar.tsx       ← Sticky header (glassmorphism)
│   │   ├── BottomNav.tsx       ← Mobile bottom nav (Lobby·Seasons·Works)
│   │   ├── CollectionCard.tsx  ← Lobby collection card
│   │   ├── LookCard.tsx        ← Look image card
│   │   ├── SearchBar.tsx       ← Client component, updates ?q= URL param
│   │   └── Pagination.tsx      ← Client component, updates ?page= URL param
│   └── 3d/                     ← PARKED — do not import
│       ├── Lobby.tsx
│       └── CollectionRoom.tsx
├── lib/
│   ├── types.ts                ← Collection, Look interfaces
│   ├── supabase.ts             ← getCollections, getCollectionBySlug,
│   │                              getLooksByCollection, getAllLooks, getLook
│   └── imageLoader.ts
└── globals.css
```

Data flows: Supabase → Server Components (page.tsx, seasons/*, works/*) → UI components.
Search and pagination state lives in URL params (`?q=`, `?page=`), read by Server Components.

## URL Structure

| Route | Description |
|---|---|
| `/` | Lobby — hero + vertical collection cards |
| `/seasons` | All seasons list |
| `/seasons/[slug]` | Season detail — masonry look grid |
| `/works` | All works — search (`?q=`), pagination (`?page=`) |
| `/works/[id]` | Look detail — art frame, placard, prev/next |

## Environment Setup

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Database schema is in `SUPABASE_SETUP.md`. Tables: `collections` (id, name, description, slug, sort_order, status) and `looks` (id, collection_id, name, description, tags, photos, sort_order, status).

## Design System

**Font:** Inter (via `next/font/google`)
**Palette:** Material Design warm neutrals — key tokens:
- `background: #faf9f6` — page background
- `surface-container-high: #e6e9e4` — image frames, cards
- `inverse-surface: #0d0f0d` — primary headings
- `secondary: #6a5e45` — labels, CTAs, accents
- `on-surface-variant: #5c605c` — body text, descriptions
- `outline-variant: #afb3ae` — subtle dividers

**Border radius:** `0px` everywhere (full: 9999px only)
**Labels:** `text-[0.6875rem] uppercase tracking-label font-medium`
**Display headings:** `tracking-display` (`-0.04em`)

## Key Constraints

- **No commerce** — no cart, checkout, or buy buttons (by design)
- **No borders** for sectioning — use background color shifts instead
- **No rounded corners** — architectural/editorial aesthetic
- All Supabase queries are read-only; no auth in MVP
- Images use `next/image` with `loading="lazy"` (first 2–4 images use `priority`)

## Parked Files (3D — do not import or modify)

- `app/components/3d/Lobby.tsx`
- `app/components/3d/CollectionRoom.tsx`
- `app/components/Scene.tsx`
- `app/components/UI/LookDetail.tsx` (old modal, superseded by `/works/[id]`)
- `app/components/UI/Navigation.tsx` (old nav, superseded by TopAppBar)
- `app/components/UI/LoadingScreen.tsx`
