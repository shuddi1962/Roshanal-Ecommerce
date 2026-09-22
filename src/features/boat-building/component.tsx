'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, Download, Share2, Phone, Mail, MessageSquare } from 'lucide-react'
import { generateBoatIllustration } from '@/lib/boat-illustration'
import type { BoatIllustrationConfig } from '@/lib/boat-illustration'
import { cn } from '@/lib/utils'

const STEPS = ['Vessel Type', 'Dimensions', 'Engine', 'Hull & Finish', 'Cabin & Features', 'Visual', 'Next Steps']

const VESSEL_TYPES = [
  { id: 'fishing-boat', name: 'Fishing Boat', desc: 'Optimised for fishing — rod holders, livewells, stable hull', price: '₦2.5M+', icon: '🎣' },
  { id: 'passenger-ferry', name: 'Passenger Ferry', desc: 'High capacity passenger transport for rivers and creeks', price: '₦8M+', icon: '⛴️' },
  { id: 'patrol-boat', name: 'Patrol / Security Boat', desc: 'Fast, agile craft for security and enforcement operations', price: '₦5M+', icon: '🚔' },
  { id: 'leisure-boat', name: 'Leisure Boat', desc: 'Recreational cruiser for family outings and water sports', price: '₦3.5M+', icon: '🏖️' },
  { id: 'work-boat', name: 'Work / Utility Boat', desc: 'Heavy-duty commercial work boat for oil & gas, construction', price: '₦6M+', icon: '⚙️' },
  { id: 'survey-boat', name: 'Survey / Research Boat', desc: 'Equipped for hydrographic and environmental surveys', price: '₦7M+', icon: '🔬' },
]

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface Config {
  vesselTypeId: string
  vesselTypeName: string
  lengthFt: number
  beamFt: number
  purpose: string
  engineIncluded: boolean
  engineType: BoatIllustrationConfig['engineType']
  engineBrand: string
  engineHp: number
  engineCount: number
  hullMaterial: string
  hullColor: string
  finish: string
  cabinType: BoatIllustrationConfig['cabinType']
  features: string[]
}

const DEFAULT_CONFIG: Config = {
  vesselTypeId: '',
  vesselTypeName: '',
  lengthFt: 20,
  beamFt: 6,
  purpose: 'Fishing',
  engineIncluded: true,
  engineType: 'outboard',
  engineBrand: 'Yamaha',
  engineHp: 60,
  engineCount: 1,
  hullMaterial: 'Fibre Glass',
  hullColor: '#1641C4',
  finish: 'Gloss',
  cabinType: 'open_deck',
  features: [],
}

const AVAILABLE_FEATURES = [
  'Navigation Lights', 'Life Jacket Storage', 'Canopy/Bimini Top', 'Anchor & Windlass',
  'Bilge Pump System', 'Fire Suppression', 'GPS Mount', 'VHF Radio Mount',
  'Fish Finder Mount', 'Livewells & Rod Holders', 'Sleeping Quarters', 'Toilet/Head',
  'Generator', 'Fuel Tank (extra)', 'Air Conditioning', 'Sound System', 'CCTV System',
  'Custom Storage Compartments',
]

export default function BoatBuildingConfigurator() {
  const [step, setStep] = useState<Step>(0)
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [illustration, setIllustration] = useState<{ sideViewSVG: string; topViewSVG: string; estimatedDimensions: Record<string, unknown>; estimatedWeight: string; capacity: string; buildTime: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [enquiryType, setEnquiryType] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', budget: '', timeline: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const next = () => setStep((s) => Math.min(s + 1, 6) as Step)
  const prev = () => setStep((s) => Math.max(s - 1, 0) as Step)

  const generateVisual = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1000)) // simulate processing

    const result = generateBoatIllustration({
      vesselType: config.vesselTypeName,
      lengthFt: config.lengthFt,
      beamFt: config.beamFt,
      hullColor: config.hullColor,
      hullMaterial: config.hullMaterial,
      engineCount: config.engineIncluded ? config.engineCount : 0,
      engineType: config.engineIncluded ? config.engineType : 'none',
      engineBrand: config.engineBrand,
      engineHp: config.engineHp,
      cabinType: config.cabinType,
      features: config.features,
      purpose: config.purpose,
    })

    setIllustration(result)
    setGenerating(false)
    next()
  }

  const submitEnquiry = async () => {
    try {
      await fetch('/api/boat-building', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, enquiryType, formData }),
      })
      setSubmitted(true)
    } catch {}
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-border overflow-hidden max-w-5xl mx-auto">
      {/* Step indicators */}
      <div className="px-6 py-4 border-b border-brand-border bg-brand-offwhite">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < step && setStep(i as Step)}
                className={cn(
                  'shrink-0 text-xs font-manrope px-3 py-1.5 rounded-full transition-colors',
                  i === step ? 'bg-brand-blue text-white font-600' : i < step ? 'bg-green-100 text-green-700 cursor-pointer' : 'bg-white text-text-4 border border-brand-border'
                )}
              >
                {i < step ? '✓ ' : `${i + 1}. `}{s}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-text-4 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">

          {/* Step 0: Vessel Type */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-syne font-800 text-text-1 text-xl mb-6">Select Vessel Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {VESSEL_TYPES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setConfig((c) => ({ ...c, vesselTypeId: v.id, vesselTypeName: v.name }))}
                    className={cn(
                      'text-left p-5 rounded-xl border-2 transition-all',
                      config.vesselTypeId === v.id ? 'border-brand-blue bg-blue-50' : 'border-brand-border hover:border-brand-blue/50'
                    )}
                  >
                    <div className="text-3xl mb-2">{v.icon}</div>
                    <div className="font-syne font-700 text-text-1 mb-1">{v.name}</div>
                    <div className="text-xs font-manrope text-text-3 mb-2">{v.desc}</div>
                    <div className="font-syne font-700 text-brand-red text-sm">From {v.price}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Dimensions */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-syne font-800 text-text-1 text-xl mb-6">Dimensions & Purpose</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-manrope font-600 text-text-2 text-sm mb-2">Length: <span className="font-syne font-700 text-brand-blue">{config.lengthFt}ft</span></label>
                  <input type="range" min={10} max={120} value={config.lengthFt} onChange={(e) => setConfig((c) => ({ ...c, lengthFt: parseInt(e.target.value) }))}
                    className="w-full accent-brand-blue" />
                  <div className="flex justify-between text-xs text-text-4 mt-1"><span>10ft</span><span>120ft</span></div>
                </div>
                <div>
                  <label className="block font-manrope font-600 text-text-2 text-sm mb-2">Beam (width): <span className="font-syne font-700 text-brand-blue">{config.beamFt}ft</span></label>
                  <input type="range" min={4} max={30} value={config.beamFt} onChange={(e) => setConfig((c) => ({ ...c, beamFt: parseInt(e.target.value) }))}
                    className="w-full accent-brand-blue" />
                  <div className="flex justify-between text-xs text-text-4 mt-1"><span>4ft</span><span>30ft</span></div>
                </div>
              </div>
              <div className="mt-6">
                <label className="block font-manrope font-600 text-text-2 text-sm mb-3">Primary Purpose</label>
                <div className="flex flex-wrap gap-2">
                  {['Fishing', 'Passenger Transport', 'Security/Patrol', 'Leisure', 'Commercial', 'Survey', 'Racing', 'Custom'].map((p) => (
                    <button key={p} onClick={() => setConfig((c) => ({ ...c, purpose: p }))}
                      className={cn('px-4 py-2 rounded-full text-sm font-manrope font-600 transition-colors',
                        config.purpose === p ? 'bg-brand-blue text-white' : 'bg-brand-offwhite text-text-3 hover:bg-blue-50')}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Engine */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-syne font-800 text-text-1 text-xl mb-6">Engine & Propulsion</h3>
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={config.engineIncluded} onChange={(e) => setConfig((c) => ({ ...c, engineIncluded: e.target.checked }))}
                    className="w-5 h-5 accent-brand-blue" />
                  <span className="font-manrope font-600 text-text-2">Include engine in build</span>
                </label>
              </div>
              {config.engineIncluded && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {(['outboard', 'inboard', 'inboard-outboard', 'stern-drive', 'electric'] as const).map((t) => (
                      <button key={t} onClick={() => setConfig((c) => ({ ...c, engineType: t }))}
                        className={cn('capitalize py-3 px-4 rounded-lg border-2 text-sm font-manrope font-600 transition-colors',
                          config.engineType === t ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-brand-border text-text-3 hover:border-brand-blue/50')}>
                        {t.replace('-', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-manrope font-600 text-text-2 block mb-2">Brand</label>
                      <select className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-blue"
                        value={config.engineBrand} onChange={(e) => setConfig((c) => ({ ...c, engineBrand: e.target.value }))}>
                        {['Yamaha', 'Honda', 'Mercury', 'Suzuki', 'Tohatsu', 'Volvo Penta', 'Custom'].map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-manrope font-600 text-text-2 block mb-2">Horsepower: <span className="text-brand-blue">{config.engineHp}HP</span></label>
                      <input type="range" min={2} max={350} value={config.engineHp} onChange={(e) => setConfig((c) => ({ ...c, engineHp: parseInt(e.target.value) }))}
                        className="w-full accent-brand-blue" />
                    </div>
                    <div>
                      <label className="text-sm font-manrope font-600 text-text-2 block mb-2">No. of Engines</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((n) => (
                          <button key={n} onClick={() => setConfig((c) => ({ ...c, engineCount: n }))}
                            className={cn('flex-1 py-2.5 rounded-lg border-2 text-sm font-syne font-700 transition-colors',
                              config.engineCount === n ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-brand-border text-text-3')}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Hull & Finish */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-syne font-800 text-text-1 text-xl mb-6">Hull Material & Finish</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-manrope font-600 text-text-2 block mb-3">Hull Material</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['Fibre Glass', 'Aluminium', 'Steel', 'Wood', 'Composite'].map((m) => (
                      <button key={m} onClick={() => setConfig((c) => ({ ...c, hullMaterial: m }))}
                        className={cn('py-3 px-4 rounded-xl border-2 text-xs font-manrope font-600 transition-colors',
                          config.hullMaterial === m ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-brand-border text-text-3 hover:border-brand-blue/50')}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-manrope font-600 text-text-2 block mb-3">Hull Colour</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={config.hullColor} onChange={(e) => setConfig((c) => ({ ...c, hullColor: e.target.value }))}
                      className="w-12 h-12 rounded-lg border border-brand-border cursor-pointer" />
                    <div className="flex flex-wrap gap-2">
                      {['#1641C4', '#0C1A36', '#C8191C', '#FFFFFF', '#000000', '#2C2C2C', '#C0C0C0', '#FFD700'].map((col) => (
                        <button key={col} onClick={() => setConfig((c) => ({ ...c, hullColor: col }))}
                          className={cn('w-8 h-8 rounded-lg border-2 transition-all', config.hullColor === col ? 'border-brand-blue scale-110' : 'border-brand-border')}
                          style={{ backgroundColor: col }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-manrope font-600 text-text-2 block mb-3">Finish</label>
                  <div className="flex gap-3">
                    {['Gloss', 'Matte', 'Anti-Fouling Coated'].map((f) => (
                      <button key={f} onClick={() => setConfig((c) => ({ ...c, finish: f }))}
                        className={cn('py-2.5 px-5 rounded-lg border-2 text-sm font-manrope font-600 transition-colors',
                          config.finish === f ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-brand-border text-text-3 hover:border-brand-blue/50')}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Cabin & Features */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-syne font-800 text-text-1 text-xl mb-6">Cabin & Features</h3>
              <div className="mb-6">
                <label className="text-sm font-manrope font-600 text-text-2 block mb-3">Cabin Configuration</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'open_deck', label: 'Open Deck' },
                    { value: 'enclosed_wheelhouse', label: 'Enclosed Wheelhouse' },
                    { value: 'multi_cabin', label: 'Multi-Cabin' },
                    { value: 'custom', label: 'Custom' },
                  ].map((c) => (
                    <button key={c.value} onClick={() => setConfig((prev) => ({ ...prev, cabinType: c.value as Config['cabinType'] }))}
                      className={cn('py-3 px-3 rounded-xl border-2 text-xs font-manrope font-600 transition-colors text-center',
                        config.cabinType === c.value ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-brand-border text-text-3 hover:border-brand-blue/50')}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-manrope font-600 text-text-2 block mb-3">Features & Equipment</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_FEATURES.map((f) => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={config.features.includes(f)}
                        onChange={(e) => setConfig((prev) => ({
                          ...prev,
                          features: e.target.checked ? [...prev.features, f] : prev.features.filter((x) => x !== f),
                        }))}
                        className="w-4 h-4 accent-brand-blue" />
                      <span className="text-sm font-manrope text-text-2 group-hover:text-brand-blue transition-colors">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Visual Generation */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-syne font-800 text-text-1 text-xl mb-6">Generate Your Boat Visual</h3>

              {/* Config summary */}
              <div className="bg-brand-offwhite rounded-xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  { label: 'Type', value: config.vesselTypeName },
                  { label: 'Size', value: `${config.lengthFt}ft × ${config.beamFt}ft` },
                  { label: 'Hull', value: `${config.hullMaterial}` },
                  { label: 'Engine', value: config.engineIncluded ? `${config.engineCount}× ${config.engineBrand} ${config.engineHp}HP` : 'No engine' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-text-4 font-manrope text-xs uppercase tracking-wider mb-0.5">{item.label}</div>
                    <div className="font-syne font-700 text-text-1">{item.value}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => void generateVisual()}
                disabled={generating}
                className="flex items-center gap-3 bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 px-8 py-4 rounded-xl transition-colors disabled:opacity-60 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                {generating ? 'Generating Your Boat...' : 'Generate My Boat Visual'}
              </button>

              {generating && (
                <div className="mt-6 flex items-center justify-center gap-3 text-text-3 font-manrope text-sm">
                  <div className="animate-spin w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full" />
                  Building your concept illustration...
                </div>
              )}
            </motion.div>
          )}

          {/* Step 6: Next Steps */}
          {step === 6 && illustration && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-syne font-800 text-text-1 text-xl mb-6">Your Boat Concept</h3>

              {/* SVG output */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs font-manrope font-600 text-text-4 uppercase tracking-wider mb-2">Side Profile</div>
                  <div dangerouslySetInnerHTML={{ __html: illustration.sideViewSVG }} className="rounded-xl overflow-hidden border border-brand-border" />
                </div>
                <div>
                  <div className="text-xs font-manrope font-600 text-text-4 uppercase tracking-wider mb-2">Top View</div>
                  <div dangerouslySetInnerHTML={{ __html: illustration.topViewSVG }} className="rounded-xl overflow-hidden border border-brand-border" />
                </div>
              </div>

              {/* Estimated specs */}
              <div className="bg-brand-offwhite rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><div className="text-text-4 text-xs uppercase tracking-wider mb-0.5">Est. Weight</div><div className="font-syne font-700 text-text-1">{illustration.estimatedWeight}</div></div>
                <div><div className="text-text-4 text-xs uppercase tracking-wider mb-0.5">Capacity</div><div className="font-syne font-700 text-text-1">{illustration.capacity}</div></div>
                <div><div className="text-text-4 text-xs uppercase tracking-wider mb-0.5">Build Time</div><div className="font-syne font-700 text-text-1">{illustration.buildTime}</div></div>
              </div>

              {!submitted ? (
                <div>
                  {!enquiryType ? (
                    <div>
                      <h4 className="font-syne font-700 text-text-1 mb-4">What would you like to do?</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { type: 'quote', icon: <Phone className="w-5 h-5" />, title: 'Request Formal Quote', desc: 'Get a detailed price quote within 48 hours' },
                          { type: 'consultation', icon: <Mail className="w-5 h-5" />, title: 'Book Consultation Call', desc: 'Speak with our marine engineer' },
                          { type: 'note', icon: <MessageSquare className="w-5 h-5" />, title: 'Drop a Note', desc: 'Send us a message about your requirements' },
                        ].map((a) => (
                          <button key={a.type} onClick={() => setEnquiryType(a.type)}
                            className="border-2 border-brand-border hover:border-brand-blue p-5 rounded-xl text-left transition-all group">
                            <div className="text-brand-blue mb-2 group-hover:scale-110 transition-transform inline-block">{a.icon}</div>
                            <div className="font-syne font-700 text-text-1 text-sm mb-1">{a.title}</div>
                            <div className="text-text-3 text-xs font-manrope">{a.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-syne font-700 text-text-1 mb-4">Your Contact Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                          { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+234 xxx xxxx xxx' },
                          { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                          { key: 'budget', label: 'Budget Range', type: 'text', placeholder: 'e.g. ₦3M – ₦5M' },
                          { key: 'timeline', label: 'Target Delivery', type: 'text', placeholder: 'e.g. Within 3 months' },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="text-sm font-manrope font-600 text-text-2 block mb-1">{field.label}</label>
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formData[field.key as keyof typeof formData]}
                              onChange={(e) => setFormData((f) => ({ ...f, [field.key]: e.target.value }))}
                              className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm text-text-1 focus:outline-none focus:border-brand-blue"
                            />
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <label className="text-sm font-manrope font-600 text-text-2 block mb-1">Additional Notes</label>
                          <textarea
                            rows={3}
                            placeholder="Any specific requirements or questions..."
                            value={formData.message}
                            onChange={(e) => setFormData((f) => ({ ...f, message: e.target.value }))}
                            className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm text-text-1 focus:outline-none focus:border-brand-blue resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => setEnquiryType(null)} className="px-5 py-2.5 border border-brand-border rounded-lg text-sm font-manrope text-text-3 hover:bg-brand-offwhite">Back</button>
                        <button onClick={() => void submitEnquiry()}
                          className="flex items-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 text-sm px-6 py-2.5 rounded-lg transition-colors">
                          Submit Enquiry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <h4 className="font-syne font-700 text-text-1 mb-1">Enquiry Received!</h4>
                  <p className="text-text-3 font-manrope text-sm">Our marine team will contact you within 24–48 hours. Reference: <span className="font-mono font-700">RG-BOAT-{Date.now().toString(36).toUpperCase()}</span></p>
                </div>
              )}

              {/* Download PDF */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-brand-border">
                <button className="flex items-center gap-2 text-sm font-manrope text-text-3 hover:text-brand-blue transition-colors">
                  <Download className="w-4 h-4" /> Download Concept PDF
                </button>
                <button className="flex items-center gap-2 text-sm font-manrope text-text-3 hover:text-brand-blue transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation */}
        {step < 6 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-brand-border">
            <button onClick={prev} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-brand-border rounded-lg text-sm font-manrope font-600 text-text-3 hover:bg-brand-offwhite disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={step === 5 ? undefined : next}
              disabled={step === 0 && !config.vesselTypeId}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-syne font-700 transition-colors',
                step === 5 ? 'opacity-0 pointer-events-none' : 'bg-brand-blue hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
