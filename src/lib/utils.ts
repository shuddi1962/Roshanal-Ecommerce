import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { nanoid } from 'nanoid'
import slugify from 'slugify'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-safe slug from any string.
 */
export function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true })
}

/**
 * Generate a short unique ID (for order numbers, reference IDs, etc.)
 */
export function generateId(length = 12): string {
  return nanoid(length)
}

/**
 * Generate an order number (e.g., RG-2026-ABCD1234)
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const suffix = nanoid(8).toUpperCase()
  return `RG-${year}-${suffix}`
}

/**
 * Generate a quote number (e.g., QT-2026-001234)
 */
export function generateQuoteNumber(sequence: number): string {
  const year = new Date().getFullYear()
  return `QT-${year}-${String(sequence).padStart(6, '0')}`
}

/**
 * Format a date string for display.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date))
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}

/**
 * Calculate sale percentage off.
 */
export function getSalePercentage(regularKobo: number, saleKobo: number): number {
  if (regularKobo <= 0 || saleKobo >= regularKobo) return 0
  return Math.round(((regularKobo - saleKobo) / regularKobo) * 100)
}

/**
 * Check if a product is on sale (auto-detect).
 */
export function isOnSale(regularKobo: number, saleKobo: number | null): boolean {
  return saleKobo !== null && saleKobo > 0 && saleKobo < regularKobo
}

/**
 * Get current effective price in kobo.
 */
export function getEffectivePrice(regularKobo: number, saleKobo: number | null): number {
  if (isOnSale(regularKobo, saleKobo)) return saleKobo!
  return regularKobo
}

/**
 * Delay utility for async throttling.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Deep clone a JSON-serializable object.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

/**
 * Format file size bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/**
 * Validate Nigerian phone number.
 */
export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().+]/g, '')
  return /^(0|234)?[789]\d{9}$/.test(cleaned)
}

/**
 * Format a Nigerian phone number to international format.
 */
export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-().+]/g, '')
  if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`
  if (cleaned.startsWith('234')) return `+${cleaned}`
  return `+234${cleaned}`
}

/**
 * Chunk an array into groups of n.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

/**
 * Get initials from a name (for avatar fallbacks).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}
