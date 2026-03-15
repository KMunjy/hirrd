import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg,#ede8ff,#f4f2ff,#e6f9ff)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      fontFamily: "'Inter', Arial, sans-serif"
    }}>
      <div style={{ fontSize: '72px', marginBottom: '16px', lineHeight: 1 }}>🔍</div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1240', marginBottom: '12px' }}>
        Page not found
      </h1>
      <p style={{ fontSize: '15px', color: '#4a4270', maxWidth: '380px', lineHeight: 1.6, marginBottom: '32px' }}>
        This page doesn&apos;t exist yet — but your career does. Head back and let Hirrd find your next opportunity.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '12px 28px', borderRadius: '10px',
          background: 'linear-gradient(135deg,#7c58e8,#38c6d4)',
          color: 'white', fontWeight: 600, fontSize: '15px', textDecoration: 'none'
        }}>
          ← Back to Hirrd
        </Link>
        <Link href="/auth/register" style={{
          padding: '12px 24px', borderRadius: '10px',
          border: '1px solid rgba(124,88,232,0.3)',
          color: '#7c58e8', fontWeight: 600, fontSize: '15px', textDecoration: 'none'
        }}>
          Get hirrd →
        </Link>
      </div>
      <p style={{ marginTop: '40px', fontSize: '12px', color: '#8880a8', letterSpacing: '0.06em' }}>
        HIRRD · CAREER INTELLIGENCE · SA · ZW · UK
      </p>
    </div>
  )
}
