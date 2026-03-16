/**
 * POST /api/admin/seed
 * One-time seed — 250 SA opportunities
 * Auth: x-seed-key header must match SUPABASE_SERVICE_ROLE_KEY (already in Vercel)
 * No new env vars needed. Delete this file after use.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const COMPANIES: [string, string][] = [
  ['FNB','Financial Services'],['Standard Bank','Financial Services'],
  ['Capitec','Financial Services'],['Discovery','Insurance / FinTech'],
  ['Vodacom','Telecoms'],['MTN South Africa','Telecoms'],['Nedbank','Financial Services'],
  ['Absa','Financial Services'],['Old Mutual','Financial Services'],
  ['Sanlam','Financial Services'],['Anglo American','Mining'],['Sasol','Energy'],
  ['Shoprite','Retail'],['Pick n Pay','Retail'],['Woolworths SA','Retail'],
  ['Transnet','Logistics'],['Eskom','Energy'],['Telkom','Telecoms'],
  ['Cell C','Telecoms'],['EOH','Technology'],['BCX','Technology'],
  ['Dimension Data','Technology'],['Accenture SA','Technology'],
  ['Deloitte SA','Professional Services'],['PwC SA','Professional Services'],
  ['KPMG SA','Professional Services'],['Bidvest','Diversified'],
]

const CITIES = ['Johannesburg','Pretoria','Soweto','Sandton','Midrand','Centurion',
  'Cape Town','Stellenbosch','Bellville','Durban','Pietermaritzburg','Umhlanga',
  'Gqeberha','East London','Polokwane','Mbombela','Witbank']

const JOBS: [string, string[], string, number, number][] = [
  ['Junior Data Analyst',['SQL','Python','Excel','Tableau','Data Analysis'],'junior',22,45],
  ['Software Developer',['JavaScript','React','Node.js','SQL','Git'],'junior',28,55],
  ['UX Designer',['Figma','User Research','Prototyping','CSS'],'mid',32,60],
  ['Business Analyst',['SQL','Excel','JIRA','Agile'],'junior',25,50],
  ['DevOps Engineer',['AWS','Docker','Kubernetes','CI/CD','Linux'],'mid',50,90],
  ['Cybersecurity Analyst',['SIEM','Python','Network Security'],'junior',35,65],
  ['Product Manager',['Agile','User Stories','Data Analysis'],'mid',55,95],
  ['Data Scientist',['Python','R','Machine Learning','SQL'],'mid',50,85],
  ['Financial Analyst',['Excel','SAP','Accounting','Forecasting'],'junior',25,48],
  ['HR Business Partner',['Labour Law','Excel','Communication'],'mid',30,60],
  ['Sales Executive',['CRM','Negotiation','Communication'],'junior',20,45],
  ['Full Stack Developer',['React','Node.js','PostgreSQL','TypeScript'],'mid',40,80],
  ['Cloud Engineer',['AWS','Terraform','Docker','Python'],'mid',50,90],
  ['Operations Manager',['Operations','Excel','Leadership'],'mid',45,80],
  ['Accountant',['Accounting','Excel','SAP','IFRS'],'junior',24,45],
  ['Network Engineer',['Cisco','TCP/IP','Routing','Linux'],'mid',38,70],
  ['Mobile Developer',['Flutter','React Native','Kotlin'],'mid',35,70],
  ['Legal Advisor',['Legal Research','Compliance','Communication'],'junior',28,55],
  ['Project Manager',['PMP','Agile','Stakeholder Management'],'senior',60,100],
  ['Marketing Coordinator',['Google Analytics','Social Media','Excel'],'junior',18,32],
]

const LEARNERSHIPS: [string, string[], number, number][] = [
  ['IT Learnership',['SQL','Python','Computer Skills'],5,12],
  ['Banking Learnership',['Excel','Communication','Customer Service'],6,12],
  ['Data Science Learnership',['Python','SQL','Statistics'],7,14],
  ['Finance Learnership',['Accounting','Excel','Communication'],6,11],
  ['Engineering Learnership',['AutoCAD','Mathematics','Safety'],6,13],
  ['Customer Service Learnership',['Communication','MS Office','Teamwork'],5,10],
  ['Retail Learnership',['Sales','Customer Service','Communication'],4,9],
  ['Digital Marketing Learnership',['Social Media','Google Analytics','Excel'],6,12],
  ['Health Safety Learnership',['Safety','Communication','Problem Solving'],5,11],
  ['HR Learnership',['Communication','Excel','Labour Law'],5,10],
]

const INTERNSHIPS: [string, string[], number, number][] = [
  ['Graduate Intern — Finance',['Excel','Accounting','Communication'],8,18],
  ['Graduate Intern — IT',['Python','SQL','Problem Solving'],8,18],
  ['Graduate Intern — Engineering',['AutoCAD','Mathematics','Excel'],8,18],
  ['Graduate Intern — Data',['Python','SQL','Data Analysis'],9,18],
  ['Graduate Intern — Marketing',['Social Media','Communication','Canva'],8,18],
]

const BURSARIES: [string, string[], number, number][] = [
  ['Engineering Bursary',['Mathematics','Physical Sciences','English'],3,8],
  ['ICT Bursary',['Mathematics','Computer Science','English'],3,8],
  ['Finance Bursary',['Mathematics','Accounting','English'],3,8],
  ['Mining Engineering Bursary',['Mathematics','Physical Sciences','English'],3,8],
]

function rng(seed: number) {
  let s = seed | 0
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
    s ^= s >>> 15
    return (s >>> 0) / 4294967296
  }
}

export async function POST(req: Request) {
  // Auth: the caller must know the service role key (already in their possession)
  const provided = req.headers.get('x-seed-key') || ''
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const r = rng(42)
  const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)]
  const ri = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))

  const records: any[] = []

  for (let i = 0; i < 250; i++) {
    const roll = r()
    let type: string, title: string, skills: string[], lvl = 'entry', sMin: number, sMax: number

    if (roll < 0.52) {
      type = 'job'
      const d = pick(JOBS); [title, skills, lvl, sMin, sMax] = [d[0], d[1], d[2] as string, d[3] as number, d[4] as number]
    } else if (roll < 0.76) {
      type = 'learnership'
      const d = pick(LEARNERSHIPS); [title, skills, sMin, sMax] = [d[0], d[1], d[2], d[3]]
    } else if (roll < 0.92) {
      type = 'internship'
      const d = pick(INTERNSHIPS); [title, skills, sMin, sMax] = [d[0], d[1], d[2], d[3]]
    } else {
      type = 'bursary'
      const d = pick(BURSARIES); [title, skills, sMin, sMax] = [d[0], d[1], d[2], d[3]]
    }

    const [company, industry] = pick(COMPANIES)
    const city = pick(CITIES)
    const salMin = ri(sMin, sMax) * 1000
    const salMax = Math.floor(salMin * (1.25 + r() * 0.5))
    const daysAgo = ri(0, 45)

    const hex = (1000 + i).toString(16).padStart(8, '0')
    const id = `${hex}-1234-5678-9abc-${hex.padStart(12, '0')}`
    const slug = `${company}-${title}-${1000 + i}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)

    records.push({
      id, employer_id: null, type, title, slug,
      description: `Join ${company} in this ${type} opportunity based in ${city}. Build real skills in ${industry} with one of South Africa's leading organisations.`,
      requirements: 'South African citizen or permanent resident. Meet minimum qualifications.',
      skills_required: skills,
      employment_type: 'full_time',
      experience_level: lvl,
      industry, market: 'za',
      location_city: city, location_country: 'ZA',
      salary_min: salMin, salary_max: salMax, salary_currency: 'ZAR',
      is_active: true, is_verified: r() < 0.71,
      published_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    })
  }

  let inserted = 0
  const errors: string[] = []

  for (let b = 0; b < records.length; b += 50) {
    const { error } = await sb
      .from('opportunities')
      .upsert(records.slice(b, b + 50), { onConflict: 'id', ignoreDuplicates: true })
    if (error) errors.push(error.message)
    else inserted += 50
  }

  const { count } = await sb
    .from('opportunities')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  return NextResponse.json({
    success: errors.length === 0,
    inserted,
    total_in_db: count,
    errors: errors.length ? errors : undefined,
  })
}
