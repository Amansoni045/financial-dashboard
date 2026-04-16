import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [income, expense, totalRecords] = await Promise.all([
      prisma.financialRecord.aggregate({
        _sum: { amount: true },
        where: { type: 'INCOME', deletedAt: null },
      }),
      prisma.financialRecord.aggregate({
        _sum: { amount: true },
        where: { type: 'EXPENSE', deletedAt: null },
      }),
      prisma.financialRecord.count({ where: { deletedAt: null } }),
    ])

    const totalIncome = income._sum.amount || 0
    const totalExpense = expense._sum.amount || 0

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      totalRecords,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
