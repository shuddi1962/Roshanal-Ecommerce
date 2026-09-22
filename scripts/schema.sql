-- ============================================================
-- ROSHANAL GLOBAL — AI Commerce OS
-- Insforge.dev Database Schema
-- Run this in Insforge SQL editor to set up all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS & AUTH ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  password_hash TEXT,
  avatar_url TEXT,
  wallet_balance_kobo BIGINT NOT NULL DEFAULT 0,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  loyalty_tier TEXT NOT NULL DEFAULT 'bronze',
  birthday DATE,
  language TEXT NOT NULL DEFAULT 'en',
  currency_preference TEXT NOT NULL DEFAULT 'NGN',
  detected_country TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL DEFAULT 'customer_support',
  api_vault_access JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#1641C4',
  dashboard_redirect TEXT DEFAULT '/admin/dashboard',
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS two_factor_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  secret TEXT NOT NULL,
  backup_codes JSONB DEFAULT '[]',
  enabled_at TIMESTAMPTZ
);

-- ─── PRODUCTS & CATALOG ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  emoji_icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT
);

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  is_authorized_dealer BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description_html TEXT NOT NULL DEFAULT '',
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT,
  type TEXT NOT NULL DEFAULT 'simple',
  brand_id UUID REFERENCES brands(id),
  category_id UUID REFERENCES categories(id),
  regular_price_kobo BIGINT NOT NULL DEFAULT 0,
  sale_price_kobo BIGINT,
  cost_price_kobo BIGINT,
  b2b_price_kobo BIGINT,
  rental_price_kobo BIGINT,
  subscription_price_kobo BIGINT,
  subscription_cycle TEXT,
  tax_class TEXT DEFAULT 'standard',
  images JSONB DEFAULT '[]',
  video_url TEXT,
  video_360_url TEXT,
  weight_kg NUMERIC(8,2),
  dimensions JSONB,
  specifications JSONB,
  tags TEXT[] DEFAULT '{}',
  badges JSONB DEFAULT '[]',
  watermark_enabled BOOLEAN DEFAULT FALSE,
  sale_badge_label TEXT,
  sale_badge_color TEXT,
  sale_badge_placements JSONB DEFAULT '[]',
  countdown_enabled BOOLEAN DEFAULT FALSE,
  countdown_start TIMESTAMPTZ,
  countdown_end TIMESTAMPTZ,
  countdown_label TEXT,
  countdown_style TEXT,
  countdown_placements JSONB DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  seo_keyword TEXT,
  schema_data JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT TRUE,
  vendor_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active, is_draft);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price_kobo BIGINT NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  attributes JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  is_verified BOOLEAN DEFAULT FALSE,
  staff_reply TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_qa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  question TEXT NOT NULL,
  answer TEXT,
  staff_id UUID,
  answered_at TIMESTAMPTZ
);

-- ─── INVENTORY ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  manager_staff_id UUID,
  phone TEXT,
  hours JSONB,
  payment_methods JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_qty INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT FALSE,
  UNIQUE(product_id, variant_id, branch_id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  branch_id UUID REFERENCES branches(id),
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID,
  staff_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id),
  status TEXT DEFAULT 'draft',
  total_kobo BIGINT DEFAULT 0,
  items JSONB DEFAULT '[]',
  expected_date DATE,
  received_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS & COMMERCE ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'card',
  payment_reference TEXT,
  gateway TEXT,
  subtotal_kobo BIGINT NOT NULL DEFAULT 0,
  discount_kobo BIGINT NOT NULL DEFAULT 0,
  shipping_kobo BIGINT NOT NULL DEFAULT 0,
  vat_kobo BIGINT NOT NULL DEFAULT 0,
  total_kobo BIGINT NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'NGN',
  currency_rate NUMERIC(12,6) DEFAULT 1,
  shipping_address JSONB NOT NULL DEFAULT '{}',
  billing_address JSONB,
  fulfillment_branch_id UUID REFERENCES branches(id),
  tracking_number TEXT,
  notes TEXT,
  abandoned_at TIMESTAMPTZ,
  recovery_sent_at TIMESTAMPTZ,
  vendor_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID,
  vendor_id UUID,
  quantity INTEGER NOT NULL,
  unit_price_kobo BIGINT NOT NULL,
  total_price_kobo BIGINT NOT NULL,
  product_snapshot JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID REFERENCES products(id),
  variant_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  branch_id UUID,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage',
  value NUMERIC(10,2) NOT NULL,
  min_order_kobo BIGINT DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  product_ids JSONB DEFAULT '[]',
  category_ids JSONB DEFAULT '[]',
  user_id UUID,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  type TEXT NOT NULL,
  amount_kobo BIGINT NOT NULL,
  reference TEXT UNIQUE,
  gateway TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BOAT BUILDING ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vessel_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  size_range_ft JSONB DEFAULT '{"min": 10, "max": 120}',
  base_price_estimate_kobo BIGINT DEFAULT 0,
  side_profile_svg TEXT,
  top_view_svg TEXT,
  admin_reference_images JSONB DEFAULT '[]',
  engine_options JSONB DEFAULT '[]',
  features_available JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS boat_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  vessel_type_id TEXT,
  length_ft NUMERIC(6,1) NOT NULL,
  beam_ft NUMERIC(5,1) NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'Custom',
  hull_material TEXT NOT NULL,
  hull_color TEXT NOT NULL DEFAULT '#1641C4',
  engine_type TEXT NOT NULL DEFAULT 'outboard',
  engine_brand TEXT,
  engine_hp INTEGER,
  engine_count INTEGER DEFAULT 1,
  cabin_config TEXT NOT NULL DEFAULT 'open_deck',
  equipment JSONB DEFAULT '[]',
  special_notes TEXT,
  generated_illustration_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boat_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID REFERENCES boat_configurations(id),
  user_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  assigned_staff_id UUID,
  quote_pdf_url TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boat_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  vessel_type_id UUID,
  description TEXT,
  images JSONB DEFAULT '[]',
  video_url TEXT,
  year_completed INTEGER,
  client_type TEXT,
  testimonial TEXT,
  specs JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  base_price_kobo BIGINT DEFAULT 0,
  deposit_required BOOLEAN DEFAULT TRUE,
  deposit_percentage NUMERIC(5,2) DEFAULT 30,
  deposit_min_kobo BIGINT DEFAULT 0,
  requires_site_visit BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type_id UUID REFERENCES service_types(id),
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_bookings INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  service_type_id UUID REFERENCES service_types(id),
  staff_id UUID,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  deposit_paid_kobo BIGINT DEFAULT 0,
  balance_due_kobo BIGINT DEFAULT 0,
  total_kobo BIGINT DEFAULT 0,
  address TEXT NOT NULL,
  notes TEXT,
  customer_uploaded_files JSONB DEFAULT '[]',
  completion_photos JSONB DEFAULT '[]',
  job_report TEXT,
  customer_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QUOTES ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  quote_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft',
  items JSONB DEFAULT '[]',
  subtotal_kobo BIGINT DEFAULT 0,
  discount_kobo BIGINT DEFAULT 0,
  vat_kobo BIGINT DEFAULT 0,
  total_kobo BIGINT DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  pdf_url TEXT,
  assigned_staff_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── VENDORS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  shop_name TEXT NOT NULL,
  shop_slug TEXT UNIQUE NOT NULL,
  shop_description TEXT,
  shop_banner_url TEXT,
  shop_logo_url TEXT,
  shop_layout_format INTEGER DEFAULT 1,
  shop_colors JSONB DEFAULT '{}',
  commission_rate NUMERIC(5,2) DEFAULT 10,
  tier TEXT DEFAULT 'standard',
  bank_name TEXT,
  bank_account TEXT,
  bank_account_name TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 0,
  total_sales_kobo BIGINT DEFAULT 0,
  pending_payout_kobo BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  product_id UUID REFERENCES products(id),
  ad_type TEXT NOT NULL,
  pricing_model TEXT NOT NULL,
  budget_kobo BIGINT DEFAULT 0,
  daily_budget_kobo BIGINT DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend_kobo BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  admin_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  amount_kobo BIGINT NOT NULL,
  status TEXT DEFAULT 'pending',
  reference TEXT,
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AFFILIATE ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  code TEXT UNIQUE NOT NULL,
  commission_rate NUMERIC(5,2) DEFAULT 5,
  total_earned_kobo BIGINT DEFAULT 0,
  pending_kobo BIGINT DEFAULT 0,
  paid_kobo BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id),
  order_id UUID REFERENCES orders(id),
  commission_kobo BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LOYALTY ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  discount_rate NUMERIC(5,2) DEFAULT 0,
  free_shipping BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  perks JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  order_id UUID,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  amount_kobo BIGINT NOT NULL,
  balance_after_kobo BIGINT NOT NULL,
  reference TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CRM & LEADS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  industry TEXT,
  size TEXT,
  source TEXT DEFAULT 'manual',
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  assigned_to UUID,
  next_follow_up TIMESTAMPTZ,
  linkedin_url TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  probability INTEGER DEFAULT 0,
  color TEXT DEFAULT '#1641C4'
);

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  stage_id UUID REFERENCES crm_stages(id),
  title TEXT NOT NULL,
  value_kobo BIGINT DEFAULT 0,
  probability INTEGER DEFAULT 0,
  expected_close DATE,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MARKETING ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'broadcast',
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  segment_ids JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  open_rate NUMERIC(5,2) DEFAULT 0,
  click_rate NUMERIC(5,2) DEFAULT 0,
  revenue_kobo BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  segment_ids JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  analytics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seasonal_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  event_key TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  banner_urls JSONB DEFAULT '[]',
  notice_bar_text TEXT,
  deals_slug TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  auto_activate BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  trigger_config JSONB DEFAULT '{}',
  geo_targeting JSONB DEFAULT '{}',
  frequency TEXT DEFAULT 'once',
  start_date DATE,
  end_date DATE,
  impressions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONTENT ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  focus_keyword TEXT,
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  template TEXT DEFAULT 'default'
);

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT DEFAULT 'homepage',
  sizes JSONB DEFAULT '{}',
  watermark_enabled BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS navigation_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT UNIQUE NOT NULL,
  items JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS footer_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  columns JSONB DEFAULT '[]',
  image_blocks JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '[]',
  app_links JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homepage_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sections JSONB DEFAULT '[]',
  product_tabs JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SYSTEM ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  module TEXT NOT NULL DEFAULT 'General',
  enabled BOOLEAN DEFAULT FALSE,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  allowed_staff_ids JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  last_tested TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service, key_name)
);

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type TEXT DEFAULT 'string',
  "group" TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  staff_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_doctor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  issue_found TEXT,
  fix_applied TEXT,
  details JSONB DEFAULT '{}',
  ran_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indexing_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT UNIQUE NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  google_status TEXT,
  bing_status TEXT,
  last_indexed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS support_conversations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agent_persona_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  messages JSONB DEFAULT '[]',
  admin_monitoring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_personas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  personality TEXT,
  greeting TEXT,
  response_style TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS research_agent_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  findings JSONB DEFAULT '{}',
  was_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitor_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  our_product_id UUID REFERENCES products(id),
  competitor_name TEXT NOT NULL,
  competitor_url TEXT,
  competitor_price_kobo BIGINT NOT NULL,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  price_history JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency TEXT NOT NULL DEFAULT 'NGN',
  rates JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geo_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  country_code TEXT,
  city TEXT,
  currency_code TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plugins (
  id TEXT PRIMARY KEY,
  manifest JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT FALSE,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  installed_by UUID,
  build_source TEXT DEFAULT 'manual'
);

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────
-- Enable RLS on all sensitive tables

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_vault ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "users_own_data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "orders_own_data" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cart_own_data" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_data" ON notifications FOR ALL USING (auth.uid() = user_id);

-- API Vault — service role only
CREATE POLICY "api_vault_service_only" ON api_vault FOR ALL USING (FALSE);
