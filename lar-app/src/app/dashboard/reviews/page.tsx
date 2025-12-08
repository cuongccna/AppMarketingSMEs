'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ReviewCard } from '@/components/reviews/review-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'

// Extended mock data
const mockReviews = [
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
  {
    id: '4',
    authorName: 'Phạm Đức Dũng',
    rating: 5,
    content: 'Tuyệt vời! Đồ ăn ngon, nhân viên thân thiện, giá cả hợp lý. 10 điểm!',
    sentiment: 'POSITIVE' as const,
    status: 'RESPONDED',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    keywords: ['tuyệt vời', 'ngon', 'thân thiện', 'hợp lý'],
    location: { name: 'Chi nhánh Quận 3', address: '456 Võ Văn Tần, Q.3' },
    responses: [
      {
        id: 'r2',
        content: 'Cảm ơn bạn Dũng đã dành 5 sao cho chúng tôi! Thật vui khi bạn hài lòng với đồ ăn và dịch vụ. Rất mong được phục vụ bạn trong lần tới!',
        status: 'PUBLISHED',
        isAiGenerated: true,
      },
    ],
  },
  {
    id: '5',
    authorName: 'Hoàng Thị Em',
    rating: 4,
    content: 'Đồ ăn ngon, không gian đẹp. Chỉ hơi ồn vào cuối tuần.',
    sentiment: 'POSITIVE' as const,
    status: 'NEW',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    keywords: ['ngon', 'đẹp', 'ồn'],
    location: { name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ, Q.1' },
    responses: [],
  },
  {
    id: '6',
    authorName: 'Võ Văn Phúc',
    rating: 2,
    content: 'Order online nhưng giao trễ 45 phút. Đồ ăn đã nguội khi nhận.',
    sentiment: 'NEGATIVE' as const,
    status: 'AI_DRAFT_READY',
    publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    keywords: ['giao trễ', 'nguội'],
    location: { name: 'Chi nhánh Quận 3', address: '456 Võ Văn Tần, Q.3' },
    responses: [
      {
        id: 'r3',
        content: 'Xin chào bạn Phúc, chúng tôi thành thật xin lỗi về trải nghiệm giao hàng không tốt lần này. Việc giao trễ 45 phút là không thể chấp nhận được và chúng tôi đang làm việc với đối tác giao hàng để cải thiện. Mong bạn cho chúng tôi cơ hội phục vụ tốt hơn lần sau!',
        status: 'PENDING_APPROVAL',
        isAiGenerated: true,
      },
    ],
  },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = React.useState(mockReviews)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sentimentFilter, setSentimentFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [isLoading, setIsLoading] = React.useState(false)
  const [generatingReviewId, setGeneratingReviewId] = React.useState<string | null>(null)

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSentiment = sentimentFilter === 'all' || review.sentiment === sentimentFilter
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter
    
    return matchesSearch && matchesSentiment && matchesStatus
  })

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
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
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
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quản Lý Đánh Giá</h1>
            <p className="text-muted-foreground">
              Xem và phản hồi tất cả đánh giá từ khách hàng
            </p>
          </div>
          <Button onClick={handleSync} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Đồng bộ từ GBP
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
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
        {filteredReviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onGenerateResponse={handleGenerateResponse}
                onApproveResponse={handleApproveResponse}
                isGenerating={generatingReviewId === review.id}
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
