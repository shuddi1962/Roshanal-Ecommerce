'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { 
  Ship, UtensilsCrossed, Wrench, Waves, 
  ChevronRight, ChevronLeft, Check, Calendar, Clock, MapPin, User, Phone, Mail, FileText, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import FeatureFlagGate from '@/components/shared/FeatureFlagGate'

interface ServiceType {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  depositKobo: number
  basePriceKobo: number
}

interface BookingFormData {
  serviceTypeId: string
  address: string
  preferredDate: string
  preferredTime: string
  notes: string
  name: string
  email: string
  phone: string
}

const serviceTypes: ServiceType[] = [
  {
    id: 'boat_building',
    name: 'Boat Building',
    icon: <Ship className="w-8 h-8" />,
    description: 'Custom vessel construction tailored to your specifications',
    depositKobo: 5000000,
    basePriceKobo: 500000000,
  },
  {
    id: 'kitchen_installation',
    name: 'Kitchen Installation',
    icon: <UtensilsCrossed className="w-8 h-8" />,
    description: 'Indoor, outdoor, commercial & domestic cooking solutions',
    depositKobo: 5000000,
    basePriceKobo: 150000000,
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: <Wrench className="w-8 h-8" />,
    description: 'Professional maintenance services for all equipment',
    depositKobo: 2500000,
    basePriceKobo: 5000000,
  },
  {
    id: 'dredging',
    name: 'Dredging',
    icon: <Waves className="w-8 h-8" />,
    description: 'Waterway clearing and dredging services',
    depositKobo: 10000000,
    basePriceKobo: 1000000000,
  },
]

const bookingSchema = z.object({
  serviceTypeId: z.string().min(1, 'Please select a service'),
  address: z.string().min(10, 'Please enter a valid address'),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTime: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
})

const steps = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Contact' },
  { id: 4, label: 'Confirm' },
]

const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
]

export default function BookServicePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [user, setUser] = useState<{ name: string; email: string; phone?: string } | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      serviceTypeId: '',
      address: '',
      preferredDate: '',
      preferredTime: '',
      notes: '',
      name: '',
      email: '',
      phone: '',
    },
    mode: 'onChange',
  })

  const selectedServiceId = watch('serviceTypeId')
  const selectedService = serviceTypes.find(s => s.id === selectedServiceId)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          setValue('name', data.user.name || '')
          setValue('email', data.user.email || '')
          setValue('phone', data.user.phone || '')
        }
      } catch {}
    }
    loadUser()
  }, [setValue])

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user ? 'authenticated' : null,
          serviceTypeId: data.serviceTypeId,
          date: data.preferredDate,
          timeSlot: data.preferredTime,
          address: data.address,
          notes: data.notes,
          depositPaidKobo: 0,
          balanceDueKobo: selectedService?.basePriceKobo || 0,
          totalKobo: selectedService?.basePriceKobo || 0,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to create booking')

      setBookingRef(result.booking?.id || 'BK-' + Date.now())
      toast.success('Booking submitted successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, 4))
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1))

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!selectedServiceId
      case 2:
        return watch('address')?.length >= 10 && !!watch('preferredDate') && !!watch('preferredTime')
      case 3:
        return watch('name')?.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watch('email')) && watch('phone')?.length >= 10
      default:
        return true
    }
  }

  if (bookingRef) {
    return (
      <div className="min-h-screen bg-brand-offwhite py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-brand-border p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-syne font-800 text-2xl text-text-1 mb-2">Booking Confirmed!</h1>
          <p className="font-manrope text-text-3 mb-6">
            Your service booking has been received. Our team will contact you shortly.
          </p>
          <div className="bg-brand-offwhite rounded-xl p-4 mb-6">
            <p className="text-sm font-manrope text-text-4">Booking Reference</p>
            <p className="font-mono text-lg text-brand-blue font-700">{bookingRef}</p>
          </div>
          {selectedService && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                <span className="font-syne font-700 text-warning">Deposit Required</span>
              </div>
              <p className="font-manrope text-text-3 text-sm">
                A deposit of <span className="font-syne font-700 text-text-1">₦{(selectedService.depositKobo / 100).toLocaleString('en-NG')}</span> is required to confirm your booking.
              </p>
            </div>
          )}
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-blue text-white font-syne font-700 rounded-xl hover:bg-brand-blue/90 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <FeatureFlagGate flag="booking_system">
      <div className="min-h-screen bg-brand-offwhite py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-syne font-800 text-3xl text-text-1 mb-2">Book a Service</h1>
            <p className="font-manrope text-text-3">Schedule professional services from Roshanal Global</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-syne font-700 text-sm transition-colors',
                  currentStep >= step.id ? 'bg-brand-blue text-white' : 'bg-white border border-brand-border text-text-4'
                )}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className={cn(
                    'w-5 h-5',
                    currentStep > step.id ? 'text-brand-blue' : 'text-brand-border'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6"
                >
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-6">Select Service Type</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {serviceTypes.map(service => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setValue('serviceTypeId', service.id)}
                        className={cn(
                          'p-6 rounded-xl border-2 text-left transition-all',
                          selectedServiceId === service.id
                            ? 'border-brand-blue bg-brand-blue/5'
                            : 'border-brand-border hover:border-brand-blue/50'
                        )}
                      >
                        <div className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                          selectedServiceId === service.id ? 'bg-brand-blue text-white' : 'bg-brand-offwhite text-brand-blue'
                        )}>
                          {service.icon}
                        </div>
                        <h3 className="font-syne font-700 text-lg text-text-1 mb-1">{service.name}</h3>
                        <p className="font-manrope text-sm text-text-3 mb-3">{service.description}</p>
                        <p className="font-syne font-700 text-brand-blue">From ₦{(service.basePriceKobo / 100).toLocaleString('en-NG')}</p>
                      </button>
                    ))}
                  </div>
                  {errors.serviceTypeId && (
                    <p className="text-brand-red text-sm font-manrope mt-2">{String(errors.serviceTypeId.message)}</p>
                  )}
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6"
                >
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-6">Service Details</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <MapPin className="w-4 h-4 text-brand-blue" /> Service Address
                      </label>
                      <textarea
                        {...register('address')}
                        rows={3}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="Enter the full address where service is needed"
                      />
                      {errors.address && (
                        <p className="text-brand-red text-sm font-manrope mt-1">{String(errors.address.message)}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                          <Calendar className="w-4 h-4 text-brand-blue" /> Preferred Date
                        </label>
                        <input
                          type="date"
                          {...register('preferredDate')}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        />
                        {errors.preferredDate && (
                          <p className="text-brand-red text-sm font-manrope mt-1">{String(errors.preferredDate.message)}</p>
                        )}
                      </div>
                      <div>
                        <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                          <Clock className="w-4 h-4 text-brand-blue" /> Preferred Time
                        </label>
                        <select
                          {...register('preferredTime')}
                          className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        >
                          <option value="">Select time slot</option>
                          {timeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                        {errors.preferredTime && (
                          <p className="text-brand-red text-sm font-manrope mt-1">{String(errors.preferredTime.message)}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <FileText className="w-4 h-4 text-brand-blue" /> Additional Notes
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={3}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="Any specific requirements or details..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6"
                >
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-6">Contact Information</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <User className="w-4 h-4 text-brand-blue" /> Full Name
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-brand-red text-sm font-manrope mt-1">{String(errors.name.message)}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Mail className="w-4 h-4 text-brand-blue" /> Email Address
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-brand-red text-sm font-manrope mt-1">{String(errors.email.message)}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 font-manrope text-sm text-text-2 mb-2">
                        <Phone className="w-4 h-4 text-brand-blue" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-brand-border rounded-xl font-manrope focus:outline-none focus:border-brand-blue"
                        placeholder="+234 800 000 0000"
                      />
                      {errors.phone && (
                        <p className="text-brand-red text-sm font-manrope mt-1">{String(errors.phone.message)}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6"
                >
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-6">Review & Confirm</h2>
                  
                  {selectedService && (
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-4 p-4 bg-brand-offwhite rounded-xl">
                        <div className="w-12 h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center">
                          {selectedService.icon}
                        </div>
                        <div>
                          <h3 className="font-syne font-700 text-text-1">{selectedService.name}</h3>
                          <p className="font-manrope text-sm text-text-3">{selectedService.description}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border border-brand-border rounded-xl">
                          <p className="font-manrope text-sm text-text-4 mb-1">Service Address</p>
                          <p className="font-manrope text-text-1">{watch('address')}</p>
                        </div>
                        <div className="p-4 border border-brand-border rounded-xl">
                          <p className="font-manrope text-sm text-text-4 mb-1">Preferred Date & Time</p>
                          <p className="font-manrope text-text-1">{watch('preferredDate')} at {watch('preferredTime')}</p>
                        </div>
                      </div>

                      <div className="p-4 border border-brand-border rounded-xl">
                        <p className="font-manrope text-sm text-text-4 mb-1">Contact</p>
                        <p className="font-manrope text-text-1">{watch('name')} · {watch('email')} · {watch('phone')}</p>
                      </div>

                      {watch('notes') && (
                        <div className="p-4 border border-brand-border rounded-xl">
                          <p className="font-manrope text-sm text-text-4 mb-1">Notes</p>
                          <p className="font-manrope text-text-1">{watch('notes')}</p>
                        </div>
                      )}

                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-warning" />
                          <span className="font-syne font-700 text-warning">Deposit Required</span>
                        </div>
                        <p className="font-manrope text-text-3 text-sm">
                          A deposit of <span className="font-syne font-700 text-text-1">₦{(selectedService.depositKobo / 100).toLocaleString('en-NG')}</span> is required to confirm your booking. You will receive payment instructions after submission.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 border border-brand-border rounded-xl font-manrope font-600 text-text-3 hover:bg-brand-offwhite transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-syne font-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-blue/90 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-xl font-syne font-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-blue/90 transition-colors"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Submitting...</span>
                  ) : (
                    <>Confirm Booking <Check className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </FeatureFlagGate>
  )
}
