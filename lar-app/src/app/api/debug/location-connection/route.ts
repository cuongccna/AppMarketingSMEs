import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const locationId = 'cmj5a44vb00087y3as010wdjz'
    
    const responses = await prisma.response.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        review: {
          include: {
            location: true
          }
        }
      }
    })

    return NextResponse.json({
      count: responses.length,
      responses: responses.map(r => ({
        id: r.id,
        status: r.status,
        reviewId: r.reviewId,
        locationId: r.review?.locationId,
        locationName: r.review?.location?.name
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
