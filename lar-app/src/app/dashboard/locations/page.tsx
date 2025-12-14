'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Plus,
  MapPin,
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Settings,
  Trash2,
  Search,
  Filter,
  Eye,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useLocations, useBusinesses } from '@/hooks'

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; address: string; phone: string; businessId: string }) => void
  businesses: { id: string; name: string }[]
  isSubmitting?: boolean
}

function AddLocationModal({ isOpen, onClose, onSubmit, businesses, isSubmitting }: AddLocationModalProps) {
  const [name, setName] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [businessId, setBusinessId] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, address, phone, businessId })
  }

  const handleClose = () => {
    setName('')
    setAddress('')
    setPhone('')
    setBusinessId('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-bold mb-4">Thêm Địa Điểm Mới</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Doanh nghiệp</label>
            <Select value={businessId} onValueChange={setBusinessId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn doanh nghiệp" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((business) => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Tên địa điểm</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Chi nhánh Quận 1"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Địa chỉ</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 028 1234 5678"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting || !businessId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Thêm địa điểm'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LocationsPage() {
  const searchParams = useSearchParams()
  const businessFilter = searchParams.get('business')

  // Use real hooks
  const { locations, isLoading, error, addLocation, deleteLocation, refetch } = useLocations()
  const { businesses, isLoading: businessesLoading } = useBusinesses()
  
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedBusiness, setSelectedBusiness] = React.useState(businessFilter || 'all')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredLocations = locations.filter((location) => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBusiness = selectedBusiness === 'all' || location.businessId === selectedBusiness
    return matchesSearch && matchesBusiness
  })

  const handleAddLocation = async (data: { name: string; address: string; phone: string; businessId: string }) => {
    setIsSubmitting(true)
    const result = await addLocation(data)
    setIsSubmitting(false)
    
    if (result.success) {
      showToast('Đã thêm địa điểm thành công!', 'success')
      setShowAddModal(false)
    } else {
      showToast(result.error || 'Không thể thêm địa điểm', 'error')
    }
  }

  const handleDelete = async (locationId: string) => {
    if (confirm('Bạn có chắc muốn xóa địa điểm này? Hành động này không thể hoàn tác.')) {
      const result = await deleteLocation(locationId)
      if (result.success) {
        showToast('Đã xóa địa điểm thành công!', 'success')
      } else {
        showToast(result.error || 'Không thể xóa địa điểm', 'error')
      }
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const formatLastReview = (dateStr: string | null) => {
    if (!dateStr) return 'Chưa có đánh giá'
    const date = new Date(dateStr)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Vừa xong'
    if (diffHours < 24) return `${diffHours} giờ trước`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} ngày trước`
  }

  // Calculate stats
  const totalLocations = filteredLocations.length
  const totalReviews = filteredLocations.reduce((sum, l) => sum + l.totalReviews, 0)
  const avgRating = filteredLocations.length > 0
    ? (filteredLocations.reduce((sum, l) => sum + l.averageRating, 0) / filteredLocations.length).toFixed(1)
    : '0'
  const totalPending = filteredLocations.reduce((sum, l) => sum + l.pendingResponses, 0)

  return (
    <DashboardLayout>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Địa Điểm</h1>
            <p className="text-muted-foreground">
              Quản lý các địa điểm kinh doanh của bạn
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} disabled={businesses.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm địa điểm
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng địa điểm</p>
                      <p className="text-2xl font-bold">{totalLocations}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                      <p className="text-2xl font-bold">{totalReviews}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Điểm TB</p>
                      <p className="text-2xl font-bold">{avgRating} ⭐</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chờ phản hồi</p>
                      <p className="text-2xl font-bold text-orange-600">{totalPending}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm địa điểm..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Lọc theo doanh nghiệp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả doanh nghiệp</SelectItem>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Locations List */}
            <div className="space-y-4">
              {filteredLocations.length === 0 ? (
                <Card className="py-12">
                  <CardContent className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Không tìm thấy địa điểm</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : businesses.length === 0 ? 'Hãy thêm doanh nghiệp trước khi thêm địa điểm' : 'Bắt đầu bằng việc thêm địa điểm mới'}
                    </p>
                    {!searchQuery && businesses.length > 0 && (
                      <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm địa điểm
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredLocations.map((location) => (
                  <Card key={location.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Location Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold truncate">{location.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {location.businessName}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{location.address}</p>
                              {location.phone && (
                                <p className="text-sm text-muted-foreground">{location.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 lg:gap-8 flex-wrap">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-lg font-bold">{location.averageRating.toFixed(1)}</span>
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              {getTrendIcon(location.ratingTrend)}
                            </div>
                            <p className="text-xs text-muted-foreground">Điểm TB</p>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{location.totalReviews}</div>
                            <p className="text-xs text-muted-foreground">Đánh giá</p>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{location.pendingResponses}</div>
                            <p className="text-xs text-muted-foreground">Chờ phản hồi</p>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Cảm xúc</div>
                            <div className="flex gap-1">
                              <Badge variant="success" className="text-xs">{location.sentiment.positive}</Badge>
                              <Badge variant="secondary" className="text-xs">{location.sentiment.neutral}</Badge>
                              <Badge variant="destructive" className="text-xs">{location.sentiment.negative}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 lg:ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/dashboard/locations/${location.id}/seo`}>
                              <BarChart3 className="h-4 w-4 mr-1" />
                              SEO
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/dashboard/reviews?location=${location.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </a>
                          </Button>
                          {location.gbpUrl && (
                            <Button variant="outline" size="icon" asChild>
                              <a href={location.gbpUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/dashboard/locations/${location.id}/settings`}>
                              <Settings className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(location.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Last review info */}
                      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                        Đánh giá gần nhất: {formatLastReview(location.lastReview)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddLocation}
        businesses={businesses.map(b => ({ id: b.id, name: b.name }))}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  )
}

// Wrapper component with Suspense for useSearchParams
export default function LocationsPageWrapper() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    }>
      <LocationsPage />
    </Suspense>
  )
}
