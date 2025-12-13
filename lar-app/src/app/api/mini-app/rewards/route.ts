import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mini-app/rewards
 * Get list of rewards
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')

    const whereClause = locationId ? { locationId, isActive: true } : { isActive: true }

    const rewards = await prisma.reward.findMany({
      where: whereClause,
      orderBy: { pointsRequired: 'asc' },
      include: {
        location: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: rewards
    })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
