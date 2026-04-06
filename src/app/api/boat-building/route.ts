import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { generateId } from '@/lib/utils'

interface BoatEnquiryRequest {
  config: {
    vesselTypeId: string
    vesselTypeName: string
    lengthFt: number
    beamFt: number
    purpose: string
    engineIncluded: boolean
    engineType: string
    engineBrand: string
    engineHp: number
    engineCount: number
    hullMaterial: string
    hullColor: string
    finish: string
    cabinType: string
    features: string[]
  }
  enquiryType: string
  formData: {
    name: string
    phone: string
    email: string
    budget: string
    timeline: string
    message: string
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as BoatEnquiryRequest
  const { config, enquiryType, formData } = body

  if (!formData.name || !formData.phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
  }

  // Save boat configuration
  const { data: configData } = await adminDb.from('boat_configurations').insert({
    vessel_type_id: config.vesselTypeId || 'custom',
    length_ft: config.lengthFt,
    beam_ft: config.beamFt,
    purpose: config.purpose,
    hull_material: config.hullMaterial,
    hull_color: config.hullColor,
    engine_type: config.engineIncluded ? config.engineType : 'none',
    engine_brand: config.engineBrand,
    engine_hp: config.engineHp,
    engine_count: config.engineCount,
    cabin_config: config.cabinType,
    equipment: config.features,
    status: 'enquiry',
  }).select('id').single()

  // Save enquiry
  const enquiryId = generateId(10).toUpperCase()
  await adminDb.from('boat_enquiries').insert({
    config_id: configData?.id ?? null,
    action_type: enquiryType,
    budget_range: formData.budget,
    timeline: formData.timeline,
    contact_name: formData.name,
    contact_phone: formData.phone,
    contact_email: formData.email,
    notes: formData.message,
    status: 'new',
  })

  return NextResponse.json({ ok: true, reference: `RG-BOAT-${enquiryId}` })
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Public: fetch vessel types for configurator
  const { data: vesselTypes } = await adminDb
    .from('vessel_types')
    .select('id, name, description, size_range_ft, base_price_estimate_kobo, admin_reference_images, engine_options, features_available')
    .eq('is_active', true)
    .order('name')

  return NextResponse.json({ vesselTypes: vesselTypes ?? [] })
}
