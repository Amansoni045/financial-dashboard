'use client'

export function Badge({ type }: { type: 'INCOME' | 'EXPENSE' }) {
  const isIncome = type === 'INCOME'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isIncome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
      {isIncome ? '↑ INCOME' : '↓ EXPENSE'}
    </span>
  )
}

export function StatCard({ title, value, icon, positive }: { title: string, value: string, icon: React.ReactNode, positive?: boolean }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex items-center gap-5">
      <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center text-2xl shrink-0 border border-slate-600/50">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-1 tracking-tight ${positive === undefined ? 'text-white' : positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
