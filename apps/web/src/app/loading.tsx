export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--void, #09061A)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
    }}>
      {/* Animated logo mark */}
      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #7B5CF0, #2DD4BF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: 900, color: 'white',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 0 40px rgba(123,92,240,0.5)',
          animation: 'logoBreath 2s ease-in-out infinite',
        }}>H</div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '120px', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #7B5CF0, #2DD4BF)',
          borderRadius: '1px',
          animation: 'loadBar 1.6s ease-in-out infinite',
        }} />
      </div>

      <p style={{ fontSize: '12px', color: 'rgba(240,236,255,0.3)', fontFamily: 'system-ui, sans-serif', fontWeight: 500, letterSpacing: '0.08em' }}>
        LOADING
      </p>

      <style>{`
        @keyframes logoBreath {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(123,92,240,0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(123,92,240,0.7); }
        }
        @keyframes loadBar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 80%; margin-left: 10%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}
