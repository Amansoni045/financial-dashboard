'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const fmt = (n: number) => `$${Number(n).toFixed(2)}`
const COLORS = ['#818cf8', '#34d399', '#fb7185', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6', '#38bdf8']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex gap-4 justify-between text-sm items-center mb-1">
            <span style={{color: p.color}} className="capitalize">{p.name}:</span>
            <span className="font-bold text-white">{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart({ trends }: { trends: any[] }) {
  if (trends.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-500 font-medium">Insufficient chronological data mapped.</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trends} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="month" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" activeDot={{r: 6, strokeWidth: 0, fill: '#10b981'}} />
        <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" activeDot={{r: 6, strokeWidth: 0, fill: '#f43f5e'}} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DistributionChart({ categories }: { categories: any[] }) {
    if (categories.length === 0) {
        return <p className="text-slate-500 font-medium text-center">No categories clustered.</p>
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                    stroke="none"
                >
                    {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    )
}

export { COLORS }
