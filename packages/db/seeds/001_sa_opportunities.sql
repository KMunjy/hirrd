-- ============================================================
-- HIRRD SEED: SA Employers + Opportunities (MVP)
-- Run AFTER schema migration
-- ============================================================

-- First ensure a system employer profile exists
INSERT INTO profiles (id, role, full_name, email, market)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'employer', 'Hirrd System', 'system@hirrd.com', 'za')
ON CONFLICT (id) DO NOTHING;

-- Seed SA employers
INSERT INTO employers (id, profile_id, company_name, company_slug, industry, headquarters_city, headquarters_country, company_website, verification_status, account_status)
VALUES
  ('e1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'FNB', 'fnb', 'Financial Services', 'Johannesburg', 'ZA', 'https://www.fnb.co.za', 'verified', 'verified'),
  ('e1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Standard Bank', 'standard-bank', 'Financial Services', 'Johannesburg', 'ZA', 'https://www.standardbank.co.za', 'verified', 'verified'),
  ('e1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Capitec Bank', 'capitec', 'Financial Services', 'Stellenbosch', 'ZA', 'https://www.capitecbank.co.za', 'verified', 'verified'),
  ('e1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Discovery', 'discovery', 'Insurance / FinTech', 'Johannesburg', 'ZA', 'https://www.discovery.co.za', 'verified', 'verified'),
  ('e1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Vodacom', 'vodacom', 'Telecoms', 'Midrand', 'ZA', 'https://www.vodacom.co.za', 'verified', 'verified'),
  ('e1000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'MTN South Africa', 'mtn-sa', 'Telecoms', 'Johannesburg', 'ZA', 'https://www.mtn.co.za', 'verified', 'verified'),
  ('e1000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Nedbank', 'nedbank', 'Financial Services', 'Johannesburg', 'ZA', 'https://www.nedbank.co.za', 'verified', 'verified')
ON CONFLICT (id) DO NOTHING;

-- Seed SA opportunities
INSERT INTO opportunities (
  id, employer_id, type, title, slug, description, requirements,
  skills_required, employment_type, experience_level, industry,
  market, location_city, location_country, salary_min, salary_max, salary_currency,
  is_active, is_verified, published_at
) VALUES
  (
    'op000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'job', 'Junior Data Analyst', 'fnb-junior-data-analyst',
    'Join FNB Analytics team to drive data-driven decisions across retail banking products. You will analyse customer data, build dashboards, and support strategic initiatives.',
    'BCom / BSc degree. Strong SQL and Excel skills. 0-2 years experience.',
    ARRAY['SQL', 'Python', 'Excel', 'Tableau', 'Data Analysis'],
    'full_time', 'junior', 'Financial Services',
    'za', 'Johannesburg', 'ZA', 28000, 40000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000002',
    'job', 'UX Researcher', 'standard-bank-ux-researcher',
    'Standard Bank is looking for a UX Researcher to improve digital banking experiences for millions of South Africans. You will conduct user interviews, usability tests, and synthesise insights.',
    '2+ years UX research experience. Portfolio required.',
    ARRAY['User Research', 'Figma', 'Usability Testing', 'Data Analysis', 'Interviewing'],
    'full_time', 'mid', 'Financial Services',
    'za', 'Cape Town', 'ZA', 32000, 48000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000004',
    'job', 'Data Scientist', 'discovery-data-scientist',
    'Discovery Vitality team seeks a Data Scientist to build predictive models for health and wellness incentives, working at the intersection of insurance and behavioural economics.',
    'Honours/Masters in Statistics, Maths, CS. R or Python required. 3+ years.',
    ARRAY['Python', 'R', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
    'full_time', 'mid', 'Insurance / FinTech',
    'za', 'Johannesburg', 'ZA', 50000, 75000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000004',
    'e1000000-0000-0000-0000-000000000003',
    'job', 'Product Manager — Digital Banking', 'capitec-product-manager',
    'Capitec is disrupting SA banking. Join as a PM to own digital features used by 22 million+ customers. Drive feature strategy from ideation to launch.',
    '3+ years product management. Fintech preferred. MBA advantageous.',
    ARRAY['Product Strategy', 'Agile', 'User Stories', 'Data Analysis', 'Stakeholder Management'],
    'full_time', 'senior', 'Financial Services',
    'za', 'Stellenbosch', 'ZA', 65000, 90000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000005',
    'e1000000-0000-0000-0000-000000000004',
    'learnership', 'Data Science Learnership', 'discovery-data-science-learnership',
    'A 12-month paid learnership for graduates to develop data science skills within the Discovery Vitality team. Includes mentorship, training, and real project work.',
    'Recent BCom/BSc graduate. Strong maths. SA citizen.',
    ARRAY['Python', 'SQL', 'Excel', 'Statistics'],
    'full_time', 'entry', 'Insurance / FinTech',
    'za', 'Johannesburg', 'ZA', 8000, 12000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000006',
    'e1000000-0000-0000-0000-000000000005',
    'job', 'DevOps Engineer', 'vodacom-devops-engineer',
    'Vodacom Technology is modernising its cloud infrastructure. Join as a DevOps Engineer to build CI/CD pipelines, manage Kubernetes clusters, and drive platform reliability.',
    '3+ years DevOps. AWS/Azure certified preferred.',
    ARRAY['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
    'full_time', 'mid', 'Telecoms',
    'za', 'Midrand', 'ZA', 58000, 82000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000007',
    'e1000000-0000-0000-0000-000000000006',
    'job', 'Software Engineer — Backend', 'mtn-backend-engineer',
    'MTN SA Digital team is building next-generation mobile money and fintech products for Africa. Join as a Backend Engineer to design scalable APIs and microservices.',
    '3+ years backend. Node.js or Java. REST API design.',
    ARRAY['Node.js', 'Java', 'REST APIs', 'PostgreSQL', 'Redis', 'Docker'],
    'full_time', 'mid', 'Telecoms',
    'za', 'Johannesburg', 'ZA', 55000, 78000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000008',
    'e1000000-0000-0000-0000-000000000007',
    'job', 'Business Analyst — Digital Transformation', 'nedbank-business-analyst',
    'Nedbank CIB is running a major digital transformation. Looking for a BA to bridge business and technology, document requirements, and manage stakeholder expectations.',
    'BCom or BSc. 2+ years BA experience. Banking domain preferred.',
    ARRAY['Business Analysis', 'SQL', 'Visio', 'JIRA', 'Stakeholder Management', 'Agile'],
    'full_time', 'junior', 'Financial Services',
    'za', 'Johannesburg', 'ZA', 35000, 52000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000009',
    'e1000000-0000-0000-0000-000000000001',
    'learnership', 'IT Graduate Programme', 'fnb-it-graduate-programme',
    'FNB IT Graduate Programme offers 18-month rotations across cybersecurity, data engineering, software development, and cloud. Structured mentorship and full salary.',
    'BIT, BSc Comp Sci, or related. Graduated within 2 years. SA citizen.',
    ARRAY['SQL', 'Python', 'Java', 'Problem Solving'],
    'full_time', 'entry', 'Financial Services',
    'za', 'Johannesburg', 'ZA', 18000, 22000, 'ZAR',
    true, true, NOW()
  ),
  (
    'op000000-0000-0000-0000-000000000010',
    'e1000000-0000-0000-0000-000000000002',
    'job', 'Cybersecurity Analyst', 'standard-bank-cybersecurity',
    'Standard Bank Security Operations Centre is looking for an analyst to monitor threats, investigate incidents, and protect one of Africa''s largest banks.',
    '2+ years cybersecurity. CISSP or CompTIA Security+ preferred.',
    ARRAY['SIEM', 'Threat Analysis', 'Network Security', 'Python', 'Incident Response'],
    'full_time', 'junior', 'Financial Services',
    'za', 'Johannesburg', 'ZA', 38000, 58000, 'ZAR',
    true, true, NOW()
  )
ON CONFLICT (id) DO NOTHING;
