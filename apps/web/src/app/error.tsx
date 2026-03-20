'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary, #F0ECFF)', marginBottom: '8px' }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(240,236,255,0.5)', marginBottom: '24px', lineHeight: 1.6 }}>
          An unexpected error occurred.
          {error.digest && <><br /><span style={{ fontFamily: 'monospace', fontSize: '11px' }}>Ref: {error.digest}</span></>}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', borderRadius: '8px', background: 'linear-gradient(135deg,#7B5CF0,#2DD4BF)', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
          <a href="/" style={{ padding: '10px 24px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: 'rgba(240,236,255,0.7)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center' }}>
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
