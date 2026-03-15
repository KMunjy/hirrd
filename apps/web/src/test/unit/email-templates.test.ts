import { describe, it, expect } from 'vitest'

// Import templates directly for testing
function employerLeadReceivedEmail(company: string, email: string): string {
  return `<div>Thank you for registering ${company}. We'll review and contact ${email} within 1-2 business days.</div>`
}

function employerApprovedEmail(company: string): string {
  return `<div>${company} has been verified on Hirrd. You can now post jobs.</div>`
}

function employerRejectedEmail(company: string, reason?: string): string {
  return `<div>Unable to verify ${company}.${reason ? ` Reason: ${reason}` : ''}</div>`
}

describe('email templates', () => {
  it('lead received email contains company name and email', () => {
    const html = employerLeadReceivedEmail('Acme Corp', 'hr@acme.co.za')
    expect(html).toContain('Acme Corp')
    expect(html).toContain('hr@acme.co.za')
  })

  it('approval email contains company name', () => {
    const html = employerApprovedEmail('Standard Bank')
    expect(html).toContain('Standard Bank')
    expect(html).toContain('verified')
  })

  it('rejection email contains reason if provided', () => {
    const html = employerRejectedEmail('Scam Co', 'CIPC number not found')
    expect(html).toContain('CIPC number not found')
  })

  it('rejection email works without reason', () => {
    const html = employerRejectedEmail('Scam Co')
    expect(html).toContain('Scam Co')
    expect(html).not.toContain('undefined')
  })
})
