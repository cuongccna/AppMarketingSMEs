'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ReviewCard } from '@/components/reviews/review-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { useReviews } from '@/hooks/useReviews'
import { useSearchParams } from 'next/navigation'

// Fallback reviews for development/error states
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
  {
    id: '4',
    authorName: 'Phạm Đức Dũng',
    rating: 5,
    content: 'Tuyệt vời! Đồ ăn ngon, nhân viên thân thiện, giá cả hợp lý. 10 điểm!',
    sentiment: 'POSITIVE' as const,
    status: 'RESPONDED',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    keywords: ['tuyệt vời', 'ngon', 'thân thiện'],
    platform: 'GOOGLE_BUSINESS_PROFILE',
    externalId: 'ext-4',
    location: { id: 'loc-2', name: 'Chi nhánh Quận 3', address: '456 Võ Văn Tần, Q.3' },
    responses: [
      {
        id: 'r2',
        content: 'Cảm ơn bạn Dũng đã dành 5 sao cho chúng tôi!',
        status: 'PUBLISHED',
        isAiGenerated: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
]

function ReviewsPageContent() {
  const searchParams = useSearchParams()
  const initialSentiment = searchParams.get('sentiment') || 'all'
  const initialStatus = searchParams.get('status') || 'all'

  const [searchQuery, setSearchQuery] = React.useState('')
  const [sentimentFilter, setSentimentFilter] = React.useState<string>(initialSentiment)
  const [statusFilter, setStatusFilter] = React.useState<string>(initialStatus)

  // Fetch reviews from API with filters
  const {
    reviews: apiReviews,
    isLoading,
    error,
    generateResponse,
    approveResponse,
    syncReviews,
    isGenerating,
    isSyncing,
    refetch,
  } = useReviews({
    sentiment: sentimentFilter,
    status: statusFilter,
    search: searchQuery,
  })

  // Use API reviews or fallback
  const reviews = apiReviews.length > 0 ? apiReviews : (error ? fallbackReviews : apiReviews)

  // Filter client-side for search (in case API doesn't support full-text search)
  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true
    const matchesSearch = 
      review.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleSync = async () => {
    await syncReviews()
    await refetch()
  }

  const stats = {
    total: reviews.length,
    new: reviews.filter(r => r.status === 'NEW').length,
    pending: reviews.filter(r => r.status === 'AI_DRAFT_READY').length,
    positive: reviews.filter(r => r.sentiment === 'POSITIVE').length,
    negative: reviews.filter(r => r.sentiment === 'NEGATIVE').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Không thể tải dữ liệu từ server
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Đang hiển thị dữ liệu mẫu. {error}
              </p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quản Lý Đánh Giá</h1>
            <p className="text-muted-foreground">
              Xem và phản hồi tất cả đánh giá từ khách hàng
            </p>
          </div>
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ từ GBP'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-20" />
            </>
          ) : (
            <>
              <Badge variant="outline" className="px-3 py-1">
                Tổng: {stats.total}
              </Badge>
              <Badge variant="warning" className="px-3 py-1">
                Mới: {stats.new}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Chờ duyệt: {stats.pending}
              </Badge>
              <Badge variant="success" className="px-3 py-1">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Tích cực: {stats.positive}
              </Badge>
              <Badge variant="danger" className="px-3 py-1">
                <ThumbsDown className="h-3 w-3 mr-1" />
                Tiêu cực: {stats.negative}
              </Badge>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc nội dung..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Cảm xúc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cảm xúc</SelectItem>
              <SelectItem value="POSITIVE">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  Tích cực
                </div>
              </SelectItem>
              <SelectItem value="NEUTRAL">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-gray-600" />
                  Trung lập
                </div>
              </SelectItem>
              <SelectItem value="NEGATIVE">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  Tiêu cực
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="NEW">Mới</SelectItem>
              <SelectItem value="AI_DRAFT_READY">AI đã soạn</SelectItem>
              <SelectItem value="PENDING_RESPONSE">Chờ gửi</SelectItem>
              <SelectItem value="RESPONDED">Đã phản hồi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map((review) => (
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
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Không tìm thấy đánh giá</h3>
            <p className="text-muted-foreground">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function ReviewsPage() {
  return (
    <React.Suspense fallback={
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-24" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    }>
      <ReviewsPageContent />
    </React.Suspense>
  )
}
