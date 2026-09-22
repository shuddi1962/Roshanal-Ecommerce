'use client'

/**
 * AI Support Chat Widget
 * - NEVER labelled "AI" or "Bot" — "Shopping Assistant" only
 * - 4 human personas: Sarah Adeyemi, Kemi Okafor, Tunde Nwachukwu, Fatima Aliyu
 * - Feature flag: ai_support_chat
 * - Admin real-time monitoring + invisible jump-in
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const PERSONAS = [
  { id: 'sarah', name: 'Sarah Adeyemi', avatar: 'SA', color: '#1641C4', greeting: "Hello! I'm Sarah, your shopping assistant. How can I help you today?" },
  { id: 'kemi', name: 'Kemi Okafor', avatar: 'KO', color: '#0B6B3A', greeting: "Hi there! I'm Kemi. Looking for something specific? I'm here to help!" },
  { id: 'tunde', name: 'Tunde Nwachukwu', avatar: 'TN', color: '#C8191C', greeting: "Good day! I'm Tunde. How can I assist you today?" },
  { id: 'fatima', name: 'Fatima Aliyu', avatar: 'FA', color: '#9C4B10', greeting: "Welcome to Roshanal Global! I'm Fatima, your shopping assistant." },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AISupportChat() {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Pick a random persona per session
  const [persona] = useState(() => PERSONAS[Math.floor(Math.random() * PERSONAS.length)])

  useEffect(() => {
    // Check feature flag
    fetch('/api/feature-flags/ai_support_chat')
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) => setEnabled(d.enabled ?? false))
      .catch(() => setEnabled(false))
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: persona.greeting,
        timestamp: new Date(),
      }])
    }
  }, [open, messages.length, persona.greeting])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          personaId: persona.id,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = (await res.json()) as { reply?: string }
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply ?? "I'm unable to respond right now. Please call +234 800 ROSHANAL for immediate assistance.",
        timestamp: new Date(),
      }])
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. You can reach us at +234 800 ROSHANAL.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!enabled) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[340px] bg-white rounded-2xl shadow-float border border-brand-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-border" style={{ backgroundColor: persona.color }}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-syne font-700 text-sm shrink-0">
                {persona.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-syne font-700 text-white text-sm">{persona.name}</div>
                <div className="text-white/70 text-[11px] font-manrope">Shopping Assistant · Online</div>
              </div>
              <button onClick={() => setMinimized(true)} className="text-white/70 hover:text-white p-1">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 flex flex-col gap-3 bg-brand-offwhite">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm font-manrope',
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white rounded-tr-sm'
                      : 'bg-white text-text-1 rounded-tl-sm shadow-sm border border-brand-border'
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 border border-brand-border shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 bg-text-4 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-brand-border bg-white">
              <form onSubmit={(e) => { e.preventDefault(); void sendMessage() }} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-sm px-3 py-2 bg-brand-offwhite border border-brand-border rounded-lg placeholder:text-text-4 focus:outline-none focus:border-brand-blue"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 bg-brand-blue hover:bg-blue-700 disabled:bg-brand-border rounded-lg flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized pill */}
      <AnimatePresence>
        {open && minimized && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-float text-white text-sm font-manrope font-600"
            style={{ backgroundColor: persona.color }}
          >
            <span>{persona.name}</span>
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* FAB trigger */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="w-14 h-14 bg-brand-blue hover:bg-blue-700 text-white rounded-full shadow-float flex items-center justify-center transition-colors relative"
          aria-label="Open Shopping Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        </motion.button>
      )}
    </div>
  )
}
