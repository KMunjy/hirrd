import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'

const inter = Inter({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hirrd — Career Intelligence',
  description: 'Upload your CV once. Hirrd works until you find your right opportunity — across South Africa.',
  keywords: ['jobs', 'careers', 'South Africa', 'learnerships', 'internships', 'CV', 'AI matching', 'SA jobs'],
  openGraph: {
    title: 'Hirrd — Career Intelligence',
    description: 'Get hirrd. AI-powered career matching for South Africa.',
    url: 'https://hirrd.com',
    siteName: 'Hirrd',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Hirrd" />
        <meta name="theme-color" content="#7C58E8" />
        <meta name="application-name" content="Hirrd" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-startup-image" href="/icons/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        {/* Security headers via meta (belt-and-suspenders — middleware handles server-side) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      </head>
      <body className="min-h-screen" style={{ fontFamily: inter.style.fontFamily }}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ServiceWorkerRegistrar />
        <div id="main-content">
        {children}
        </div>
        {/* Service worker registered via /public/sw.js — loaded by browser automatically */}
      </body>
    </html>
  )
}
