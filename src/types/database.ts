/**
 * Insforge Database Type Definitions
 * Auto-generated types for all tables defined in schema.sql
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      // USERS & AUTH
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: UserRole
          avatar_url: string | null
          wallet_balance_kobo: number
          loyalty_points: number
          loyalty_tier: LoyaltyTier
          birthday: string | null
          language: string
          currency_preference: string
          detected_country: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      staff: {
        Row: {
          id: string
          user_id: string
          role_id: string
          api_vault_access: Json
          is_active: boolean
          last_login: string | null
        }
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['staff']['Row']>
      }
      custom_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          dashboard_redirect: string
          permissions: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['custom_roles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['custom_roles']['Row']>
      }
      // PRODUCTS
      products: {
        Row: {
          id: string
          name: string
          slug: string
          short_description: string | null
          description_html: string
          sku: string
          barcode: string | null
          type: ProductType
          brand_id: string | null
          category_id: string | null
          regular_price_kobo: number
          sale_price_kobo: number | null
          cost_price_kobo: number | null
          b2b_price_kobo: number | null
          rental_price_kobo: number | null
          subscription_price_kobo: number | null
          subscription_cycle: string | null
          tax_class: string
          images: Json
          video_url: string | null
          video_360_url: string | null
          weight_kg: number | null
          dimensions: Json | null
          specifications: Json | null
          tags: string[]
          badges: Json
          watermark_enabled: boolean
          sale_badge_label: string | null
          sale_badge_color: string | null
          sale_badge_placements: Json
          countdown_enabled: boolean
          countdown_start: string | null
          countdown_end: string | null
          countdown_label: string | null
          countdown_style: string | null
          countdown_placements: Json
          seo_title: string | null
          seo_description: string | null
          seo_keyword: string | null
          schema_data: Json | null
          is_active: boolean
          is_featured: boolean
          is_draft: boolean
          vendor_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Row']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          emoji_icon: string | null
          sort_order: number
          is_active: boolean
          seo_title: string | null
          seo_description: string | null
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          is_authorized_dealer: boolean
        }
        Insert: Omit<Database['public']['Tables']['brands']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['brands']['Row']>
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string
          price_kobo: number
          stock_quantity: number
          image_url: string | null
          attributes: Json
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['product_variants']['Row']>
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          body: string
          images: Json
          is_verified: boolean
          staff_reply: string | null
          helpful_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_reviews']['Row']>
      }
      // INVENTORY
      inventory: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          branch_id: string
          quantity: number
          reserved_qty: number
          low_stock_threshold: number
          allow_backorder: boolean
        }
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['inventory']['Row']>
      }
      branches: {
        Row: {
          id: string
          name: string
          slug: string
          address: string
          city: string
          state: string
          lat: number | null
          lng: number | null
          manager_staff_id: string | null
          phone: string | null
          hours: Json | null
          payment_methods: Json
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['branches']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['branches']['Row']>
      }
      // ORDERS
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: OrderStatus
          payment_status: PaymentStatus
          payment_method: string
          payment_reference: string | null
          gateway: string | null
          subtotal_kobo: number
          discount_kobo: number
          shipping_kobo: number
          vat_kobo: number
          total_kobo: number
          currency_code: string
          currency_rate: number
          shipping_address: Json
          billing_address: Json | null
          fulfillment_branch_id: string | null
          tracking_number: string | null
          notes: string | null
          abandoned_at: string | null
          recovery_sent_at: string | null
          vendor_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          vendor_id: string | null
          quantity: number
          unit_price_kobo: number
          total_price_kobo: number
          product_snapshot: Json
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Row']>
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          product_id: string
          variant_id: string | null
          quantity: number
          branch_id: string | null
          added_at: string
        }
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'added_at'>
        Update: Partial<Database['public']['Tables']['cart_items']['Row']>
      }
      // BOAT BUILDING
      vessel_types: {
        Row: {
          id: string
          name: string
          description: string
          size_range_ft: Json
          base_price_estimate_kobo: number
          side_profile_svg: string | null
          top_view_svg: string | null
          admin_reference_images: Json
          engine_options: Json
          features_available: Json
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['vessel_types']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['vessel_types']['Row']>
      }
      boat_configurations: {
        Row: {
          id: string
          user_id: string | null
          vessel_type_id: string
          length_ft: number
          beam_ft: number
          purpose: string
          hull_material: string
          hull_color: string
          engine_type: string
          engine_brand: string | null
          engine_hp: number | null
          engine_count: number
          cabin_config: string
          equipment: Json
          special_notes: string | null
          generated_illustration_url: string | null
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['boat_configurations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['boat_configurations']['Row']>
      }
      boat_enquiries: {
        Row: {
          id: string
          config_id: string | null
          user_id: string | null
          action_type: string
          budget_range: string | null
          timeline: string | null
          contact_name: string
          contact_phone: string
          contact_email: string
          assigned_staff_id: string | null
          quote_pdf_url: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['boat_enquiries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['boat_enquiries']['Row']>
      }
      // BOOKINGS
      bookings: {
        Row: {
          id: string
          user_id: string
          service_type_id: string
          staff_id: string | null
          date: string
          time_slot: string
          status: BookingStatus
          deposit_paid_kobo: number
          balance_due_kobo: number
          total_kobo: number
          address: string
          notes: string | null
          customer_uploaded_files: Json
          completion_photos: Json
          job_report: string | null
          customer_signature: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Row']>
      }
      // VENDORS
      vendors: {
        Row: {
          id: string
          user_id: string
          shop_name: string
          shop_slug: string
          shop_description: string | null
          shop_banner_url: string | null
          shop_logo_url: string | null
          shop_layout_format: number
          shop_colors: Json
          commission_rate: number
          tier: VendorTier
          bank_name: string | null
          bank_account: string | null
          bank_account_name: string | null
          is_approved: boolean
          is_suspended: boolean
          rating: number
          total_sales_kobo: number
          pending_payout_kobo: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vendors']['Row']>
      }
      // AFFILIATES
      affiliates: {
        Row: {
          id: string
          user_id: string
          code: string
          commission_rate: number
          total_earned_kobo: number
          pending_kobo: number
          paid_kobo: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['affiliates']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['affiliates']['Row']>
      }
      // LOYALTY
      loyalty_tiers: {
        Row: {
          id: string
          name: string
          min_points: number
          max_points: number | null
          discount_rate: number
          free_shipping: boolean
          priority_support: boolean
          perks: Json
        }
        Insert: Omit<Database['public']['Tables']['loyalty_tiers']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['loyalty_tiers']['Row']>
      }
      // SYSTEM
      feature_flags: {
        Row: {
          id: string
          key: string
          name: string
          description: string
          module: string
          enabled: boolean
          updated_by: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['feature_flags']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['feature_flags']['Row']>
      }
      api_vault: {
        Row: {
          id: string
          service: string
          key_name: string
          encrypted_value: string
          allowed_staff_ids: string[]
          is_active: boolean
          last_tested: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['api_vault']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['api_vault']['Row']>
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string
          type: string
          group: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          staff_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json
          ip_address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['activity_logs']['Row']>
      }
      currency_rates: {
        Row: {
          id: string
          base_currency: string
          rates: Json
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['currency_rates']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['currency_rates']['Row']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          content_html: string
          excerpt: string | null
          cover_image: string | null
          author_id: string
          status: 'draft' | 'published'
          seo_title: string | null
          seo_description: string | null
          focus_keyword: string | null
          tags: string[]
          published_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['blog_posts']['Row']>
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed'
          value: number
          min_order_kobo: number
          max_uses: number | null
          uses_count: number
          product_ids: string[]
          category_ids: string[]
          user_id: string | null
          expires_at: string | null
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['coupons']['Row']>
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          industry: string | null
          size: string | null
          source: string
          score: number
          status: string
          assigned_to: string | null
          next_follow_up: string | null
          linkedin_url: string | null
          website: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leads']['Row']>
      }
      quotes: {
        Row: {
          id: string
          user_id: string | null
          quote_number: string
          status: string
          items: Json
          subtotal_kobo: number
          discount_kobo: number
          vat_kobo: number
          total_kobo: number
          valid_until: string | null
          notes: string | null
          pdf_url: string | null
          assigned_staff_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quotes']['Row']>
      }
      indexing_log: {
        Row: {
          id: string
          url: string
          submitted_at: string
          google_status: string | null
          bing_status: string | null
          last_indexed_at: string | null
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['indexing_log']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['indexing_log']['Row']>
      }
      site_doctor_logs: {
        Row: {
          id: string
          check_type: string
          status: 'ok' | 'warning' | 'error'
          issue_found: string | null
          fix_applied: string | null
          details: Json
          ran_at: string
        }
        Insert: Omit<Database['public']['Tables']['site_doctor_logs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['site_doctor_logs']['Row']>
      }
      support_conversations: {
        Row: {
          id: string
          user_id: string | null
          agent_persona_id: string
          status: string
          messages: Json
          admin_monitoring: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['support_conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['support_conversations']['Row']>
      }
      vendor_ads: {
        Row: {
          id: string
          vendor_id: string
          product_id: string | null
          ad_type: VendorAdType
          pricing_model: VendorAdPricingModel
          budget_kobo: number
          daily_budget_kobo: number
          start_date: string
          end_date: string
          impressions: number
          clicks: number
          conversions: number
          spend_kobo: number
          status: string
          admin_approved: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vendor_ads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vendor_ads']['Row']>
      }
      homepage_config: {
        Row: {
          id: string
          sections: Json
          product_tabs: Json
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['homepage_config']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['homepage_config']['Row']>
      }
      footer_config: {
        Row: {
          id: string
          columns: Json
          image_blocks: Json
          social_links: Json
          app_links: Json
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['footer_config']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['footer_config']['Row']>
      }
      banners: {
        Row: {
          id: string
          title: string
          image_url: string
          link_url: string | null
          position: string
          sizes: Json
          watermark_enabled: boolean
          sort_order: number
          is_active: boolean
          starts_at: string | null
          ends_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['banners']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['banners']['Row']>
      }
      seasonal_campaigns: {
        Row: {
          id: string
          name: string
          event_key: string
          start_date: string
          end_date: string
          banner_urls: Json
          notice_bar_text: string | null
          deals_slug: string | null
          is_active: boolean
          auto_activate: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['seasonal_campaigns']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['seasonal_campaigns']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ─── Domain types ────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'store_manager'
  | 'accountant'
  | 'marketing_manager'
  | 'technical_team'
  | 'field_technical_team'
  | 'customer_support'
  | 'content_editor'
  | 'delivery_boy'
  | 'warehouse_staff'
  | 'location_manager'
  | 'sales_staff'
  | 'b2b_customer'
  | 'customer'
  | 'vendor'

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type ProductType =
  | 'simple'
  | 'variable'
  | 'digital'
  | 'service'
  | 'bundle'
  | 'rental'
  | 'subscription'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'return_requested'
  | 'returned'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'failed'
  | 'cod_pending'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'deposit_paid'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type VendorTier = 'standard' | 'premium' | 'verified'

export type VendorAdType =
  | 'featured_listing'
  | 'homepage_banner'
  | 'category_banner'
  | 'sponsored_product'
  | 'sidebar_ad'

export type VendorAdPricingModel = 'cpc' | 'cpm' | 'cpa' | 'cpd' | 'fixed_duration'
