export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

const COLORS = [
  'bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-pink-600',
  'bg-orange-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-red-600',
  'bg-green-600', 'bg-purple-600',
]

function logoColor(company: string) {
  let hash = 0
  for (const c of company) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return 'Salary not listed'
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

function formatType(contractTime?: string, contractType?: string) {
  if (contractTime === 'part_time') return 'Part-time'
  if (contractType === 'contract') return 'Contract'
  return 'Full-time'
}

function daysSince(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || 'software engineer'
  const location = searchParams.get('location') || ''
  const page = searchParams.get('page') || '1'

  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    results_per_page: '50',
    what: query,
    'content-type': 'application/json',
  })

  if (location && location !== 'all') params.set('where', location)

  try {
    // Fetch multiple pages in parallel to get more results
    const pagesToFetch = page === '1' ? [1, 2, 3] : [parseInt(page)]
    const responses = await Promise.all(
      pagesToFetch.map(p =>
        fetch(`https://api.adzuna.com/v1/api/jobs/us/search/${p}?${params}`, { next: { revalidate: 300 } })
      )
    )

    const dataArr = await Promise.all(responses.map(r => r.ok ? r.json() : { results: [] }))
    const allResults = dataArr.flatMap(d => d.results ?? [])
    const total = dataArr[0]?.count ?? allResults.length

    // Deduplicate by id
    const seen = new Set<string>()
    const unique = allResults.filter((job: any) => {
      if (seen.has(job.id)) return false
      seen.add(job.id)
      return true
    })

    const data = { results: unique, count: total }

    const jobs = (data.results ?? []).map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name ?? 'Unknown Company',
      location: job.location?.display_name ?? 'Location not listed',
      salary: formatSalary(job.salary_min, job.salary_max),
      type: formatType(job.contract_time, job.contract_type),
      description: job.description ?? '',
      requirements: [],
      tags: [job.category?.label ?? 'General'].filter(Boolean),
      matchScore: Math.floor(Math.random() * 30) + 65, // 65–95
      postedDate: daysSince(job.created),
      jobUrl: job.redirect_url,
      logo: (job.company?.display_name?.[0] ?? '?').toUpperCase(),
      logoColor: logoColor(job.company?.display_name ?? ''),
    }))

    return NextResponse.json({ jobs, total })
  } catch (error) {
    console.error('Adzuna API error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
