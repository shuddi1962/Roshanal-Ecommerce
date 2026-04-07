import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { generateBoatIllustration } from '@/lib/boat-illustration'
import type { BoatIllustrationConfig } from '@/lib/boat-illustration'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data } = await adminDb.from('boat_configurations').select('*').eq('id', id).single()
  if (!data) return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })

  return NextResponse.json({ config: data })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const config = body as BoatIllustrationConfig

    const illustration = generateBoatIllustration(config)

    const { data, error } = await adminDb
      .from('boat_configurations')
      .insert({
        user_id: body.userId ?? null,
        vessel_type_id: body.vesselTypeId ?? '',
        length_ft: config.lengthFt,
        beam_ft: config.beamFt,
        purpose: config.purpose,
        hull_material: config.hullMaterial,
        hull_color: config.hullColor,
        engine_type: config.engineType,
        engine_brand: config.engineBrand ?? null,
        engine_hp: config.engineHp ?? null,
        engine_count: config.engineCount,
        cabin_config: config.cabinType,
        equipment: config.features,
        status: 'draft',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ configId: data.id, illustration })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
