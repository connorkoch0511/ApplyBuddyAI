'use client'

import { useState } from 'react'

interface OptimizationResult {
  matchScore: number
  missingKeywords: string[]
  strengths: string[]
  improvements: string[]
  rewrittenSummary: string
}

function CircularProgress({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'
    if (s >= 60) return '#6366f1'
    if (s >= 40) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#1f2937"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={getColor(score)}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: getColor(score) }}>{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
    </div>
  )
}

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleOptimize = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please fill in both fields')
      return
    }
    setError('')
    setIsOptimizing(true)
    setResult(null)

    try {
      const res = await fetch('/api/ai/resume-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      })

      if (!res.ok) throw new Error(`Error: ${res.status}`)

      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error('Optimization error:', err)
      setError('Failed to optimize resume. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  const copySummary = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.rewrittenSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scoreLabel = (score: number) => {
    if (score >= 80) return { text: 'Excellent Match', color: 'text-emerald-400' }
    if (score >= 60) return { text: 'Good Match', color: 'text-violet-400' }
    if (score >= 40) return { text: 'Fair Match', color: 'text-yellow-400' }
    return { text: 'Poor Match', color: 'text-red-400' }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>📄</span> Resume Optimizer
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Get your resume analyzed against any job description to maximize your ATS score
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold">Your Resume</label>
              <span className="text-xs text-gray-500">{resumeText.length} chars</span>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here...

Include your:
• Work experience with dates
• Skills and technologies
• Education
• Achievements and metrics"
              rows={14}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500 resize-none"
            />
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold">Job Description</label>
              <span className="text-xs text-gray-500">{jobDescription.length} chars</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here...

Include the full posting with:
• Required qualifications
• Nice to have skills
• Responsibilities
• Company information"
              rows={14}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleOptimize}
          disabled={isOptimizing || !resumeText || !jobDescription}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-violet-500/20 flex items-center justify-center gap-3 mb-8"
        >
          {isOptimizing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing your resume...
            </>
          ) : (
            <>
              <span>🔍</span>
              Optimize Resume
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Match Score */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-xl mb-5">Optimization Results</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <CircularProgress score={result.matchScore} />
                <div className="flex-1 text-center sm:text-left">
                  <div className={`text-2xl font-bold ${scoreLabel(result.matchScore).color}`}>
                    {scoreLabel(result.matchScore).text}
                  </div>
                  <p className="text-gray-400 mt-1 text-sm">
                    Your resume matches {result.matchScore}% of the job requirements.
                    {result.matchScore < 80 && ' Implement the suggestions below to improve your score.'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300">
                      {result.strengths.length} strengths found
                    </div>
                    <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300">
                      {result.missingKeywords.length} gaps identified
                    </div>
                    <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300">
                      {result.improvements.length} improvements
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Missing Keywords */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-red-400">⚠️</span>
                  Missing Keywords
                  <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full ml-auto">
                    {result.missingKeywords.length}
                  </span>
                </h3>
                <p className="text-gray-500 text-xs mb-3">Add these to your resume to improve ATS matching:</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="bg-red-900/20 text-red-300 border border-red-800/50 text-xs px-3 py-1.5 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-emerald-400">✅</span>
                  Your Strengths
                  <span className="text-xs bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full ml-auto">
                    {result.strengths.length}
                  </span>
                </h3>
                <p className="text-gray-500 text-xs mb-3">These aspects of your resume are a great match:</p>
                <ul className="space-y-2.5">
                  {result.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-violet-400">📈</span>
                Improvement Suggestions
              </h3>
              <div className="space-y-3">
                {result.improvements.map((improvement, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-violet-400 font-bold text-sm flex-shrink-0 w-6 h-6 bg-violet-600/20 rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-gray-300 text-sm">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewritten Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="text-blue-400">✨</span>
                  AI-Rewritten Professional Summary
                </h3>
                <button
                  onClick={copySummary}
                  className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div className="bg-blue-900/10 border border-blue-800/30 rounded-xl p-4">
                <p className="text-gray-200 text-sm leading-relaxed">{result.rewrittenSummary}</p>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                This summary is tailored to the job description. Copy it to replace your current summary.
              </p>
            </div>
          </div>
        )}

        {/* Empty state / tips */}
        {!result && !isOptimizing && (
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'ATS Optimization', desc: 'Our AI analyzes your resume against the exact keywords and phrases ATS systems look for.' },
              { icon: '📊', title: 'Match Score', desc: 'Get a precise score showing how well your resume matches the job requirements, from 0-100.' },
              { icon: '✍️', title: 'Better Summary', desc: 'Receive a completely rewritten professional summary tailored to the specific role.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2 text-sm">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
