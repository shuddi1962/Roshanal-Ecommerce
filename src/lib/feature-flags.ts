/**
 * Feature Flag Engine
 *
 * All features must be wrapped in a feature flag check before rendering.
 * Flags are stored in Insforge DB (feature_flags table) and cached in memory.
 * Admin can toggle from Admin → Feature Flags without redeployment.
 */

import { adminDb } from '@/lib/db'

export type FeatureFlagKey =
  // Geo & Currency
  | 'geolocation_detection'
  | 'live_currency_conversion'
  | 'multi_currency_display'
  | 'language_auto_switch'
  | 'location_indicator'
  | 'geo_popup_campaigns'
  // AI Features
  | 'ai_support_chat'
  | 'ai_voice_agent'
  | 'voice_payment'
  | 'ai_outbound_calls'
  | 'ai_product_writer'
  | 'ai_blog_researcher'
  | 'ai_blog_writer'
  | 'ai_banner_generator'
  | 'ai_marketing_agent'
  | 'ai_seo_optimizer'
  | 'ai_review_responder'
  | 'ai_ugc_video_creator'
  | 'ai_image_generator'
  | 'ai_page_builder'
  | 'voice_welcome_greeting'
  | 'ai_daily_research_agent'
  | 'ai_quote_generator'
  | 'seasonal_ai_generator'
  | 'ai_plugin_builder'
  | 'ai_boat_visual_generator'
  // SEO & Indexing
  | 'google_search_console'
  | 'ga4'
  | 'google_auto_indexing'
  | 'google_my_business'
  | 'bing_webmaster_tools'
  | 'bing_auto_indexing'
  | 'meta_pixel'
  | 'tiktok_pixel'
  | 'schema_org'
  | 'open_graph'
  | 'sitemap_auto_generator'
  | 'google_shopping_feed'
  | 'hreflang_tags'
  | 'hotjar_clarity'
  | 'google_tag_manager'
  // Marketing
  | 'google_ads_conversion'
  | 'social_auto_post'
  | 'content_calendar'
  | 'email_campaign_manager'
  | 'newsletter'
  | 'sms_blast'
  | 'seasonal_campaigns'
  | 'popup_notifications'
  | 'exit_intent_popup'
  | 'social_proof'
  | 'affiliate_program'
  // Payments
  | 'paystack'
  | 'squad_co'
  | 'flutterwave'
  | 'stripe'
  | 'nowpayments_crypto'
  | 'wallet'
  | 'loyalty_points'
  | 'referral_program'
  // Customer
  | 'wishlist'
  | 'compare'
  | 'qa'
  | 'reviews'
  | 'recently_viewed'
  | 'back_in_stock_alerts'
  | 'gift_cards'
  | 'upsell_engine'
  | 'abandoned_cart_recovery'
  | 'whatsapp_button'
  | 'subscription_orders'
  | 'quote_sourcing'
  | 'price_alert'
  | 'rental_system'
  | 'product_tabs_homepage'
  | 'quick_view_modal'
  | 'before_after_slider'
  | 'image_hotspot'
  // Operations
  | 'cj_dropshipping'
  | 'b2b_wholesale'
  | 'pos_system'
  | 'booking_system'
  | 'multi_location_inventory'
  | 'competitor_monitor'
  | 'field_team_chat'
  | 'warranty_management'
  | 'digital_downloads'
  | 'pickup_dropoff_points'
  | 'product_video_gen'
  | 'category_countdown'
  | 'vendor_marketplace'
  | 'vendor_ads_system'
  | 'rental_module'
  | 'subscription_module'
  // Services
  | 'boat_building_service'
  | 'boat_engines_category'
  | 'kitchen_installation_service'
  | 'maintenance_paid_booking'
  // System
  | 'custom_role_builder'
  | 'footer_app_icons'
  | 'indexing_status_dashboard'

interface FeatureFlag {
  id: string
  key: FeatureFlagKey
  name: string
  description: string
  module: string
  enabled: boolean
  updated_by: string | null
  updated_at: string
}

// In-memory cache with TTL
const flagCache = new Map<string, { value: boolean; expiresAt: number }>()
const CACHE_TTL_MS = 60_000 // 1 minute

/**
 * Get a single feature flag value.
 * Falls back to `false` if the flag is not found in DB.
 * Uses in-memory cache to avoid repeated DB calls.
 */
export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const cached = flagCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  try {
    const { data, error } = await adminDb
      .from('feature_flags')
      .select('enabled')
      .eq('key', key)
      .single()

    if (error || !data) {
      // Flag not in DB — default to false (safe)
      flagCache.set(key, { value: false, expiresAt: Date.now() + CACHE_TTL_MS })
      return false
    }

    const enabled = data.enabled as boolean
    flagCache.set(key, { value: enabled, expiresAt: Date.now() + CACHE_TTL_MS })
    return enabled
  } catch {
    return false
  }
}

/**
 * Get all feature flags at once (for admin panel).
 * Bypasses cache.
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const { data, error } = await adminDb
    .from('feature_flags')
    .select('*')
    .order('module', { ascending: true })

  if (error || !data) return []
  return data as FeatureFlag[]
}

/**
 * Toggle a feature flag ON or OFF (admin only).
 */
export async function setFeatureFlag(
  key: FeatureFlagKey,
  enabled: boolean,
  updatedBy: string
): Promise<void> {
  await adminDb
    .from('feature_flags')
    .upsert({ key, enabled, updated_by: updatedBy, updated_at: new Date().toISOString() })

  // Invalidate cache
  flagCache.delete(key)
}

/**
 * Seed default feature flags into DB (run once on setup).
 */
export const DEFAULT_FEATURE_FLAGS: Array<Omit<FeatureFlag, 'id' | 'updated_by' | 'updated_at'>> = [
  // Geo
  { key: 'geolocation_detection', name: 'Geolocation Detection', description: 'Auto-detect visitor country and city', module: 'Geo & Currency', enabled: true },
  { key: 'live_currency_conversion', name: 'Live Currency Conversion', description: 'Show prices in visitor currency', module: 'Geo & Currency', enabled: true },
  { key: 'multi_currency_display', name: 'Multi-Currency Display', description: 'Show prices in multiple currencies', module: 'Geo & Currency', enabled: true },
  { key: 'location_indicator', name: 'Location Indicator Pill', description: 'Show city/country pill in topbar', module: 'Geo & Currency', enabled: true },
  // AI
  { key: 'ai_support_chat', name: 'AI Support Chat', description: 'Shopping Assistant chat widget', module: 'AI Features', enabled: true },
  { key: 'ai_voice_agent', name: 'AI Voice Agent', description: 'Voice shopping assistant', module: 'AI Features', enabled: true },
  { key: 'voice_payment', name: 'Voice Payment', description: 'Optional voice-initiated payment (customer-initiated only)', module: 'AI Features', enabled: false },
  { key: 'ai_product_writer', name: 'AI Product Writer', description: 'AI generates product descriptions (saves as DRAFT)', module: 'AI Features', enabled: true },
  { key: 'ai_blog_writer', name: 'AI Blog Writer', description: 'AI writes blog posts (saves as DRAFT)', module: 'AI Features', enabled: true },
  { key: 'ai_daily_research_agent', name: 'Daily Research Agent', description: 'Midnight research agent + 7AM report', module: 'AI Features', enabled: true },
  { key: 'ai_boat_visual_generator', name: 'Boat Visual Generator', description: 'SVG boat illustration engine', module: 'AI Features', enabled: true },
  // Payments
  { key: 'paystack', name: 'Paystack', description: 'Paystack payment gateway', module: 'Payments', enabled: true },
  { key: 'squad_co', name: 'Squad', description: 'Squad.co payment gateway', module: 'Payments', enabled: true },
  { key: 'flutterwave', name: 'Flutterwave', description: 'Flutterwave payment gateway', module: 'Payments', enabled: true },
  { key: 'stripe', name: 'Stripe', description: 'Stripe international payments', module: 'Payments', enabled: true },
  { key: 'nowpayments_crypto', name: 'Crypto Payments', description: 'NowPayments crypto gateway', module: 'Payments', enabled: false },
  { key: 'wallet', name: 'Platform Wallet', description: 'Customer wallet and balance', module: 'Payments', enabled: true },
  { key: 'loyalty_points', name: 'Loyalty Points', description: 'Points and tier system', module: 'Payments', enabled: true },
  // Customer
  { key: 'wishlist', name: 'Wishlist', description: 'Save products to wishlist', module: 'Customer', enabled: true },
  { key: 'compare', name: 'Product Compare', description: 'Compare up to 4 products side-by-side', module: 'Customer', enabled: true },
  { key: 'reviews', name: 'Product Reviews', description: 'Customer reviews and ratings', module: 'Customer', enabled: true },
  { key: 'gift_cards', name: 'Gift Cards', description: 'Generate and sell gift cards', module: 'Customer', enabled: true },
  { key: 'abandoned_cart_recovery', name: 'Abandoned Cart Recovery', description: 'Email/SMS/WhatsApp recovery sequences', module: 'Customer', enabled: true },
  { key: 'upsell_engine', name: 'Upsell Engine', description: 'Cross-sell and upsell recommendations', module: 'Customer', enabled: true },
  // Operations
  { key: 'pos_system', name: 'POS System', description: 'Point of sale terminal', module: 'Operations', enabled: true },
  { key: 'booking_system', name: 'Booking System', description: 'Service bookings with deposit', module: 'Operations', enabled: true },
  { key: 'multi_location_inventory', name: 'Multi-Location Inventory', description: 'Stock management across branches', module: 'Operations', enabled: true },
  { key: 'competitor_monitor', name: 'Competitor Monitor', description: 'Track competitor prices every 6h', module: 'Operations', enabled: true },
  { key: 'vendor_marketplace', name: 'Vendor Marketplace', description: 'Full multivendor marketplace', module: 'Operations', enabled: false },
  { key: 'vendor_ads_system', name: 'Vendor Advertising', description: 'Vendor ad campaigns (CPC/CPM/CPA)', module: 'Operations', enabled: false },
  // Services
  { key: 'boat_building_service', name: 'Boat Building Service', description: 'Boat configurator and enquiry system', module: 'Services', enabled: true },
  { key: 'boat_engines_category', name: 'Boat Engines Category', description: 'Dedicated boat engines shop page', module: 'Services', enabled: true },
  { key: 'kitchen_installation_service', name: 'Kitchen Installation', description: 'Indoor/outdoor/commercial kitchen service', module: 'Services', enabled: true },
  { key: 'maintenance_paid_booking', name: 'Maintenance Booking', description: 'Paid maintenance contract bookings', module: 'Services', enabled: true },
  // SEO
  { key: 'google_auto_indexing', name: 'Google Auto-Indexing', description: 'Submit URLs to Google Indexing API on publish', module: 'SEO & Indexing', enabled: true },
  { key: 'bing_auto_indexing', name: 'Bing Auto-Indexing', description: 'Submit URLs to Bing on publish', module: 'SEO & Indexing', enabled: true },
  { key: 'schema_org', name: 'Schema.org Markup', description: 'Structured data for all pages', module: 'SEO & Indexing', enabled: true },
  { key: 'sitemap_auto_generator', name: 'Auto Sitemap', description: 'Auto-generate and submit sitemap', module: 'SEO & Indexing', enabled: true },
  // System
  { key: 'custom_role_builder', name: 'Custom Role Builder', description: 'Permission matrix editor for custom roles', module: 'System', enabled: true },
  { key: 'indexing_status_dashboard', name: 'Indexing Status Dashboard', description: 'Per-URL Google + Bing index status', module: 'System', enabled: true },
]
