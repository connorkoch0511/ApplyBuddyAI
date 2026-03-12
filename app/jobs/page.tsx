'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  description: string
  requirements: string[]
  tags: string[]
  matchScore: number
  postedDate: string
  logo: string
  logoColor: string
}

const typeColors: Record<string, string> = {
  Remote: 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50',
  Hybrid: 'bg-blue-900/50 text-blue-400 border-blue-700/50',
  Onsite: 'bg-orange-900/50 text-orange-400 border-orange-700/50',
}

const scoreColor = (score: number) => {
  if (score >= 90) return 'text-emerald-400 bg-emerald-900/40'
  if (score >= 75) return 'text-blue-400 bg-blue-900/40'
  if (score >= 60) return 'text-yellow-400 bg-yellow-900/40'
  return 'text-gray-400 bg-gray-800'
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applyJob, setApplyJob] = useState<Job | null>(null)
  const [applySuccess, setApplySuccess] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/jobs/search')
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
        setFilteredJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = useCallback(() => {
    let result = [...jobs]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (locationFilter !== 'all') {
      result = result.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter((job) => job.type === typeFilter)
    }

    setFilteredJobs(result)
  }, [jobs, searchQuery, locationFilter, typeFilter])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleApply = async (job: Job) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          status: 'applied',
          appliedAt: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        setApplySuccess(true)
        setTimeout(() => {
          setShowApplyModal(false)
          setApplySuccess(false)
          setApplyJob(null)
        }, 2000)
      }
    } catch (error) {
      console.error('Error applying:', error)
    }
  }

  const handleSave = async (job: Job) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          status: 'saved',
        }),
      })
      if (res.ok) {
        setSavedJobs((prev) => { const next = new Set(prev); next.add(job.id); return next })
      }
    } catch (error) {
      console.error('Error saving job:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return `${Math.floor(diffDays / 7)} weeks ago`
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Job Search</h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, company, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
              />
            </div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 text-gray-300"
            >
              <option value="all">All Locations</option>
              <option value="san francisco">San Francisco</option>
              <option value="new york">New York</option>
              <option value="remote">Remote</option>
              <option value="chicago">Chicago</option>
              <option value="austin">Austin</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 text-gray-300"
            >
              <option value="all">All Types</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            {isLoading ? 'Loading...' : `${filteredJobs.length} jobs found`}
          </p>
          <div className="text-xs text-gray-500">Sorted by match score</div>
        </div>

        {/* Jobs grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400 mb-2">No jobs found matching your filters</p>
            <button
              onClick={() => { setSearchQuery(''); setLocationFilter('all'); setTypeFilter('all') }}
              className="text-violet-400 hover:text-violet-300 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-violet-500/10 group"
              >
                {/* Company header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${job.logoColor} flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                      {job.logo}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight group-hover:text-violet-300 transition-colors">{job.title}</h3>
                      <p className="text-gray-400 text-xs">{job.company}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-lg ${scoreColor(job.matchScore)}`}>
                    {job.matchScore}%
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary.split(' - ')[0]}+</span>
                </div>

                {/* Type + tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[job.type] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {job.type}
                  </span>
                  {job.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setApplyJob(job); setShowApplyModal(true) }}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    Quick Apply
                  </button>
                  <button
                    onClick={() => handleSave(job)}
                    className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                      savedJobs.has(job.id)
                        ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {savedJobs.has(job.id) ? '✓' : '🔖'}
                  </button>
                </div>

                <div className="mt-2 text-right text-xs text-gray-600">{formatDate(job.postedDate)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Detail Slide-over */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
          <div className="w-full max-w-lg bg-gray-900 border-l border-gray-800 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${selectedJob.logoColor} flex items-center justify-center font-bold text-white`}>
                  {selectedJob.logo}
                </div>
                <div>
                  <h2 className="font-bold">{selectedJob.title}</h2>
                  <p className="text-gray-400 text-sm">{selectedJob.company}</p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              {/* Key details */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Salary</div>
                  <div className="text-sm font-medium">{selectedJob.salary}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Location</div>
                  <div className="text-sm font-medium">{selectedJob.location}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Work Type</div>
                  <div className="text-sm font-medium">{selectedJob.type}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Match Score</div>
                  <div className={`text-sm font-bold ${scoreColor(selectedJob.matchScore).split(' ')[0]}`}>{selectedJob.matchScore}% match</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedJob.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-violet-900/30 text-violet-300 border border-violet-700/50 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="font-semibold mb-3">About the Role</h3>
                {selectedJob.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-gray-300 text-sm leading-relaxed mb-3">{para}</p>
                ))}
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Apply buttons */}
              <div className="flex gap-3 sticky bottom-0 bg-gray-900 pt-3">
                <button
                  onClick={() => { setApplyJob(selectedJob); setShowApplyModal(true) }}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => handleSave(selectedJob)}
                  className={`px-4 py-3 rounded-xl border transition-colors text-sm ${
                    savedJobs.has(selectedJob.id)
                      ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {savedJobs.has(selectedJob.id) ? 'Saved ✓' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && applyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {applySuccess ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2">Application Saved!</h3>
                <p className="text-gray-400 text-sm">Added to your applications tracker</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-1">Apply to {applyJob.company}</h3>
                <p className="text-gray-400 text-sm mb-5">{applyJob.title}</p>

                <div className="bg-gray-800 rounded-xl p-4 mb-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span>{applyJob.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Salary</span>
                    <span>{applyJob.salary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Match Score</span>
                    <span className="text-violet-400 font-bold">{applyJob.matchScore}%</span>
                  </div>
                </div>

                <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-3 mb-5 text-sm text-violet-300">
                  💡 Tip: Generate a custom cover letter for this role to increase your chances!
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApply(applyJob)}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Mark as Applied
                  </button>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
