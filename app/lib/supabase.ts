// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Collection, Look, SubscriptionStatus } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

/** Converts a storage_url into a full HTTPS URL.
 *  Handles legacy DB paths: "/looks_example/collection_{name}/{file}"
 *  → "https://xxx.supabase.co/storage/v1/object/public/media/looks/{slug}/{file}"
 */
function resolveStorageUrl(storageUrl: string): string {
  if (!storageUrl) return ''
  if (storageUrl.startsWith('http')) return storageUrl
  const base = supabaseUrl.replace(/\/$/, '')
  // Legacy path pattern: /looks_example/collection_{slug_underscored}/{filename}
  const legacy = storageUrl.match(/^\/looks_example\/collection_([^/]+)\/(.+)$/)
  if (legacy) {
    const slug = legacy[1].replace(/_/g, '-').toLowerCase()
    const filename = legacy[2]
    return `${base}/storage/v1/object/public/media/looks/${slug}/${filename}`
  }
  const path = storageUrl.startsWith('/') ? storageUrl : `/${storageUrl}`
  return `${base}/storage/v1/object/public${path}`
}

function mapLook(l: Record<string, unknown>): Look {
  return {
    id: l.id as string,
    collection_id: l.collection_id as string,
    name: l.name as string,
    materials: Array.isArray(l.tags) && l.tags.length > 0 ? (l.tags as string[]).join(', ') : 'Details forthcoming',
    inspiration: (l.description as string) || '',
    image_url: Array.isArray(l.photos) && l.photos.length > 0 ? resolveStorageUrl((l.photos as Array<{ storage_url: string }>)[0].storage_url) : '',
    order: l.sort_order as number,
  }
}

// Fetch all published collections (with cover image from collection field or first look)
export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, slug, sort_order, cover_photo')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) console.error('Error fetching collections:', error)
  const collections = (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    slug: c.slug,
    order: c.sort_order,
    cover_image: c.cover_photo
      ? resolveStorageUrl((c.cover_photo as { storage_url: string }).storage_url)
      : undefined,
  }))

  if (collections.length === 0) return collections

  // For collections without an explicit cover_image, fall back to first look photo
  const needsCover = collections.filter((c) => !c.cover_image)
  if (needsCover.length > 0) {
    const { data: coverData } = await supabase
      .from('looks')
      .select('collection_id, photos, sort_order')
      .in('collection_id', needsCover.map((c) => c.id))
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    const coverMap = new Map<string, string>()
    for (const row of (coverData || [])) {
      if (!coverMap.has(row.collection_id)) {
        const raw = Array.isArray(row.photos) && row.photos.length > 0
          ? (row.photos[0].storage_url as string)
          : undefined
        const url = raw ? resolveStorageUrl(raw) : undefined
        if (url) coverMap.set(row.collection_id, url)
      }
    }

    return collections.map((c) => ({
      ...c,
      cover_image: c.cover_image || coverMap.get(c.id),
    }))
  }

  return collections
}

// Fetch collection by slug
export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, slug, sort_order, cover_photo')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching collection by slug:', error)
    return null
  }
  if (!data) return null
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    slug: data.slug,
    order: data.sort_order,
    cover_image: data.cover_photo
      ? resolveStorageUrl((data.cover_photo as { storage_url: string }).storage_url)
      : undefined,
  }
}

// Fetch looks for a collection
export async function getLooksByCollection(collectionId: string): Promise<Look[]> {
  const { data, error } = await supabase
    .from('looks')
    .select('id, collection_id, name, description, tags, photos, sort_order')
    .eq('collection_id', collectionId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching looks:', error)
    return []
  }
  return (data || []).map((l) => mapLook(l as Record<string, unknown>))
}

// Fetch a single look by id
export async function getLookById(lookId: string): Promise<Look | null> {
  const { data, error } = await supabase
    .from('looks')
    .select('id, collection_id, name, description, tags, photos, sort_order')
    .eq('id', lookId)
    .single()

  if (error) {
    console.error('Error fetching look by id:', error)
    return null
  }
  if (!data) return null
  return mapLook(data as Record<string, unknown>)
}

/**
 * email_subscribers table schema:
 *
 * CREATE TABLE email_subscribers (
 *   id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email       text NOT NULL UNIQUE,
 *   subscribed_at timestamptz NOT NULL DEFAULT now(),
 *   active      boolean NOT NULL DEFAULT true
 * );
 *
 * Row-level security: INSERT allowed for anon role (no SELECT/UPDATE/DELETE for anon).
 * Index: CREATE UNIQUE INDEX email_subscribers_email_idx ON email_subscribers (email);
 */

export interface EmailSubscriber {
  id: string
  email: string
  subscribed_at: string
  active: boolean
}

/**
 * Fetch all active email subscribers.
 * Intended for server-side / admin use only — the anon key will be blocked
 * by RLS unless you grant SELECT to anon or use the service role key.
 */
export async function getEmailSubscribers(): Promise<EmailSubscriber[]> {
  const { data, error } = await supabase
    .from('email_subscribers')
    .select('id, email, subscribed_at, active')
    .eq('active', true)
    .order('subscribed_at', { ascending: false })

  if (error) {
    console.error('Error fetching email subscribers:', error)
    return []
  }
  return (data || []) as EmailSubscriber[]
}

/**
 * Subscribe an email address to collection updates.
 * Inserts a new row; if the email already exists the unique constraint
 * causes an error which is surfaced as status 'error' with a friendly message.
 *
 * Returns an object compatible with EmailSignupResponse from types.ts.
 */
export async function subscribeEmail(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' }
  }

  const { error } = await supabase
    .from('email_subscribers')
    .insert({ email: email.trim().toLowerCase() })

  if (error) {
    // Unique violation: Postgres error code 23505
    if (error.code === '23505') {
      return { success: false, message: 'This email is already subscribed.' }
    }
    console.error('Error subscribing email:', error)
    return { success: false, message: 'Something went wrong. Please try again.' }
  }

  return { success: true, message: 'You are now subscribed to collection updates.' }
}