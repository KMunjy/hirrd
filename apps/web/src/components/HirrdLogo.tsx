import React from 'react'

interface HirrdLogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
  theme?: 'light' | 'dark'
}

const sizes = {
  sm: { icon: 28, text: 22, tagline: false },
  md: { icon: 36, text: 28, tagline: false },
  lg: { icon: 48, text: 38, tagline: true },
}

export default function HirrdLogo({
  size = 'md',
  variant = 'full',
  theme = 'light',
}: HirrdLogoProps) {
  const s = sizes[size]
  const textColor = theme === 'dark' ? '#FFFFFF' : '#1A1240'
  const mutedColor = theme === 'dark' ? '#6A62A0' : '#8880A8'

  if (variant === 'icon') {
    return (
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="iBox" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDFBFF" />
            <stop offset="100%" stopColor="#EDE8FF" />
          </linearGradient>
          <linearGradient id="iArrow" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#B099FF" />
            <stop offset="50%" stopColor="#7C58E8" />
            <stop offset="100%" stopColor="#4E30B8" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="22" fill="url(#iBox)" />
        <rect width="96" height="96" rx="22" fill="none" stroke="rgba(124,88,232,0.2)" strokeWidth="1" />
        <ellipse cx="32" cy="22" rx="16" ry="9" fill="rgba(255,255,255,0.6)" />
        {/* Arrow 3D */}
        <polygon points="48,14 70,46 56,46 56,76 40,76 40,46 26,46" fill="#2E1880" opacity="0.18" transform="translate(4,5)" />
        <polygon points="70,46 76,40 64,40 64,70 56,76 56,46" fill="#3A1888" opacity="0.8" />
        <polygon points="48,14 70,46 56,46 56,76 40,76 40,46 26,46" fill="url(#iArrow)" />
        <polygon points="48,14 70,46 64,40 48,22" fill="rgba(200,180,255,0.45)" />
        <ellipse cx="48" cy="24" rx="7" ry="4" fill="rgba(255,255,255,0.5)" transform="rotate(-18,48,24)" />
        {/* Teal base */}
        <rect x="0" y="88" width="96" height="8" rx="4" fill="#38C6D4" opacity="0.9" />
      </svg>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={`lBox_${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme === 'dark' ? '#1E1448' : '#FDFBFF'} />
            <stop offset="100%" stopColor={theme === 'dark' ? '#140C38' : '#EDE8FF'} />
          </linearGradient>
          <linearGradient id={`lArrow_${size}`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#B099FF" />
            <stop offset="50%" stopColor="#7C58E8" />
            <stop offset="100%" stopColor="#4E30B8" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="22" fill={`url(#lBox_${size})`} />
        <rect width="96" height="96" rx="22" fill="none"
          stroke={theme === 'dark' ? 'rgba(124,88,232,0.4)' : 'rgba(124,88,232,0.2)'}
          strokeWidth="1" />
        {theme === 'light' && (
          <ellipse cx="32" cy="22" rx="16" ry="9" fill="rgba(255,255,255,0.6)" />
        )}
        <polygon points="48,14 70,46 56,46 56,76 40,76 40,46 26,46"
          fill="#2E1880" opacity="0.18" transform="translate(4,5)" />
        <polygon points="70,46 76,40 64,40 64,70 56,76 56,46"
          fill="#3A1888" opacity="0.8" />
        <polygon points="48,14 70,46 56,46 56,76 40,76 40,46 26,46"
          fill={`url(#lArrow_${size})`} />
        <polygon points="48,14 70,46 64,40 48,22"
          fill="rgba(200,180,255,0.4)" />
        <ellipse cx="48" cy="24" rx="7" ry="4"
          fill="rgba(255,255,255,0.5)" transform="rotate(-18,48,24)" />
        <rect x="0" y="88" width="96" height="8" rx="4" fill="#38C6D4" opacity="0.9" />
      </svg>

      {/* Wordmark */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0px',
          lineHeight: 1,
        }}>
          <span style={{
            fontSize: `${s.text}px`,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.03em',
            fontFamily: '"Inter", Arial, sans-serif',
          }}>hi</span>
          <span style={{
            fontSize: `${s.text}px`,
            fontWeight: 800,
            color: '#7C58E8',
            letterSpacing: '-0.03em',
            fontFamily: '"Inter", Arial, sans-serif',
          }}>rr</span>
          <span style={{
            fontSize: `${s.text}px`,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.03em',
            fontFamily: '"Inter", Arial, sans-serif',
          }}>d</span>
        </div>
        {s.tagline && (
          <div style={{
            fontSize: '9px',
            fontWeight: 600,
            color: mutedColor,
            letterSpacing: '0.16em',
            marginTop: '2px',
          }}>
            CAREER INTELLIGENCE
          </div>
        )}
      </div>
    </div>
  )
}
