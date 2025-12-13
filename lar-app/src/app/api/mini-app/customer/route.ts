import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mini-app/customer
 * Get customer info and points by Zalo ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const zaloId = searchParams.get('zaloId')

    if (!zaloId) {
      return NextResponse.json(
        { success: false, error: 'zaloId is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { zaloId },
      include: {
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({
        success: true,
        data: {
          points: 0,
          level: 'MEMBER',
          transactions: [],
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        points: customer.points,
        level: customer.level,
        transactions: customer.transactions,
      },
    })
  } catch (error) {
    console.error('Get customer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer info' },
      { status: 500 }
    )
  }
}
