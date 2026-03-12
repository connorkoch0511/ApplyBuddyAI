'use client'

import Link from 'next/link'

const features = [
  {
    icon: '✍️',
    title: 'AI Cover Letters',
    description: 'Generate personalized, compelling cover letters in seconds. Choose from professional, enthusiastic, creative, or concise tones.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: '🎯',
    title: 'Smart Job Matching',
    description: 'Our AI analyzes your profile and scores each job on fit. See your match percentage before you apply.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: '📄',
    title: 'Resume Optimizer',
    description: 'Paste any job description and get instant feedback. See missing keywords, strengths, and a rewritten summary.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: '📊',
    title: 'Application Tracker',
    description: 'Keep every application organized in a visual kanban board. Never lose track of where you stand.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: '🎤',
    title: 'Interview Prep',
    description: 'Get 10 tailored interview questions with suggested answers for any role at any company.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: '⚡',
    title: 'Quick Apply',
    description: 'One-click apply to hundreds of jobs simultaneously. Save hours of repetitive form-filling.',
    color: 'from-yellow-500 to-orange-600',
  },
]

const steps = [
  {
    number: '01',
    title: 'Build Your Profile',
    description: 'Upload your resume, add your skills, and set your job preferences. Takes less than 5 minutes.',
    icon: '👤',
  },
  {
    number: '02',
    title: 'Discover & Match',
    description: 'Browse thousands of jobs matched to your profile. Our AI scores each listing so you apply where it counts.',
    icon: '🔍',
  },
  {
    number: '03',
    title: 'Apply with AI',
    description: 'Generate a custom cover letter, optimize your resume, and track every application — all in one place.',
    icon: '🚀',
  },
]



export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-32">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-400 mb-8">
            <span className="text-xs">✨</span>
            Powered by Claude AI — The most advanced language model
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Apply to{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              100s of Jobs
            </span>
            <br />
            in Minutes with AI
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Stop spending hours writing cover letters and tracking applications.
            ApplyBuddyAI automates the tedious parts of your job search so you can
            focus on what matters — landing interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
            >
              Get Started Free →
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-gray-700"
            >
              See How It Works
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-500">Free to use · Powered by Claude AI</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                land your dream job
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              ApplyBuddyAI combines powerful AI tools with smart automation to supercharge every step of your job search.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-500/10 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">Get from zero to employed in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-violet-500/50 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-3xl mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="text-violet-400 text-sm font-mono font-bold mb-2">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to land your dream job?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Sign up for free and start applying smarter with AI-powered tools.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
            >
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              ApplyBuddyAI
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
