import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // 1. Check User Settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    // 2. Check Scheduled Responses
    const scheduledResponses = await prisma.response.findMany({
      where: {
        status: 'SCHEDULED',
        review: {
          location: {
            business: {
              userId: userId
            }
          }
        }
      },
      select: {
        id: true,
        scheduledAt: true,
        reviewId: true,
        review: {
            select: {
                authorName: true
            }
        }
      }
    })

    // 3. Check Potential Reviews (5 stars, no reply)
    const locations = await prisma.location.findMany({
        where: { business: { userId } },
        select: { id: true }
    })
    const locationIds = locations.map(l => l.id)

    const potentialReviews = await prisma.review.findMany({
      where: {
        locationId: { in: locationIds },
        rating: 5,
        status: { not: 'RESPONDED' }, // Not marked as responded in our DB
      },
      select: {
        id: true,
        authorName: true,
        rating: true,
        sentiment: true,
        status: true,
        responses: {
            select: {
                status: true
            }
        }
      },
      take: 20
    })

    return NextResponse.json({
      info: "Debug Auto-Reply Status",
      settings: {
        autoReplyFiveStar: userSettings?.autoReplyFiveStar,
        defaultTone: userSettings?.defaultTone,
        preferredModel: userSettings?.preferredModel,
      },
      scheduledQueue: {
        count: scheduledResponses.length,
        items: scheduledResponses
      },
      potentialCandidates: {
        count: potentialReviews.length,
        sample: potentialReviews.map(r => ({
            ...r,
            willAutoReply: 
                userSettings?.autoReplyFiveStar && 
                r.rating === 5 && 
                r.sentiment === 'POSITIVE' && 
                r.responses.length === 0
                ? "YES" 
                : "NO (Reason: " + (
                    !userSettings?.autoReplyFiveStar ? "Setting Disabled" :
                    r.rating !== 5 ? "Not 5 Stars" :
                    r.sentiment !== 'POSITIVE' ? `Sentiment is ${r.sentiment}` :
                    r.responses.length > 0 ? "Has Existing Response" : "Unknown"
                ) + ")"
        }))
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
