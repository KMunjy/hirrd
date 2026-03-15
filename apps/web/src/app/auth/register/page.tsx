'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HirrdLogo from '@/components/HirrdLogo'

type Role = 'candidate' | 'employer'

function LoginContent() {
  const router = useRouter()
  const supabase = createClient()
  const [role, setRole] = useState<Role>('candidate')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [tos, setTos] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [whatsappOptIn, setWhatsappOptIn] = useState(true) // default ON — users expect it
  const [smsOptIn, setSmsOptIn] = useState(true)
  const [photoConsent, setPhotoConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // SA phone validation
  function isValidPhone(p: string) {
    const clean = p.replace(/[\s\-\(\)]/g, '')
    return /^(0[6-8]\d{8}|\+27[6-8]\d{8}|27[6-8]\d{8})$/.test(clean)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!tos) { setError('Please accept the Terms of Service to continue.'); return }
    if (phone && !isValidPhone(phone)) {
      setError('Please enter a valid SA mobile number (e.g. 082 123 4567)')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone: phone || null,
          marketing_consent: marketing,
          whatsapp_opt_in: whatsappOptIn,
          sms_opt_in: smsOptIn,
          photo_consent: photoConsent,
          tos_accepted_at: new Date().toISOString(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { role },
      },
    })
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Check your inbox</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
        </p>
        {phone && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
            After verifying your email, you&apos;ll be able to verify your phone number for WhatsApp notifications.
          </p>
        )}
        <Link href="/" style={{ display: 'inline-block', marginTop: '24px', padding: '12px 28px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
          Back to Hirrd
        </Link>
      </div>
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid rgba(124,88,232,0.2)', background: 'var(--bg-base)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
    display: 'block', marginBottom: '6px', letterSpacing: '0.06em',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '460px', border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(124,88,232,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <HirrdLogo size="md" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Get hirrd today</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>South Africa · Early Access</p>
        </div>

        {/* Role toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-base)', borderRadius: '12px', padding: '4px' }}>
          {(['candidate', 'employer'] as Role[]).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)} style={{
              flex: 1, padding: '10px', borderRadius: '9px', fontWeight: 600, fontSize: '13px',
              border: role === r ? '1px solid var(--primary)' : '1px solid transparent',
              background: role === r ? 'var(--bg-card)' : 'transparent',
              color: role === r ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {r === 'candidate' ? '👤 Job Seeker' : '🏢 Employer'}
            </button>
          ))}
        </div>

        <button type="button" onClick={handleGoogle} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleRegister}>
          {/* Core fields */}
          {[
            { label: 'FULL NAME', id: 'reg-name', type: 'text', autocomplete: 'name', value: fullName, setter: setFullName, placeholder: 'Thabo Mokoena', required: true },
            { label: 'EMAIL', id: 'reg-email', type: 'email', autocomplete: 'email', value: email, setter: setEmail, placeholder: 'you@example.com', required: true },
            { label: 'PASSWORD', id: 'reg-password', type: 'password', autocomplete: 'new-password', value: password, setter: setPassword, placeholder: '••••••••', required: true },
          ].map(({ label, id, type, autocomplete, value, setter, placeholder, required }) => (
            <div key={id} style={{ marginBottom: '14px' }}>
              <label htmlFor={id} style={labelStyle}>{label}</label>
              <input id={id} name={id} type={type} autoComplete={autocomplete} value={value}
                onChange={e => setter(e.target.value)} placeholder={placeholder} required={required}
                style={inputStyle} />
            </div>
          ))}

          {/* SA Mobile number — WhatsApp/SMS primary */}
          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="reg-phone" style={labelStyle}>
              SA MOBILE NUMBER <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— for WhatsApp job alerts</span>
            </label>
            <input
              id="reg-phone" name="phone" type="tel" autoComplete="tel"
              value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="082 123 4567 or +27 82 123 4567"
              style={{
                ...inputStyle,
                borderColor: phone && !isValidPhone(phone) ? 'rgba(192,80,74,0.4)' : 'rgba(124,88,232,0.2)',
              }}
            />
            {phone && !isValidPhone(phone) && (
              <p style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>Please enter a valid SA mobile number</p>
            )}
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              We&apos;ll send you job matches and alerts via WhatsApp or SMS. You can opt out any time.
            </p>
          </div>

          {/* Messaging opt-ins */}
          {phone && isValidPhone(phone) && (
            <div style={{ background: 'rgba(124,88,232,0.04)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '10px' }}>HOW SHOULD WE REACH YOU?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={whatsappOptIn} onChange={e => setWhatsappOptIn(e.target.checked)} style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <strong>📱 WhatsApp</strong> — instant job alerts and updates <span style={{ fontSize: '11px', background: 'rgba(58,174,114,0.1)', color: 'var(--success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Recommended</span>
                  </span>
                </label>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={smsOptIn} onChange={e => setSmsOptIn(e.target.checked)} style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <strong>💬 SMS</strong> — backup for when WhatsApp is unavailable
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Passport photo consent — POPIA s.26 */}
          {role === 'candidate' && (
            <div style={{ background: 'rgba(58,174,114,0.04)', border: '1px solid rgba(58,174,114,0.15)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '8px' }}>PROFILE PHOTO (OPTIONAL)</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input id="photo-consent" type="checkbox" checked={photoConsent} onChange={e => setPhotoConsent(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--primary)', flexShrink: 0 }} />
                <label htmlFor="photo-consent" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, cursor: 'pointer' }}>
                  I consent to uploading a passport-size photo to my profile. I understand this is{' '}
                  <strong>special personal information under POPIA s.26</strong> and can be removed at any time.
                  Employers may use it to identify me during the hiring process.
                </label>
              </div>
              {photoConsent && (
                <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '8px' }}>
                  ✓ You&apos;ll be able to upload your photo from your profile page after registration.
                </p>
              )}
            </div>
          )}

          {/* Legal consent */}
          <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <input id="tos-check" type="checkbox" required checked={tos} onChange={e => setTos(e.target.checked)}
              style={{ marginTop: '3px', accentColor: 'var(--primary)', flexShrink: 0 }} />
            <label htmlFor="tos-check" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              I agree to Hirrd&apos;s <Link href="/terms" style={{ color: 'var(--primary)' }}>Terms of Service</Link> and{' '}
              <Link href="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>. My data is processed under POPIA. <span style={{ color: 'var(--error)' }}>*</span>
            </label>
          </div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <input id="marketing-check" type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)}
              style={{ marginTop: '3px', accentColor: 'var(--primary)', flexShrink: 0 }} />
            <label htmlFor="marketing-check" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              I&apos;d like to receive career insights and product updates. (Optional — unsubscribe any time.)
            </label>
          </div>

          {error && <div role="alert" style={{ background: '#fff5f5', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>{error}</div>}

          <button type="submit" disabled={loading || !tos} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontWeight: 600, fontSize: '15px', cursor: loading || !tos ? 'default' : 'pointer', opacity: loading || !tos ? 0.65 : 1 }}>
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

import { Suspense } from 'react'
export default function RegisterPage() {
  return <Suspense fallback={null}><LoginContent /></Suspense>
}
