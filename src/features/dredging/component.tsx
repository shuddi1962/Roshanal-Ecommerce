'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Waves, Anchor, Shovel, Droplets, Ship, MapPin, Phone, Mail,
  ClipboardCheck, FileSearch, Settings, Shield, CheckCircle,
  ChevronDown, ChevronUp, PhoneCall, MessageCircle, X,
  Calendar, Clock, Building2, User, FileText
} from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'

const SERVICES = [
  {
    id: 'canal',
    title: 'Canal Dredging',
    description: 'Precision dredging for irrigation canals, drainage channels, and waterways to ensure optimal water flow and prevent blockages.',
    icon: Waves,
  },
  {
    id: 'river',
    title: 'River Dredging',
    description: 'Comprehensive river bed maintenance and deepening for improved navigation, flood control, and ecosystem restoration.',
    icon: Droplets,
  },
  {
    id: 'pond',
    title: 'Pond & Lake Dredging',
    description: 'Restoration and maintenance of ponds, lakes, and reservoirs. Remove silt, improve water quality, and restore depth.',
    icon: Anchor,
  },
  {
    id: 'harbor',
    title: 'Harbor Maintenance',
    description: 'Regular maintenance dredging for ports, harbors, and marinas to maintain navigable depths for vessels of all sizes.',
    icon: Ship,
  },
  {
    id: 'sediment',
    title: 'Sediment Removal',
    description: 'Expert removal of accumulated sediment, sludge, and debris from water bodies to restore capacity and functionality.',
    icon: Shovel,
  },
  {
    id: 'restoration',
    title: 'Waterway Restoration',
    description: 'Complete ecological restoration of degraded waterways, including habitat improvement and erosion control.',
    icon: MapPin,
  },
]

const EQUIPMENT = [
  {
    category: 'Cutter Suction Dredgers',
    description: 'High-efficiency hydraulic dredgers for precise cutting and suction of compacted sediments.',
    specs: ['Capacity: 50-500 m³/h', 'Depth: Up to 15m', 'Discharge: Up to 1km'],
  },
  {
    category: 'Bucket Dredgers',
    description: 'Mechanical dredgers ideal for rock, gravel, and hard-packed sediments.',
    specs: ['Bucket size: 0.5-2 m³', 'Production: 100-400 m³/h', 'Precision placement'],
  },
  {
    category: 'Amphibious Dredgers',
    description: 'Versatile machines that operate in both water and marshy terrain.',
    specs: ['Swamp capable', 'Low ground pressure', 'Multi-tool compatible'],
  },
  {
    category: 'Submersible Pumps',
    description: 'High-capacity pumps for slurry transport and dewatering operations.',
    specs: ['Flow: Up to 2000 m³/h', 'Head: Up to 100m', 'Abrasion resistant'],
  },
  {
    category: 'Discharge Pipes',
    description: 'Durable HDPE and steel discharge pipelines for sediment transport.',
    specs: ['Diameters: 200-800mm', 'Lengths: Custom', 'Pressure rated'],
  },
  {
    category: 'GPS Tracking Systems',
    description: 'Precision positioning and depth monitoring for accurate dredging.',
    specs: ['RTK accuracy', 'Real-time monitoring', '3D modeling capable'],
  },
]

const PROCESS_STEPS = [
  {
    step: 1,
    title: 'Site Assessment',
    description: 'Our experts conduct thorough site surveys including bathymetric mapping, sediment analysis, and environmental assessment.',
    icon: FileSearch,
  },
  {
    step: 2,
    title: 'Custom Plan',
    description: 'We develop a tailored dredging plan with equipment selection, methodology, timeline, and environmental safeguards.',
    icon: ClipboardCheck,
  },
  {
    step: 3,
    title: 'Execution',
    description: 'Our licensed operators execute the dredging work with precision, safety, and minimal environmental impact.',
    icon: Settings,
  },
  {
    step: 4,
    title: 'Maintenance',
    description: 'Ongoing monitoring and maintenance programs to keep your waterway in optimal condition.',
    icon: Shield,
  },
]

const GALLERY_PROJECTS = [
  { title: 'Port Harcourt Channel', type: 'Harbor Maintenance', depth: 'Restored to 8m depth' },
  { title: 'Bonny River Project', type: 'River Dredging', depth: '12km waterway cleared' },
  { title: 'Lekki Lagoon', type: 'Sediment Removal', depth: '150,000 m³ removed' },
  { title: 'Cross River Basin', type: 'Waterway Restoration', depth: 'Ecological restoration' },
  { title: 'Warri Creek', type: 'Canal Dredging', depth: '5km irrigation channel' },
  { title: 'Calabar Marina', type: 'Harbor Maintenance', depth: 'Berth deepening' },
]

const TRUST_SIGNALS = [
  { value: '15+', label: 'Years Experience', description: 'In marine and dredging services' },
  { value: '200+', label: 'Projects Completed', description: 'Across Nigeria and West Africa' },
  { value: '100%', label: 'Licensed Operators', description: 'Certified and trained professionals' },
  { value: '24/7', label: 'Emergency Response', description: 'Rapid deployment capability' },
]

const FAQS = [
  {
    question: 'How long does dredging typically take?',
    answer: 'Project duration varies based on water body size, sediment volume, and equipment deployed. Small pond dredging may take 1-2 weeks, while large harbor projects can take several months. We provide detailed timelines during the planning phase.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We provide dredging services throughout Nigeria including Lagos, Port Harcourt, Abuja, Calabar, Warri, and all major riverine areas. We also undertake projects in neighboring West African countries.',
  },
  {
    question: 'Do you provide maintenance after dredging?',
    answer: 'Yes, we offer comprehensive maintenance contracts including periodic inspections, sediment monitoring, and follow-up dredging as needed. Our maintenance programs help extend the longevity of your waterway investment.',
  },
  {
    question: 'What happens to the dredged material?',
    answer: 'Dredged material is carefully managed according to environmental regulations. Depending on sediment quality, it may be used for land reclamation, disposed of at approved sites, or beneficially reused for beach nourishment or wetland creation.',
  },
  {
    question: 'Do you handle environmental permits?',
    answer: 'Yes, our team manages all necessary environmental permits and regulatory compliance. We work closely with FMEnv (Federal Ministry of Environment) and other relevant authorities to ensure full legal compliance.',
  },
]

const URGENCY_OPTIONS = [
  { value: 'standard', label: 'Standard (2-4 weeks)' },
  { value: 'priority', label: 'Priority (1-2 weeks)' },
  { value: 'emergency', label: 'Emergency (Within 48 hours)' },
]

const quoteSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  location: z.string().min(5, 'Location is required'),
  waterBodyType: z.string().min(1, 'Water body type is required'),
  estimatedSize: z.string().min(1, 'Estimated size is required'),
  urgency: z.string().min(1, 'Urgency is required'),
  notes: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

export function DredgingServicePage() {
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
  })

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: 'dredging',
          name: data.name,
          company: data.company,
          email: data.email,
          phone: data.phone,
          location: data.location,
          water_body_type: data.waterBodyType,
          estimated_size: data.estimatedSize,
          urgency: data.urgency,
          notes: data.notes,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit quote request')

      toast.success('Quote request submitted successfully!')
      setQuoteSubmitted(true)
      reset()
    } catch {
      toast.error('Failed to submit quote request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Hero Section */}
      <section className="relative bg-brand-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-blue opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/20 rounded-full text-sm font-manrope mb-6">
                <Waves className="w-4 h-4" />
                Professional Marine Services
              </span>
              <h1 className="font-syne font-800 text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
                Dredging Equipment & Services
              </h1>
              <p className="font-manrope text-lg text-white/80 mb-8 max-w-2xl">
                Expert dredging solutions for canals, rivers, harbors, and waterways. 
                State-of-the-art equipment operated by licensed professionals with 15+ years of experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-red text-white font-syne font-700 rounded-xl hover:bg-red-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Request Dredging Quote
                </button>
                <a
                  href="tel:+234800ROSHANAL"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-syne font-700 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call Us Now
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-offwhite to-transparent" />
      </section>

      {/* Trust Signals */}
      <section className="py-12 bg-brand-offwhite">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_SIGNALS.map((signal, idx) => (
              <motion.div
                key={signal.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 border border-brand-border text-center"
              >
                <div className="font-syne font-800 text-3xl text-brand-blue mb-1">{signal.value}</div>
                <div className="font-syne font-700 text-text-1 text-sm mb-1">{signal.label}</div>
                <div className="font-manrope text-text-4 text-xs">{signal.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">Our Dredging Services</h2>
            <p className="font-manrope text-text-3 max-w-2xl mx-auto">
              Comprehensive dredging solutions tailored to your specific waterway needs, 
              delivered with precision and environmental responsibility.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 border border-brand-border hover:shadow-card-hover transition-shadow group"
              >
                <div className="w-14 h-14 bg-brand-offwhite rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <service.icon className="w-7 h-7 text-brand-blue group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-syne font-700 text-lg text-text-1 mb-2">{service.title}</h3>
                <p className="font-manrope text-text-3 text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">Dredging Equipment</h2>
            <p className="font-manrope text-text-3 max-w-2xl mx-auto">
              State-of-the-art dredging machinery available for hire and purchase. 
              All equipment is regularly maintained and operated by certified professionals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EQUIPMENT.map((item, idx) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand-offwhite rounded-xl p-6 border border-brand-border"
              >
                <h3 className="font-syne font-700 text-lg text-text-1 mb-2">{item.category}</h3>
                <p className="font-manrope text-text-3 text-sm mb-4">{item.description}</p>
                <div className="space-y-1">
                  {item.specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-2 text-xs font-manrope text-text-4">
                      <CheckCircle className="w-3 h-3 text-success" />
                      {spec}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">Our Process</h2>
            <p className="font-manrope text-text-3 max-w-2xl mx-auto">
              A systematic approach to every dredging project, ensuring quality results and client satisfaction.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-6 border border-brand-border h-full">
                  <div className="w-12 h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="font-mono text-xs text-brand-blue mb-2">STEP {step.step}</div>
                  <h3 className="font-syne font-700 text-lg text-text-1 mb-2">{step.title}</h3>
                  <p className="font-manrope text-text-3 text-sm">{step.description}</p>
                </div>
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-brand-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">Completed Projects</h2>
            <p className="font-manrope text-text-3 max-w-2xl mx-auto">
              A showcase of our successful dredging projects across Nigeria and West Africa.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_PROJECTS.map((project, idx) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand-offwhite rounded-xl overflow-hidden border border-brand-border group"
              >
                <div className="aspect-video bg-gradient-to-br from-brand-blue/20 to-brand-navy/20 flex items-center justify-center">
                  <Waves className="w-16 h-16 text-brand-blue/40" />
                </div>
                <div className="p-5">
                  <h3 className="font-syne font-700 text-text-1 mb-1">{project.title}</h3>
                  <p className="font-manrope text-brand-blue text-sm mb-2">{project.type}</p>
                  <p className="font-manrope text-text-4 text-xs">{project.depth}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">Frequently Asked Questions</h2>
              <p className="font-manrope text-text-3">
                Find answers to common questions about our dredging services.
              </p>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl border border-brand-border overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-brand-offwhite/50 transition-colors"
                  >
                    <span className="font-syne font-700 text-text-1 pr-4">{faq.question}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-brand-blue shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-4 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 font-manrope text-text-3 text-sm">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 lg:py-24 bg-brand-navy text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-syne font-800 text-3xl mb-4">Ready to Start Your Dredging Project?</h2>
            <p className="font-manrope text-white/80 mb-8">
              Contact our team today for a free consultation and detailed quote. 
              We are available 24/7 for emergency dredging services.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowQuoteForm(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-red text-white font-syne font-700 rounded-xl hover:bg-red-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Request Quote
              </button>
              <a
                href="tel:+234800ROSHANAL"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white font-syne font-700 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <PhoneCall className="w-5 h-5" />
                Call Now
              </a>
              <a
                href="https://wa.me/234800ROSHANAL"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-syne font-700 rounded-xl hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Modal */}
      <AnimatePresence>
        {showQuoteForm && (
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
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="font-syne font-800 text-xl text-text-1">Request Dredging Quote</h2>
                  <p className="font-manrope text-text-4 text-sm">Fill in your project details for a free estimate</p>
                </div>
                <button
                  onClick={() => {
                    setShowQuoteForm(false)
                    setQuoteSubmitted(false)
                  }}
                  className="p-2 hover:bg-brand-offwhite rounded-lg"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>

              {quoteSubmitted ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="font-syne font-800 text-xl text-text-1 mb-2">Quote Request Submitted!</h3>
                  <p className="font-manrope text-text-3 mb-6">
                    Our dredging team will review your request and contact you within 24 hours with a detailed quote.
                  </p>
                  <button
                    onClick={() => {
                      setShowQuoteForm(false)
                      setQuoteSubmitted(false)
                    }}
                    className="px-6 py-3 bg-brand-blue text-white font-syne font-700 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <User className="w-4 h-4 text-brand-blue" /> Full Name *
                      </label>
                      <input
                        {...register('name')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-brand-red text-xs font-manrope mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Building2 className="w-4 h-4 text-brand-blue" /> Company
                      </label>
                      <input
                        {...register('company')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="Company name (optional)"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Mail className="w-4 h-4 text-brand-blue" /> Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <p className="text-brand-red text-xs font-manrope mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Phone className="w-4 h-4 text-brand-blue" /> Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="+234 800 000 0000"
                      />
                      {errors.phone && (
                        <p className="text-brand-red text-xs font-manrope mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                      <MapPin className="w-4 h-4 text-brand-blue" /> Project Location *
                    </label>
                    <input
                      {...register('location')}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                      placeholder="Full address of the project site"
                    />
                    {errors.location && (
                      <p className="text-brand-red text-xs font-manrope mt-1">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Waves className="w-4 h-4 text-brand-blue" /> Water Body Type *
                      </label>
                      <select
                        {...register('waterBodyType')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                      >
                        <option value="">Select type</option>
                        <option value="canal">Canal</option>
                        <option value="river">River</option>
                        <option value="pond">Pond/Lake</option>
                        <option value="harbor">Harbor/Marina</option>
                        <option value="wetland">Wetland/Marsh</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.waterBodyType && (
                        <p className="text-brand-red text-xs font-manrope mt-1">{errors.waterBodyType.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Settings className="w-4 h-4 text-brand-blue" /> Estimated Size *
                      </label>
                      <select
                        {...register('estimatedSize')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                      >
                        <option value="">Select size</option>
                        <option value="small">Small (&lt; 1,000 m³)</option>
                        <option value="medium">Medium (1,000 - 10,000 m³)</option>
                        <option value="large">Large (10,000 - 50,000 m³)</option>
                        <option value="xlarge">Extra Large (&gt; 50,000 m³)</option>
                        <option value="unknown">Unknown - Need assessment</option>
                      </select>
                      {errors.estimatedSize && (
                        <p className="text-brand-red text-xs font-manrope mt-1">{errors.estimatedSize.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                      <Clock className="w-4 h-4 text-brand-blue" /> Urgency *
                    </label>
                    <select
                      {...register('urgency')}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                    >
                      {URGENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {errors.urgency && (
                      <p className="text-brand-red text-xs font-manrope mt-1">{errors.urgency.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                      <FileText className="w-4 h-4 text-brand-blue" /> Additional Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue resize-none"
                      placeholder="Describe your project requirements, timeline constraints, or any specific challenges..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                    <button
                      type="button"
                      onClick={() => setShowQuoteForm(false)}
                      className="px-6 py-3 border border-brand-border rounded-xl font-manrope font-600 text-text-3 hover:bg-brand-offwhite transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-brand-blue text-white font-syne font-700 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
