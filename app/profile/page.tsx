'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface WorkExperience {
  id: string
  company: string
  title: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface ProfileData {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  resumeText: string
  skills: string[]
  desiredRole: string
  desiredSalary: string
  workType: string
  experience: WorkExperience[]
  education: string
}

const tabs = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'resume', label: 'Resume & Skills', icon: '📄' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
]

const workTypes = ['Remote', 'Hybrid', 'Onsite', 'Flexible']

export default function ProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('personal')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [skillInput, setSkillInput] = useState('')

  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    resumeText: '',
    skills: [],
    desiredRole: '',
    desiredSalary: '',
    workType: '',
    experience: [],
    education: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile((prev) => ({
          ...prev,
          name: data.user?.name || session?.user?.name || '',
          email: data.user?.email || session?.user?.email || '',
          phone: data.profile?.phone || '',
          location: data.profile?.location || '',
          linkedin: data.profile?.linkedin || '',
          website: data.profile?.website || '',
          resumeText: data.profile?.resumeText || '',
          skills: data.profile?.skills ? JSON.parse(data.profile.skills) : [],
          desiredRole: data.profile?.desiredRole || '',
          desiredSalary: data.profile?.desiredSalary || '',
          workType: data.profile?.workType || '',
          experience: data.profile?.experience ? JSON.parse(data.profile.experience) : [],
          education: data.profile?.education || '',
        }))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
          linkedin: profile.linkedin,
          website: profile.website,
          resumeText: profile.resumeText,
          skills: JSON.stringify(profile.skills),
          desiredRole: profile.desiredRole,
          desiredSalary: profile.desiredSalary,
          workType: profile.workType,
          experience: JSON.stringify(profile.experience),
          education: profile.education,
        }),
      })
      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    const skill = skillInput.trim()
    if (skill && !profile.skills.includes(skill)) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, skill] }))
    }
    setSkillInput('')
  }

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))
  }

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    }
    setProfile((prev) => ({ ...prev, experience: [...prev.experience, newExp] }))
  }

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }))
  }

  const removeExperience = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Profile" className="w-12 h-12 rounded-full border-2 border-violet-500" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-xl font-bold">
                {profile.name?.[0] || 'U'}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{profile.name || 'Your Profile'}</h1>
              <p className="text-gray-400 text-sm">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              '✓ Saved!'
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-lg">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="San Francisco, CA"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">LinkedIn URL</label>
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Personal Website</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://yourname.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resume & Skills Tab */}
        {activeTab === 'resume' && (
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Resume Text</h2>
                <label className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg cursor-pointer transition-colors">
                  📁 Upload File (cosmetic)
                  <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" />
                </label>
              </div>
              <textarea
                value={profile.resumeText}
                onChange={(e) => setProfile({ ...profile, resumeText: e.target.value })}
                placeholder="Paste your resume text here. This is used by the AI to generate personalized cover letters and optimize your applications..."
                rows={12}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none placeholder-gray-500"
              />
              <p className="text-gray-500 text-xs mt-2">
                Tip: Include your full resume text. The AI uses this to generate personalized cover letters.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Skills</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors"
                >
                  Add
                </button>
              </div>
              {profile.skills.length === 0 ? (
                <p className="text-gray-500 text-sm">No skills added yet. Start typing above.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 bg-violet-600/20 text-violet-300 border border-violet-700/50 text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-violet-400 hover:text-red-400 transition-colors text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Education</h2>
              <textarea
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                placeholder="B.S. Computer Science, Stanford University, 2019&#10;Relevant coursework: Algorithms, Machine Learning, Distributed Systems"
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none placeholder-gray-500"
              />
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Work Experience</h2>
              <button
                onClick={addExperience}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <span>+</span> Add Experience
              </button>
            </div>

            {profile.experience.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
                <div className="text-4xl mb-3">💼</div>
                <p className="text-gray-400 mb-4">No experience added yet</p>
                <button
                  onClick={addExperience}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Add Your First Job
                </button>
              </div>
            ) : (
              profile.experience.map((exp, i) => (
                <div key={exp.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-400">Position {i + 1}</span>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder="Company name"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                        placeholder="Software Engineer"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">End Date</label>
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 text-gray-300 disabled:opacity-50"
                      />
                      <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                          className="accent-violet-500"
                        />
                        <span className="text-xs text-gray-400">Currently working here</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="• Led development of core product features&#10;• Reduced API latency by 40%&#10;• Mentored 3 junior engineers"
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none placeholder-gray-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Job Preferences</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Desired Role / Job Title</label>
                  <input
                    type="text"
                    value={profile.desiredRole}
                    onChange={(e) => setProfile({ ...profile, desiredRole: e.target.value })}
                    placeholder="e.g. Senior Software Engineer, Product Manager"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Desired Salary Range</label>
                  <input
                    type="text"
                    value={profile.desiredSalary}
                    onChange={(e) => setProfile({ ...profile, desiredSalary: e.target.value })}
                    placeholder="e.g. $120,000 - $160,000"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-3">Preferred Work Type</label>
                  <div className="flex flex-wrap gap-2">
                    {workTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setProfile({ ...profile, workType: type === profile.workType ? '' : type })}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                          profile.workType === type
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-sm font-medium text-violet-300">Profile Tip</p>
                  <p className="text-sm text-gray-400 mt-1">
                    A complete profile helps our AI generate more personalized cover letters and match you to better jobs.
                    Fill in your resume text under the "Resume & Skills" tab for the best results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save button at bottom */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              '✓ Profile Saved!'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
