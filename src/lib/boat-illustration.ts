/**
 * Boat Illustration Engine — SVG Generator
 * Client-side SVG generation (no external API needed).
 * Generates side profile + top-down view for boat configurator.
 * Admin uploads SVG templates per vessel type from Admin → Boat Building → Illustration Library.
 */

export interface BoatIllustrationConfig {
  vesselType: string
  lengthFt: number
  beamFt: number
  hullColor: string
  hullMaterial: string
  engineCount: number
  engineType: 'outboard' | 'inboard' | 'inboard-outboard' | 'stern-drive' | 'electric' | 'none'
  engineBrand?: string
  engineHp?: number
  cabinType: 'open_deck' | 'enclosed_wheelhouse' | 'multi_cabin' | 'custom'
  features: string[]
  purpose: string
}

export interface BoatIllustrationOutput {
  sideViewSVG: string
  topViewSVG: string
  estimatedDimensions: {
    lengthFt: number
    beamFt: number
    draftFt: number
    heightFt: number
  }
  estimatedWeight: string
  capacity: string
  buildTime: string
}

const WATERMARK_TEXT = 'Roshanal Infotech Limited — Design Concept'
const DISCLAIMER = 'Concept illustration. Final build may vary.'

/**
 * Generate boat SVG illustration from configuration.
 */
export function generateBoatIllustration(config: BoatIllustrationConfig): BoatIllustrationOutput {
  const sideViewSVG = generateSideProfile(config)
  const topViewSVG = generateTopView(config)
  const estimatedDimensions = calculateDimensions(config)

  return {
    sideViewSVG,
    topViewSVG,
    estimatedDimensions,
    estimatedWeight: estimateWeight(config),
    capacity: estimateCapacity(config),
    buildTime: estimateBuildTime(config),
  }
}

function generateSideProfile(config: BoatIllustrationConfig): string {
  const W = 800
  const H = 320
  const hullColor = config.hullColor || '#1641C4'
  const hullDark = darkenColor(hullColor, 20)
  const hasCabin = config.cabinType !== 'open_deck'
  const hasEngine = config.engineType !== 'none'

  // Scale hull length proportionally
  const hullStartX = 60
  const hullEndX = W - 80
  const hullWidth = hullEndX - hullStartX
  const waterlineY = H * 0.55

  const bowTip = `${hullEndX + 40},${waterlineY}`
  const sternBottom = `${hullStartX},${waterlineY + 40}`
  const deckFore = `${hullEndX},${waterlineY - 50}`
  const deckAft = `${hullStartX + 20},${waterlineY - 40}`
  const midDeck = `${hullStartX + hullWidth * 0.5},${waterlineY - 60}`

  // Cabin SVG block
  const cabinSVG = hasCabin
    ? `
    <!-- Cabin / Wheelhouse -->
    <rect x="${hullStartX + hullWidth * 0.35}" y="${waterlineY - 130}"
      width="${hullWidth * 0.35}" height="70"
      rx="6" fill="white" stroke="${hullDark}" stroke-width="2" opacity="0.9"/>
    <!-- Windows -->
    <rect x="${hullStartX + hullWidth * 0.37}" y="${waterlineY - 120}"
      width="28" height="22" rx="3" fill="#A8D4F5" opacity="0.8"/>
    <rect x="${hullStartX + hullWidth * 0.37 + 36}" y="${waterlineY - 120}"
      width="28" height="22" rx="3" fill="#A8D4F5" opacity="0.8"/>
    `
    : ''

  // Engine SVG
  const engineSVGs: string[] = []
  if (hasEngine && config.engineType === 'outboard') {
    for (let i = 0; i < Math.min(config.engineCount, 4); i++) {
      const ex = hullStartX - 28 - i * 20
      engineSVGs.push(`
        <rect x="${ex}" y="${waterlineY - 20}" width="14" height="50"
          rx="4" fill="#2C2C2C" stroke="#444" stroke-width="1.5"/>
        <ellipse cx="${ex + 7}" cy="${waterlineY + 30}" rx="10" ry="4" fill="#1a1a1a"/>
      `)
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" 
    style="font-family:sans-serif;background:#f0f6ff;border-radius:12px;">
  <defs>
    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0077B6" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#023E8A" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="hullGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${hullColor}"/>
      <stop offset="100%" stop-color="${hullDark}"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="2" dy="4" stdDeviation="6" flood-opacity="0.2"/></filter>
  </defs>

  <!-- Water -->
  <rect x="0" y="${waterlineY + 30}" width="${W}" height="${H - waterlineY - 30}" 
    fill="url(#waterGrad)" rx="0"/>
  <!-- Water shimmer -->
  <ellipse cx="${W * 0.5}" cy="${waterlineY + 50}" rx="${W * 0.45}" ry="8" 
    fill="white" opacity="0.12"/>

  <!-- Hull body -->
  <polygon points="${deckFore} ${bowTip} ${sternBottom} ${deckAft} ${midDeck}"
    fill="url(#hullGrad)" filter="url(#shadow)"/>
  <!-- Deck surface -->
  <polygon points="${deckFore} ${midDeck} ${deckAft}"
    fill="white" opacity="0.15"/>
  <!-- Rub rail -->
  <line x1="${hullStartX + 20}" y1="${waterlineY - 40}" x2="${hullEndX + 30}" y2="${waterlineY - 50}"
    stroke="${hullDark}" stroke-width="3"/>

  ${cabinSVG}
  ${engineSVGs.join('\n')}

  <!-- Dimension callout: length -->
  <line x1="${hullStartX}" y1="${H - 30}" x2="${hullEndX + 40}" y2="${H - 30}"
    stroke="#4A5270" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-size="12" fill="#4A5270">
    ${config.lengthFt}ft × ${config.beamFt}ft beam
  </text>

  <!-- Label -->
  <text x="16" y="22" font-size="11" font-weight="700" fill="#0C1A36" letter-spacing="1">
    ${config.vesselType.toUpperCase()} — ${config.purpose.toUpperCase()}
  </text>
  <text x="16" y="38" font-size="10" fill="#8990AB">${config.hullMaterial} Hull · ${config.engineType !== 'none' ? `${config.engineCount}× ${config.engineType} engine` : 'No engine'}</text>

  <!-- Watermark -->
  <text x="${W - 12}" y="${H - 8}" text-anchor="end" font-size="9" fill="#8990AB" opacity="0.7">
    ${WATERMARK_TEXT}
  </text>

  <!-- Disclaimer -->
  <text x="16" y="${H - 8}" font-size="9" fill="#8990AB" opacity="0.7">${DISCLAIMER}</text>
</svg>`
}

function generateTopView(config: BoatIllustrationConfig): string {
  const W = 800
  const H = 280
  const hullColor = config.hullColor || '#1641C4'
  const hullDark = darkenColor(hullColor, 20)
  const cx = W / 2
  const beamPx = Math.min(160, config.beamFt * 8)
  const lengthPx = Math.min(600, config.lengthFt * 10)
  const hasCabin = config.cabinType !== 'open_deck'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"
    style="font-family:sans-serif;background:#E8F4FD;border-radius:12px;">
  <defs>
    <linearGradient id="hullTopGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${hullColor}"/>
      <stop offset="100%" stop-color="${hullDark}"/>
    </linearGradient>
  </defs>

  <!-- Hull top view (pointed bow, flat stern) -->
  <ellipse cx="${cx}" cy="${H / 2}" rx="${beamPx / 2}" ry="${lengthPx / 2}"
    fill="url(#hullTopGrad)" opacity="0.9"/>
  <!-- Bow accent -->
  <ellipse cx="${cx}" cy="${H / 2 - lengthPx / 2 + 20}" rx="${beamPx * 0.15}" ry="14"
    fill="${hullDark}" opacity="0.5"/>
  <!-- Deck width markers -->
  <line x1="${cx - beamPx / 2}" y1="${H / 2}" x2="${cx + beamPx / 2}" y2="${H / 2}"
    stroke="white" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>

  ${hasCabin ? `
  <!-- Cabin top view -->
  <rect x="${cx - beamPx * 0.22}" y="${H / 2 - lengthPx * 0.15}"
    width="${beamPx * 0.44}" height="${lengthPx * 0.3}"
    rx="6" fill="white" opacity="0.7" stroke="${hullDark}" stroke-width="1.5"/>
  ` : ''}

  <!-- Label -->
  <text x="${W / 2}" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="#0C1A36">
    TOP VIEW
  </text>
  <text x="${W / 2}" y="38" text-anchor="middle" font-size="10" fill="#4A5270">
    Beam: ${config.beamFt}ft
  </text>
  <!-- Watermark -->
  <text x="${W - 12}" y="${H - 8}" text-anchor="end" font-size="9" fill="#8990AB" opacity="0.7">
    ${WATERMARK_TEXT}
  </text>
</svg>`
}

function calculateDimensions(config: BoatIllustrationConfig): BoatIllustrationOutput['estimatedDimensions'] {
  const draftFactor = config.hullMaterial === 'Steel' ? 0.12 : 0.10
  const heightFactor = config.cabinType === 'enclosed_wheelhouse' ? 0.25 : 0.15

  return {
    lengthFt: config.lengthFt,
    beamFt: config.beamFt,
    draftFt: parseFloat((config.lengthFt * draftFactor).toFixed(1)),
    heightFt: parseFloat((config.lengthFt * heightFactor).toFixed(1)),
  }
}

function estimateWeight(config: BoatIllustrationConfig): string {
  const densityFactor: Record<string, number> = {
    'Fibre Glass': 0.8, 'Aluminium': 1.2, 'Steel': 2.5, 'Wood': 1.0, 'Composite': 0.9,
  }
  const factor = densityFactor[config.hullMaterial] ?? 1.0
  const weight = Math.round(config.lengthFt * config.beamFt * factor * 15)
  return `~${weight.toLocaleString()} kg`
}

function estimateCapacity(config: BoatIllustrationConfig): string {
  const base = Math.floor((config.lengthFt * config.beamFt) / 18)
  if (config.purpose === 'Fishing') return `${base} persons + gear`
  if (config.purpose === 'Passenger Transport') return `${Math.floor(base * 1.5)} passengers`
  if (config.purpose === 'Commercial') return `${Math.floor(config.lengthFt * 0.8)} tonnes cargo`
  return `${base} persons`
}

function estimateBuildTime(config: BoatIllustrationConfig): string {
  let weeks = Math.ceil(config.lengthFt / 4)
  if (config.hullMaterial === 'Steel') weeks += 4
  if (config.cabinType === 'multi_cabin') weeks += 3
  if (config.features.length > 8) weeks += 2
  return `${weeks}–${weeks + 4} weeks`
}

function darkenColor(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const num = parseInt(h.padEnd(6, '0'), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
