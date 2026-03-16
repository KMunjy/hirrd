'use client'

import { useState, useEffect } from 'react'
import { getPushPermissionState, requestPushPermission } from '@/lib/firebase/messaging'

interface Props {
  context?: 'after-cv-upload' | 'after-apply' | 'settings'
}

/**
 * Push notification opt-in prompt
 * CRITICAL: Never show on app launch (App Store guideline 5.1.2)
 * Only show AFTER user completes a value-generating action
 *
 * Timing:
 * - After CV upload: "Get notified when new matches arrive"
 * - After first application: "Get alerts when employers respond"
 * - Never: on first launch, before any interaction
 */
export default function PushOptIn({ context = 'after-cv-upload' }: Props) {
  const [state, setState] = useState<'hidden' | 'prompt' | 'loading' | 'done' | 'denied'>('hidden')

  useEffect(() => {
    const perm = getPushPermissionState()
    if (perm === 'unsupported' || perm === 'granted' || perm === 'denied') {
      setState('hidden')
      return
    }
    // Show after a short delay — don't interrupt the current action
    const timer = setTimeout(() => setState('prompt'), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (state === 'hidden' || state === 'done') return null

  const messages = {
    'after-cv-upload': {
      title: 'Get notified when jobs match your CV',
      body: 'We\'ll send a push notification when a verified SA employer matches your skills. No spam.',
    },
    'after-apply': {
      title: 'Know when employers respond',
      body: 'Get a notification the moment an employer views your application.',
    },
    'settings': {
      title: 'Enable job alert notifications',
      body: 'Push notifications for Hirrd job matches and application updates.',
    },
  }

  const { title, body } = messages[context]

  async function handleEnable() {
    setState('loading')
    const result = await requestPushPermission()
    setState(result.success ? 'done' : result.permissionState === 'denied' ? 'denied' : 'hidden')
  }

  return (
    <div style={{
      background: 'var(--glass-2)', border: '1px solid var(--border)',
      borderRadius: '14px', padding: '16px 20px', marginTop: '16px',
      display: 'flex', gap: '14px', alignItems: 'flex-start',
      animation: 'slideUp 0.3s ease-out',
    }}>
      <div style={{ fontSize: '28px', flexShrink: 0 }}>🔔</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
          {body}
        </div>
        {state === 'denied' ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Notifications blocked. Enable in browser settings to receive alerts.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleEnable}
              disabled={state === 'loading'}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: 'var(--gradient-primary)', color: 'white', border: 'none',
                cursor: state === 'loading' ? 'default' : 'pointer',
                opacity: state === 'loading' ? 0.7 : 1,
              }}
            >
              {state === 'loading' ? 'Enabling…' : 'Enable notifications'}
            </button>
            <button
              onClick={() => setState('hidden')}
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: 'none', color: 'var(--text-muted)', border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              Not now
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
