/**
 * Firebase Cloud Messaging — Push Notification Manager
 *
 * POPIA + GDPR compliance:
 * - Permission requested at point of value (after user takes first action)
 * - Explicit opt-in stored in DB (candidates.push_opt_in)
 * - User can revoke via browser settings OR profile preferences
 * - FCM token stored encrypted in Supabase (never logged)
 *
 * Channel hierarchy (SA GenZ preference):
 *   1. WhatsApp (78% opt-in, highest engagement)
 *   2. Push notification (this file)
 *   3. SMS (80% open rate fallback)
 *   4. Email (lowest — last resort)
 */
'use client'

import { getFirebaseApp } from './index'

export type PushPermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

export interface PushRegistrationResult {
  success: boolean
  token?: string
  error?: string
  permissionState: PushPermissionState
}

// VAPID public key from Firebase Console → Cloud Messaging → Web Push certificates
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

/**
 * Check current push permission state without requesting
 */
export function getPushPermissionState(): PushPermissionState {
  if (!('Notification' in window)) return 'unsupported'
  if (!('serviceWorker' in navigator)) return 'unsupported'
  return Notification.permission as PushPermissionState
}

/**
 * Request push permission and register FCM token
 * Call ONLY after user explicitly requests job alerts
 * (not at app launch — Apple/Google reject apps that ask immediately)
 */
export async function requestPushPermission(): Promise<PushRegistrationResult> {
  if (!('Notification' in window)) {
    return { success: false, error: 'Push not supported', permissionState: 'unsupported' }
  }

  if (!VAPID_KEY) {
    console.warn('[Push] NEXT_PUBLIC_FIREBASE_VAPID_KEY not configured')
    return { success: false, error: 'Push not configured', permissionState: 'default' }
  }

  // Request permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { success: false, permissionState: permission as PushPermissionState }
  }

  try {
    const firebaseApp = getFirebaseApp()
    if (!firebaseApp) {
      return { success: false, error: 'Firebase not configured', permissionState: 'granted' }
    }

    // Dynamic import — only load messaging when needed
    const { getMessaging, getToken } = await import('firebase/messaging')
    const messaging = getMessaging(firebaseApp)

    // Ensure service worker is registered for FCM
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    })

    if (!token) {
      return { success: false, error: 'No token received', permissionState: 'granted' }
    }

    // Store token in backend (encrypted in DB)
    await savePushToken(token)

    return { success: true, token, permissionState: 'granted' }
  } catch (error: any) {
    console.error('[Push] Registration failed:', error.message)
    return { success: false, error: error.message, permissionState: 'granted' }
  }
}

/**
 * Save FCM token to Supabase for targeted notifications
 */
async function savePushToken(token: string): Promise<void> {
  try {
    await fetch('/api/notifications/register-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: 'web' }),
    })
  } catch (error) {
    console.warn('[Push] Token save failed:', error)
  }
}

/**
 * Revoke push notifications (POPIA opt-out)
 */
export async function revokePushPermission(): Promise<void> {
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    const fcmSW = regs.find(r => r.scope.includes('firebase-messaging'))
    if (fcmSW) await fcmSW.unregister()

    await fetch('/api/notifications/register-push', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.warn('[Push] Revoke failed:', error)
  }
}

/**
 * Check if the app is running as an installed PWA or Capacitor wrapper
 */
export function isRunningAsApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}
