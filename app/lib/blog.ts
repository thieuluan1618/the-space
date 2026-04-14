import { supabase } from './supabase'
import type { BlogPost } from './types'

function mapBlogPost(p: Record<string, unknown>): BlogPost {
  return {
    id: p.id as string,
    title: p.title as string,
    slug: p.slug as string,
    excerpt: (p.excerpt as string) || '',
    content: (p.content as string) || '',
    featured_image: (p.featured_image as string) || '',
    created_at: (p.created_at as string) || '',
    published: (p.published as boolean) ?? false,
    sort_order: (p.sort_order as number) ?? 0,
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, featured_image, created_at, published, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (error) console.error('Error fetching blog posts:', error)
  return (data || []).map((p) => mapBlogPost(p as Record<string, unknown>))
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, featured_image, created_at, published, sort_order')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching blog post by slug:', error)
    return null
  }
  if (!data) return null
  return mapBlogPost(data as Record<string, unknown>)
}