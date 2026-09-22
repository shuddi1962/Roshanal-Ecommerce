'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Wrench, Shield, Video, Flame, Lock, BatteryCharging, Sun, Wifi, Zap,
  Calendar, Clock, CheckCircle, ChevronDown, ChevronUp, Star, Phone, Mail,
  MapPin, User, Building2, FileText, X, AlertCircle, ArrowRight
} from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'

const MAINTENANCE_PLANS = [
  {
    id: 'preventive',
    name: 'Preventive',
    priceKobo: 5000000,
    period: 'per quarter',
    description: 'Regular inspections and minor adjustments to prevent major failures',
    features: [
      'Quarterly system inspections',
      'Basic cleaning and calibration',
      'Minor component adjustments',
      'System health reports',
      'Email support',
      '10% discount on parts',
    ],
    highlighted: false,
    icon: Shield,
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    priceKobo: 15000000,
    period: 'per quarter',
    description: 'Complete care package with priority response and parts coverage',
    features: [
      'Monthly system inspections',
      'Deep cleaning and full calibration',
      'Parts replacement (up to ₦100k/quarter)',
      '24/7 priority phone support',
      'Same-day emergency response',
      '25% discount on parts',
      'Annual system upgrade recommendations',
      'Dedicated account manager',
    ],
    highlighted: true,
    icon: Wrench,
  },
  {
    id: 'emergency',
    name: 'Emergency',
    priceKobo: 500000,
    period: 'per hour',
    description: 'On-demand emergency repairs and troubleshooting',
    features: [
      'No contract required',
      'Rapid response (2-4 hours)',
      'Troubleshooting & diagnostics',
      'Emergency repairs',
      'Standby generator support',
      'Available 24/7/365',
      'Pay-as-you-go billing',
    ],
    highlighted: false,
    icon: AlertCircle,
  },
]

const SERVICES = [
  {
    id: 'cctv',
    title: 'CCTV Maintenance',
    description: 'Camera cleaning, lens calibration, storage optimization, and firmware updates.',
    icon: Video,
    color: 'bg-blue-50 text-blue-700',
  },
  {
    id: 'fire-alarm',
    title: 'Fire Alarm Testing',
    description: 'Sensor testing, battery replacement, alarm verification, and compliance certification.',
    icon: Flame,
    color: 'bg-red-50 text-red-700',
  },
  {
    id: 'access-control',
    title: 'Access Control',
    description: 'Card reader testing, door lock maintenance, software updates, and user management.',
    icon: Lock,
    color: 'bg-purple-50 text-purple-700',
  },
  {
    id: 'ups',
    title: 'UPS & Inverter',
    description: 'Battery testing, capacity checks, cooling system maintenance, and load balancing.',
    icon: BatteryCharging,
    color: 'bg-green-50 text-green-700',
  },
  {
    id: 'solar',
    title: 'Solar Panel Cleaning',
    description: 'Panel washing, connection inspection, inverter checks, and performance optimization.',
    icon: Sun,
    color: 'bg-yellow-50 text-yellow-700',
  },
  {
    id: 'network',
    title: 'Network Diagnostics',
    description: 'Cable testing, switch maintenance, WiFi optimization, and security audits.',
    icon: Wifi,
    color: 'bg-indigo-50 text-indigo-700',
  },
  {
    id: 'generator',
    title: 'Generator Servicing',
    description: 'Oil changes, filter replacement, load testing, and preventive maintenance.',
    icon: Zap,
    color: 'bg-orange-50 text-orange-700',
  },
]

const PROCESS_STEPS = [
  {
    step: 1,
    title: 'Schedule',
    description: 'Book online or call us to schedule a convenient time',
    icon: Calendar,
  },
  {
    step: 2,
    title: 'Diagnosis',
    description: 'Our technician performs a thorough system assessment',
    icon: Wrench,
  },
  {
    step: 3,
    title: 'Quote',
    description: 'Receive a transparent quote before any work begins',
    icon: FileText,
  },
  {
    step: 4,
    title: 'Work',
    description: 'Expert technicians complete the maintenance work',
    icon: Shield,
  },
  {
    step: 5,
    title: 'Sign-off',
    description: 'Quality check and digital report delivery',
    icon: CheckCircle,
  },
]

const TESTIMONIALS = [
  {
    name: 'Chief Emmanuel Okonkwo',
    company: 'Grandview Estate',
    rating: 5,
    text: 'Roshanal has been maintaining our estate security systems for 3 years. Their preventive maintenance has saved us from major failures. Highly recommended!',
  },
  {
    name: 'Dr. Amina Bello',
    company: 'Metro Hospital',
    rating: 5,
    text: 'The emergency response team is incredible. When our generator failed during surgery hours, they had it running within 90 minutes.',
  },
  {
    name: 'Mr. Tunde Ajayi',
    company: 'Ajayi Manufacturing',
    text: 'Professional, punctual, and thorough. Their comprehensive plan covers all our industrial equipment perfectly.',
    rating: 5,
  },
]

const FAQS = [
  {
    question: 'How quickly can you respond to emergencies?',
    answer: 'Our emergency team aims to respond within 2-4 hours in Lagos, Port Harcourt, and Abuja. Other locations may take 4-8 hours depending on distance. Emergency plan subscribers get priority dispatch.',
  },
  {
    question: 'Do you provide maintenance for residential properties?',
    answer: 'Yes, we maintain all types of properties including homes, estates, offices, factories, hospitals, and schools. Our plans can be customized for any size of installation.',
  },
  {
    question: 'What happens if a part needs replacement?',
    answer: 'Comprehensive plan subscribers get parts replacement up to ₦100,000 per quarter included. For other plans, we source quality parts at competitive prices with your approval before replacement.',
  },
  {
    question: 'Can I switch between maintenance plans?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of the next billing quarter. We will help you choose the right plan based on your needs.',
  },
  {
    question: 'Do you offer service guarantees?',
    answer: 'Yes, all our maintenance work comes with a 90-day service guarantee. If the same issue recurs within 90 days of our service, we will fix it at no additional cost.',
  },
]

const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(10, 'Address is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  plan: z.string().min(1, 'Maintenance plan is required'),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

export function MaintenanceServicePage() {
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('comprehensive')

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      plan: 'comprehensive',
    },
  })

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: 'maintenance',
          ...data,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit booking')

      toast.success('Maintenance booking submitted successfully!')
      setBookingSubmitted(true)
      reset()
    } catch {
      toast.error('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openBookingWithPlan = (planId: string) => {
    setSelectedPlan(planId)
    setValue('plan', planId)
    setShowBookingForm(true)
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Hero Section */}
      <section className="relative bg-brand-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-blue opacity-90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-blue rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-red rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/20 rounded-full text-sm font-manrope mb-6">
                <Wrench className="w-4 h-4" />
                24/7 Professional Support
              </span>
              <h1 className="font-syne font-800 text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
                Expert Maintenance Services
              </h1>
              <p className="font-manrope text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Keep your security, power, and technology systems running at peak performance 
                with our professional maintenance services across Nigeria.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-red text-white font-syne font-700 rounded-xl hover:bg-red-700 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Book Maintenance
                </button>
                <a
                  href="tel:+234800ROSHANAL"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-syne font-700 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Emergency Line
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-offwhite to-transparent" />
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">Services We Cover</h2>
            <p className="font-manrope text-text-3 max-w-2xl mx-auto">
              Comprehensive maintenance for all your critical systems. From security to power, 
              we have got you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-6 border border-brand-border hover:shadow-card-hover transition-shadow group"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', service.color)}>
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="font-syne font-700 text-text-1 mb-2">{service.title}</h3>
                <p className="font-manrope text-text-3 text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance Plans */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">Maintenance Plans</h2>
            <p className="font-manrope text-text-3 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include certified technicians 
              and genuine replacement parts.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {MAINTENANCE_PLANS.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'relative rounded-2xl p-8 border-2 transition-all',
                  plan.highlighted
                    ? 'border-brand-blue bg-brand-blue/5 scale-105 shadow-card-hover'
                    : 'border-brand-border bg-white hover:border-brand-blue/50'
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-blue text-white text-xs font-syne font-700 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', plan.highlighted ? 'bg-brand-blue text-white' : 'bg-brand-offwhite text-brand-blue')}>
                  <plan.icon className="w-7 h-7" />
                </div>
                <h3 className="font-syne font-800 text-2xl text-text-1 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="font-syne font-800 text-4xl text-brand-blue">
                    {formatNaira(plan.priceKobo)}
                  </span>
                  <span className="font-manrope text-text-4 text-sm ml-2">{plan.period}</span>
                </div>
                <p className="font-manrope text-text-3 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="font-manrope text-text-2 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openBookingWithPlan(plan.id)}
                  className={cn(
                    'w-full py-3 rounded-xl font-syne font-700 transition-colors',
                    plan.highlighted
                      ? 'bg-brand-blue text-white hover:bg-blue-700'
                      : 'border-2 border-brand-border text-text-2 hover:border-brand-blue hover:text-brand-blue'
                  )}
                >
                  Choose {plan.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">How It Works</h2>
            <p className="font-manrope text-text-3 max-w-2xl mx-auto">
              Simple, transparent process from booking to completion
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {PROCESS_STEPS.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 bg-brand-blue text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="font-mono text-xs text-brand-blue mb-1">STEP {step.step}</div>
                <h3 className="font-syne font-700 text-text-1 mb-1">{step.title}</h3>
                <p className="font-manrope text-text-3 text-xs">{step.description}</p>
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full">
                    <ArrowRight className="w-5 h-5 text-brand-border" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-800 text-3xl text-text-1 mb-4">What Our Clients Say</h2>
            <p className="font-manrope text-text-3">
              Trusted by hundreds of businesses across Nigeria
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand-offwhite rounded-xl p-6 border border-brand-border"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="font-manrope text-text-2 text-sm mb-4">{testimonial.text}</p>
                <div>
                  <p className="font-syne font-700 text-text-1 text-sm">{testimonial.name}</p>
                  <p className="font-manrope text-text-4 text-xs">{testimonial.company}</p>
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
                Get answers to common maintenance questions
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

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-brand-navy text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-syne font-800 text-3xl mb-4">Ready to Protect Your Investment?</h2>
            <p className="font-manrope text-white/80 mb-8">
              Do not wait for a breakdown. Schedule your maintenance today and keep your systems running smoothly.
            </p>
            <button
              onClick={() => setShowBookingForm(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-red text-white font-syne font-700 rounded-xl hover:bg-red-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Book Maintenance Now
            </button>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingForm && (
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
                  <h2 className="font-syne font-800 text-xl text-text-1">Book Maintenance</h2>
                  <p className="font-manrope text-text-4 text-sm">Schedule a service visit</p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingForm(false)
                    setBookingSubmitted(false)
                  }}
                  className="p-2 hover:bg-brand-offwhite rounded-lg"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>

              {bookingSubmitted ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="font-syne font-800 text-xl text-text-1 mb-2">Booking Confirmed!</h3>
                  <p className="font-manrope text-text-3 mb-6">
                    Our maintenance team will contact you within 24 hours to confirm your appointment.
                  </p>
                  <button
                    onClick={() => {
                      setShowBookingForm(false)
                      setBookingSubmitted(false)
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
                        <Mail className="w-4 h-4 text-brand-blue" /> Email *
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
                        <Phone className="w-4 h-4 text-brand-blue" /> Phone *
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
                      <MapPin className="w-4 h-4 text-brand-blue" /> Service Address *
                    </label>
                    <textarea
                      {...register('address')}
                      rows={2}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue resize-none"
                      placeholder="Full address where service is needed"
                    />
                    {errors.address && (
                      <p className="text-brand-red text-xs font-manrope mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Wrench className="w-4 h-4 text-brand-blue" /> Service Type *
                      </label>
                      <select
                        {...register('serviceType')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                      >
                        <option value="">Select service</option>
                        {SERVICES.map((s) => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                        <option value="multiple">Multiple Services</option>
                      </select>
                      {errors.serviceType && (
                        <p className="text-brand-red text-xs font-manrope mt-1">{errors.serviceType.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Shield className="w-4 h-4 text-brand-blue" /> Maintenance Plan *
                      </label>
                      <select
                        {...register('plan')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                      >
                        {MAINTENANCE_PLANS.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} - {formatNaira(p.priceKobo)}/{p.period.split(' ')[1]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                      <Calendar className="w-4 h-4 text-brand-blue" /> Preferred Date *
                    </label>
                    <input
                      type="date"
                      {...register('preferredDate')}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                    />
                    {errors.preferredDate && (
                      <p className="text-brand-red text-xs font-manrope mt-1">{errors.preferredDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                      <FileText className="w-4 h-4 text-brand-blue" /> Additional Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue resize-none"
                      placeholder="Describe your maintenance needs, equipment details, or any specific issues..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="px-6 py-3 border border-brand-border rounded-xl font-manrope font-600 text-text-3 hover:bg-brand-offwhite transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-brand-blue text-white font-syne font-700 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Book Maintenance'}
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
