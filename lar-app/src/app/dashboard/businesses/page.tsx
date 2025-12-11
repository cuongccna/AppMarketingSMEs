'use client'

import React, { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  Building2,
  MapPin,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Link as LinkIcon,
  Chrome,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import { useBusinesses } from '@/hooks'

// Toast notification
function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {message}
    </div>
  )
}

interface AddBusinessModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; category: string }) => Promise<void>
  isLoading: boolean
}

function AddBusinessModal({ isOpen, onClose, onSubmit, isLoading }: AddBusinessModalProps) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ name, category })
    setName('')
    setCategory('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-bold mb-4">Thêm Doanh Nghiệp Mới</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên doanh nghiệp</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Quán Cơm Nhà Làm"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Danh mục</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="VD: Nhà hàng, Spa, Cửa hàng..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !name}>
              {isLoading ? 'Đang tạo...' : 'Tạo doanh nghiệp'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface ConnectPlatformModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  businessName: string
  platform: 'gbp' | 'zalo'
  onConnect: (data: { platform: string; externalId: string; locationId: string }) => Promise<void>
  isLoading: boolean
  locations: Array<{ id: string; name: string }>
}

function ConnectPlatformModal({ 
  isOpen, 
  onClose, 
  businessName, 
  platform,
  onConnect,
  isLoading,
  locations
}: ConnectPlatformModalProps) {
  const [externalId, setExternalId] = React.useState('')
  const [selectedLocation, setSelectedLocation] = React.useState('')

  const platformInfo = {
    gbp: {
      name: 'Google Business Profile',
      icon: <Chrome className="h-8 w-8 text-blue-500" />,
      description: 'Kết nối với Google Business Profile để đồng bộ đánh giá từ Google Maps và Search.',
      placeholder: 'Place ID hoặc Account ID',
    },
    zalo: {
      name: 'Zalo Official Account',
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      description: 'Kết nối Zalo OA để nhận đánh giá và gửi thông báo qua Zalo.',
      placeholder: 'OA ID',
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const platformMap = {
      gbp: 'GOOGLE_BUSINESS_PROFILE',
      zalo: 'ZALO_OA',
    }
    await onConnect({
      platform: platformMap[platform],
      externalId,
      locationId: selectedLocation,
    })
    setExternalId('')
    setSelectedLocation('')
  }

  if (!isOpen) return null

  const info = platformInfo[platform]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
        <div className="flex items-center gap-4 mb-6">
          {info.icon}
          <div>
            <h2 className="text-xl font-bold">Kết nối {info.name}</h2>
            <p className="text-sm text-muted-foreground">{businessName}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">{info.description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Chọn địa điểm</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
              required
            >
              <option value="">-- Chọn địa điểm --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            {locations.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Chưa có địa điểm nào. Vui lòng tạo địa điểm trước.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">{info.placeholder}</label>
            <Input
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder={info.placeholder}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading || !externalId || !selectedLocation}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang kết nối...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Kết nối ngay
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BusinessesPage() {
  const { 
    businesses, 
    isLoading, 
    error,
    fetchBusinesses, 
    createBusiness, 
    deleteBusiness, 
    connectPlatform 
  } = useBusinesses()
  
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [syncingId, setSyncingId] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [connectModal, setConnectModal] = React.useState<{
    isOpen: boolean
    businessId: string
    businessName: string
    platform: 'gbp' | 'zalo'
    locations: Array<{ id: string; name: string }>
  }>({
    isOpen: false,
    businessId: '',
    businessName: '',
    platform: 'gbp',
    locations: [],
  })

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddBusiness = async (data: { name: string; category: string }) => {
    setIsSaving(true)
    const result = await createBusiness(data)
    setIsSaving(false)
    if (result) {
      showToast('Đã tạo doanh nghiệp thành công!')
      setShowAddModal(false)
    } else {
      showToast(error || 'Không thể tạo doanh nghiệp', 'error')
    }
  }

  const handleSync = async (businessId: string) => {
    setSyncingId(businessId)
    // TODO: Implement actual sync logic
    await new Promise(resolve => setTimeout(resolve, 2000))
    await fetchBusinesses()
    setSyncingId(null)
    showToast('Đã đồng bộ thành công!')
  }

  const handleDelete = async (businessId: string) => {
    if (confirm('Bạn có chắc muốn xóa doanh nghiệp này? Hành động này không thể hoàn tác.')) {
      const success = await deleteBusiness(businessId)
      if (success) {
        showToast('Đã xóa doanh nghiệp!')
      } else {
        showToast('Không thể xóa doanh nghiệp', 'error')
      }
    }
  }

  const handleConnectPlatform = async (data: { platform: string; externalId: string; locationId: string }) => {
    setIsSaving(true)
    const result = await connectPlatform(connectModal.businessId, data)
    setIsSaving(false)
    if (result) {
      showToast(`Đã kết nối ${data.platform === 'GOOGLE_BUSINESS_PROFILE' ? 'Google Business Profile' : 'Zalo OA'}!`)
      setConnectModal({ ...connectModal, isOpen: false })
    } else {
      showToast('Không thể kết nối platform', 'error')
    }
  }

  const formatLastSync = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Chưa đồng bộ'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffMinutes < 60) return `${diffMinutes} phút trước`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  // Transform API data for display
  const businessesWithStats = businesses.map((b: any) => {
    const locations = b.locations || []
    const totalReviews = locations.reduce((sum: number, loc: any) => sum + (loc._count?.reviews || 0), 0)
    
    // Check platform connections across all locations
    const hasGbp = locations.some((loc: any) => 
      loc.platformConnections?.some((pc: any) => pc.platform === 'GOOGLE_BUSINESS_PROFILE' && pc.isConnected)
    )
    const hasZalo = locations.some((loc: any) => 
      loc.platformConnections?.some((pc: any) => pc.platform === 'ZALO_OA' && pc.isConnected)
    )
    
    const gbpConnection = locations.flatMap((loc: any) => loc.platformConnections || [])
      .find((pc: any) => pc.platform === 'GOOGLE_BUSINESS_PROFILE')
    const zaloConnection = locations.flatMap((loc: any) => loc.platformConnections || [])
      .find((pc: any) => pc.platform === 'ZALO_OA')

    return {
      ...b,
      locationCount: locations.length,
      totalReviews,
      platforms: {
        gbp: { connected: hasGbp, lastSync: gbpConnection?.lastSyncAt },
        zalo: { connected: hasZalo, lastSync: zaloConnection?.lastSyncAt },
      },
    }
  })

  if (isLoading && businesses.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Doanh Nghiệp</h1>
            <p className="text-muted-foreground">
              Quản lý các doanh nghiệp và kết nối nền tảng
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm doanh nghiệp
          </Button>
        </div>

        {/* Empty State */}
        {businessesWithStats.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có doanh nghiệp nào</h3>
              <p className="text-muted-foreground mb-4">
                Bắt đầu bằng việc thêm doanh nghiệp đầu tiên của bạn
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm doanh nghiệp
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Business Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {businessesWithStats.map((business: any) => (
            <Card key={business.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {business.name}
                    </CardTitle>
                    <CardDescription>{business.category || 'Chưa phân loại'}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSync(business.id)}
                      disabled={syncingId === business.id}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncingId === business.id ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(business.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{business.locationCount}</div>
                    <div className="text-xs text-muted-foreground">Địa điểm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{business.totalReviews}</div>
                    <div className="text-xs text-muted-foreground">Đánh giá</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">-</div>
                    <div className="text-xs text-muted-foreground">Điểm TB</div>
                  </div>
                </div>

                {/* Platform Connections */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Nền tảng kết nối</h4>
                  
                  {/* Google Business Profile */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Chrome className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Google Business Profile</div>
                        <div className="text-xs text-muted-foreground">
                          {business.platforms.gbp.connected
                            ? `Đồng bộ: ${formatLastSync(business.platforms.gbp.lastSync)}`
                            : 'Chưa kết nối'
                          }
                        </div>
                      </div>
                    </div>
                    {business.platforms.gbp.connected ? (
                      <Badge className="gap-1 bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã kết nối
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConnectModal({
                          isOpen: true,
                          businessId: business.id,
                          businessName: business.name,
                          platform: 'gbp',
                          locations: (business.locations || []).map((l: any) => ({ id: l.id, name: l.name })),
                        })}
                        disabled={business.locationCount === 0}
                      >
                        {business.locationCount === 0 ? 'Tạo địa điểm trước' : 'Kết nối'}
                      </Button>
                    )}
                  </div>

                  {/* Zalo OA */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium">Zalo Official Account</div>
                        <div className="text-xs text-muted-foreground">
                          {business.platforms.zalo.connected
                            ? `Đồng bộ: ${formatLastSync(business.platforms.zalo.lastSync)}`
                            : 'Chưa kết nối'
                          }
                        </div>
                      </div>
                    </div>
                    {business.platforms.zalo.connected ? (
                      <Badge className="gap-1 bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã kết nối
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConnectModal({
                          isOpen: true,
                          businessId: business.id,
                          businessName: business.name,
                          platform: 'zalo',
                          locations: (business.locations || []).map((l: any) => ({ id: l.id, name: l.name })),
                        })}
                        disabled={business.locationCount === 0}
                      >
                        {business.locationCount === 0 ? 'Tạo địa điểm trước' : 'Kết nối'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`/dashboard/locations?business=${business.id}`}>
                      <MapPin className="h-4 w-4 mr-1" />
                      Xem địa điểm
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`/dashboard/reviews?business=${business.id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Xem đánh giá
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddBusinessModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddBusiness}
        isLoading={isSaving}
      />

      <ConnectPlatformModal
        isOpen={connectModal.isOpen}
        onClose={() => setConnectModal({ ...connectModal, isOpen: false })}
        businessId={connectModal.businessId}
        businessName={connectModal.businessName}
        platform={connectModal.platform}
        onConnect={handleConnectPlatform}
        isLoading={isSaving}
        locations={connectModal.locations}
      />
    </DashboardLayout>
  )
}
