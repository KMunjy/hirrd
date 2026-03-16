/**
 * Firebase Configuration
 * Used for: Push notifications (FCM) — web + Android + iOS via Capacitor
 *
 * Architecture:
 *   Web PWA: FCM Web SDK → service worker receives push → showNotification()
 *   Android: Capacitor @capacitor/push-notifications wraps FCM natively
 *   iOS: Capacitor + APNs → FCM bridge → same token system
 *
 * SECURITY: API keys here are safe to expose (restricted by domain in Firebase Console)
 * Firebase web API keys are not secrets — they identify the project, not authenticate.
 * Server operations (sending messages) use Firebase Admin SDK on the backend.
 */

import { getApps, initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'

// These are public client config values — not secret
// Configure restrictions in Firebase Console → Project Settings → API Keys
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    // Firebase not configured — graceful degradation
    return null
  }
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  return app
}
