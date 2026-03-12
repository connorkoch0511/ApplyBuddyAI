'use client'

import { useState, useRef } from 'react'

const tones = [
  { id: 'professional', label: 'Professional', icon: '👔', description: 'Formal and polished' },
  { id: 'enthusiastic', label: 'Enthusiastic', icon: '🚀', description: 'Energetic and excited' },
  { id: 'creative', label: 'Creative', icon: '🎨', description: 'Unique and memorable' },
  { id: 'concise', label: 'Concise', icon: '⚡', description: 'Short and impactful' },
]

export default function CoverLetterPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [userBackground, setUserBackground] = useState('')
  const [tone, setTone] = useState('professional')
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedLetter, setEditedLetter] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const letterRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async () => {
    if (!jobTitle || !company || !jobDescription || !userBackground) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setIsGenerating(true)
    setGeneratedLetter('')
    setIsEditing(false)

    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, company, jobDescription, userBackground, tone }),
      })

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader')

      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setGeneratedLetter(fullText)
      }

      setEditedLetter(fullText)
    } catch (err) {
      console.error('Generation error:', err)
      setError('Failed to generate cover letter. Please check your API key and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    const text = isEditing ? editedLetter : generatedLetter
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = isEditing ? editedLetter : generatedLetter
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const wordCount = (isEditing ? editedLetter : generatedLetter).split(/\s+/).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>✍️</span> AI Cover Letter Generator
          </h1>
          <p className="text-gray-400 text-sm mt-1">Generate a personalized cover letter in seconds</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-4">Job Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Job Title *</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Company *</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Google"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Job Description *</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-4">Your Background *</h2>
              <textarea
                value={userBackground}
                onChange={(e) => setUserBackground(e.target.value)}
                placeholder="Tell AI about your experience, skills, and what makes you a great candidate...

Example: I'm a software engineer with 5 years of experience in React and Node.js. I led a team that built a real-time dashboard serving 1M+ users at my previous company Acme Corp. I'm passionate about performance optimization and have reduced load times by 60% in my last project..."
                rows={8}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500 resize-none"
              />
            </div>

            {/* Tone Selector */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-4">Tone</h2>
              <div className="grid grid-cols-2 gap-2">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      tone === t.id
                        ? 'border-violet-500 bg-violet-600/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className="text-xs text-gray-400">{t.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !jobTitle || !company || !jobDescription || !userBackground}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-violet-500/20 flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>

          {/* Right: Output */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
              {/* Output header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">Generated Letter</h2>
                  {generatedLetter && (
                    <span className="text-xs text-gray-500">{wordCount} words</span>
                  )}
                </div>
                {generatedLetter && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setIsEditing(!isEditing); setEditedLetter(generatedLetter) }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        isEditing
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {isEditing ? '✓ Editing' : '✏️ Edit'}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                      {copied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                )}
              </div>

              {/* Letter Content */}
              <div className="flex-1 min-h-96 p-5">
                {!generatedLetter && !isGenerating && (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <div className="text-5xl mb-4">✍️</div>
                    <p className="text-gray-400 mb-2">Your cover letter will appear here</p>
                    <p className="text-gray-600 text-sm">Fill in the form and click Generate</p>
                  </div>
                )}

                {isGenerating && !generatedLetter && (
                  <div className="flex flex-col items-center justify-center h-full py-16">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 text-sm">Crafting your cover letter...</p>
                  </div>
                )}

                {(generatedLetter || isGenerating) && (
                  <>
                    {isEditing ? (
                      <textarea
                        value={editedLetter}
                        onChange={(e) => setEditedLetter(e.target.value)}
                        className="w-full h-full min-h-96 bg-transparent text-gray-200 text-sm leading-relaxed resize-none focus:outline-none"
                      />
                    ) : (
                      <div ref={letterRef} className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {generatedLetter}
                        {isGenerating && (
                          <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-blink" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tips */}
            {!generatedLetter && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-medium mb-3 text-sm">💡 Tips for best results</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">→</span>
                    Include the full job description — more context = better output
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">→</span>
                    Mention specific achievements with numbers (e.g., "increased revenue by 30%")
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">→</span>
                    Include the technologies, tools, or skills from the job description
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">→</span>
                    Use "Edit" to personalize the output further after generation
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
