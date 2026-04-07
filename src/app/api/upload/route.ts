import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { uploadToInsforgeStorage } from '@/lib/media'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) ?? 'products'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 })
    }

    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')}`
    const watermarked = formData.get('watermark') !== 'false'

    const processed = await uploadToInsforgeStorage(file, filename, {
      bucket,
      watermark: watermarked,
      quality: 85,
    })

    return NextResponse.json({
      ok: true,
      images: processed,
      primaryUrl: processed[0]?.url ?? '',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
