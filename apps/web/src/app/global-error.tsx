'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#09061A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '480px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F0ECFF', marginBottom: '8px' }}>Something went wrong</h1>
          <p style={{ fontSize: '14px', color: 'rgba(240,236,255,0.5)', marginBottom: '28px' }}>
            {error.digest && `Ref: ${error.digest}`}
          </p>
          <button onClick={reset} style={{ padding: '12px 28px', borderRadius: '8px', background: 'linear-gradient(135deg,#7B5CF0,#2DD4BF)', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
