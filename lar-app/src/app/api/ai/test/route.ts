import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateReviewResponse, analyzeSentiment, getAvailableProviders, AIProvider } from '@/lib/ai'
import { z } from 'zod'

const testSchema = z.object({
  reviewContent: z.string().min(1),
  reviewerName: z.string().default('Khách hàng'),
  rating: z.number().min(1).max(5).default(5),
  businessName: z.string().default('Doanh nghiệp Test'),
  tone: z.enum(['FRIENDLY', 'PROFESSIONAL', 'EMPATHETIC', 'CONCISE', 'FORMAL']).default('FRIENDLY'),
  provider: z.enum(['openai', 'gemini', 'auto']).default('auto'),
})

/**
 * POST /api/ai/test
 * Test AI response generation (for debugging and demo)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = testSchema.parse(body)

    const providers = getAvailableProviders()
    if (!providers.openai && !providers.gemini) {
      return NextResponse.json(
        { error: 'Chưa cấu hình AI. Vui lòng thêm OPENAI_API_KEY hoặc GEMINI_API_KEY.' },
        { status: 503 }
      )
    }

    // First analyze sentiment
    const sentimentStart = Date.now()
    const sentimentResult = await analyzeSentiment(data.reviewContent, data.provider)
    const sentimentTime = Date.now() - sentimentStart

    // Then generate response
    const responseStart = Date.now()
    const responseResult = await generateReviewResponse({
      reviewContent: data.reviewContent,
      reviewerName: data.reviewerName,
      rating: data.rating,
      sentiment: sentimentResult.sentiment,
      businessName: data.businessName,
      tone: data.tone,
      preferredProvider: data.provider,
    })
    const responseTime = Date.now() - responseStart

    return NextResponse.json({
      success: true,
      sentiment: {
        ...sentimentResult,
        processingTimeMs: sentimentTime,
      },
      response: {
        content: responseResult.response,
        tokensUsed: responseResult.tokensUsed,
        model: responseResult.model,
        provider: responseResult.provider,
        processingTimeMs: responseTime,
      },
      totalTimeMs: sentimentTime + responseTime,
      availableProviders: providers,
    })
  } catch (error) {
    console.error('AI test error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'AI generation failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
