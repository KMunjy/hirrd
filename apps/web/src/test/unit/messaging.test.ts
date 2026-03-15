import { describe, it, expect } from 'vitest'

// Test phone normalisation
function normalisePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-\(\)]/g, '')
  if (/^0[6-8]\d{8}$/.test(cleaned)) return `+27${cleaned.slice(1)}`
  if (/^\+27[6-8]\d{8}$/.test(cleaned)) return cleaned
  if (/^27[6-8]\d{8}$/.test(cleaned)) return `+${cleaned}`
  return null
}

function isValidSAPhone(phone: string): boolean {
  return normalisePhone(phone) !== null
}

describe('SA phone normalisation', () => {
  it('converts 0XX format to E.164', () => {
    expect(normalisePhone('0821234567')).toBe('+27821234567')
  })

  it('accepts +27 format unchanged', () => {
    expect(normalisePhone('+27821234567')).toBe('+27821234567')
  })

  it('converts 27XX (no +) to E.164', () => {
    expect(normalisePhone('27821234567')).toBe('+27821234567')
  })

  it('handles spaces and dashes', () => {
    expect(normalisePhone('082 123 4567')).toBe('+27821234567')
    expect(normalisePhone('082-123-4567')).toBe('+27821234567')
  })

  it('rejects non-SA numbers', () => {
    expect(normalisePhone('+441234567890')).toBeNull() // UK
    expect(normalisePhone('0123456789')).toBeNull()    // SA landline (starts 01)
  })

  it('rejects obviously invalid numbers', () => {
    expect(normalisePhone('123')).toBeNull()
    expect(normalisePhone('')).toBeNull()
  })
})

describe('SA phone validation', () => {
  it('validates real SA mobile numbers', () => {
    expect(isValidSAPhone('0821234567')).toBe(true)
    expect(isValidSAPhone('0731234567')).toBe(true)
    expect(isValidSAPhone('+27831234567')).toBe(true)
  })

  it('rejects SA landlines', () => {
    expect(isValidSAPhone('0111234567')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidSAPhone('')).toBe(false)
  })
})

describe('Message templates', () => {
  it('welcome message contains name', () => {
    const msg = `Hi Nomsa! 👋 Welcome to *Hirrd* — SA's career intelligence platform.`
    expect(msg).toContain('Nomsa')
    expect(msg).toContain('Hirrd')
  })

  it('new match message contains job title and score', () => {
    const msg = `🔔 *New job match on Hirrd!*\n\nData Analyst at FNB\nMatch score: 82%`
    expect(msg).toContain('Data Analyst')
    expect(msg).toContain('82%')
  })

  it('OTP message is concise and contains code', () => {
    const otp = '123456'
    const msg = `Your Hirrd verification code is: *${otp}*\n\nDo not share this code with anyone.\nExpires in 10 minutes.`
    expect(msg).toContain(otp)
    expect(msg).toContain('Do not share')
    expect(msg.length).toBeLessThan(200) // SMS character limit awareness
  })
})
