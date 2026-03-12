'use client'

import { useState } from 'react'

interface InterviewQuestion {
  id: number
  category: string
  question: string
  suggestedAnswer: string
  tips: string
}

const categoryColors: Record<string, string> = {
  Behavioral: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  Technical: 'bg-violet-900/40 text-violet-300 border-violet-700/50',
  Situational: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  'Culture Fit': 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
}

const interviewTips = [
  { icon: '⏱️', title: 'Use the STAR Method', desc: 'Situation, Task, Action, Result — structure every behavioral answer this way.' },
  { icon: '🔍', title: 'Research the Company', desc: 'Know their mission, recent news, products, and competitors before walking in.' },
  { icon: '❓', title: 'Prepare Your Questions', desc: 'Have 3-5 thoughtful questions ready. It shows genuine interest and engagement.' },
  { icon: '💰', title: 'Know Your Numbers', desc: 'Have your salary expectations ready and based on market research, not just desire.' },
  { icon: '🤝', title: 'Follow Up', desc: 'Send a thank-you email within 24 hours. Reference specific topics you discussed.' },
  { icon: '🎯', title: 'Be Specific', desc: 'Use concrete examples with numbers whenever possible. Vague answers lose points.' },
]

export default function InterviewPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!jobTitle || !company) {
      setError('Please enter a job title and company')
      return
    }
    setError('')
    setIsGenerating(true)
    setQuestions([])

    try {
      const res = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, jobDescription }),
      })

      if (!res.ok) throw new Error(`Error: ${res.status}`)

      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (err) {
      console.error('Interview prep error:', err)
      setError('Failed to generate questions. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleQuestion = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const categoryCount = (category: string) => questions.filter((q) => q.category === category).length

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>🎤</span> Interview Prep
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Get 10 tailored interview questions with AI-crafted answers
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Input Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Job Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Job Title *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Company *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1.5">
              Job Description <span className="text-gray-600">(optional but recommended)</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description for more targeted questions..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !jobTitle || !company}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating questions...
              </>
            ) : (
              <>
                <span>⚡</span>
                Generate Interview Questions
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {questions.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex flex-wrap gap-3">
              {['Behavioral', 'Technical', 'Situational', 'Culture Fit'].map((cat) => {
                const count = categoryCount(cat)
                if (count === 0) return null
                return (
                  <div key={cat} className={`text-xs px-3 py-1.5 rounded-full border ${categoryColors[cat] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {cat}: {count} question{count !== 1 ? 's' : ''}
                  </div>
                )
              })}
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
                >
                  <button
                    onClick={() => toggleQuestion(q.id)}
                    className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-600/20 text-violet-400 rounded-lg flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded border ${categoryColors[q.category] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                          {q.category}
                        </span>
                      </div>
                      <p className="font-medium text-sm leading-relaxed">{q.question}</p>
                    </div>
                    <div className="flex-shrink-0 text-gray-400 mt-1">
                      {expandedId === q.id ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {expandedId === q.id && (
                    <div className="px-5 pb-5 border-t border-gray-800">
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-violet-400 mb-2">Suggested Answer</h4>
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <p className="text-gray-300 text-sm leading-relaxed">{q.suggestedAnswer}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-yellow-400 mb-2">💡 Pro Tips</h4>
                        <p className="text-gray-400 text-sm">{q.tips}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Company Research */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🔍</span> Research {company} Before Your Interview
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: '📰', label: 'Recent News', desc: `Search "${company} news 2024" to find recent announcements` },
                  { icon: '💡', label: 'Products & Services', desc: `Review their main product offerings and recent launches` },
                  { icon: '👥', label: 'Culture & Values', desc: `Check their "About Us" page, Glassdoor, and LinkedIn` },
                  { icon: '📊', label: 'Competitors', desc: `Know their top 3-5 competitors and how ${company} differentiates` },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="text-sm font-medium mb-1">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tips section — always visible */}
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <span>🏆</span> Interview Success Tips
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviewTips.map((tip) => (
              <div key={tip.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="text-2xl mb-2">{tip.icon}</div>
                <h3 className="font-medium text-sm mb-1">{tip.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
