'use client'

import React from 'react'
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Minus, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime, getSentimentColor, getSentimentLabel, getRatingStars } from '@/lib/utils'

interface Review {
  id: string
  authorName: string
  authorPhotoUrl?: string
  rating: number
  content?: string
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  status: string
  publishedAt: string
  keywords: string[]
  location: {
    name: string
    address: string
  }
  responses?: {
    id: string
    content: string
    status: string
    isAiGenerated: boolean
  }[]
}

interface ReviewCardProps {
  review: Review
  onGenerateResponse: (reviewId: string) => void
  onApproveResponse: (responseId: string, content?: string) => void
  isGenerating?: boolean
}

export function ReviewCard({
  review,
  onGenerateResponse,
  onApproveResponse,
  isGenerating = false,
}: ReviewCardProps) {
  const [editedResponse, setEditedResponse] = React.useState('')
  const latestResponse = review.responses?.[0]

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <ThumbsUp className="h-4 w-4 text-green-600" />
      case 'NEGATIVE':
        return <ThumbsDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="warning">Mới</Badge>
      case 'AI_DRAFT_READY':
        return <Badge variant="secondary">AI đã soạn</Badge>
      case 'PENDING_RESPONSE':
        return <Badge variant="default">Chờ gửi</Badge>
      case 'RESPONDED':
        return <Badge variant="success">Đã phản hồi</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {review.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {review.authorName}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-yellow-500">{getRatingStars(review.rating)}</span>
                <span>•</span>
                <span>{formatRelativeTime(review.publishedAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getSentimentIcon(review.sentiment)}
            {getStatusBadge(review.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Review Content */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm">
            {review.content || <span className="text-muted-foreground italic">Không có nội dung đánh giá</span>}
          </p>
          {review.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {review.keywords.slice(0, 5).map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Location Info */}
        <div className="text-xs text-muted-foreground">
          📍 {review.location.name} - {review.location.address}
        </div>

        {/* AI Response Section */}
        {latestResponse && (
          <div className="border rounded-lg p-4 bg-blue-50/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {latestResponse.isAiGenerated ? 'Phản hồi AI' : 'Phản hồi của bạn'}
              </span>
              {latestResponse.status === 'PENDING_APPROVAL' && (
                <Badge variant="warning" className="text-xs">Chờ duyệt</Badge>
              )}
              {latestResponse.status === 'APPROVED' && (
                <Badge variant="success" className="text-xs">Đã duyệt</Badge>
              )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {latestResponse.content}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {!latestResponse && (
            <Button
              size="sm"
              onClick={() => onGenerateResponse(review.id)}
              disabled={isGenerating}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {isGenerating ? 'Đang tạo...' : 'Tạo phản hồi AI'}
            </Button>
          )}
          
          {latestResponse?.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => onApproveResponse(latestResponse.id)}
              >
                Phê duyệt
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGenerateResponse(review.id)}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Tạo lại
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
