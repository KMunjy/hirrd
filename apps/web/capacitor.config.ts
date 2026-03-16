import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Hirrd Capacitor Configuration
 * Wraps existing PWA for iOS App Store + Google Play Store submission
 * Architecture: PWA → Capacitor wrapper → Native stores
 * No rebuild of business logic required
 */
const config: CapacitorConfig = {
  // App identity (must match store listings exactly)
  appId: 'com.hirrd.app',
  appName: 'Hirrd',

  // Point Capacitor at Next.js build output
  webDir: 'out',

  // Production API — always HTTPS, never HTTP
  server: {
    // During development: use live Vercel URL (no local server needed)
    url: process.env.NODE_ENV === 'development'
      ? 'https://hirrd-web.vercel.app'
      : undefined,
    cleartext: false,               // Enforce HTTPS — no HTTP allowed (ATS compliance)
    allowNavigation: [
      'hirrd-web.vercel.app',
      '*.supabase.co',              // Supabase auth + storage
    ],
  },

  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0A0A0F',     // Match app theme
    limitsNavigationsToAppBoundDomains: true,  // Security: no arbitrary navigation
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    // Required for App Store
    // scheme: 'hirrd',             // Enable for deep links: hirrd://
  },

  // Android specific configuration
  android: {
    backgroundColor: '#0A0A0F',
    minWebViewVersion: 89,          // Chrome 89+ (2021+)
    allowMixedContent: false,       // Security: block HTTP on HTTPS pages
    captureInput: true,
    webContentsDebuggingEnabled: false,  // NEVER true in production
  },

  // Plugins
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_hirrd',
      iconColor: '#7C58E8',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0A0F',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
