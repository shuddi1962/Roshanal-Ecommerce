# ROSHANAL GLOBAL — AI Commerce Operating System
## AGENTS.md — DO NOT DELETE OR MODIFY WITHOUT APPROVAL

### Company
- Legal Name: Roshanal Infotech Limited
- Trading Name: Roshanal Global
- Address: 14 Aba Road, Port Harcourt, Rivers State, Nigeria
- Phone: +234 800 ROSHANAL
- Email: info@roshanalglobal.com
- Hours: Monday–Saturday 8AM–6PM WAT
- Market: GLOBAL

### Brand Identity
- Navy: #0C1A36 (topbar, admin sidebar, footer bg)
- Blue: #1641C4 (primary buttons, links, accents)
- Red: #C8191C (CTAs, sale badges, dept nav)
- White: #FFFFFF
- Off-White: #F3F5FB (page backgrounds)
- Border: #E8EBF6 (card borders, dividers)
- Text-1: #080E22 (primary text)
- Text-2: #1E2540 (secondary text)
- Text-3: #4A5270 (muted text)
- Text-4: #8990AB (placeholder, hint)
- Success: #0B6B3A | Warning: #9C4B10

### Typography (NON-NEGOTIABLE)
- Syne 600–900: ALL headings, titles, prices, badges, buttons, product names
- Manrope 300–800: ALL body, descriptions, labels, nav, forms, table cells
- JetBrains Mono: SKUs, order IDs, API keys, codes, tracking numbers
- NEVER use Inter, Roboto, Arial, or system-ui as primary font

### Tech Stack (NON-NEGOTIABLE)
- Framework: Next.js 14 App Router
- Language: TypeScript strict (NO any)
- Styling: Tailwind CSS + shadcn/ui
- Backend: Insforge.dev EXCLUSIVELY
- Auth: NextAuth v5 beta
- Images: Sharp.js (NO Cloudinary)
- Media CDN: Insforge Storage (built-in)
- AI: Anthropic Claude API
- Voice: Vapi.ai + OpenAI Whisper
- Payments: Paystack + Squad.co + Flutterwave + Stripe + NowPayments
- Email: Resend + React Email
- SMS: Termii
- Push: OneSignal
- Maps: Mapbox GL JS
- Geo: ipapi.co
- Currency: Open Exchange Rates API
- Video: Kie.ai + FFmpeg
- Scraping: Apify
- Social: Buffer + Meta Graph + Twitter v2 + TikTok + LinkedIn APIs
- Animations: Framer Motion
- Charts: Recharts
- State: Zustand
- Forms: React Hook Form + Zod

### Architecture Rules
- Features NEVER import from each other — Event Bus only
- Every feature has a feature flag — check before rendering
- Every feature is self-contained in /features/[name]/
- ComponentSlot system for all cross-feature UI injection
- API Vault: all external API keys AES-256 encrypted in Insforge DB
- Per-staff API vault access toggling (admin-controlled, per-person)
- .env contains ONLY: INSFORGE_URL, INSFORGE_ANON_KEY, NEXTAUTH_SECRET, ENCRYPTION_KEY

### Products & Services
- Security: CCTV, Fire Alarm, Access Control, UPS/Inverter, Solar, Networking, ICT
- Marine: Accessories, Safety Equipment, Navigation Electronics, Pumps, Lighting
- Dredging: Equipment category + standalone dredging service
- Boat Engines: Yamaha, Honda, Mercury, Suzuki, Volvo — dedicated category page
- Boat Building: Custom vessel construction — standalone service with configurator
- Kitchen Installation: Indoor, Outdoor, Commercial, Domestic cooking — standalone service
- General: Maintenance, Consultation, B2B solutions

### AI Support Personas
- Sarah Adeyemi, Kemi Okafor, Tunde Nwachukwu, Fatima Aliyu
- Never admit to being AI. Full customer history access.

### Key Decisions (LOCKED — NEVER CHANGE)
- Voice payment: strictly optional, customer-initiated ONLY
- Sale badges: auto-detect when sale price < regular price
- Kitchen page: covers indoor + outdoor + commercial + domestic
- Boat building: full configurator + SVG illustration engine
- API Vault: per-staff per-service access toggles
- All AI content → DRAFT → admin approves
- Social posts → DRAFT → admin approves
- Multivendor: feature flag toggle — completely invisible when OFF
- Voice agent + AI chat: RAG sync every midnight

### Current Build Status
[Update this section after each module completes]
- [x] Automated Setup (Git + package install)
- [x] Project scaffold (Next.js 14 App Router, TypeScript strict)
- [ ] Feature Flag System
- [ ] Safe Delete + Plugin System
- [ ] API Vault
- [ ] Authentication + All Roles
- [ ] Database Schema (Insforge)
- [ ] Geolocation + Currency Service
- [ ] Media Engine (Sharp.js)
- [ ] 5-Layer Header
- [ ] Homepage + Product Tabs
- [ ] Shop + Category Pages
- [ ] Product Detail Page
- [ ] Cart + Checkout (7 steps)
- [ ] Customer Account
- [ ] Admin Shell + Analytics
- [ ] Product Upload + AI Content
- [ ] Inventory + Multi-location
- [ ] Orders + Fulfillment
- [ ] Payments (all gateways)
- [ ] Booking System (all services)
- [x] Boat Building Configurator
- [x] Boat Engines Category
- [x] Kitchen Installation Page
- [ ] Multivendor System
- [ ] Vendor Ad Platform
- [ ] CRM + Acquisition Engine
- [ ] Marketing + Campaigns
- [ ] AI Voice + Chat Agents
- [ ] Site Doctor
- [ ] SEO + Auto-indexing (Google + Bing)
- [ ] Page Builder
- [ ] Plugin Builder
- [ ] Deployment
