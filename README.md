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

## Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@roshanalglobal.com | admin123 |
| Staff | staff@roshanalglobal.com | staff123 |
| Customer | customer@test.com | customer123 |
| Vendor | vendor@roshanalglobal.com | vendor123 |

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
