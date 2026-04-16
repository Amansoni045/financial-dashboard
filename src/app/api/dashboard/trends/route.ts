import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, authorizeRole } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!authorizeRole(user, ['ADMIN', 'ANALYST'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
    twelveMonthsAgo.setDate(1)
    twelveMonthsAgo.setHours(0, 0, 0, 0)

    const records = await prisma.financialRecord.findMany({
      where: {
        deletedAt: null,
        date: { gte: twelveMonthsAgo },
      },
      select: { amount: true, type: true, date: true },
    })

    const monthMap: Record<string, any> = {}

    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap[key] = { month: key, income: 0, expense: 0, net: 0 }
    }

    for (const record of records) {
      const d = new Date(record.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (monthMap[key]) {
        if (record.type === 'INCOME') {
          monthMap[key].income += record.amount
        } else {
          monthMap[key].expense += record.amount
        }
        monthMap[key].net = monthMap[key].income - monthMap[key].expense
      }
    }

    return NextResponse.json(Object.values(monthMap))
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
