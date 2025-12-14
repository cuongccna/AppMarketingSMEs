import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's businesses/locations
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        businesses: {
          include: {
            locations: true
          }
        }
      }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const locationIds = user.businesses.flatMap(b => b.locations.map(l => l.id))

    // Fetch recent reviews that need attention
    const reviews = await prisma.review.findMany({
      where: {
        locationId: { in: locationIds },
        OR: [
          { status: 'NEW' },
          { status: 'AI_DRAFT_READY' },
          { sentiment: 'NEGATIVE', status: { not: 'RESPONDED' } }
        ]
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 10,
      include: {
        location: true
      }
    })

    // Map reviews to notifications
    const notifications = reviews.map(review => {
      let type = 'new_review'
      let title = 'Đánh giá mới'
      let message = `${review.authorName} đã đánh giá ${review.rating} sao`
      let link = `/dashboard/reviews?id=${review.id}`

      if (review.sentiment === 'NEGATIVE') {
        type = 'negative_review'
        title = 'Đánh giá tiêu cực mới'
        message = `${review.authorName} đã đánh giá ${review.rating} sao - ${review.location.name}`
      } else if (review.status === 'AI_DRAFT_READY') {
        type = 'ai_ready'
        title = 'AI đã soạn phản hồi'
        message = `Phản hồi cho ${review.authorName} đang chờ duyệt`
        link = `/dashboard/reviews?status=AI_DRAFT_READY`
      }

      return {
        id: review.id,
        type,
        title,
        message,
        time: formatDistanceToNow(new Date(review.publishedAt), { addSuffix: true, locale: vi }),
        read: false, // In a real app, we'd track read status in a separate table
        link
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
