import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { generateReviewResponse, analyzeSentiment, getAvailableProviders, AIProvider } from '@/lib/ai'
import { z } from 'zod'

// Request validation schema
const generateResponseSchema = z.object({
  reviewId: z.string(),
  tone: z.enum(['FRIENDLY', 'PROFESSIONAL', 'EMPATHETIC', 'CONCISE', 'FORMAL']),
  customInstructions: z.string().optional(),
  provider: z.enum(['openai', 'gemini', 'auto']).optional(),
})

/**
 * POST /api/reviews/generate-response
 * Generate AI response for a review
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, tone, customInstructions, provider } = generateResponseSchema.parse(body)

    // Get the review with location and business info
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        location: {
          include: {
            business: true,
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Verify user owns this business
    if (review.location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user settings for preferred model
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: (session.user as any).id },
    })
    
    // Determine AI provider to use (request param > user settings > auto)
    const preferredProvider: AIProvider = provider || (userSettings as any)?.preferredModel || 'auto'
    
    // Check available providers
    const availableProviders = getAvailableProviders()
    if (!availableProviders.openai && !availableProviders.gemini) {
      return NextResponse.json(
        { error: 'Chưa cấu hình API key AI. Vui lòng thêm OPENAI_API_KEY hoặc GEMINI_API_KEY.' },
        { status: 503 }
      )
    }

    // Check user's subscription and usage limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: (session.user as any).id },
    })

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const usageStats = await prisma.usageStats.findUnique({
      where: {
        userId_month: {
          userId: (session.user as any).id,
          month: currentMonth,
        },
      },
    })

    // Free plan: 10 AI responses per month
    if (subscription?.plan === 'FREE' && (usageStats?.aiResponseCount || 0) >= 10) {
      return NextResponse.json(
        { error: 'Đã đạt giới hạn phản hồi AI miễn phí. Vui lòng nâng cấp gói.' },
        { status: 429 }
      )
    }

    // Generate AI response
    const result = await generateReviewResponse({
      reviewContent: review.content || '',
      reviewerName: review.authorName,
      rating: review.rating,
      sentiment: review.sentiment,
      businessName: review.location.business.name,
      businessCategory: review.location.business.category || undefined,
      tone: tone,
      preferredProvider,
    })

    // Save the generated response
    const response = await prisma.response.create({
      data: {
        reviewId: review.id,
        content: result.response,
        tone: tone,
        isAiGenerated: true,
        status: 'PENDING_APPROVAL',
        tokensUsed: result.tokensUsed,
        modelUsed: result.model,
      },
    })

    // Update usage stats
    await prisma.usageStats.upsert({
      where: {
        userId_month: {
          userId: (session.user as any).id,
          month: currentMonth,
        },
      },
      update: {
        aiResponseCount: { increment: 1 },
        tokensUsed: { increment: result.tokensUsed },
      },
      create: {
        userId: (session.user as any).id,
        month: currentMonth,
        aiResponseCount: 1,
        tokensUsed: result.tokensUsed,
      },
    })

    // Update review status
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: 'AI_DRAFT_READY' },
    })

    return NextResponse.json({
      success: true,
      response: {
        id: response.id,
        content: response.content,
        tone: response.tone,
        tokensUsed: response.tokensUsed,
        model: response.modelUsed,
        provider: result.provider,
      },
      availableProviders,
    })
  } catch (error) {
    console.error('Generate response error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
