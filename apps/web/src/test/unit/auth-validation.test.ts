import { describe, it, expect } from 'vitest'

function validatePassword(pw: string): { valid: boolean; reason?: string } {
  if (pw.length < 8) return { valid: false, reason: 'Password must be at least 8 characters' }
  if (!/[A-Z]/.test(pw)) return { valid: false, reason: 'Password must contain an uppercase letter' }
  if (!/[0-9]/.test(pw)) return { valid: false, reason: 'Password must contain a number' }
  return { valid: true }
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

describe('email validation', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('thabo@mca-ca.co.za')).toBe(true)
    expect(validateEmail('test+tag@domain.org')).toBe(true)
  })
  it('rejects invalid emails', () => {
    expect(validateEmail('notanemail')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})

describe('password validation', () => {
  it('rejects short passwords', () => {
    expect(validatePassword('Ab1').valid).toBe(false)
  })
  it('rejects passwords without uppercase', () => {
    expect(validatePassword('password123').valid).toBe(false)
  })
  it('rejects passwords without numbers', () => {
    expect(validatePassword('Password').valid).toBe(false)
  })
  it('accepts strong password', () => {
    expect(validatePassword('Hirrd2026!').valid).toBe(true)
    expect(validatePassword('TestPass1').valid).toBe(true)
  })
})
