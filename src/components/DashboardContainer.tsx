'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge, StatCard } from '@/components/DashboardElements'
import { TransactionTable } from '@/components/TransactionTable'
import { LoginScreen, AccessDenied } from '@/components/AuthScreens'
import { TrendChart, DistributionChart, COLORS } from '@/components/Charts'

const API = '/api'
const fmt = (n: number) => `$${Number(n).toFixed(2)}`

export default function DashboardContainer() {
  const [token, setToken] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('token') : null)
  const [user, setUser] = useState<any>(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null)
  const [loginError, setLoginError] = useState<string | null>(null)

  const [summary, setSummary] = useState<any>({ totalIncome: 0, totalExpense: 0, netBalance: 0 })
  const [transactions, setTransactions] = useState<any[]>([])
  const [allRecords, setAllRecords] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [toast, setToast] = useState<{ msg: string, ok: boolean } | null>(null)
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'INCOME',
    category: '',
    date: new Date().toISOString().slice(0, 16),
    notes: ''
  })
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER'
  })

  // Memoize showToast to avoid re-renders if used in callbacks
  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setActiveTab('dashboard')
  }, [])

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const dashboardHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      const reqs = [
        fetch(`${API}/dashboard/summary`, { headers: dashboardHeaders }),
        fetch(`${API}/dashboard/recent`, { headers: dashboardHeaders })
      ]
      
      if (user?.role === 'ANALYST' || user?.role === 'ADMIN') {
        reqs.push(fetch(`${API}/dashboard/categories`, { headers: dashboardHeaders }))
        reqs.push(fetch(`${API}/dashboard/trends`, { headers: dashboardHeaders }))
        reqs.push(fetch(`${API}/records?limit=100`, { headers: dashboardHeaders }))
      }

      const responses = await Promise.all(reqs)
      
      if (!responses[0] || responses[0].status === 401) return handleLogout()

      if (responses[0].ok) setSummary(await responses[0].json())
      if (responses[1]?.ok) setTransactions(await responses[1].json())
        
      if (user?.role === 'ANALYST' || user?.role === 'ADMIN') {
        if (responses[2]?.ok) setCategories(await responses[2].json())
        if (responses[3]?.ok) {
          const t = await responses[3].json()
          setTrends(t)
        }
        if (responses[4]?.ok) {
          const fetchedRecs = await responses[4].json()
          setAllRecords(fetchedRecs.data || [])
        }
      }
        
      if (user?.role === 'ADMIN') {
        const usersResp = await fetch(`${API}/users`, { headers: dashboardHeaders })
        if (usersResp.ok) {
          const uData = await usersResp.json()
          setUsersList(uData.data || [])
        }
      }
    } catch (err) {
      console.error(err)
      showToast('Network synchronization error', false)
    } finally {
      setLoading(false)
    }
  }, [token, user?.role, handleLogout, showToast])

  useEffect(() => { 
    if (token) loadData() 
  }, [token, loadData])

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Authentication denied by server')
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setLoginError(null)
    } catch (err: any) {
      setLoginError(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/records`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category,
          date: new Date(formData.date).toISOString(),
          notes: formData.notes
        })
      })
      const data = await res.json()

      if (res.ok) {
        setFormData({ ...formData, amount: '', category: '', notes: '' })
        loadData()
        showToast('Financial record securely logged!')
        setActiveTab('records')
      } else {
        showToast(data.error || 'Validation failed on record save.', false)
      }
    } catch (err) {
      showToast('Client network error during transmission', false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(userForm)
      })
      const data = await res.json()

      if (res.ok) {
        setUserForm({ name: '', email: '', password: '', role: 'VIEWER' })
        loadData()
        showToast('New system user authenticated & generated!')
      } else {
        showToast(data.error || 'System failed to register user profile.', false)
      }
    } catch (err) {
      showToast('Client connection error', false)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!window.confirm('Erase this record completely from ledger?')) return
    try {
      const res = await fetch(`${API}/records/${id}`, { 
        method: 'DELETE',
        headers: authHeaders
      })
      
      if (res.ok) {
        loadData()
        showToast('Ledger soft-deleted successfully.')
      } else {
        const data = await res.json()
        showToast(data.error || 'Deletion rejected by server security policy.', false)
      }
    } catch(err) {
      showToast('Network error during eradication', false)
    }
  }
  
  const deleteUserRecord = async (id: string) => {
    if (!window.confirm('Delete this user profile permanently from the infrastructure?')) return
    try {
      const res = await fetch(`${API}/users/${id}`, { 
        method: 'DELETE',
        headers: authHeaders
      })
      
      if (res.ok) {
        loadData()
        showToast('User profile destructed.')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to destroy profile instance.', false)
      }
    } catch(err) {
      showToast('Network disconnection triggered', false)
    }
  }

  const setVal = (k: string) => (e: any) => setFormData({ ...formData, [k]: e.target.value })
  const setUserVal = (k: string) => (e: any) => setUserForm({ ...userForm, [k]: e.target.value })

  const inputClass = "w-full bg-slate-900 border border-slate-600 focus:border-indigo-500 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-500 transition-all duration-200"

  let navItems = [
    { id: 'dashboard', label: 'Dashboard Data', icon: '📊' },
  ]
  if (user?.role === 'ANALYST' || user?.role === 'ADMIN') {
    navItems.push({ id: 'insights', label: 'Deep Insights', icon: '📈' })
    navItems.push({ id: 'records', label: 'Ledger Records', icon: '📋' })
  }
  if (user?.role === 'ADMIN') {
    navItems.push({ id: 'add', label: 'New Record', icon: '➕' })
    navItems.push({ id: 'users', label: 'User Hub', icon: '👥' })
  }

  if (!token || !user) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl text-sm font-semibold shadow-2xl transition-all flex items-center gap-2 ${toast.ok ? 'bg-emerald-600/90 border border-emerald-500/50 backdrop-blur-md text-white' : 'bg-rose-600/90 border border-rose-500/50 backdrop-blur-md text-white'}`}>
          <span>{toast.ok ? '✓' : '⚠️'}</span>
          {toast.msg}
        </div>
      )}

      <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-800/80 backdrop-blur-xl border-r border-slate-700/80 flex flex-col z-20">
        <div className="p-6 border-b border-slate-700/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-xl shadow-lg ring-1 ring-white/10">💰</div>
            <div>
              <p className="font-bold text-white tracking-tight leading-tight">Finance Dash</p>
              <p className="text-[10px] font-bold px-2 py-0.5 mt-1 rounded bg-slate-700 text-slate-300 inline-block uppercase tracking-wider shadow-inner">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-1">Platform</p>
          {navItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/80">
          <div className="bg-slate-900/50 rounded-xl p-3 flex items-center justify-between group border border-transparent hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-inner ring-1 ring-white/10">
                {user.name?.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate pr-2 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-500 truncate pr-2 mt-0.5">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} title="Sign Out" className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-900 to-slate-900">
        <div className="p-10 max-w-6xl mx-auto h-full z-10 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
               <p className="text-sm font-semibold text-slate-400 animate-pulse tracking-wide uppercase">Connecting to Enterprise Vault...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-b border-slate-800 pb-5">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                       Live aggregated ledger metrics
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Cash Flow IN" value={fmt(summary.totalIncome)} icon="💵" positive={true} />
                    <StatCard title="Total Cash Flow OUT" value={fmt(summary.totalExpense)} icon="💸" positive={false} />
                    <StatCard title="Liquid Asset Balance" value={fmt(summary.netBalance)} icon={summary.netBalance >= 0 ? '📈' : '📉'} positive={summary.netBalance >= 0} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-white tracking-tight">Recent Live Activity</h3>
                      {user.role !== 'VIEWER' && (
                        <button onClick={() => setActiveTab('records')} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                          View ledger <span className="text-lg leading-none">→</span>
                        </button>
                      )}
                    </div>
                    <TransactionTable transactions={transactions.slice(0, 5)} onDelete={deleteTransaction} userRole={user.role} />
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (user.role === 'ADMIN' || user.role === 'ANALYST') && (
                 <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="border-b border-slate-800 pb-5">
                     <h2 className="text-3xl font-extrabold text-white tracking-tight">Deep Insights</h2>
                     <p className="text-slate-400 text-sm mt-1.5">Categorical breakdowns and chronological trajectory</p>
                   </div>
                   
                   <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-3xl p-8 shadow-xl">
                      <div className="mb-6 flex items-center justify-between">
                         <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">12-Month Financial Trajectory</h3>
                            <p className="text-slate-400 text-sm mt-1">Income & Expense correlation over moving window</p>
                         </div>
                      </div>
                      
                      <div className="h-96 w-full -ml-4">
                        <TrendChart trends={trends} />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-3xl p-8 shadow-xl md:col-span-1 flex flex-col">
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">Category Distribution</h3>
                          <p className="text-slate-400 text-sm mt-1">Cash flow clustering</p>
                        </div>
                        <div className="flex-1 flex items-center justify-center min-h-[260px] relative">
                           <DistributionChart categories={categories} />
                           {categories.length > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Entities</p>
                                   <p className="text-2xl font-black text-white">{categories.length}</p>
                                </div>
                              </div>
                           )}
                        </div>
                      </div>

                      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 rounded-3xl p-8 shadow-xl md:col-span-2 overflow-y-auto max-h-[400px]">
                         <div className="sticky top-0 bg-slate-800/90 backdrop-blur pb-4 pt-1 z-10 border-b border-slate-700/50 mb-4">
                            <h3 className="text-xl font-bold text-white tracking-tight">Sector Volumes</h3>
                            <p className="text-slate-400 text-sm mt-1">Raw volume mapping by entity sector</p>
                         </div>
                         <div className="space-y-4">
                            {categories.map((c, i) => (
                              <div key={i} className="flex items-center justify-between group p-3 rounded-xl hover:bg-slate-700/40 transition-colors border border-transparent hover:border-slate-600/50">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${COLORS[i % COLORS.length]}20`, border: `1px solid ${COLORS[i % COLORS.length]}40` }}>
                                     <span style={{ color: COLORS[i % COLORS.length] }}>■</span>
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{c.category}</p>
                                     <p className="text-xs text-slate-400 mt-0.5">{c.type}</p>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <span className={`font-bold text-lg tracking-tight ${c.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {fmt(c.total)}
                                  </span>
                                </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 </div>
              )}
              
              {activeTab === 'insights' && user.role === 'VIEWER' && (
                 <AccessDenied userRole={user.role} goBack={() => setActiveTab('dashboard')} />
              )}

              {activeTab === 'records' && (user.role === 'ADMIN' || user.role === 'ANALYST') && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">Ledger Records</h2>
                      <p className="text-slate-400 text-sm mt-1.5">{allRecords.length} distinct validated transactions mapped</p>
                    </div>
                    {user.role === 'ADMIN' && (
                      <button onClick={() => setActiveTab('add')} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 ring-1 ring-inset ring-white/10">+ Create Ledger Entry</button>
                    )}
                  </div>
                  <TransactionTable transactions={allRecords} onDelete={deleteTransaction} userRole={user.role} />
                </div>
              )}
              
              {activeTab === 'records' && user.role === 'VIEWER' && (
                 <AccessDenied userRole={user.role} goBack={() => setActiveTab('dashboard')} />
              )}

              {activeTab === 'add' && user.role === 'ADMIN' && (
                <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-b border-slate-800 pb-5">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">System Ledger Entry</h2>
                    <p className="text-slate-400 text-sm mt-1.5">Directly map a verified financial parameter</p>
                  </div>

                  <form onSubmit={handleSubmit} className="bg-slate-800/90 backdrop-blur rounded-3xl border border-slate-700/80 p-8 shadow-xl">
                    <div className="grid grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Volume ($)</label>
                        <input type="number" step="0.01" required placeholder="0.00" value={formData.amount} onChange={setVal('amount')} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vector</label>
                        <select required value={formData.type} onChange={setVal('type')} className={inputClass}>
                          <option value="INCOME">Income / Revenue</option>
                          <option value="EXPENSE">Expense / Cost</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Economic Sector/Category</label>
                      <input type="text" required placeholder="e.g. Compensation, Logistics, Marketing..." value={formData.category} onChange={setVal('category')} className={inputClass} />
                    </div>
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temporal Point</label>
                      <input type="datetime-local" required value={formData.date} onChange={setVal('date')} className={inputClass} />
                    </div>
                    <div className="mb-8">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audit Trail <span className="text-slate-500 normal-case font-normal">(Notes)</span></label>
                      <textarea rows={3} placeholder="Describe ledger context..." value={formData.notes} onChange={setVal('notes')} className={`${inputClass} resize-none`} />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-[15px] py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 ring-1 ring-inset ring-white/10">
                      {submitting ? 'Authenticating...' : 'Sign & Complete Ledger Action'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'users' && user.role === 'ADMIN' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-b border-slate-800 pb-5">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Identity Administration</h2>
                    <p className="text-slate-400 text-sm mt-1.5">Regulate deep vault access across system networks</p>
                  </div>
                  
                  <div className="flex gap-8 flex-col lg:flex-row items-start">
                    <div className="flex-1 bg-slate-800/80 backdrop-blur rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl w-full">
                      <div className="p-5 border-b border-slate-700/50 bg-slate-800/50">
                        <h3 className="text-lg font-bold text-white tracking-tight">Authorized Profiles</h3>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700/50 bg-slate-900/40">
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Name</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Email</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Access Level</th>
                            <th className="px-6 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {usersList.map((u) => (
                             <tr key={u.id} className="hover:bg-slate-700/30 transition-colors duration-150 group">
                               <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                               <td className="px-6 py-4 text-slate-400 hidden sm:table-cell">{u.email}</td>
                               <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border tracking-wide uppercase ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                    {u.status}
                                  </span>
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border tracking-wide uppercase ${u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : u.role === 'ANALYST' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                    {u.role}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <button onClick={() => deleteUserRecord(u.id)} disabled={u.id === user.id} className="opacity-0 group-hover:opacity-100 disabled:invisible text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Revoke</button>
                               </td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="w-full lg:w-96 shrink-0 z-10 sticky top-10">
                      <form onSubmit={handleUserSubmit} className="bg-slate-800/90 backdrop-blur rounded-3xl border border-slate-700/80 p-8 shadow-xl">
                         <h3 className="text-xl font-bold text-white tracking-tight mb-6">Provision New Profile</h3>
                         <div className="space-y-4">
                           <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Legal Name</label>
                              <input type="text" required value={userForm.name} onChange={setUserVal('name')} className={inputClass} placeholder="Full legal name" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                              <input type="email" required value={userForm.email} onChange={setUserVal('email')} className={inputClass} placeholder="Email for auth" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Initial Password</label>
                              <input type="password" required value={userForm.password} onChange={setUserVal('password')} className={inputClass} placeholder="••••••••" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Access Role</label>
                              <select value={userForm.role} onChange={setUserVal('role')} className={inputClass}>
                                 <option value="VIEWER">Viewer (Dashboard Only)</option>
                                 <option value="ANALYST">Analyst (Insights + Records)</option>
                                 <option value="ADMIN">System Administrator</option>
                              </select>
                           </div>
                           <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 mt-4">Generate Authorized Profile</button>
                         </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
