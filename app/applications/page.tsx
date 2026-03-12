'use client'

import { useState, useEffect } from 'react'

interface Application {
  id: string
  jobTitle: string
  company: string
  location?: string
  salary?: string
  status: string
  jobUrl?: string
  notes?: string
  appliedAt?: string
  createdAt: string
  updatedAt: string
}

const columns = [
  { id: 'saved', label: 'Saved', icon: '🔖', color: 'border-gray-600', headerColor: 'bg-gray-800 text-gray-300' },
  { id: 'applied', label: 'Applied', icon: '📤', color: 'border-blue-600', headerColor: 'bg-blue-900/40 text-blue-300' },
  { id: 'phone_screen', label: 'Phone Screen', icon: '📞', color: 'border-yellow-600', headerColor: 'bg-yellow-900/40 text-yellow-300' },
  { id: 'interview', label: 'Interview', icon: '🎤', color: 'border-violet-600', headerColor: 'bg-violet-900/40 text-violet-300' },
  { id: 'offer', label: 'Offer', icon: '🎉', color: 'border-emerald-600', headerColor: 'bg-emerald-900/40 text-emerald-300' },
  { id: 'rejected', label: 'Rejected', icon: '❌', color: 'border-red-600', headerColor: 'bg-red-900/40 text-red-300' },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const [newApp, setNewApp] = useState({
    jobTitle: '',
    company: '',
    location: '',
    salary: '',
    status: 'saved',
    jobUrl: '',
    notes: '',
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setIsLoading(true)
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

  const handleAddApplication = async () => {
    if (!newApp.jobTitle || !newApp.company) return
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      })
      if (res.ok) {
        const created = await res.json()
        setApplications((prev) => [created, ...prev])
        setShowAddModal(false)
        setNewApp({ jobTitle: '', company: '', location: '', salary: '', status: 'saved', jobUrl: '', notes: '' })
      }
    } catch (error) {
      console.error('Error adding application:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        )
        if (selectedApp?.id === id) {
          setSelectedApp((prev) => prev ? { ...prev, status: newStatus } : null)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedApp) return
    setIsSavingNotes(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedApp.id, notes: editNotes }),
      })
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === selectedApp.id ? { ...app, notes: editNotes } : app))
        )
        setSelectedApp((prev) => prev ? { ...prev, notes: editNotes } : null)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setApplications((prev) => prev.filter((app) => app.id !== id))
        if (selectedApp?.id === id) setSelectedApp(null)
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    }
  }

  const getColumnApps = (status: string) => applications.filter((app) => app.status === status)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Applications</h1>
            <p className="text-gray-400 text-sm mt-0.5">{applications.length} total applications</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span>+</span> Add Application
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto p-6">
        <div className="flex gap-4 min-w-max">
          {columns.map((col) => {
            const colApps = getColumnApps(col.id)
            return (
              <div key={col.id} className="w-64 flex-shrink-0">
                {/* Column Header */}
                <div className={`${col.headerColor} rounded-t-xl px-3 py-2 flex items-center justify-between border-b-2 ${col.color}`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{col.icon}</span>
                    <span>{col.label}</span>
                  </div>
                  <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
                    {colApps.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className="bg-gray-900/50 rounded-b-xl min-h-48 p-2 space-y-2 border border-t-0 border-gray-800">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3 animate-pulse h-20" />
                    ))
                  ) : colApps.length === 0 ? (
                    <div className="text-center py-6 text-gray-600 text-xs">No applications</div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => { setSelectedApp(app); setEditNotes(app.notes || '') }}
                        className="bg-gray-800 border border-gray-700 hover:border-violet-500/50 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="w-6 h-6 rounded bg-violet-600/30 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                            {app.company[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{app.jobTitle}</p>
                            <p className="text-xs text-gray-400 truncate">{app.company}</p>
                          </div>
                        </div>
                        {app.location && (
                          <p className="text-xs text-gray-500 mt-1.5 truncate">📍 {app.location}</p>
                        )}
                        {app.salary && (
                          <p className="text-xs text-gray-500 truncate">💰 {app.salary}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600">{formatDate(app.createdAt)}</span>
                          <select
                            value={app.status}
                            onChange={(e) => { e.stopPropagation(); handleStatusChange(app.id, e.target.value) }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-gray-300 cursor-pointer"
                          >
                            {columns.map((c) => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-5">Add Application</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={newApp.jobTitle}
                  onChange={(e) => setNewApp({ ...newApp, jobTitle: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company *</label>
                <input
                  type="text"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  placeholder="e.g. Google"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={newApp.location}
                    onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                    placeholder="e.g. Remote"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Salary</label>
                  <input
                    type="text"
                    value={newApp.salary}
                    onChange={(e) => setNewApp({ ...newApp, salary: e.target.value })}
                    placeholder="e.g. $120k"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={newApp.status}
                  onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 text-gray-300"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>{col.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Job URL</label>
                <input
                  type="url"
                  value={newApp.jobUrl}
                  onChange={(e) => setNewApp({ ...newApp, jobUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={newApp.notes}
                  onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                  placeholder="Any notes about this application..."
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleAddApplication}
                disabled={!newApp.jobTitle || !newApp.company}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
              >
                Add Application
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold">{selectedApp.jobTitle}</h3>
                <p className="text-gray-400">{selectedApp.company}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              {selectedApp.location && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Location</div>
                  <div>{selectedApp.location}</div>
                </div>
              )}
              {selectedApp.salary && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Salary</div>
                  <div>{selectedApp.salary}</div>
                </div>
              )}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-500 text-xs mb-1">Added</div>
                <div>{new Date(selectedApp.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-gray-500 text-xs mb-1">Status</div>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                  className="bg-transparent text-gray-300 text-sm focus:outline-none w-full cursor-pointer"
                >
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedApp.jobUrl && (
              <a
                href={selectedApp.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-violet-400 hover:text-violet-300 text-sm mb-4 truncate"
              >
                🔗 {selectedApp.jobUrl}
              </a>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add your notes here..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={() => { if (confirm('Delete this application?')) handleDelete(selectedApp.id) }}
                className="px-4 py-2.5 bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded-xl text-sm transition-colors border border-red-800/50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
