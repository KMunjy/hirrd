'use client'

export default function OfflinePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📡</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>You&apos;re offline</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6, maxWidth: '340px' }}>
          No internet connection. Your cached job matches are still available — go back to browse them.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>
          Hirrd works offline for browsing. You&apos;ll need data to apply or upload your CV.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}
        >
          ← Go back
        </button>
      </div>
    </div>
  )
}
