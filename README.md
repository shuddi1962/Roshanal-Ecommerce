# Roshanal Ecommerce - AI Commerce Operating System

A comprehensive Nigerian e-commerce platform for security systems, marine equipment, boat engines, and professional services.

## Quick Deploy

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy
```

### Render
- Connect GitHub repo
- Build command: npm run build
- Publish directory: .next

## Environment Variables Required

Create a .env.local file with:

```
INSFORGE_URL=your-insforge-url
INSFORGE_ANON_KEY=your-anon-key
INSFORGE_SERVICE_KEY=your-service-key
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-domain.com
ENCRYPTION_KEY=32-char-random-string
```

## Test Accounts (demo login — use `/auth/login`)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@roshanalglobal.com | admin123 |
| Store Manager | manager@roshanalglobal.com | manager123 |
| Accountant | accountant@roshanalglobal.com | accountant123 |
| Vendor | vendor@roshanalglobal.com | vendor123 |
| Customer | customer@test.com | customer123 |

> Source of truth: `src/lib/auth.ts` and `src/app/auth/login/page.tsx` (demoUsers). Do NOT commit real `.env.local` secrets here.

## Features

- Full admin dashboard with analytics
- Multi-vendor marketplace
- Boat building configurator
- Kitchen installation booking
- POS system
- CRM and lead management
- Email campaigns
- Inventory management
- Geolocation and currency conversion

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- InsForge.dev (Backend)
- NextAuth v5 (Auth)
- Recharts (Charts)
- Framer Motion (Animations)
