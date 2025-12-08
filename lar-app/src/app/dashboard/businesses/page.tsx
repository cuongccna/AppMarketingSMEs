'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Building2,
  MapPin,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Chrome,
  MessageSquare,
} from 'lucide-react'

// Type definitions
interface Business {
  id: string
  name: string
  category: string
  locations: number
  totalReviews: number
  averageRating: number
  platforms: {
    gbp: { connected: boolean; lastSync: string | null }
    zalo: { connected: boolean; lastSync: string | null }
  }
}

// Mock data for businesses
const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Quán Cơm Nhà Làm',
    category: 'Nhà hàng',
    locations: 3,
    totalReviews: 156,
    averageRating: 4.5,
    platforms: {
      gbp: { connected: true, lastSync: '2025-12-08T10:00:00Z' },
      zalo: { connected: true, lastSync: '2025-12-08T09:30:00Z' },
    },
  },
  {
    id: '2',
    name: 'Spa Làm Đẹp Sài Gòn',
    category: 'Spa & Làm đẹp',
    locations: 2,
    totalReviews: 89,
    averageRating: 4.8,
    platforms: {
      gbp: { connected: true, lastSync: '2025-12-08T08:00:00Z' },
      zalo: { connected: false, lastSync: null },
    },
  },
]

interface AddBusinessModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; category: string }) => void
}

function AddBusinessModal({ isOpen, onClose, onSubmit }: AddBusinessModalProps) {
  const [name, setName] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onSubmit({ name, category })
    setName('')
    setCategory('')
    setIsLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
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
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
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
  business: typeof mockBusinesses[0] | null
  platform: 'gbp' | 'zalo'
}

function ConnectPlatformModal({ isOpen, onClose, business, platform }: ConnectPlatformModalProps) {
  const [isConnecting, setIsConnecting] = React.useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnecting(false)
    onClose()
  }

  if (!isOpen || !business) return null

  const platformInfo = {
    gbp: {
      name: 'Google Business Profile',
      icon: <Chrome className="h-8 w-8 text-blue-500" />,
      description: 'Kết nối với Google Business Profile để đồng bộ đánh giá từ Google Maps và Search.',
      steps: [
        'Đăng nhập vào tài khoản Google của bạn',
        'Chọn địa điểm doanh nghiệp cần kết nối',
        'Cấp quyền cho LAR đọc và phản hồi đánh giá',
      ],
    },
    zalo: {
      name: 'Zalo Official Account',
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      description: 'Kết nối Zalo OA để nhận đánh giá và gửi thông báo qua Zalo.',
      steps: [
        'Đăng nhập vào Zalo for Developers',
        'Chọn Official Account cần kết nối',
        'Cấp quyền cho LAR quản lý tin nhắn',
      ],
    },
  }

  const info = platformInfo[platform]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
        <div className="flex items-center gap-4 mb-6">
          {info.icon}
          <div>
            <h2 className="text-xl font-bold">Kết nối {info.name}</h2>
            <p className="text-sm text-muted-foreground">{business.name}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">{info.description}</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Các bước thực hiện:</h3>
          <ol className="space-y-2">
            {info.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button className="flex-1" onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
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
      </div>
    </div>
  )
}

export default function BusinessesPage() {
  const { data: session } = useSession()
  const [businesses, setBusinesses] = React.useState(mockBusinesses)
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [connectModal, setConnectModal] = React.useState<{
    isOpen: boolean
    business: typeof mockBusinesses[0] | null
    platform: 'gbp' | 'zalo'
  }>({
    isOpen: false,
    business: null,
    platform: 'gbp',
  })
  const [syncingId, setSyncingId] = React.useState<string | null>(null)

  const handleAddBusiness = (data: { name: string; category: string }) => {
    const newBusiness = {
      id: Date.now().toString(),
      name: data.name,
      category: data.category,
      locations: 0,
      totalReviews: 0,
      averageRating: 0,
      platforms: {
        gbp: { connected: false, lastSync: null },
        zalo: { connected: false, lastSync: null },
      },
    }
    setBusinesses([...businesses, newBusiness])
  }

  const handleSync = async (businessId: string) => {
    setSyncingId(businessId)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncingId(null)
  }

  const handleDelete = (businessId: string) => {
    if (confirm('Bạn có chắc muốn xóa doanh nghiệp này? Hành động này không thể hoàn tác.')) {
      setBusinesses(businesses.filter(b => b.id !== businessId))
    }
  }

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Chưa đồng bộ'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffMinutes < 60) return `${diffMinutes} phút trước`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} giờ trước`
    return date.toLocaleDateString('vi-VN')
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
        {businesses.length === 0 && (
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
          {businesses.map((business) => (
            <Card key={business.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {business.name}
                    </CardTitle>
                    <CardDescription>{business.category}</CardDescription>
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
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{business.locations}</div>
                    <div className="text-xs text-muted-foreground">Địa điểm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{business.totalReviews}</div>
                    <div className="text-xs text-muted-foreground">Đánh giá</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{business.averageRating}</div>
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
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã kết nối
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConnectModal({
                          isOpen: true,
                          business,
                          platform: 'gbp',
                        })}
                      >
                        Kết nối
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
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã kết nối
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConnectModal({
                          isOpen: true,
                          business,
                          platform: 'zalo',
                        })}
                      >
                        Kết nối
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
      />

      <ConnectPlatformModal
        isOpen={connectModal.isOpen}
        onClose={() => setConnectModal({ ...connectModal, isOpen: false })}
        business={connectModal.business}
        platform={connectModal.platform}
      />
    </DashboardLayout>
  )
}
