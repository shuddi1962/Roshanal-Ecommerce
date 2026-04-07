'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Stethoscope, Play, CheckCircle, AlertTriangle, XCircle, RefreshCw,
  Database, CreditCard, Image as ImageIcon, Search, Gauge, Shield,
  Clock, ChevronDown, ChevronUp, Wrench, X, BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn, formatDate } from '@/lib/utils'

type CheckStatus = 'ok' | 'warning' | 'error'
type CheckCategory = 'database' | 'payments' | 'media' | 'seo' | 'performance' | 'security'

interface DiagnosticCheck {
  id: string
  check_type: string
  category: CheckCategory
  status: CheckStatus
  issue_found: string | null
  fix_applied: string | null
  details: Record<string, unknown>
  ran_at: string
}

interface DiagnosticSummary {
  lastRun: string | null
  totalChecks: number
  okCount: number
  warningCount: number
  errorCount: number
  score: number
}

const CATEGORY_ICONS: Record<CheckCategory, typeof Database> = {
  database: Database,
  payments: CreditCard,
  media: ImageIcon,
  seo: Search,
  performance: Gauge,
  security: Shield,
}

const CATEGORY_LABELS: Record<CheckCategory, string> = {
  database: 'Database',
  payments: 'Payments',
  media: 'Media',
  seo: 'SEO',
  performance: 'Performance',
  security: 'Security',
}

const STATUS_CONFIG: Record<CheckStatus, { bg: string; text: string; icon: typeof CheckCircle; label: string }> = {
  ok: { bg: 'bg-green-100', text: 'text-success', icon: CheckCircle, label: 'OK' },
  warning: { bg: 'bg-yellow-100', text: 'text-warning', icon: AlertTriangle, label: 'Warning' },
  error: { bg: 'bg-red-100', text: 'text-brand-red', icon: XCircle, label: 'Error' },
}

export default function SiteDoctorContent() {
  const [checks, setChecks] = useState<DiagnosticCheck[]>([])
  const [summary, setSummary] = useState<DiagnosticSummary>({
    lastRun: null,
    totalChecks: 0,
    okCount: 0,
    warningCount: 0,
    errorCount: 0,
    score: 100,
  })
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<CheckCategory | null>(null)
  const [selectedCheck, setSelectedCheck] = useState<DiagnosticCheck | null>(null)
  const [history, setHistory] = useState<Array<{ date: string; errors: number; warnings: number }>>([])

  const loadDiagnostics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/site-doctor')
      const data = await res.json()
      setChecks(data.checks ?? [])
      setSummary(data.summary ?? {
        lastRun: null,
        totalChecks: 0,
        okCount: 0,
        warningCount: 0,
        errorCount: 0,
        score: 100,
      })
      setHistory(data.history ?? [])
    } catch {
      toast.error('Failed to load diagnostic results')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDiagnostics()
  }, [loadDiagnostics])

  const runDiagnostic = async () => {
    setRunning(true)
    try {
      const res = await fetch('/api/cron/site-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Failed to run diagnostic')

      const data = await res.json()
      toast.success(`Diagnostic complete! Site health score: ${data.score}%`)
      loadDiagnostics()
    } catch {
      toast.error('Failed to run diagnostic')
    } finally {
      setRunning(false)
    }
  }

  const applyFix = async (checkId: string) => {
    try {
      const res = await fetch(`/api/site-doctor/fix/${checkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Failed to apply fix')

      toast.success('Fix applied successfully')
      loadDiagnostics()
    } catch {
      toast.error('Failed to apply fix')
    }
  }

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = []
    acc[check.category].push(check)
    return acc
  }, {} as Record<CheckCategory, DiagnosticCheck[]>)

  const getCategoryStatus = (categoryChecks: DiagnosticCheck[]): CheckStatus => {
    if (categoryChecks.some((c) => c.status === 'error')) return 'error'
    if (categoryChecks.some((c) => c.status === 'warning')) return 'warning'
    return 'ok'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-brand-blue" /> Site Doctor
          </h1>
          <p className="font-manrope text-text-3 text-sm mt-0.5">Auto-diagnostic system for system health monitoring</p>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
        >
          {running ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {running ? 'Running...' : 'Run Diagnostic'}
        </button>
      </div>

      {/* Score Card */}
      <div className="bg-white rounded-xl border border-brand-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-syne font-800 text-lg text-text-1">Site Health Score</h2>
            <p className="font-manrope text-text-4 text-sm">
              Last run: {summary.lastRun ? formatDate(summary.lastRun, { hour: '2-digit', minute: '2-digit' }) : 'Never'}
            </p>
          </div>
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center',
            summary.score >= 90 ? 'bg-green-100' : summary.score >= 70 ? 'bg-yellow-100' : 'bg-red-100'
          )}>
            <span className={cn(
              'font-syne font-800 text-2xl',
              summary.score >= 90 ? 'text-success' : summary.score >= 70 ? 'text-warning' : 'text-brand-red'
            )}>
              {summary.score}%
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Checks', value: summary.totalChecks, color: 'text-text-1' },
            { label: 'Passed', value: summary.okCount, color: 'text-success' },
            { label: 'Warnings', value: summary.warningCount, color: 'text-warning' },
            { label: 'Errors', value: summary.errorCount, color: 'text-brand-red' },
          ].map((s) => (
            <div key={s.label} className="bg-brand-offwhite rounded-lg p-3 text-center">
              <div className={cn('font-syne font-800 text-xl', s.color)}>{s.value}</div>
              <div className="font-manrope text-text-4 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History Chart */}
      <div className="bg-white rounded-xl border border-brand-border p-4">
        <h3 className="font-syne font-700 text-text-1 mb-4">Issues Over Time</h3>
        <div className="h-48">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EBF6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#4A5270' }} />
                <YAxis tick={{ fontSize: 12, fill: '#4A5270' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8EBF6' }} />
                <Line type="monotone" dataKey="errors" stroke="#C8191C" strokeWidth={2} name="Errors" />
                <Line type="monotone" dataKey="warnings" stroke="#9C4B10" strokeWidth={2} name="Warnings" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-4 font-manrope text-sm">
              No history data available
            </div>
          )}
        </div>
      </div>

      {/* Check Categories */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-brand-offwhite rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          (Object.keys(groupedChecks) as CheckCategory[]).map((category) => {
            const categoryChecks = groupedChecks[category] || []
            const categoryStatus = getCategoryStatus(categoryChecks)
            const statusConfig = STATUS_CONFIG[categoryStatus]
            const Icon = CATEGORY_ICONS[category]
            const isExpanded = expandedCategory === category

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'bg-white rounded-xl border overflow-hidden',
                  categoryStatus === 'error' ? 'border-red-200' : 'border-brand-border'
                )}
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-brand-offwhite/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', statusConfig.bg)}>
                      <Icon className={cn('w-6 h-6', statusConfig.text)} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-syne font-700 text-text-1">{CATEGORY_LABELS[category]}</h3>
                      <p className="font-manrope text-text-4 text-sm">
                        {categoryChecks.filter((c) => c.status === 'ok').length} of {categoryChecks.length} checks passed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-manrope font-600', statusConfig.bg, statusConfig.text)}>
                      <statusConfig.icon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-text-4" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-brand-border"
                    >
                      <div className="divide-y divide-brand-border">
                        {categoryChecks.map((check) => {
                          const checkStatus = STATUS_CONFIG[check.status]
                          return (
                            <div
                              key={check.id}
                              className={cn(
                                'px-6 py-4 flex items-start gap-4 hover:bg-brand-offwhite/50 transition-colors',
                                check.status === 'error' && 'bg-red-50/50'
                              )}
                            >
                              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', checkStatus.bg)}>
                                <checkStatus.icon className={cn('w-4 h-4', checkStatus.text)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-syne font-600 text-text-1 text-sm">{check.check_type}</span>
                                  <span className="font-manrope text-text-4 text-xs">
                                    {formatDate(check.ran_at, { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {check.issue_found && (
                                  <p className="font-manrope text-text-3 text-sm mb-2">{check.issue_found}</p>
                                )}
                                {check.fix_applied && (
                                  <p className="font-manrope text-success text-xs flex items-center gap-1">
                                    <Wrench className="w-3 h-3" />
                                    Fix applied: {check.fix_applied}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {check.status !== 'ok' && (
                                  <button
                                    onClick={() => setSelectedCheck(check)}
                                    className="p-2 hover:bg-brand-border rounded-lg transition-colors"
                                    title="View details"
                                  >
                                    <BarChart3 className="w-4 h-4 text-text-3" />
                                  </button>
                                )}
                                {check.status === 'error' && (
                                  <button
                                    onClick={() => applyFix(check.id)}
                                    className="p-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    title="Auto-fix"
                                  >
                                    <Wrench className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Check Details Modal */}
      <AnimatePresence>
        {selectedCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', STATUS_CONFIG[selectedCheck.status].bg)}>
                    {React.createElement(STATUS_CONFIG[selectedCheck.status].icon, {
                      className: cn('w-5 h-5', STATUS_CONFIG[selectedCheck.status].text)
                    })}
                  </div>
                  <div>
                    <h3 className="font-syne font-700 text-text-1">{selectedCheck.check_type}</h3>
                    <span className={cn('text-xs font-manrope font-600', STATUS_CONFIG[selectedCheck.status].text)}>
                      {STATUS_CONFIG[selectedCheck.status].label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCheck(null)}
                  className="p-2 hover:bg-brand-offwhite rounded-lg"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {selectedCheck.issue_found && (
                  <div>
                    <label className="font-manrope text-xs text-text-4 uppercase tracking-wider">Issue Found</label>
                    <p className="font-manrope text-text-2 mt-1">{selectedCheck.issue_found}</p>
                  </div>
                )}
                {selectedCheck.fix_applied && (
                  <div>
                    <label className="font-manrope text-xs text-text-4 uppercase tracking-wider">Fix Applied</label>
                    <p className="font-manrope text-success mt-1">{selectedCheck.fix_applied}</p>
                  </div>
                )}
                {Object.keys(selectedCheck.details).length > 0 && (
                  <div>
                    <label className="font-manrope text-xs text-text-4 uppercase tracking-wider">Details</label>
                    <pre className="mt-2 p-3 bg-brand-offwhite rounded-lg text-xs font-mono text-text-2 overflow-auto">
                      {JSON.stringify(selectedCheck.details, null, 2)}
                    </pre>
                  </div>
                )}
                <div className="flex items-center gap-2 text-text-4 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-manrope">Ran at {formatDate(selectedCheck.ran_at, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
