'use client'

import { useState } from 'react'

export function LoginScreen({ onLogin, error }: { onLogin: (e: string, p: string) => Promise<void>, error: string | null }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await onLogin(email, password)
    setSubmitting(false)
  }

  const setCreds = (e: string, p: string) => { setEmail(e); setPassword(p) }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-sm">
      <div className="w-full max-w-md bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">💰</div>
          <h1 className="text-2xl font-bold tracking-tight">Finance Dash</h1>
          <p className="text-slate-400 mt-2">Sign in to your enterprise dashboard</p>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition outline-none" placeholder="Enter your email" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition duration-200 mt-2 shadow-lg shadow-indigo-500/25">
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 mb-3 text-center uppercase tracking-wide font-semibold">Test Accounts</p>
          <div className="grid grid-cols-1 gap-2">
            <button type="button" onClick={() => setCreds('admin@finance.dev', 'Admin@1234')} className="py-2.5 px-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-xs font-medium text-left flex justify-between group transition">
              <span>Admin <span className="text-slate-500 ml-1 font-normal">(All access)</span></span><span className="text-slate-500 group-hover:text-slate-300">admin@finance.dev</span>
            </button>
            <button type="button" onClick={() => setCreds('analyst@finance.dev', 'Analyst@1234')} className="py-2.5 px-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-xs font-medium text-left flex justify-between group transition">
              <span>Analyst <span className="text-slate-500 ml-1 font-normal">(Insights + Records)</span></span><span className="text-slate-500 group-hover:text-slate-300">analyst@finance.dev</span>
            </button>
            <button type="button" onClick={() => setCreds('viewer@finance.dev', 'Viewer@1234')} className="py-2.5 px-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-xs font-medium text-left flex justify-between group transition">
              <span>Viewer <span className="text-slate-500 ml-1 font-normal">(Dashboard Only)</span></span><span className="text-slate-500 group-hover:text-slate-300">viewer@finance.dev</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AccessDenied({ userRole, goBack }: { userRole: string, goBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 bg-slate-800/30 rounded-3xl border border-slate-700/50 border-dashed backdrop-blur-sm">
      <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-3xl mb-5 ring-1 ring-rose-500/20 shadow-lg shadow-rose-500/10">🔒</div>
      <h2 className="text-2xl font-bold text-white tracking-tight">Access Restricted</h2>
      <p className="text-slate-400 text-sm mt-3 max-w-sm text-center leading-relaxed">
        Your current role mapping <span className="font-bold text-white bg-slate-700 px-2 py-0.5 rounded mx-1">({userRole})</span> does not grant you permissions to view this secure vault section.
      </p>
      <button onClick={goBack} className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition text-sm font-semibold shadow-lg shadow-indigo-500/20">
        Return to Dashboard Overview
      </button>
    </div>
  )
}
