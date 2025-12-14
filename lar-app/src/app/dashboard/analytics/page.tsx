'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnalyticsDashboard } from '@/components/analytics/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  MapPin,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { useAnalytics, useLocations } from '@/hooks'

// Fallback data for development/error states
const fallbackDashboardData = {
  overview: {
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    pendingResponses: 0,
  },
  sentiment: {
    positive: 0,
    neutral: 0,
    negative: 0,
  },
  sentimentPercentage: {
    positive: 0,
    neutral: 0,
    negative: 0,
  },
  trend: [],
  topKeywords: [],
  ratingDistribution: [],
  locationStats: [],
  monthlyData: [],
}

const dateRangeOptions = [
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: '90d', label: '90 ngày qua' },
  { value: '6m', label: '6 tháng qua' },
  { value: '1y', label: '1 năm qua' },
  { value: 'custom', label: 'Tùy chọn' },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState('30d')
  const [selectedLocation, setSelectedLocation] = React.useState('all')

  // Convert date range to days
  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '6m': return 180
      case '1y': return 365
      default: return 30
    }
  }

  // Fetch analytics data from API
  const { 
    data: apiData, 
    isLoading, 
    error, 
    refetch 
  } = useAnalytics({
    locationId: selectedLocation === 'all' ? undefined : selectedLocation,
    days: getDaysFromRange(dateRange),
  })

  // Fetch locations for filter dropdown  
  const { locations } = useLocations()

  // Use API data or fallback
  const dashboardData = apiData || fallbackDashboardData

  const handleExport = () => {
    // Simulate export
    alert('Xuất báo cáo PDF sẽ được gửi đến email của bạn!')
  }

  const handleRefresh = async () => {
    await refetch()
  }

  // Calculate comparison stats
  const stats = dashboardData?.changes || {
    reviewsChange: 0,
    ratingChange: 0,
    responseRateChange: 0,
    positiveChange: 0,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Phân Tích & Báo Cáo</h1>
            <p className="text-muted-foreground">
              Tổng quan hiệu suất đánh giá và danh tiếng
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả địa điểm</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                  <p className="text-3xl font-bold">{dashboardData?.overview.totalReviews ?? 0}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stats.reviewsChange > 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">+{stats.reviewsChange}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">{stats.reviewsChange}%</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">so với kỳ trước</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                  <p className="text-3xl font-bold">{dashboardData?.overview.averageRating ?? 0}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stats.ratingChange > 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">+{stats.ratingChange}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">{stats.ratingChange}</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">so với kỳ trước</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tỷ lệ phản hồi</p>
                  <p className="text-3xl font-bold">{dashboardData?.overview.responseRate ?? 0}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+{stats.responseRateChange}%</span>
                    <span className="text-xs text-muted-foreground">so với kỳ trước</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đánh giá tích cực</p>
                  <p className="text-3xl font-bold">{dashboardData?.sentimentPercentage.positive ?? 0}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+{stats.positiveChange}%</span>
                    <span className="text-xs text-muted-foreground">so với kỳ trước</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Component */}
        {dashboardData && <AnalyticsDashboard data={dashboardData} />}

        {/* Additional Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Đánh giá theo tháng
              </CardTitle>
              <CardDescription>Số lượng đánh giá trong 6 tháng gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    name="Tích cực"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="#6b7280"
                    fill="#6b7280"
                    name="Trung lập"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="Tiêu cực"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Phân bố điểm đánh giá
              </CardTitle>
              <CardDescription>Tỷ lệ theo số sao</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(dashboardData?.ratingDistribution || []).map((item) => (
                  <div key={item.rating} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.rating}</span>
                      <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              So sánh theo địa điểm
            </CardTitle>
            <CardDescription>Hiệu suất đánh giá của từng chi nhánh</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Địa điểm</th>
                    <th className="text-center py-3 px-4 font-medium">Đánh giá</th>
                    <th className="text-center py-3 px-4 font-medium">Điểm TB</th>
                    <th className="text-center py-3 px-4 font-medium">Đã phản hồi</th>
                    <th className="text-center py-3 px-4 font-medium">Tỷ lệ</th>
                    <th className="text-center py-3 px-4 font-medium">Xu hướng</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboardData?.locationStats || []).map((location, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{location.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">{location.reviews}</td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{location.rating}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">{location.responses}</td>
                      <td className="text-center py-3 px-4">
                        <Badge 
                          variant={location.responseRate >= 90 ? 'success' : location.responseRate >= 70 ? 'warning' : 'destructive'}
                        >
                          {location.responseRate}%
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        {location.rating >= 4.5 ? (
                          <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                        ) : location.rating >= 4.0 ? (
                          <div className="h-1 w-6 bg-gray-400 rounded mx-auto" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">Xuất báo cáo chi tiết</h3>
                <p className="text-sm text-muted-foreground">
                  Tải xuống báo cáo đầy đủ với tất cả dữ liệu phân tích
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất PDF
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
