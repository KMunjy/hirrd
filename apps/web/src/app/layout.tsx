import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hirrd — Career Intelligence',
  description: 'Upload your CV once. Hirrd works until you find your right opportunity — across South Africa, Zimbabwe, and the UK.',
  keywords: ['jobs', 'careers', 'South Africa', 'Zimbabwe', 'UK', 'learnerships', 'internships', 'CV', 'AI matching'],
  openGraph: {
    title: 'Hirrd — Career Intelligence',
    description: 'Get hirrd. AI-powered career matching for Africa and Europe.',
    url: 'https://hirrd.com',
    siteName: 'Hirrd',
    images: [{ url: 'https://hirrd.com/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hirrd — Career Intelligence',
    description: 'Upload your CV once. We do the rest.',
    images: ['https://hirrd.com/og-image.png'],
  },
  manifest: '/manifest.json',
  themeColor: '#7C58E8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hirrd',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-bg-base font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
