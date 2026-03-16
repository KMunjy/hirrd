'use client'
export function isCapacitor(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).Capacitor !== 'undefined'
}
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (!isCapacitor()) return 'web'
  return (window as any).Capacitor?.getPlatform?.() || 'web'
}
export async function openExternalUrl(url: string): Promise<void> {
  if (isCapacitor()) {
    try {
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url, presentationStyle: 'popover' })
      return
    } catch {}
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!isCapacitor()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy }
    await Haptics.impact({ style: map[style] })
  } catch {}
}
export async function registerNativePush(): Promise<string | null> {
  if (!isCapacitor()) return null
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const result = await PushNotifications.requestPermissions()
    if (result.receive !== 'granted') return null
    await PushNotifications.register()
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', t => resolve(t.value))
      PushNotifications.addListener('registrationError', () => resolve(null))
      setTimeout(() => resolve(null), 5000)
    })
  } catch { return null }
}
