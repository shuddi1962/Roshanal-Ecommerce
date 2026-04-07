'use client'

import React, { useState, useEffect } from 'react'
import { Star, Search, CheckCircle, XCircle, MessageSquare, ThumbsUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  product_name: string
  product_slug: string
  rating: number
  title: string | null
  body: string
  images: string[]
  is_verified: boolean
  staff_reply: string | null
  helpful_count: number
  user_name: string
  user_email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function ReviewsAdminContent() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    void (async () => {
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') params.set('status', filter)
        const res = await fetch(`/api/admin/reviews?${params}`)
        if (res.ok) {
          const data = (await res.json()) as { reviews?: Review[] }
          setReviews(data.reviews ?? [])
        }
      } catch {}
      setLoading(false)
    })()
  }, [filter])

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }

  const submitReply = async (id: string) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staff_reply: replyText }),
    })
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, staff_reply: replyText } : r))
    setReplyingTo(null)
    setReplyText('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1">Product Reviews</h1>
          <p className="text-text-3 font-manrope text-sm mt-0.5">Manage customer reviews and responses.</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Pending', count: reviews.filter((r) => r.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
            { label: 'Approved', count: reviews.filter((r) => r.status === 'approved').length, color: 'bg-green-50 text-success' },
            { label: 'Rejected', count: reviews.filter((r) => r.status === 'rejected').length, color: 'bg-red-50 text-brand-red' },
          ].map((s) => (
            <div key={s.label} className={cn('px-4 py-2 rounded-lg text-center', s.color)}>
              <div className="font-syne font-800 text-lg">{s.count}</div>
              <div className="text-[10px] font-manrope font-600 uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..."
              className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-blue animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16"><Star className="w-12 h-12 text-text-4 mx-auto mb-3" /><p className="text-text-3 font-manrope">No reviews found.</p></div>
        ) : (
          <div className="divide-y divide-brand-border">
            {reviews.map((review) => (
              <div key={review.id} className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn('w-4 h-4', i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300')} />
                        ))}
                      </div>
                      {review.title && <span className="font-syne font-700 text-sm text-text-1">{review.title}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-manrope text-text-4 mb-1">
                      <span className="font-600 text-text-2">{review.user_name}</span>
                      <span>·</span>
                      <span>{new Date(review.created_at).toLocaleDateString('en-NG')}</span>
                      {review.is_verified && <span className="text-success font-600">✓ Verified Purchase</span>}
                    </div>
                    <p className="text-sm font-manrope text-text-2 leading-relaxed">{review.body}</p>
                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-brand-border" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {review.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(review.id, 'approved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-success text-xs font-manrope font-600 rounded-lg hover:bg-green-100 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => updateStatus(review.id, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-brand-red text-xs font-manrope font-600 rounded-lg hover:bg-red-100 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {review.status === 'approved' && (
                      <button onClick={() => updateStatus(review.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-brand-red text-xs font-manrope font-600 rounded-lg hover:bg-red-100 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    <button onClick={() => { setReplyingTo(review.id); setReplyText(review.staff_reply ?? '') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-brand-blue text-xs font-manrope font-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> Reply
                    </button>
                  </div>
                </div>

                {review.staff_reply && (
                  <div className="ml-4 pl-4 border-l-2 border-brand-blue bg-blue-50 rounded-r-lg p-3">
                    <div className="text-[10px] font-manrope font-600 text-brand-blue uppercase tracking-wider mb-1">Roshanal Response</div>
                    <p className="text-sm font-manrope text-text-2">{review.staff_reply}</p>
                  </div>
                )}

                {replyingTo === review.id && (
                  <div className="mt-3 flex gap-2">
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your response..."
                      className="flex-1 border border-brand-border rounded-lg px-3 py-2 text-sm font-manrope focus:outline-none focus:border-brand-blue resize-none" rows={3} />
                    <div className="flex flex-col gap-2">
                      <button onClick={() => void submitReply(review.id)}
                        className="px-4 py-2 bg-brand-blue text-white font-syne font-700 text-xs rounded-lg hover:bg-blue-700">Save Reply</button>
                      <button onClick={() => setReplyingTo(null)}
                        className="px-4 py-2 border border-brand-border text-text-3 font-manrope text-xs rounded-lg hover:bg-brand-offwhite">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs font-manrope text-text-4">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {review.helpful_count} helpful</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-700',
                    review.status === 'approved' ? 'bg-green-100 text-success' :
                    review.status === 'rejected' ? 'bg-red-100 text-brand-red' :
                    'bg-amber-100 text-amber-600')}>
                    {review.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
