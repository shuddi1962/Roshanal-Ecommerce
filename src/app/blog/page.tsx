import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Blog — Industry Insights, Product Guides & How-tos',
  description: 'Read the latest articles on security systems, marine technology, solar energy, networking, and boat building from the Roshanal Global team.',
  path: '/blog',
})

export const revalidate = 600

export default async function BlogPage() {
  const { data: posts } = await db
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, published_at, tags')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(24)

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Header */}
      <div className="bg-white border-b border-brand-border py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-syne font-800 text-3xl md:text-4xl text-text-1 mb-2">Roshanal Global Blog</h1>
          <p className="font-manrope text-text-3 max-w-xl mx-auto">
            Industry insights, product guides, installation tips, and news from Nigeria&apos;s leading security & marine technology company.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {(!posts || posts.length === 0) ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-text-4 mx-auto mb-4" />
            <h2 className="font-syne font-700 text-2xl text-text-1 mb-2">Blog Coming Soon</h2>
            <p className="font-manrope text-text-3">Our AI is researching and writing articles for you. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(posts as Array<{ id: string; title: string; slug: string; excerpt: string | null; cover_image: string | null; published_at: string | null; tags: string[] }>)
              .map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="bg-white rounded-xl border border-brand-border overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all group">
                <div className="aspect-video bg-brand-offwhite overflow-hidden">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-50 to-brand-offwhite">📝</div>
                  )}
                </div>
                <div className="p-5">
                  {post.tags?.[0] && (
                    <span className="text-[10px] font-manrope font-700 text-brand-blue uppercase tracking-widest mb-2 block">{post.tags[0]}</span>
                  )}
                  <h2 className="font-syne font-700 text-text-1 text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="font-manrope text-text-3 text-sm leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs font-manrope text-text-4">
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.published_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-brand-blue font-600">
                      Read more <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
