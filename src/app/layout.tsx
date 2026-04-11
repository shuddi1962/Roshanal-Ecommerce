import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Roshanal Global — Security Systems, Marine, Safety & Professional Services",
    template: "%s | Roshanal Global",
  },
  description:
    "Your trusted partner for CCTV, fire alarm, access control, marine accessories, boat engines, boat building, safety equipment, kitchen installation, dredging services, and more. Shipping worldwide from Port Harcourt, Nigeria.",
  keywords: [
    "CCTV", "security systems", "fire alarm", "access control", "marine accessories",
    "boat engines", "boat building", "safety equipment", "dredging", "kitchen installation",
    "Yamaha engines", "Hikvision", "Port Harcourt", "Nigeria", "surveillance",
  ],
  openGraph: {
    title: "Roshanal Global — Security, Marine & Professional Services",
    description: "Premium security, marine, safety & professional services. Worldwide shipping.",
    type: "website",
    locale: "en_US",
    siteName: "Roshanal Global",
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Roshanal",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0C1A36" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased bg-off-white text-text-1">
        <div className="min-h-screen">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-blue-600">Roshanal Global</h1>
                <nav className="space-x-4">
                  <a href="/" className="text-gray-600 hover:text-blue-600">Home</a>
                  <a href="/shop" className="text-gray-600 hover:text-blue-600">Shop</a>
                  <a href="/account" className="text-gray-600 hover:text-blue-600">Account</a>
                  <a href="/admin" className="text-gray-600 hover:text-blue-600">Admin</a>
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p>&copy; 2026 Roshanal Global. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
