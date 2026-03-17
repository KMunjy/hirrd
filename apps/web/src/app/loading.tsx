export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--glass-1, #09061A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '3px solid rgba(123,92,240,0.2)',
          borderTop: '3px solid #7B5CF0',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: '13px', color: 'rgba(240,236,255,0.4)', margin: 0 }}>Loading…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
