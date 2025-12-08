'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart3,
} from 'lucide-react'

interface DashboardData {
  overview: {
    totalReviews: number
    averageRating: number
    responseRate: number
    pendingResponses: number
  }
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  sentimentPercentage: {
    positive: number
    neutral: number
    negative: number
  }
  trend: Array<{
    date: string
    newReviews: number
    positiveCount: number
    negativeCount: number
    neutralCount: number
  }>
  topKeywords: Array<{
    keyword: string
    count: number
  }>
}

interface AnalyticsDashboardProps {
  data: DashboardData
  isLoading?: boolean
}

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
}

export function AnalyticsDashboard({ data, isLoading }: AnalyticsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const sentimentPieData = [
    { name: 'Tích cực', value: data.sentiment.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Trung lập', value: data.sentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Tiêu cực', value: data.sentiment.negative, color: SENTIMENT_COLORS.negative },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đánh Giá</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalReviews}</div>
            <p className="text-xs text-muted-foreground">trong 30 ngày qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm Trung Bình</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageRating}/5</div>
            <div className="text-yellow-500 text-sm">
              {'★'.repeat(Math.round(data.overview.averageRating))}
              {'☆'.repeat(5 - Math.round(data.overview.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Phản Hồi</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              đánh giá đã được phản hồi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ Phản Hồi</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.overview.pendingResponses}
            </div>
            <p className="text-xs text-muted-foreground">
              đánh giá cần xử lý
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân Bố Cảm Xúc</CardTitle>
            <CardDescription>Tỷ lệ cảm xúc trong các đánh giá</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sentimentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="text-sm">{data.sentimentPercentage.positive}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-gray-600" />
                <span className="text-sm">{data.sentimentPercentage.neutral}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span className="text-sm">{data.sentimentPercentage.negative}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Xu Hướng Đánh Giá</CardTitle>
            <CardDescription>Số lượng đánh giá theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="positiveCount"
                  name="Tích cực"
                  stroke={SENTIMENT_COLORS.positive}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="negativeCount"
                  name="Tiêu cực"
                  stroke={SENTIMENT_COLORS.negative}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Từ Khóa Phổ Biến</CardTitle>
          <CardDescription>
            Các từ khóa được nhắc đến nhiều nhất trong đánh giá
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.topKeywords.map((kw, index) => (
              <Badge
                key={index}
                variant={index < 3 ? 'default' : 'secondary'}
                className="text-sm py-1 px-3"
              >
                {kw.keyword}
                <span className="ml-2 text-xs opacity-70">({kw.count})</span>
              </Badge>
            ))}
            {data.topKeywords.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Chưa có dữ liệu từ khóa
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
