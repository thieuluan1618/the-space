// app/lib/types.ts

export interface Collection {
  id: string
  name: string
  description: string
  slug: string
  order: number
  cover_image?: string
  created_at?: string
}

export interface Look {
  id: string
  collection_id: string
  name: string
  materials: string
  inspiration: string
  image_url: string
  order: number
  created_at?: string
}

export type ViewState = 'lobby' | 'collection' | 'detail'
