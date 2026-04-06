'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function CookieConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('rg_cookie_consent')
    if (!consent) {
      setTimeout(() => setShow(true), 1500)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('rg_cookie_consent', 'accepted')
    // Trigger geo detection now that consent is given
    window.dispatchEvent(new CustomEvent('rg:consent-accepted'))
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem('rg_cookie_consent', 'declined')
    // Will use NGN as default, no geo tracking
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-brand-navy text-white px-4 py-4 md:py-5 shadow-float border-t border-white/10"
        >
          <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-manrope text-white/80 leading-relaxed">
                We use cookies to detect your location for currency display and to improve your experience.
                Your data is protected under GDPR and NDPR.{' '}
                <Link href="/privacy" className="text-brand-blue hover:underline">Learn more</Link>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 text-sm font-manrope text-white/60 hover:text-white border border-white/20 rounded-lg transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="px-5 py-2 text-sm font-syne font-700 bg-brand-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
