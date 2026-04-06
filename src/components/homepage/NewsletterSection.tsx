'use client'

import React, { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-brand-navy text-white py-14">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <Mail className="w-10 h-10 text-brand-blue mx-auto mb-4" />
        <h2 className="font-syne font-800 text-2xl md:text-3xl mb-3">Stay in the Loop</h2>
        <p className="text-white/70 font-manrope mb-6 text-sm leading-relaxed">
          Get new product alerts, exclusive deals, and industry insights. No spam — we respect your inbox.
        </p>

        {status === 'success' ? (
          <div className="bg-white/10 rounded-xl py-4 px-6 font-manrope text-white/80">
            ✅ You&apos;re subscribed! Check your email for confirmation.
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-brand-blue text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white font-syne font-700 text-sm px-5 py-3 rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              {status === 'loading' ? 'Subscribing...' : <><span>Subscribe</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}
        {status === 'error' && <p className="mt-2 text-red-400 text-xs">Something went wrong. Please try again.</p>}
        <p className="mt-4 text-white/40 text-xs font-manrope">Unsubscribe any time. We don&apos;t sell your data.</p>
      </div>
    </section>
  )
}
