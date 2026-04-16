import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, authorizeRole } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!authorizeRole(user, ['ADMIN', 'ANALYST'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  const pageNum = Math.max(1, page)
  const limitNum = Math.min(100, Math.max(1, limit))
  const skip = (pageNum - 1) * limitNum

  const where: any = {
    deletedAt: null,
    ...(type && { type }),
    ...(category && { category }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {}),
  }

  try {
    const [total, records] = await Promise.all([
      prisma.financialRecord.count({ where }),
      prisma.financialRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limitNum,
      }),
    ])

    return NextResponse.json({
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      data: records,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!authorizeRole(user, ['ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const record = await prisma.financialRecord.create({
      data: {
        ...body,
        date: new Date(body.date),
        userId: user.id,
      },
    })

    return NextResponse.json(
      { message: 'Record created successfully', data: record },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
