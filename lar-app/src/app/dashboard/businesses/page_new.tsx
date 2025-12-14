'use client'

import React, { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useToast } from '@/components/ui/use-toast'

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Doanh Nghiệp Mới</DialogTitle>
        </DialogHeader>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !name}>
              {isLoading ? 'Đang tạo...' : 'Tạo doanh nghiệp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditBusinessModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; category: string }) => Promise<void>
  isLoading: boolean
  initialData: { name: string; category: string }
}

function EditBusinessModal({ isOpen, onClose, onSubmit, isLoading, initialData }: EditBusinessModalProps) {
  const [name, setName] = React.useState(initialData.name)
  const [category, setCategory] = React.useState(initialData.category)

  useEffect(() => {
    if (isOpen) {
      setName(initialData.name)
      setCategory(initialData.category)
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ name, category })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Doanh Nghiệp</DialogTitle>
        </DialogHeader>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !name}>
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isLoading: boolean
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, isLoading }: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa doanh nghiệp</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa doanh nghiệp này? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan (địa điểm, đánh giá, khách hàng).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Đang xóa...' : 'Xóa doanh nghiệp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {info.icon}
            Kết nối {info.name}
          </DialogTitle>
          <DialogDescription>
            {businessName}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-gray-600 mb-4">{info.description}</p>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function BusinessesPage() {
  const { 
    businesses, 
    isLoading, 
    error,
    fetchBusinesses, 
    createBusiness, 
    updateBusiness,
    deleteBusiness, 
    connectPlatform 
  } = useBusinesses()
  
  const { toast } = useToast()
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [syncingId, setSyncingId] = React.useState<string | null>(null)
  
  const [editModal, setEditModal] = React.useState<{
    isOpen: boolean
    businessId: string
    initialData: { name: string; category: string }
  }>({
    isOpen: false,
    businessId: '',
    initialData: { name: '', category: '' }
  })

  const [deleteModal, setDeleteModal] = React.useState<{
    isOpen: boolean
    businessId: string
  }>({
    isOpen: false,
    businessId: ''
  })

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

  const handleAddBusiness = async (data: { name: string; category: string }) => {
    setIsSaving(true)
    const result = await createBusiness(data)
    setIsSaving(false)
    if (result) {
      toast({
        title: "Thành công",
        description: "Đã tạo doanh nghiệp mới.",
      })
      setShowAddModal(false)
    } else {
      toast({
        title: "Lỗi",
        description: error || "Không thể tạo doanh nghiệp.",
        variant: "destructive",
      })
    }
  }

  const handleEditBusiness = async (data: { name: string; category: string }) => {
    setIsSaving(true)
    const success = await updateBusiness(editModal.businessId, data)
    setIsSaving(false)
    if (success) {
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin doanh nghiệp.",
      })
      setEditModal({ ...editModal, isOpen: false })
    } else {
      toast({
        title: "Lỗi",
        description: error || "Không thể cập nhật doanh nghiệp.",
        variant: "destructive",
      })
    }
  }

  const handleSync = async (businessId: string) => {
    setSyncingId(businessId)
    // TODO: Implement actual sync logic
    await new Promise(resolve => setTimeout(resolve, 2000))
    await fetchBusinesses()
    setSyncingId(null)
    toast({
      title: "Đồng bộ thành công",
      description: "Dữ liệu đã được cập nhật mới nhất.",
    })
  }

  const handleDeleteClick = (businessId: string) => {
    setDeleteModal({ isOpen: true, businessId })
  }

  const handleConfirmDelete = async () => {
    setIsSaving(true)
    const success = await deleteBusiness(deleteModal.businessId)
    setIsSaving(false)
    if (success) {
      toast({
        title: "Đã xóa",
        description: "Doanh nghiệp đã được xóa thành công.",
      })
      setDeleteModal({ ...deleteModal, isOpen: false })
    } else {
      toast({
        title: "Không thể xóa",
        description: error || "Có lỗi xảy ra khi xóa doanh nghiệp.",
        variant: "destructive",
      })
      setDeleteModal({ ...deleteModal, isOpen: false })
    }
  }

  const handleConnectPlatform = async (data: { platform: string; externalId: string; locationId: string }) => {
    setIsSaving(true)
    const result = await connectPlatform(connectModal.businessId, data)
    setIsSaving(false)
    if (result) {
      toast({
        title: "Kết nối thành công",
        description: `Đã kết nối ${data.platform === 'GOOGLE_BUSINESS_PROFILE' ? 'Google Business Profile' : 'Zalo OA'}!`,
      })
      setConnectModal({ ...connectModal, isOpen: false })
    } else {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối platform.",
        variant: "destructive",
      })
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
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => setEditModal({
                        isOpen: true,
                        businessId: business.id,
                        initialData: { name: business.name, category: business.category || '' }
                      })}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(business.id)}
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

      <EditBusinessModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        onSubmit={handleEditBusiness}
        isLoading={isSaving}
        initialData={editModal.initialData}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
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
