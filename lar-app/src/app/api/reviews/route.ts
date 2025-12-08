import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { analyzeSentiment } from '@/lib/ai'
import { z } from 'zod'

/**
 * GET /api/reviews
 * Get reviews for user's locations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')
    const status = searchParams.get('status')
    const sentiment = searchParams.get('sentiment')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build filter
    const where: any = {
      location: {
        business: {
          userId: (session.user as any).id,
        },
      },
    }

    if (locationId) where.locationId = locationId
    if (status) where.status = status
    if (sentiment) where.sentiment = sentiment

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          responses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Schema for manual review creation (for testing/demo)
const createReviewSchema = z.object({
  locationId: z.string(),
  platform: z.enum(['GOOGLE_BUSINESS_PROFILE', 'ZALO_OA', 'FACEBOOK']),
  externalId: z.string(),
  authorName: z.string(),
  authorPhotoUrl: z.string().optional(),
  rating: z.number().min(1).max(5),
  content: z.string().optional(),
  publishedAt: z.string().transform(s => new Date(s)),
})

/**
 * POST /api/reviews
 * Manually create a review (for testing or manual entry)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createReviewSchema.parse(body)

    // Verify user owns this location
    const location = await prisma.location.findFirst({
      where: {
        id: data.locationId,
        business: {
          userId: (session.user as any).id,
        },
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Analyze sentiment
    const sentimentResult = await analyzeSentiment(data.content || '')

    // Create review
    const review = await prisma.review.create({
      data: {
        locationId: data.locationId,
        platform: data.platform,
        externalId: data.externalId,
        authorName: data.authorName,
        authorPhotoUrl: data.authorPhotoUrl,
        rating: data.rating,
        content: data.content,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        keywords: sentimentResult.keywords,
        status: 'NEW',
        publishedAt: data.publishedAt,
      },
    })

    // Update analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.locationAnalytics.upsert({
      where: {
        locationId_date: {
          locationId: data.locationId,
          date: today,
        },
      },
      update: {
        newReviews: { increment: 1 },
        totalReviews: { increment: 1 },
        ...(sentimentResult.sentiment === 'POSITIVE' ? { positiveCount: { increment: 1 } } : {}),
        ...(sentimentResult.sentiment === 'NEGATIVE' ? { negativeCount: { increment: 1 } } : {}),
        ...(sentimentResult.sentiment === 'NEUTRAL' ? { neutralCount: { increment: 1 } } : {}),
      },
      create: {
        locationId: data.locationId,
        date: today,
        newReviews: 1,
        totalReviews: 1,
        positiveCount: sentimentResult.sentiment === 'POSITIVE' ? 1 : 0,
        negativeCount: sentimentResult.sentiment === 'NEGATIVE' ? 1 : 0,
        neutralCount: sentimentResult.sentiment === 'NEUTRAL' ? 1 : 0,
      },
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Create review error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
