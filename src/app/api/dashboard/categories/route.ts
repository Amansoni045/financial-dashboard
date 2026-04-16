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
    const categories = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      _sum: { amount: true },
      where: { deletedAt: null },
    })

    const result = categories.map((cat) => ({
      category: cat.category,
      type: cat.type,
      total: cat._sum.amount || 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
