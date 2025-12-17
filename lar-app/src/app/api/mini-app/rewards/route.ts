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
    const now = new Date()

    const whereClause: any = {
      isActive: true,
      quantity: { gt: 0 },
      AND: [
        {
          OR: [
            { startTime: null },
            { startTime: { lte: now } }
          ]
        },
        {
          OR: [
            { endTime: null },
            { endTime: { gte: now } }
          ]
        }
      ]
    }

    if (locationId) {
      whereClause.locationId = locationId
    }

    const rewards = await prisma.reward.findMany({
      where: whereClause,
      orderBy: { pointsRequired: 'asc' },
      include: {
        location: {
          select: { name: true }
        }
      }
    })

    // Transform rewards to include image URL or Base64
    const transformedRewards = rewards.map(reward => {
      let imageUrl = reward.image || ''
      
      if (reward.imageBinary) {
        const base64String = Buffer.from(reward.imageBinary).toString('base64')
        imageUrl = `data:image/jpeg;base64,${base64String}`
      }

      // Remove imageBinary from response to reduce size and avoid serialization issues
      const { imageBinary, ...rest } = reward
      
      return {
        ...rest,
        image: imageUrl
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedRewards
    })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
