'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Save, Trash2, ArrowLeft, Gift, Settings as SettingsIcon, QrCode, Download } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { QRCodeSVG } from 'qrcode.react'

interface Location {
  id: string
  name: string
  pointsPerReview: number
}

interface Reward {
  id: string
  name: string
  description: string
  image: string
  pointsRequired: number
  isActive: boolean
}

export default function LocationSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const locationId = params.id as string

  const [location, setLocation] = useState<Location | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [pointsPerReview, setPointsPerReview] = useState(10)
  
  // Reward Modal state (simplified as inline form for now or modal)
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)

  useEffect(() => {
    fetchData()
  }, [locationId])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch location
      const locRes = await fetch(`/api/locations/${locationId}`)
      const locData = await locRes.json()
      
      if (locData.error) throw new Error(locData.error)
      setLocation(locData)
      setPointsPerReview(locData.pointsPerReview || 10)

      // Fetch rewards
      const rewardsRes = await fetch(`/api/rewards?locationId=${locationId}`)
      const rewardsData = await rewardsRes.json()
      if (rewardsData.success) {
        setRewards(rewardsData.data)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin cài đặt',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/locations/${locationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsPerReview }),
      })
      
      if (!res.ok) throw new Error('Failed to update')
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật cài đặt chung',
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa quà tặng này?')) return

    try {
      const res = await fetch(`/api/rewards/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      setRewards(rewards.filter(r => r.id !== id))
      toast({
        title: 'Thành công',
        description: 'Đã xóa quà tặng',
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa quà tặng',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cài đặt: {location?.name}</h1>
            <p className="text-muted-foreground">Quản lý tích điểm và quà tặng</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Cấu hình tích điểm
              </CardTitle>
              <CardDescription>
                Quy định số điểm khách hàng nhận được khi đánh giá
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Điểm thưởng mỗi đánh giá</label>
                <Input 
                  type="number" 
                  value={pointsPerReview} 
                  onChange={(e) => setPointsPerReview(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Khách hàng sẽ nhận được số điểm này sau khi đánh giá được duyệt.
                </p>
              </div>
              <Button onClick={handleSaveGeneral} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Mã QR Cửa Hàng
              </CardTitle>
              <CardDescription>
                Quét để tích điểm và đổi quà
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <QRCodeSVG 
                  id="location-qr"
                  value={`https://zalo.me/s/4089738620528471173/?locationId=${locationId}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>ID: {locationId}</p>
                <p className="mt-1">In mã này và đặt tại quầy thu ngân</p>
              </div>
              <Button variant="outline" onClick={() => {
                const svg = document.getElementById('location-qr');
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    const pngFile = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.download = `QR-${location?.name || 'Location'}.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                  };
                  img.src = "data:image/svg+xml;base64," + btoa(svgData);
                }
              }}>
                <Download className="mr-2 h-4 w-4" />
                Tải mã QR
              </Button>
            </CardContent>
          </Card>

          {/* Rewards List */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Danh sách quà tặng
                </CardTitle>
                <CardDescription>
                  Các món quà khách hàng có thể đổi bằng điểm
                </CardDescription>
              </div>
              <Button onClick={() => { setEditingReward(null); setIsRewardModalOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm quà mới
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rewards.map((reward) => (
                  <div key={reward.id} className="border rounded-lg p-4 flex flex-col gap-3 relative group">
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={reward.image || '/icons/icon-512x512.png'} 
                        alt={reward.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icons/icon-512x512.png'
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{reward.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        {reward.pointsRequired} điểm
                      </Badge>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingReward(reward); setIsRewardModalOpen(true) }}>
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteReward(reward.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {rewards.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Chưa có quà tặng nào. Hãy thêm món quà đầu tiên!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reward Modal */}
      {isRewardModalOpen && (
        <RewardModal 
          isOpen={isRewardModalOpen} 
          onClose={() => setIsRewardModalOpen(false)}
          onSubmit={async (data: { name: string; description: string; pointsRequired: number; image: string; imageBase64?: string }) => {
            try {
              const url = editingReward ? `/api/rewards/${editingReward.id}` : '/api/rewards'
              const method = editingReward ? 'PATCH' : 'POST'
              const body = { ...data, locationId }

              const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              })

              if (!res.ok) throw new Error('Failed to save')
              
              fetchData() // Refresh list
              setIsRewardModalOpen(false)
              toast({ title: 'Thành công', description: 'Đã lưu thông tin quà tặng' })
            } catch (error) {
              toast({ title: 'Lỗi', description: 'Không thể lưu quà tặng', variant: 'destructive' })
            }
          }}
          initialData={editingReward}
        />
      )}
    </DashboardLayout>
  )
}

interface RewardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string; pointsRequired: number; image: string; imageBase64?: string }) => Promise<void>
  initialData?: Reward | null
}

function RewardModal({ isOpen, onClose, onSubmit, initialData }: RewardModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [pointsRequired, setPointsRequired] = useState(initialData?.pointsRequired?.toString() || '100')
  const [image, setImage] = useState(initialData?.image || '')
  const [imageBase64, setImageBase64] = useState('')
  const [previewImage, setPreviewImage] = useState(initialData?.image || '')
  const [submitting, setSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImageBase64(base64)
        setPreviewImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit({ name, description, pointsRequired: parseInt(pointsRequired), image, imageBase64 })
    setSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Sửa quà tặng' : 'Thêm quà tặng mới'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên quà tặng</label>
            <Input value={name} onChange={e => setName(e.target.value)} required placeholder="VD: Voucher 50k" />
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả chi tiết..." />
          </div>
          <div>
            <label className="text-sm font-medium">Điểm đổi quà</label>
            <Input type="number" value={pointsRequired} onChange={e => setPointsRequired(e.target.value)} required min={1} />
          </div>
          <div>
            <label className="text-sm font-medium">Hình ảnh</label>
            <div className="space-y-2 mt-1">
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange} 
              />
              <div className="text-xs text-muted-foreground text-center">- Hoặc -</div>
              <Input value={image} onChange={e => { setImage(e.target.value); setPreviewImage(e.target.value) }} placeholder="Nhập URL ảnh..." />
            </div>
            {previewImage && (
               <div className="mt-2 border rounded p-1 w-fit">
                 <img src={previewImage} className="h-20 w-20 object-cover rounded" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
               </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
