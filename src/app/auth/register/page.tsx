'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Registration failed')
        setLoading(false)
        return
      }

      // Auto-login after registration
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      router.push('/account/dashboard')
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-blue-800 flex items-center justify-center shadow-lg">
              <span className="font-syne font-800 text-white text-xl">RS</span>
            </div>
            <div className="text-left">
              <div className="font-syne font-800 text-brand-navy text-xl">Roshanal Global</div>
              <div className="font-manrope text-brand-red text-[10px] font-600 uppercase tracking-wider">Infotech Limited</div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-8 shadow-card">
          <h1 className="font-syne font-800 text-2xl text-text-1 mb-1">Create an account</h1>
          <p className="text-text-3 font-manrope text-sm mb-6">Start shopping with Roshanal Global</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm font-manrope text-brand-red">{error}</div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+234 xxx xxxx xxx' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  required
                  className="w-full px-4 py-3 border border-brand-border rounded-xl text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            ))}

            <div>
              <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 border border-brand-border rounded-xl text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:border-brand-blue transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-4">
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 disabled:opacity-60 text-white font-syne font-700 py-3 rounded-xl transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-manrope text-text-3">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-blue font-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
