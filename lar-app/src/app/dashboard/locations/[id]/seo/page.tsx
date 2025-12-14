'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'

interface AuditItem {
  category: string
  item: string
  status: 'PASS' | 'WARNING' | 'FAIL'
  score: number
  maxScore: number
  message: string
}

interface AuditData {
  overallScore: number
  auditResults: AuditItem[]
  locationName: string
}

export default function SeoAuditPage() {
  const params = useParams()
  const router = useRouter()
  const locationId = params.id as string
  
  const [data, setData] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAudit = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/locations/${locationId}/seo-audit`)
      if (!res.ok) throw new Error('Failed to fetch audit data')
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError('Không thể tải dữ liệu audit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudit()
  }, [locationId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'FAIL': return <XCircle className="h-5 w-5 text-red-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-50 border-green-200'
      case 'WARNING': return 'bg-yellow-50 border-yellow-200'
      case 'FAIL': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <p className="text-red-500">{error || 'Đã xảy ra lỗi'}</p>
          <Button onClick={fetchAudit}>Thử lại</Button>
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
            <h1 className="text-2xl font-bold tracking-tight">SEO Audit: {data.locationName}</h1>
            <p className="text-muted-foreground">Kiểm tra sức khỏe danh tiếng và tối ưu hóa hiển thị</p>
          </div>
          <div className="ml-auto">
            <Button variant="outline" onClick={fetchAudit}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Quét lại
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium opacity-90">Điểm SEO Tổng Quan</h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{data.overallScore}</span>
                  <span className="text-xl opacity-75">/ 100</span>
                </div>
              </div>
              <div className="h-24 w-24 rounded-full border-4 border-white/30 flex items-center justify-center">
                <span className="text-3xl font-bold">{data.overallScore}%</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2 opacity-90">
                <span>Cần cải thiện</span>
                <span>Tuyệt vời</span>
              </div>
              <Progress value={data.overallScore} className="h-2 bg-white/20" indicatorClassName="bg-white" />
            </div>
          </div>
        </Card>

        {/* Audit Details */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Categories */}
          {['Profile', 'Reputation', 'Engagement'].map((category) => {
            const items = data.auditResults.filter(i => i.category === category)
            const categoryScore = items.reduce((acc, i) => acc + i.score, 0)
            const categoryMax = items.reduce((acc, i) => acc + i.maxScore, 0)
            const percent = Math.round((categoryScore / categoryMax) * 100)

            return (
              <Card key={category} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category === 'Profile' ? 'Hồ sơ' : category === 'Reputation' ? 'Uy tín' : 'Tương tác'}</CardTitle>
                    <Badge variant={percent >= 80 ? 'default' : percent >= 50 ? 'secondary' : 'destructive'}>
                      {percent}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getStatusColor(item.status)}`}>
                      <div className="flex items-start gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium text-sm">{item.item}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Đề xuất cải thiện</CardTitle>
            <CardDescription>Các hành động cần thực hiện để tối ưu hóa hồ sơ của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.auditResults.filter(i => i.status !== 'PASS').length === 0 ? (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle2 className="h-6 w-6" />
                  <p className="font-medium">Tuyệt vời! Hồ sơ của bạn đã được tối ưu hóa hoàn toàn.</p>
                </div>
              ) : (
                data.auditResults.filter(i => i.status !== 'PASS').map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border-b last:border-0">
                    <div className="mt-0.5">
                      {item.status === 'FAIL' ? (
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Cải thiện {item.item.toLowerCase()}</p>
                      <p className="text-sm text-muted-foreground">{item.message}</p>
                      {item.category === 'Engagement' && (
                        <Button variant="link" className="h-auto p-0 text-blue-600 mt-1" onClick={() => router.push('/dashboard/reviews')}>
                          Đi tới quản lý đánh giá &rarr;
                        </Button>
                      )}
                      {item.category === 'Profile' && (
                        <Button variant="link" className="h-auto p-0 text-blue-600 mt-1" onClick={() => router.push(`/dashboard/locations/${locationId}/settings`)}>
                          Cập nhật hồ sơ &rarr;
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
