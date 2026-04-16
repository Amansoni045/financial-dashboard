'use client'

import { Badge } from './DashboardElements'

const fmt = (n: number) => `$${Number(n).toFixed(2)}`

export function TransactionTable({ transactions, onDelete, userRole }: { transactions: any[], onDelete: (id: string) => void, userRole: string }) {
  const isAdmin = userRole === 'ADMIN'

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-slate-400 text-sm">No records logged in the chronological ledger.</p>
      </div>
    )
  }
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-900/40">
            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Date</th>
            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Category</th>
            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Type</th>
            <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Notes</th>
            <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Amount</th>
            {isAdmin && <th className="px-6 py-4"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {transactions.map((t) => {
            const isIncome = t.type === 'INCOME'
            return (
              <tr key={t.id} className="hover:bg-slate-700/30 transition-colors duration-150 group">
                <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                  {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 font-medium text-white">{t.category}</td>
                <td className="px-6 py-4"><Badge type={t.type} /></td>
                <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{t.notes || '—'}</td>
                <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isIncome ? '+' : '-'}{fmt(t.amount)}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all duration-150 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
