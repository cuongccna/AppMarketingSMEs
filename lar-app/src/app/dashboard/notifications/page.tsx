import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  ThumbsDown, 
  Sparkles, 
  CheckCircle2, 
  Bell,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Thông báo | LAR',
  description: 'Tất cả thông báo của bạn',
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/login')
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
    return <div>User not found</div>
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
    take: 50, // Show more on the full page
    include: {
      location: true
    }
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'negative_review':
        return <ThumbsDown className="h-5 w-5 text-red-600" />
      case 'ai_ready':
        return <Sparkles className="h-5 w-5 text-blue-600" />
      case 'new_review':
        return <MessageSquare className="h-5 w-5 text-green-600" />
      case 'sync_complete':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

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
      read: false,
      link
    }
  })

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Thông báo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tất cả thông báo</span>
            <Badge variant="secondary">{notifications.length} mới</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Bạn không có thông báo nào mới</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className="flex gap-4 p-4 hover:bg-gray-50 transition-colors items-start"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
