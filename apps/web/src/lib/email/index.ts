import { Resend } from 'resend'

const FROM = 'Hirrd <noreply@hirrd.com>'

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — skipping send to', opts.to)
    return false
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({ from: FROM, ...opts })
    if (error) { console.error('[Email] Send failed:', error); return false }
    return true
  } catch (err) {
    console.error('[Email] Exception:', err)
    return false
  }
}

// ── Templates ────────────────────────────────────────────────────────────────

export function employerLeadReceivedEmail(companyName: string, contactEmail: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f7f4f0">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid rgba(0,0,0,0.08)">
        <div style="font-size:24px;font-weight:800;color:#1a1240;margin-bottom:8px">hirrd</div>
        <h1 style="font-size:20px;font-weight:700;color:#1a1240;margin:0 0 12px">We received your application</h1>
        <p style="color:#4a4270;line-height:1.6;margin:0 0 16px">
          Thank you for registering <strong>${companyName}</strong> on Hirrd.
          Our team will review your application and verify your company details within <strong>1–2 business days</strong>.
        </p>
        <p style="color:#4a4270;line-height:1.6;margin:0 0 24px">
          You'll receive an email at this address (${contactEmail}) once verification is complete.
          In the meantime, if you have any questions contact us at <a href="mailto:employers@hirrd.com" style="color:#7c58e8">employers@hirrd.com</a>.
        </p>
        <div style="background:#f4f2ff;border-radius:8px;padding:16px;font-size:13px;color:#6a62a0">
          <strong>Reminder:</strong> Hirrd strictly prohibits charging candidates any fees. 
          Job listings that request fees from applicants will be immediately removed and may be reported to the CCMA.
        </div>
        <p style="margin-top:24px;font-size:12px;color:#6a62a0">
          Your information is processed under POPIA (Act 4 of 2013). 
          <a href="https://hirrd-web.vercel.app/privacy" style="color:#7c58e8">Privacy Policy</a>
        </p>
      </div>
    </div>`
}

export function employerApprovedEmail(companyName: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f7f4f0">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid rgba(0,0,0,0.08)">
        <div style="font-size:24px;font-weight:800;color:#1a1240;margin-bottom:8px">hirrd</div>
        <h1 style="font-size:20px;font-weight:700;color:#1a1240;margin:0 0 12px">✓ Your employer account is verified</h1>
        <p style="color:#4a4270;line-height:1.6;margin:0 0 16px">
          <strong>${companyName}</strong> has been verified on Hirrd. 
          You can now post jobs and access South African candidates.
        </p>
        <a href="https://hirrd-web.vercel.app/employer/dashboard" 
           style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c58e8,#38c6d4);color:white;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:24px">
          Go to your dashboard →
        </a>
        <p style="font-size:12px;color:#6a62a0;margin-top:16px">
          Questions? <a href="mailto:employers@hirrd.com" style="color:#7c58e8">employers@hirrd.com</a>
        </p>
      </div>
    </div>`
}

export function employerRejectedEmail(companyName: string, reason?: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f7f4f0">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid rgba(0,0,0,0.08)">
        <div style="font-size:24px;font-weight:800;color:#1a1240;margin-bottom:8px">hirrd</div>
        <h1 style="font-size:20px;font-weight:700;color:#1a1240;margin:0 0 12px">Application not approved</h1>
        <p style="color:#4a4270;line-height:1.6;margin:0 0 16px">
          Unfortunately we were unable to verify <strong>${companyName}</strong> at this time.
          ${reason ? `<br/><br/><strong>Reason:</strong> ${reason}` : ''}
        </p>
        <p style="color:#4a4270;line-height:1.6;margin:0 0 24px">
          If you believe this is an error, please contact us at 
          <a href="mailto:employers@hirrd.com" style="color:#7c58e8">employers@hirrd.com</a> 
          with your CIPC registration documentation.
        </p>
        <p style="font-size:12px;color:#6a62a0">
          You may reapply after 90 days if the issues above are resolved.
        </p>
      </div>
    </div>`
}

export function adminNewLeadEmail(companyName: string, riskFlags: string[], adminEmail: string): string {
  const flagHtml = riskFlags.length > 0
    ? `<div style="background:#fff8e8;border:1px solid rgba(196,150,42,0.3);border-radius:8px;padding:12px;margin:12px 0;font-size:13px;color:#c4962a">
        ⚠️ Risk flags: ${riskFlags.join(', ')}
       </div>`
    : `<div style="background:#edfff5;border:1px solid rgba(58,174,114,0.3);border-radius:8px;padding:12px;margin:12px 0;font-size:13px;color:#3aae72">
        ✓ No risk flags detected
       </div>`

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f7f4f0">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid rgba(0,0,0,0.08)">
        <div style="font-size:24px;font-weight:800;color:#1a1240;margin-bottom:8px">hirrd — admin alert</div>
        <h1 style="font-size:18px;font-weight:700;color:#1a1240;margin:0 0 12px">New employer lead: ${companyName}</h1>
        ${flagHtml}
        <a href="https://hirrd-web.vercel.app/admin" 
           style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c58e8,#38c6d4);color:white;border-radius:8px;text-decoration:none;font-weight:600">
          Review in admin dashboard →
        </a>
      </div>
    </div>`
}

export function institutionLeadReceivedEmail(legalName: string, contactEmail: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f7f4f0">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid rgba(0,0,0,0.08)">
        <div style="font-size:24px;font-weight:800;color:#1a1240;margin-bottom:8px">hirrd</div>
        <h1 style="font-size:20px;font-weight:700;color:#1a1240;margin:0 0 12px">Institution application received</h1>
        <p style="color:#4a4270;line-height:1.6;margin:0 0 16px">
          Thank you for registering <strong>${legalName}</strong> on Hirrd.
          We will verify your accreditation details within <strong>2 business days</strong> and reach out to ${contactEmail}.
        </p>
        <p style="font-size:12px;color:#6a62a0">
          Questions? <a href="mailto:institutions@hirrd.com" style="color:#7c58e8">institutions@hirrd.com</a>
        </p>
      </div>
    </div>`
}
