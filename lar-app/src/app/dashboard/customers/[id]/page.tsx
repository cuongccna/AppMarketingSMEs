'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, Star, Save, Trash2, User, Phone, Mail, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface CustomerDetail {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  tags: string[]
  business: { name: string }
  reviews: any[]
  transactions: any[]
  createdAt: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    tags: '',
  })

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch customer')
        const data = await res.json()
        setCustomer(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          notes: data.notes || '',
          tags: data.tags.join(', '),
        })
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải thông tin khách hàng',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomer()
  }, [params.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t)
      
      const res = await fetch(`/api/customers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin khách hàng',
      })
      
      // Refresh data
      const updated = await res.json()
      setCustomer(prev => prev ? { ...prev, ...updated } : null)
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thay đổi',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast({
        title: 'Thành công',
        description: 'Đã xóa khách hàng',
      })
      router.push('/dashboard/customers')
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa khách hàng',
        variant: 'destructive',
      })
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Khách hàng không tồn tại</div>
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
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">
              Khách hàng của {customer.business.name}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Info */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tên</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags (phân cách bằng dấu phẩy)</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="VIP, Khách quen..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ghi chú nội bộ</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ngày tham gia</span>
                  <span className="font-medium">
                    {format(new Date(customer.createdAt), 'dd/MM/yyyy')}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tổng đánh giá</span>
                  <span className="font-medium">{customer.reviews.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Giao dịch điểm</span>
                  <span className="font-medium">{customer.transactions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: History */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử đánh giá</CardTitle>
                <CardDescription>Các đánh giá khách hàng đã gửi</CardDescription>
              </CardHeader>
              <CardContent>
                {customer.reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có đánh giá nào
                  </div>
                ) : (
                  <div className="space-y-6">
                    {customer.reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(review.publishedAt), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <Badge variant="outline">{review.platform}</Badge>
                        </div>
                        <p className="text-sm mb-2">{review.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {review.location.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
