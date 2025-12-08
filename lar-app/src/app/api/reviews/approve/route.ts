import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const approveSchema = z.object({
  responseId: z.string(),
  editedContent: z.string().optional(),
})

/**
 * POST /api/reviews/approve
 * Approve an AI-generated response (with optional edits)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { responseId, editedContent } = approveSchema.parse(body)

    // Get response with review and verify ownership
    const response = await prisma.response.findUnique({
      where: { id: responseId },
      include: {
        review: {
          include: {
            location: {
              include: {
                business: true,
              },
            },
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 })
    }

    if (response.review.location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update response
    const updatedResponse = await prisma.response.update({
      where: { id: responseId },
      data: {
        content: editedContent || response.content,
        status: 'APPROVED',
        approvedAt: new Date(),
        isAiGenerated: editedContent ? false : response.isAiGenerated,
      },
    })

    // Update review status
    await prisma.review.update({
      where: { id: response.reviewId },
      data: { status: 'PENDING_RESPONSE' },
    })

    return NextResponse.json({
      success: true,
      response: updatedResponse,
      message: 'Phản hồi đã được phê duyệt. Sẵn sàng đăng lên nền tảng.',
    })
  } catch (error) {
    console.error('Approve response error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
