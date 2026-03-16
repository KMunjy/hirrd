/**
 * HIRRD MESSAGING LAYER
 * Primary: WhatsApp (via Twilio Business API — requires Meta approval)
 * Secondary: SMS (via Clickatell/Twilio — immediate)
 * Tertiary: Email (Resend — always available as fallback)
 *
 * SA context: 96% WhatsApp penetration, GenZ prefers WhatsApp > email
 * Architecture: attempt WhatsApp → fallback SMS → fallback email
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886' // Twilio sandbox default
const TWILIO_SMS_FROM = process.env.TWILIO_SMS_FROM // SA number e.g. +27XXXXXXXXX
const CLICKATELL_API_KEY = process.env.CLICKATELL_API_KEY

export type MessageChannel = 'whatsapp' | 'sms' | 'email' | 'push'

export interface MessageResult {
  channel: MessageChannel
  success: boolean
  messageId?: string
  error?: string
}

// ── WhatsApp (Twilio Business API) ───────────────────────────────────────────

export async function sendWhatsApp(
  to: string,  // SA format: +27XXXXXXXXX
  message: string
): Promise<MessageResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return { channel: 'whatsapp', success: false, error: 'Twilio not configured' }
  }

  // Normalise SA number to E.164
  const normalised = normalisePhone(to)
  if (!normalised) return { channel: 'whatsapp', success: false, error: 'Invalid SA phone number' }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_FROM,
          To: `whatsapp:${normalised}`,
          Body: message,
        }),
      }
    )

    const data = await res.json()
    if (!res.ok) {
      console.error('[WhatsApp] Send failed:', data)
      return { channel: 'whatsapp', success: false, error: data.message }
    }

    return { channel: 'whatsapp', success: true, messageId: data.sid }
  } catch (err: any) {
    console.error('[WhatsApp] Exception:', err)
    return { channel: 'whatsapp', success: false, error: err.message }
  }
}

// ── SMS (Clickatell — best SA coverage, or Twilio fallback) ──────────────────

export async function sendSMS(
  to: string,
  message: string
): Promise<MessageResult> {
  const normalised = normalisePhone(to)
  if (!normalised) return { channel: 'sms', success: false, error: 'Invalid SA phone number' }

  // Try Clickatell first (SA-founded, best local coverage, works on feature phones)
  if (CLICKATELL_API_KEY) {
    try {
      const res = await fetch('https://platform.clickatell.com/v1/message', {
        method: 'POST',
        headers: {
          Authorization: CLICKATELL_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ channel: 'sms', to: normalised, content: message }],
        }),
      })
      const data = await res.json()
      if (res.ok) return { channel: 'sms', success: true, messageId: data.messages?.[0]?.apiMessageId }
    } catch {}
  }

  // Fallback: Twilio SMS
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_SMS_FROM) {
    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: TWILIO_SMS_FROM,
            To: normalised,
            Body: message,
          }),
        }
      )
      const data = await res.json()
      if (res.ok) return { channel: 'sms', success: true, messageId: data.sid }
      return { channel: 'sms', success: false, error: data.message }
    } catch (err: any) {
      return { channel: 'sms', success: false, error: err.message }
    }
  }

  return { channel: 'sms', success: false, error: 'No SMS provider configured' }
}

// ── Smart send: WhatsApp → SMS → (email handled separately) ─────────────────

export async function sendNotification(
  phone: string | null | undefined,
  message: string,
  preferWhatsApp = true
): Promise<MessageResult> {
  if (!phone) return { channel: 'sms', success: false, error: 'No phone number' }

  if (preferWhatsApp) {
    const waResult = await sendWhatsApp(phone, message)
    if (waResult.success) return waResult
    // WhatsApp failed — fall back to SMS
  }

  return sendSMS(phone, message)
}

// ── SA OTP via SMS ────────────────────────────────────────────────────────────

export async function sendOTP(phone: string, otp: string): Promise<MessageResult> {
  const message = `Your Hirrd verification code is: *${otp}*\n\nDo not share this code with anyone.\nExpires in 10 minutes.`
  return sendSMS(phone, message)
}

// ── Message templates (WhatsApp requires pre-approved templates for first message) ──

/**
 * HIRRD WHATSAPP/SMS MESSAGE TEMPLATES
 * POPIA note: All messages reference Hirrd explicitly, include opt-out,
 * contain no sensitive personal data beyond name/role/score.
 * Templates A/B/C for re-engagement are experiment variants (Exp 5).
 */
export const MESSAGES = {
  // ── Welcome (send within 24hr of registration — WA 24hr window) ──────────
  welcome: (name: string) =>
    `Hi ${name}! 👋 Welcome to *Hirrd* — SA career intelligence.\n\nUpload your CV to get AI-matched to learnerships and jobs:\nhirrd-web.vercel.app/dashboard\n\nYou got this because you registered on Hirrd. Reply STOP to opt out.`,

  // ── CV parsed notification ────────────────────────────────────────────────
  cvParsed: (name: string, score: number, matchCount: number) =>
    `${name}, your CV is ready on Hirrd 🎯\n\nCV strength: *${score}/100*\nMatches found: *${matchCount} SA opportunities*\n\nSee your matches (2 min):\nhirrd-web.vercel.app/dashboard\n\nReply STOP to opt out.`,

  // ── New match alert ───────────────────────────────────────────────────────
  newMatch: (name: string, jobTitle: string, company: string, matchScore: number) =>
    `${name}, *${matchScore}% match* on Hirrd 🔔\n\n*${jobTitle}*\n${company} · SA\n\nApply in 2 taps:\nhirrd-web.vercel.app/dashboard\n\nYou matched this via Hirrd. Reply STOP to opt out.`,

  // ── D+3 Re-engagement — Variant A: Role-specific + urgency ───────────────
  // Based on Exp 5 results: CTR 40% ✓, apply rate 10% (target 15%)
  // Fix: add role name, match %, time-to-apply, closing date signal
  reengagementA: (name: string, jobTitle: string, company: string, matchScore: number) =>
    `${name}, this role is *${matchScore}% match* for you 👇\n\n*${jobTitle}* at ${company}\nApplications close soon — takes 2 min to apply.\n\nhirrd-web.vercel.app/dashboard\n\nThis reminder is from Hirrd. Reply STOP to stop alerts.`,

  // ── D+3 Re-engagement — Variant B: Social proof + scarcity ──────────────
  reengagementB: (name: string, matchCount: number) =>
    `${name}, *${matchCount} SA jobs* are waiting for you on Hirrd 📋\n\nOther candidates are applying now. Your profile is ready — don't miss your match.\n\nView opportunities (free):\nhirrd-web.vercel.app/dashboard\n\nFrom Hirrd. Reply STOP to opt out.`,

  // ── D+3 Re-engagement — Variant C: Direct + benefit-led ─────────────────
  reengagementC: (name: string, jobTitle: string, matchScore: number) =>
    `Hi ${name} 👋 You have a *${matchScore}% match* on Hirrd:\n\n"${jobTitle}"\n\nApply free. No fees. No middlemen. SA-verified employer.\n\nhirrd-web.vercel.app/dashboard\n\nYou're receiving this because you opted in on Hirrd. Reply STOP to stop.`,

  // ── Employer verified ─────────────────────────────────────────────────────
  employerVerified: (companyName: string) =>
    `✅ *${companyName}* is verified on Hirrd.\n\nYou can now receive candidate matches and post opportunities.\n\nhirrd-web.vercel.app/employer/dashboard\n\nThis is from Hirrd. Questions: employers@hirrd.com`,

  // ── Application received ──────────────────────────────────────────────────
  applicationReceived: (name: string, jobTitle: string) =>
    `${name}, your application is submitted ✓\n\n*${jobTitle}* via Hirrd\n\nExpect to hear from the employer within 5 business days. We'll update you here.\n\nReply STOP to stop Hirrd alerts.`,

  // ── OTP ───────────────────────────────────────────────────────────────────
  otp: (code: string) =>
    `Your Hirrd code: *${code}*\nExpires in 10 min. Never share this.`,
} as const

/**
 * Select re-engagement variant by user hash for consistent A/B split
 * userId determines which template they always see — no flip-flopping
 */
export function selectReengagementVariant(userId: string): 'A' | 'B' | 'C' {
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const variants = ['A', 'B', 'C'] as const
  return variants[hash % 3]
}

// ── Utility ───────────────────────────────────────────────────────────────────

export function normalisePhone(raw: string): string | null {
  // Strip spaces, dashes, brackets
  let cleaned = raw.replace(/[\s\-\(\)]/g, '')

  // SA mobile: 0XX → +27XX
  if (/^0[6-8]\d{8}$/.test(cleaned)) {
    return `+27${cleaned.slice(1)}`
  }
  // Already international SA: +27XXXXXXXXX
  if (/^\+27[6-8]\d{8}$/.test(cleaned)) {
    return cleaned
  }
  // 27XXXXXXXXX (no +)
  if (/^27[6-8]\d{8}$/.test(cleaned)) {
    return `+${cleaned}`
  }

  return null // Invalid
}

export function isValidSAPhone(phone: string): boolean {
  return normalisePhone(phone) !== null
}
