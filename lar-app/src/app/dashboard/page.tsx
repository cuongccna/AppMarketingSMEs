'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnalyticsDashboard } from '@/components/analytics/dashboard'
import { ReviewCard } from '@/components/reviews/review-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
  MapPin,
  Bell,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { useDashboard } from '@/hooks/useDashboard'
import { useReviews } from '@/hooks/useReviews'

// Fallback mock data for when API is unavailable
const fallbackDashboardData = {
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
    { date: '2025-12-02', newReviews: 5, positiveCount: 3, negativeCount: 1, neutralCount: 1 },
    { date: '2025-12-03', newReviews: 8, positiveCount: 6, negativeCount: 1, neutralCount: 1 },
    { date: '2025-12-04', newReviews: 3, positiveCount: 2, negativeCount: 0, neutralCount: 1 },
    { date: '2025-12-05', newReviews: 6, positiveCount: 4, negativeCount: 1, neutralCount: 1 },
    { date: '2025-12-06', newReviews: 4, positiveCount: 3, negativeCount: 1, neutralCount: 0 },
    { date: '2025-12-07', newReviews: 7, positiveCount: 5, negativeCount: 1, neutralCount: 1 },
    { date: '2025-12-08', newReviews: 9, positiveCount: 7, negativeCount: 1, neutralCount: 1 },
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

// Fallback reviews for when API fails
const fallbackReviews = [
  {
    id: '1',
    authorName: 'Nguyễn Văn An',
    rating: 5,
    content: 'Quán rất ngon, phục vụ nhiệt tình. Không gian thoáng mát, sạch sẽ. Chắc chắn sẽ quay lại!',
    sentiment: 'POSITIVE' as const,
    status: 'NEW',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    keywords: ['ngon', 'phục vụ', 'sạch sẽ'],
    platform: 'GOOGLE_BUSINESS_PROFILE',
    externalId: 'ext-1',
    location: { id: 'loc-1', name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ, Q.1' },
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
    platform: 'GOOGLE_BUSINESS_PROFILE',
    externalId: 'ext-2',
    location: { id: 'loc-2', name: 'Chi nhánh Quận 3', address: '456 Võ Văn Tần, Q.3' },
    responses: [
      {
        id: 'r1',
        content: 'Cảm ơn bạn Bình đã ghé thăm và chia sẻ trải nghiệm! Chúng tôi rất tiếc vì bạn phải chờ đợi lâu.',
        status: 'PENDING_APPROVAL',
        isAiGenerated: true,
        createdAt: new Date().toISOString(),
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
    platform: 'GOOGLE_BUSINESS_PROFILE',
    externalId: 'ext-3',
    location: { id: 'loc-1', name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ, Q.1' },
    responses: [],
  },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  
  // Fetch dashboard data from API
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useDashboard({ dateRange: '7d' })
  
  // Fetch recent reviews from API
  const {
    reviews: apiReviews,
    isLoading: isReviewsLoading,
    error: reviewsError,
    generateResponse,
    approveResponse,
    syncReviews,
    isGenerating,
    isSyncing,
  } = useReviews({ limit: 6 })

  // Use API data or fallback
  const displayData = dashboardData || fallbackDashboardData
  const recentReviews = apiReviews.length > 0 ? apiReviews : fallbackReviews
  const hasError = dashboardError || reviewsError

  const handleSync = async () => {
    await syncReviews()
    await refetchDashboard()
  }

  // Calculate quick stats from data
  const negativeCount = displayData.sentiment?.negative || 0
  const pendingAI = recentReviews.filter(r => r.status === 'AI_DRAFT_READY').length
  const locationsCount = 2 // This would come from useBusinesses in real implementation

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Error Banner */}
        {hasError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Không thể tải dữ liệu từ server
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Đang hiển thị dữ liệu mẫu. Vui lòng kiểm tra kết nối database.
              </p>
            </div>
          </div>
        )}

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
            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
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
                  {isDashboardLoading ? (
                    <Skeleton className="h-8 w-32 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-orange-600">
                      {negativeCount} đánh giá tiêu cực
                    </p>
                  )}
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
                  {isReviewsLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">{pendingAI} phản hồi</p>
                  )}
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
                  <p className="text-2xl font-bold text-green-600">{locationsCount} địa điểm</p>
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
        {isDashboardLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <AnalyticsDashboard data={displayData} />
        )}

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

          {isReviewsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : recentReviews.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentReviews.slice(0, 6).map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onGenerateResponse={(id) => generateResponse(id, 'PROFESSIONAL')}
                  onApproveResponse={(id, content) => approveResponse(id, content)}
                  isGenerating={isGenerating === review.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Chưa có đánh giá nào. Hãy kết nối Google Business Profile để bắt đầu!
                </p>
                <Link href="/dashboard/businesses">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Kết nối ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
