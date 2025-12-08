'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnalyticsDashboard } from '@/components/analytics/dashboard'
import { ReviewCard } from '@/components/reviews/review-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
  MapPin,
  Bell,
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const mockDashboardData = {
  overview: {
    totalReviews: 147,
    averageRating: 4.3,
    responseRate: 78,
    pendingResponses: 12,
  },
  sentiment: {
    positive: 98,
    neutral: 32,
    negative: 17,
  },
  sentimentPercentage: {
    positive: 67,
    neutral: 22,
    negative: 11,
  },
  trend: [
    { date: '2025-11-24', newReviews: 5, positiveCount: 3, negativeCount: 1, neutralCount: 1 },
    { date: '2025-11-25', newReviews: 8, positiveCount: 6, negativeCount: 1, neutralCount: 1 },
    { date: '2025-11-26', newReviews: 3, positiveCount: 2, negativeCount: 0, neutralCount: 1 },
    { date: '2025-11-27', newReviews: 6, positiveCount: 4, negativeCount: 1, neutralCount: 1 },
    { date: '2025-11-28', newReviews: 4, positiveCount: 3, negativeCount: 1, neutralCount: 0 },
    { date: '2025-11-29', newReviews: 7, positiveCount: 5, negativeCount: 1, neutralCount: 1 },
    { date: '2025-11-30', newReviews: 9, positiveCount: 7, negativeCount: 1, neutralCount: 1 },
  ],
  topKeywords: [
    { keyword: 'ngon', count: 45 },
    { keyword: 'phục vụ tốt', count: 38 },
    { keyword: 'không gian đẹp', count: 32 },
    { keyword: 'giá hợp lý', count: 28 },
    { keyword: 'sạch sẽ', count: 24 },
    { keyword: 'đợi lâu', count: 12 },
    { keyword: 'thiếu món', count: 8 },
  ],
}

const mockRecentReviews = [
  {
    id: '1',
    authorName: 'Nguyễn Văn An',
    rating: 5,
    content: 'Quán rất ngon, phục vụ nhiệt tình. Không gian thoáng mát, sạch sẽ. Chắc chắn sẽ quay lại!',
    sentiment: 'POSITIVE' as const,
    status: 'NEW',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    keywords: ['ngon', 'phục vụ', 'sạch sẽ'],
    location: { name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ, Q.1' },
    responses: [],
  },
  {
    id: '2',
    authorName: 'Trần Thị Bình',
    rating: 3,
    content: 'Đồ ăn khá ổn nhưng phải đợi hơi lâu. Nhân viên có vẻ bận rộn.',
    sentiment: 'NEUTRAL' as const,
    status: 'AI_DRAFT_READY',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    keywords: ['đợi lâu', 'bận rộn'],
    location: { name: 'Chi nhánh Quận 3', address: '456 Võ Văn Tần, Q.3' },
    responses: [
      {
        id: 'r1',
        content: 'Cảm ơn bạn Bình đã ghé thăm và chia sẻ trải nghiệm! Chúng tôi rất tiếc vì bạn phải chờ đợi lâu. Trong giờ cao điểm, đôi khi quán đông khách hơn dự kiến. Chúng tôi đang cải thiện quy trình phục vụ để rút ngắn thời gian chờ. Rất mong được đón tiếp bạn lần sau với trải nghiệm tốt hơn!',
        status: 'PENDING_APPROVAL',
        isAiGenerated: true,
      },
    ],
  },
  {
    id: '3',
    authorName: 'Lê Minh Châu',
    rating: 1,
    content: 'Thất vọng! Món ăn nguội ngắt, phục vụ chậm chạp. Không đáng tiền.',
    sentiment: 'NEGATIVE' as const,
    status: 'NEW',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    keywords: ['thất vọng', 'nguội', 'chậm'],
    location: { name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ, Q.1' },
    responses: [],
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = React.useState(false)
  const [generatingReviewId, setGeneratingReviewId] = React.useState<string | null>(null)

  const handleGenerateResponse = async (reviewId: string) => {
    setGeneratingReviewId(reviewId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGeneratingReviewId(null)
    // In real app, this would call the API and refresh data
  }

  const handleApproveResponse = async (responseId: string, content?: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    // In real app, this would call the API and refresh data
  }

  const handleSync = async () => {
    setIsLoading(true)
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Xin chào, {session?.user?.name?.split(' ')[0] || 'bạn'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Đây là tổng quan về danh tiếng doanh nghiệp của bạn
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSync} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Đồng bộ
            </Button>
            <Link href="/dashboard/businesses">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm địa điểm
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Cần xử lý ngay</p>
                  <p className="text-2xl font-bold text-orange-600">3 đánh giá tiêu cực</p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
              <Link href="/dashboard/reviews?sentiment=NEGATIVE">
                <Button variant="outline" size="sm" className="mt-4 border-orange-300 text-orange-700 hover:bg-orange-100">
                  Xem ngay
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Phản hồi AI chờ duyệt</p>
                  <p className="text-2xl font-bold text-blue-600">5 phản hồi</p>
                </div>
                <Sparkles className="h-8 w-8 text-blue-500" />
              </div>
              <Link href="/dashboard/reviews?status=AI_DRAFT_READY">
                <Button variant="outline" size="sm" className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-100">
                  Duyệt ngay
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Địa điểm đang theo dõi</p>
                  <p className="text-2xl font-bold text-green-600">2 địa điểm</p>
                </div>
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
              <Link href="/dashboard/locations">
                <Button variant="outline" size="sm" className="mt-4 border-green-300 text-green-700 hover:bg-green-100">
                  Quản lý
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard data={mockDashboardData} />

        {/* Recent Reviews */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Đánh Giá Gần Đây</h2>
              <p className="text-sm text-muted-foreground">
                Đánh giá mới nhất cần được xử lý
              </p>
            </div>
            <Link href="/dashboard/reviews">
              <Button variant="outline" size="sm">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockRecentReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onGenerateResponse={handleGenerateResponse}
                onApproveResponse={handleApproveResponse}
                isGenerating={generatingReviewId === review.id}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
