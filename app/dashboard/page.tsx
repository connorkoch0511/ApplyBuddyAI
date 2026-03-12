'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Application {
  id: string
  jobTitle: string
  company: string
  status: string
  createdAt: string
  salary?: string
  location?: string
}

const statusColors: Record<string, string> = {
  saved: 'bg-gray-700 text-gray-300',
  applied: 'bg-blue-900/60 text-blue-300',
  phone_screen: 'bg-yellow-900/60 text-yellow-300',
  interview: 'bg-violet-900/60 text-violet-300',
  offer: 'bg-emerald-900/60 text-emerald-300',
  rejected: 'bg-red-900/60 text-red-300',
}

const statusLabels: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

const tips = [
  'Tailor your cover letter to each company — mention their specific products or recent news.',
  'Apply to jobs within 48 hours of posting to maximize your visibility.',
  'Follow up on applications after 1 week with a brief, polite email.',
  'Optimize your LinkedIn profile to match the keywords in your target job descriptions.',
  'Research salary ranges before interviews so you can negotiate confidently.',
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    fetchApplications()
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalApplications = applications.length
  const thisWeek = applications.filter((app) => {
    const appDate = new Date(app.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return appDate > weekAgo
  }).length

  const interviews = applications.filter(
    (app) => app.status === 'interview' || app.status === 'phone_screen'
  ).length

  const offers = applications.filter((app) => app.status === 'offer').length

  const interviewRate = totalApplications > 0
    ? Math.round((interviews / totalApplications) * 100)
    : 0

  const responseRate = totalApplications > 0
    ? Math.round(((interviews + offers) / totalApplications) * 100)
    : 0

  const recentApplications = applications.slice(0, 6)

  const quickActions = [
    { href: '/jobs', icon: '🔍', title: 'Search Jobs', description: 'Browse 25+ matched openings', color: 'from-blue-600/20 to-cyan-600/10 border-blue-500/30' },
    { href: '/cover-letter', icon: '✍️', title: 'Generate Cover Letter', description: 'AI-powered in seconds', color: 'from-violet-600/20 to-purple-600/10 border-violet-500/30' },
    { href: '/resume', icon: '📄', title: 'Optimize Resume', description: 'Match any job description', color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30' },
    { href: '/interview', icon: '🎤', title: 'Interview Prep', description: '10 questions + answers', color: 'from-orange-600/20 to-amber-600/10 border-orange-500/30' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              {session?.user?.name?.split(' ')[0] || 'there'}
            </span>{' '}
            👋
          </h1>
          <p className="text-gray-400 mt-1">Here's your job search overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: isLoading ? '—' : totalApplications.toString(), icon: '📋', sub: 'all time' },
            { label: 'This Week', value: isLoading ? '—' : thisWeek.toString(), icon: '📅', sub: 'applications' },
            { label: 'Interview Rate', value: isLoading ? '—' : `${interviewRate}%`, icon: '🎤', sub: 'of applications' },
            { label: 'Response Rate', value: isLoading ? '—' : `${responseRate}%`, icon: '📬', sub: 'positive responses' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-300">{stat.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="font-semibold text-lg">Recent Applications</h2>
              <Link href="/applications" className="text-sm text-violet-400 hover:text-violet-300">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-800">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-800 rounded w-48 mb-2" />
                        <div className="h-3 bg-gray-800 rounded w-32" />
                      </div>
                    </div>
                  </div>
                ))
              ) : recentApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-3xl mb-3">📋</div>
                  <p className="text-gray-400 text-sm mb-4">No applications yet</p>
                  <Link
                    href="/jobs"
                    className="inline-block bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Search Jobs
                  </Link>
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.id} className="p-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {app.company[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{app.jobTitle}</div>
                      <div className="text-gray-400 text-xs">{app.company}</div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${statusColors[app.status] || statusColors.saved}`}>
                      {statusLabels[app.status] || app.status}
                    </div>
                    <div className="text-gray-500 text-xs flex-shrink-0 hidden sm:block">
                      {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Tips */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span>💡</span> AI Tip of the Day
            </h2>
            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {tips[currentTip]}
              </p>
            </div>
            <div className="flex gap-1 justify-center">
              {tips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTip(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentTip ? 'bg-violet-400' : 'bg-gray-700'}`}
                />
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-sm mb-3 text-gray-300">Your Progress</h3>
              <div className="space-y-2">
                {[
                  { label: 'Profile Complete', value: 60 },
                  { label: 'Applications Sent', value: Math.min(totalApplications * 10, 100) },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full">
                      <div
                        className="h-1.5 bg-violet-600 rounded-full transition-all"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`bg-gradient-to-br ${action.color} border rounded-xl p-5 hover:scale-105 transition-all group`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <div className="font-semibold text-sm mb-1">{action.title}</div>
                <div className="text-xs text-gray-400">{action.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
