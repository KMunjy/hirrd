import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const MODEL = 'claude-sonnet-4-6'

// ============================================================
// CV PARSING
// ============================================================

export interface ParsedCV {
  headline: string
  summary: string
  years_experience: number
  skills: string[]
  languages: string[]
  education: {
    institution: string
    qualification: string
    field: string
    year_completed: number | null
  }[]
  work_history: {
    company: string
    title: string
    start_date: string
    end_date: string | null
    is_current: boolean
    description: string
    achievements: string[]
  }[]
  certifications: {
    name: string
    issuer: string
    year: number | null
  }[]
  desired_roles: string[]
  raw_text: string
}

export async function parseCV(cvText: string): Promise<ParsedCV> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Parse this CV and return a JSON object with the following structure. Return ONLY valid JSON, no markdown, no explanation.

CV TEXT:
${cvText}

Return this exact JSON structure:
{
  "headline": "one-line professional headline",
  "summary": "2-3 sentence professional summary",
  "years_experience": number,
  "skills": ["skill1", "skill2"],
  "languages": ["English", "Zulu"],
  "education": [{"institution": "", "qualification": "", "field": "", "year_completed": null}],
  "work_history": [{"company": "", "title": "", "start_date": "YYYY-MM", "end_date": "YYYY-MM or null", "is_current": false, "description": "", "achievements": []}],
  "certifications": [{"name": "", "issuer": "", "year": null}],
  "desired_roles": ["inferred from experience"],
  "raw_text": "first 500 chars of CV"
}`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as ParsedCV
}

// ============================================================
// CV IMPROVEMENT
// ============================================================

export interface CVImprovement {
  score_before: number
  score_after: number
  improved_headline: string
  improved_summary: string
  improvements: {
    section: string
    original: string
    improved: string
    reason: string
  }[]
  missing_keywords: string[]
  ats_tips: string[]
}

export async function improveCV(
  parsedCV: ParsedCV,
  targetRole?: string,
  jobDescription?: string
): Promise<CVImprovement> {
  const context = targetRole
    ? `Target role: ${targetRole}\n${jobDescription ? `Job description: ${jobDescription}` : ''}`
    : 'General improvement for the South African and UK job markets'

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are an expert CV coach for the South African and UK job markets. Improve this CV.

${context}

CURRENT CV DATA:
${JSON.stringify(parsedCV, null, 2)}

Return ONLY valid JSON:
{
  "score_before": 0-100,
  "score_after": 0-100,
  "improved_headline": "stronger headline",
  "improved_summary": "stronger 2-3 sentence summary with quantifiable achievements",
  "improvements": [
    {
      "section": "Work History / Summary / Skills",
      "original": "original text",
      "improved": "improved text",
      "reason": "why this is better"
    }
  ],
  "missing_keywords": ["ATS keywords missing from this CV"],
  "ats_tips": ["actionable tip 1", "actionable tip 2"]
}`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as CVImprovement
}

// ============================================================
// JOB MATCHING
// ============================================================

export interface MatchAnalysis {
  match_score: number
  match_breakdown: {
    skills: number
    experience: number
    location: number
    salary: number
    education: number
  }
  matched_skills: string[]
  missing_skills: string[]
  match_summary: string
  recommendation: 'apply_now' | 'apply_with_note' | 'skill_up_first' | 'not_recommended'
  application_tip: string
}

export async function analyzeMatch(
  candidate: {
    skills: string[]
    years_experience: number
    education: ParsedCV['education']
    desired_salary_min?: number
    desired_currency?: string
    location_city?: string
    market?: string
  },
  opportunity: {
    title: string
    description: string
    skills_required: string[]
    skills_preferred: string[]
    experience_level: string
    salary_min?: number
    salary_max?: number
    salary_currency?: string
    location_city?: string
    market?: string
    remote_allowed?: boolean
  }
): Promise<MatchAnalysis> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Analyse the match between this candidate and job opportunity. Return ONLY valid JSON.

CANDIDATE:
${JSON.stringify(candidate, null, 2)}

OPPORTUNITY:
${JSON.stringify(opportunity, null, 2)}

Return this exact JSON:
{
  "match_score": 0-100,
  "match_breakdown": {
    "skills": 0-100,
    "experience": 0-100,
    "location": 0-100,
    "salary": 0-100,
    "education": 0-100
  },
  "matched_skills": ["skill1"],
  "missing_skills": ["skill2"],
  "match_summary": "2 sentence explanation",
  "recommendation": "apply_now|apply_with_note|skill_up_first|not_recommended",
  "application_tip": "specific tip for this candidate applying to this role"
}`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as MatchAnalysis
}

// ============================================================
// INTERVIEW PREP
// ============================================================

export interface InterviewPrep {
  likely_questions: {
    question: string
    category: string
    model_answer_tip: string
  }[]
  company_research_tips: string[]
  role_specific_tips: string[]
  sa_uk_context_tips: string[]
}

export async function generateInterviewPrep(
  role: string,
  company: string,
  jobDescription: string,
  candidateSkills: string[]
): Promise<InterviewPrep> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Generate interview preparation content for this South African / UK job opportunity. Return ONLY valid JSON.

Role: ${role}
Company: ${company}
Job Description: ${jobDescription}
Candidate Skills: ${candidateSkills.join(', ')}

Return:
{
  "likely_questions": [
    {
      "question": "Tell me about yourself",
      "category": "Behavioural|Technical|Situational|Cultural",
      "model_answer_tip": "how to structure a strong answer"
    }
  ],
  "company_research_tips": ["what to research"],
  "role_specific_tips": ["technical preparation tips"],
  "sa_uk_context_tips": ["tips specific to SA/UK workplace culture"]
}`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as InterviewPrep
}

// ============================================================
// SKILL GAP ANALYSIS
// ============================================================

export interface SkillGapAnalysis {
  gaps: {
    skill: string
    importance: 'critical' | 'high' | 'medium' | 'low'
    how_to_learn: string
    estimated_time: string
    free_resource: string
    paid_resource: string
  }[]
  quick_wins: string[]
  six_month_plan: string
}

export async function analyzeSkillGaps(
  candidateSkills: string[],
  targetRole: string,
  requiredSkills: string[]
): Promise<SkillGapAnalysis> {
  const missingSkills = requiredSkills.filter(
    s => !candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  )

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Create a skill gap analysis for a South African job seeker targeting: ${targetRole}

Candidate skills: ${candidateSkills.join(', ')}
Missing required skills: ${missingSkills.join(', ')}

Return ONLY valid JSON:
{
  "gaps": [
    {
      "skill": "skill name",
      "importance": "critical|high|medium|low",
      "how_to_learn": "practical steps",
      "estimated_time": "e.g. 2 weeks",
      "free_resource": "e.g. freeCodeCamp, YouTube, Coursera free tier",
      "paid_resource": "e.g. Udemy course name"
    }
  ],
  "quick_wins": ["things candidate can do this week"],
  "six_month_plan": "structured 6-month learning roadmap paragraph"
}`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as SkillGapAnalysis
}
