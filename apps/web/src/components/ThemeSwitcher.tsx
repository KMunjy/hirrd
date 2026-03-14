'use client'

import { useState } from 'react'

const THEMES = [
  { label: 'Violet Teal', primary: '#7C58E8', secondary: '#38C6D4' },
  { label: 'Midnight', primary: '#5B4BA8', secondary: '#8B6ED8' },
  { label: 'Ocean', primary: '#1565C0', secondary: '#00BCD4' },
  { label: 'Forest', primary: '#2E7D32', secondary: '#66BB6A' },
  { label: 'Ember', primary: '#E53935', secondary: '#FF6F00' },
  { label: 'Rose', primary: '#AD1457', secondary: '#E91E8C' },
  { label: 'Slate', primary: '#37474F', secondary: '#78909C' },
]

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const [activeTheme, setActiveTheme] = useState(THEMES[0])
  const [custom1, setCustom1] = useState('#7C58E8')
  const [custom2, setCustom2] = useState('#38C6D4')

  function applyTheme(primary: string, secondary: string) {
    document.documentElement.style.setProperty('--primary', primary)
    document.documentElement.style.setProperty('--secondary', secondary)
    document.documentElement.style.setProperty(
      '--gradient-primary',
      `linear-gradient(135deg, ${primary}, ${secondary})`
    )
  }

  function handleThemeSelect(theme: typeof THEMES[0]) {
    setActiveTheme(theme)
    applyTheme(theme.primary, theme.secondary)
    setOpen(false)
  }

  function handleCustom(p: string, s: string) {
    applyTheme(p, s)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Change theme"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.secondary})`,
          border: '2px solid rgba(255,255,255,0.3)',
          cursor: 'pointer',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      />

      {open && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '14px',
          padding: '14px',
          boxShadow: '0 8px 32px rgba(124,88,232,0.15)',
          zIndex: 100,
          minWidth: '220px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '10px' }}>
            THEME
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {THEMES.map(theme => (
              <button
                key={theme.label}
                onClick={() => handleThemeSelect(theme)}
                title={theme.label}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  border: activeTheme.label === theme.label
                    ? '2.5px solid var(--text-primary)'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
              />
            ))}
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '10px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Custom
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={custom1}
                onChange={e => { setCustom1(e.target.value); handleCustom(e.target.value, custom2) }}
                style={{ width: '32px', height: '32px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
              />
              <input
                type="color"
                value={custom2}
                onChange={e => { setCustom2(e.target.value); handleCustom(custom1, e.target.value) }}
                style={{ width: '32px', height: '32px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pick colours</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
