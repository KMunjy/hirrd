import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hirrd — Career Intelligence',
  description: 'Upload your CV once. Hirrd works until you find your right opportunity — across South Africa, Zimbabwe, and the UK.',
  keywords: ['jobs', 'careers', 'South Africa', 'Zimbabwe', 'UK', 'learnerships', 'internships', 'CV', 'AI matching'],
  openGraph: {
    title: 'Hirrd — Career Intelligence',
    description: 'Get hirrd. AI-powered career matching for Africa and Europe.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen" style={{ fontFamily: "'Inter', Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
