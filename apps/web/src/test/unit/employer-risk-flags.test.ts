import { describe, it, expect } from 'vitest'

const FREE_EMAIL_DOMAINS = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','live.com']
const HIGH_RISK_INDUSTRIES = ['cryptocurrency','forex','investment','mlm','adult','gambling']

function computeRiskFlags(data: {
  work_email?: string; website?: string; cipc_number?: string; industry?: string
}): string[] {
  const flags: string[] = []
  const emailDomain = data.work_email?.split('@')[1]?.toLowerCase() || ''
  if (FREE_EMAIL_DOMAINS.some(d => emailDomain.endsWith(d))) flags.push('free_email')
  if (!data.website?.trim()) flags.push('no_website')
  if (!data.cipc_number?.trim()) flags.push('no_cipc')
  if (HIGH_RISK_INDUSTRIES.some(i => (data.industry || '').toLowerCase().includes(i))) flags.push('high_risk_industry')
  return flags
}

describe('employer risk flag computation', () => {
  it('returns no flags for clean employer', () => {
    const flags = computeRiskFlags({
      work_email: 'thabo@mca-ca.co.za',
      website: 'https://mca-ca.co.za',
      cipc_number: '2018/445321/07',
      industry: 'Chartered accountancy',
    })
    expect(flags).toHaveLength(0)
  })

  it('flags gmail address', () => {
    const flags = computeRiskFlags({ work_email: 'user@gmail.com', website: 'https://co.za', cipc_number: '2020/001/07', industry: 'Retail' })
    expect(flags).toContain('free_email')
  })

  it('flags missing website', () => {
    const flags = computeRiskFlags({ work_email: 'hr@company.co.za', website: '', cipc_number: '2020/001/07', industry: 'Retail' })
    expect(flags).toContain('no_website')
  })

  it('flags missing CIPC', () => {
    const flags = computeRiskFlags({ work_email: 'hr@company.co.za', website: 'https://co.za', cipc_number: '', industry: 'Retail' })
    expect(flags).toContain('no_cipc')
  })

  it('flags crypto industry', () => {
    const flags = computeRiskFlags({ work_email: 'hr@crypto.co.za', website: 'https://crypto.co.za', cipc_number: '2024/001/07', industry: 'Cryptocurrency trading' })
    expect(flags).toContain('high_risk_industry')
  })

  it('flags multiple risks on scam employer', () => {
    const flags = computeRiskFlags({
      work_email: 'jobs@gmail.com',
      website: '',
      cipc_number: '',
      industry: 'forex investment opportunities',
    })
    expect(flags).toContain('free_email')
    expect(flags).toContain('no_website')
    expect(flags).toContain('no_cipc')
    expect(flags).toContain('high_risk_industry')
    expect(flags.length).toBe(4)
  })

  it('flags yahoo and hotmail as free email providers', () => {
    expect(computeRiskFlags({ work_email: 'x@yahoo.com' })).toContain('free_email')
    expect(computeRiskFlags({ work_email: 'x@hotmail.com' })).toContain('free_email')
    expect(computeRiskFlags({ work_email: 'x@outlook.com' })).toContain('free_email')
  })

  it('does not flag legitimate company subdomain', () => {
    const flags = computeRiskFlags({ work_email: 'hr@mail.standardbank.co.za' })
    expect(flags).not.toContain('free_email')
  })
})
