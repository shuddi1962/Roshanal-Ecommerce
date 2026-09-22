/**
 * Media Engine — Sharp.js Pipeline
 * - 5 output sizes per image
 * - WebP conversion on every upload
 * - Sharpening on every image (never blurry)
 * - Optional watermark (global default + per-product + per-banner override)
 * - Stores processed images in Insforge Storage
 */

import sharp from 'sharp'
import { adminDb } from '@/lib/db'

export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original'

export interface ImageSizeConfig {
  width: number
  height: number
  fit: 'cover' | 'contain' | 'inside'
}

export const IMAGE_SIZES: Record<ImageSize, ImageSizeConfig> = {
  thumbnail: { width: 80,   height: 80,   fit: 'cover' },
  small:     { width: 300,  height: 300,  fit: 'contain' },
  medium:    { width: 600,  height: 600,  fit: 'contain' },
  large:     { width: 1200, height: 1200, fit: 'contain' },
  original:  { width: 2000, height: 2000, fit: 'inside' },
}

export interface ProcessedImage {
  size: ImageSize
  url: string
  width: number
  height: number
  sizeBytes: number
}

export interface ProcessImageOptions {
  watermark?: boolean
  watermarkText?: string
  quality?: number // 1-100, default 85
  bucket?: string  // Insforge storage bucket, default 'products'
}

/**
 * Process a single image buffer through Sharp pipeline.
 * Returns WebP buffers for all 5 sizes.
 */
export async function processImageBuffer(
  inputBuffer: Buffer,
  options: ProcessImageOptions = {}
): Promise<Map<ImageSize, Buffer>> {
  const { quality = 85, watermark = false, watermarkText = 'Roshanal Global' } = options
  const results = new Map<ImageSize, Buffer>()

  for (const [sizeName, config] of Object.entries(IMAGE_SIZES) as [ImageSize, ImageSizeConfig][]) {
    let pipeline = sharp(inputBuffer)
      .resize(config.width, config.height, {
        fit: config.fit,
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .sharpen({ sigma: 0.8, m1: 1.0, m2: 2.0 }) // sharpening on every image
      .webp({ quality, effort: 4 })

    if (watermark && watermarkText && sizeName !== 'thumbnail') {
      const svgWatermark = generateWatermarkSVG(watermarkText, config.width)
      pipeline = pipeline.composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'southeast',
          blend: 'over',
        },
      ])
    }

    const buffer = await pipeline.toBuffer()
    results.set(sizeName, buffer)
  }

  return results
}

/**
 * Upload processed image to Insforge Storage.
 * Returns public URLs for all sizes.
 */
export async function uploadToInsforgeStorage(
  file: File | Buffer,
  filename: string,
  options: ProcessImageOptions = {}
): Promise<ProcessedImage[]> {
  const inputBuffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer())
  const bucket = options.bucket ?? 'products'
  const processed = await processImageBuffer(inputBuffer, options)
  const results: ProcessedImage[] = []
  const baseName = filename.replace(/\.[^.]+$/, '') // strip extension

  for (const [sizeName, buffer] of processed.entries()) {
    const path = `${baseName}/${sizeName}.webp`
    const { data, error } = await adminDb.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (error) {
      console.error(`[Media] Upload failed for ${sizeName}:`, error.message)
      continue
    }

    const { data: urlData } = adminDb.storage.from(bucket).getPublicUrl(data.path)
    const meta = await sharp(buffer).metadata()

    results.push({
      size: sizeName,
      url: urlData.publicUrl,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      sizeBytes: buffer.length,
    })
  }

  return results
}

/**
 * Get the best URL for a given display context.
 */
export function getImageUrl(
  images: ProcessedImage[],
  preferredSize: ImageSize = 'medium'
): string {
  const preferred = images.find((i) => i.size === preferredSize)
  if (preferred) return preferred.url
  const fallback = images.find((i) => i.size === 'large') ?? images[0]
  return fallback?.url ?? '/images/placeholder-product.webp'
}

function generateWatermarkSVG(text: string, imageWidth: number): string {
  const fontSize = Math.max(12, Math.round(imageWidth * 0.025))
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${fontSize * 2}">
      <text
        x="${imageWidth - 8}"
        y="${fontSize * 1.5}"
        font-family="sans-serif"
        font-size="${fontSize}"
        fill="rgba(255,255,255,0.65)"
        text-anchor="end"
      >${text}</text>
    </svg>
  `
}
