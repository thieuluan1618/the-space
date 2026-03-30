// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Collection, Look } from './types'

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

// Fetch all published collections (with cover image from first look)
export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, slug, sort_order')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) console.error('Error fetching collections:', error)
  const collections = (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    slug: c.slug,
    order: c.sort_order,
  }))

  if (collections.length === 0) return collections

  // Fetch one look per collection to use as cover image
  const { data: coverData } = await supabase
    .from('looks')
    .select('collection_id, photos, sort_order')
    .in('collection_id', collections.map((c) => c.id))
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  // Map collection_id -> first available photo URL
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
    cover_image: coverMap.get(c.id),
  }))
}

// Fetch collection by slug
export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, slug, sort_order')
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
  }
}

// Fetch looks by collection
export async function getLooksByCollection(collectionId: string): Promise<Look[]> {
  const { data, error } = await supabase
    .from('looks')
    .select('id, name, description, tags, photos, collection_id, sort_order')
    .eq('collection_id', collectionId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (error) console.error('Error fetching looks:', error)
  return (data || []).map(mapLook)
}

// Fetch all published looks with optional search and pagination
export async function getAllLooks(
  search?: string,
  page = 1,
  pageSize = 24
): Promise<{ looks: Look[]; total: number }> {
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('looks')
    .select('id, name, description, tags, photos, collection_id, sort_order', { count: 'exact' })
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .range(offset, offset + pageSize - 1)

  if (search && search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  const { data, error, count } = await query

  if (error) console.error('Error fetching all looks:', error)
  return {
    looks: (data || []).map(mapLook),
    total: count ?? 0,
  }
}

// Fetch single look
export async function getLook(lookId: string): Promise<Look | null> {
  const { data, error } = await supabase
    .from('looks')
    .select('id, name, description, tags, photos, collection_id, sort_order')
    .eq('id', lookId)
    .single()

  if (error) console.error('Error fetching look:', error)
  if (!data) return null
  return mapLook(data as Record<string, unknown>)
}
