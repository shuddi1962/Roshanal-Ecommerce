'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/account/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password. Please try again.')
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
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
          <h1 className="font-syne font-800 text-2xl text-text-1 mb-1">Welcome back</h1>
          <p className="text-text-3 font-manrope text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm font-manrope text-brand-red">
              {error}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-brand-border rounded-xl text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-manrope font-600 text-text-2 text-sm">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand-blue hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border border-brand-border rounded-xl text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-2 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 disabled:opacity-60 text-white font-syne font-700 py-3 rounded-xl transition-colors active:scale-[0.98]"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-manrope text-text-3">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-brand-blue font-600 hover:underline">Create one</Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-text-4 font-manrope">
          Protected by Roshanal Global Security. <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
