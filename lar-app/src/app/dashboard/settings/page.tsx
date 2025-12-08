'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Mail,
  Building2,
  Bell,
  MessageSquare,
  Sparkles,
  Key,
  CreditCard,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Shield,
  Globe,
  Palette,
} from 'lucide-react'

// Tabs Component (inline)
function Tabs({ 
  tabs, 
  activeTab, 
  onChange 
}: { 
  tabs: { id: string; label: string; icon: React.ReactNode }[]
  activeTab: string
  onChange: (id: string) => void 
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// Mock data
const mockProfile = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  company: 'Công ty TNHH ABC',
  phone: '0912 345 678',
}

const mockNotificationSettings = {
  emailNewReview: true,
  emailNegativeReview: true,
  emailWeeklyReport: true,
  zaloNewReview: false,
  zaloNegativeReview: true,
  pushEnabled: false,
}

const mockToneSettings = {
  defaultTone: 'FRIENDLY',
  customInstructions: '',
  includeBusinessName: true,
  includeManagerSignature: false,
  managerName: '',
}

const mockTemplates = [
  {
    id: '1',
    name: 'Cảm ơn đánh giá 5 sao',
    tone: 'FRIENDLY',
    content: 'Cảm ơn {customerName} đã dành 5 sao cho {businessName}! Chúng tôi rất vui khi bạn hài lòng với dịch vụ. Rất mong được phục vụ bạn trong lần tới!',
    useCount: 45,
  },
  {
    id: '2',
    name: 'Xin lỗi đánh giá tiêu cực',
    tone: 'EMPATHETIC',
    content: 'Chúng tôi thành thật xin lỗi về trải nghiệm không tốt của bạn. Vui lòng liên hệ hotline {phone} để chúng tôi có thể hỗ trợ và khắc phục. Cảm ơn bạn đã phản hồi.',
    useCount: 12,
  },
]

const toneOptions = [
  { value: 'FRIENDLY', label: 'Thân thiện', description: 'Gần gũi, tự nhiên' },
  { value: 'PROFESSIONAL', label: 'Chuyên nghiệp', description: 'Trang trọng, lịch sự' },
  { value: 'EMPATHETIC', label: 'Đồng cảm', description: 'Thấu hiểu, quan tâm' },
  { value: 'CONCISE', label: 'Ngắn gọn', description: 'Súc tích, trọng tâm' },
  { value: 'FORMAL', label: 'Trang trọng', description: 'Nghiêm túc, chuẩn mực' },
]

// Profile Tab
function ProfileTab() {
  const [profile, setProfile] = React.useState(mockProfile)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>
            Cập nhật thông tin tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Họ và tên</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tên công ty</label>
              <Input
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Bảo mật
          </CardTitle>
          <CardDescription>
            Quản lý mật khẩu và bảo mật tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mật khẩu hiện tại</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Mật khẩu mới</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline">Đổi mật khẩu</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Notifications Tab
function NotificationsTab() {
  const [settings, setSettings] = React.useState(mockNotificationSettings)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Cài đặt thông báo
        </CardTitle>
        <CardDescription>
          Tùy chỉnh cách bạn nhận thông báo về đánh giá mới
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Thông báo Email
          </h3>
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Đánh giá mới</p>
                <p className="text-sm text-muted-foreground">Nhận email khi có đánh giá mới</p>
              </div>
              <ToggleSwitch checked={settings.emailNewReview} onChange={() => handleToggle('emailNewReview')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Đánh giá tiêu cực</p>
                <p className="text-sm text-muted-foreground">Nhận email ngay khi có đánh giá 1-2 sao</p>
              </div>
              <ToggleSwitch checked={settings.emailNegativeReview} onChange={() => handleToggle('emailNegativeReview')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Báo cáo tuần</p>
                <p className="text-sm text-muted-foreground">Nhận email tổng kết mỗi tuần</p>
              </div>
              <ToggleSwitch checked={settings.emailWeeklyReport} onChange={() => handleToggle('emailWeeklyReport')} />
            </div>
          </div>
        </div>

        {/* Zalo Notifications */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Thông báo Zalo ZNS
          </h3>
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Đánh giá mới</p>
                <p className="text-sm text-muted-foreground">Nhận Zalo khi có đánh giá mới</p>
              </div>
              <ToggleSwitch checked={settings.zaloNewReview} onChange={() => handleToggle('zaloNewReview')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Đánh giá tiêu cực</p>
                <p className="text-sm text-muted-foreground">Nhận Zalo ngay khi có đánh giá tiêu cực</p>
              </div>
              <ToggleSwitch checked={settings.zaloNegativeReview} onChange={() => handleToggle('zaloNegativeReview')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Tone Settings Tab
function ToneSettingsTab() {
  const [settings, setSettings] = React.useState(mockToneSettings)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Cài đặt giọng điệu AI
        </CardTitle>
        <CardDescription>
          Tùy chỉnh cách AI tạo phản hồi cho doanh nghiệp của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Tone */}
        <div>
          <label className="text-sm font-medium">Giọng điệu mặc định</label>
          <Select
            value={settings.defaultTone}
            onValueChange={(value) => setSettings({ ...settings, defaultTone: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tone.label}</span>
                    <span className="text-muted-foreground">- {tone.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="text-sm font-medium">Hướng dẫn tùy chỉnh cho AI</label>
          <Textarea
            className="mt-2"
            placeholder="VD: Luôn nhắc khách hàng về chương trình khuyến mãi đang diễn ra. Đề cập hotline hỗ trợ khi cần..."
            value={settings.customInstructions}
            onChange={(e) => setSettings({ ...settings, customInstructions: e.target.value })}
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Các hướng dẫn này sẽ được thêm vào prompt khi AI tạo phản hồi
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeBusinessName"
              checked={settings.includeBusinessName}
              onChange={(e) => setSettings({ ...settings, includeBusinessName: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="includeBusinessName" className="text-sm">
              Luôn nhắc đến tên doanh nghiệp trong phản hồi
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeManagerSignature"
              checked={settings.includeManagerSignature}
              onChange={(e) => setSettings({ ...settings, includeManagerSignature: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="includeManagerSignature" className="text-sm">
              Thêm chữ ký người quản lý
            </label>
          </div>

          {settings.includeManagerSignature && (
            <div className="pl-7">
              <Input
                placeholder="Tên người quản lý (VD: Nguyễn Văn A - Quản lý)"
                value={settings.managerName}
                onChange={(e) => setSettings({ ...settings, managerName: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Templates Tab
function TemplatesTab() {
  const [templates, setTemplates] = React.useState(mockTemplates)
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState<typeof mockTemplates[0] | null>(null)

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa template này?')) {
      setTemplates(templates.filter(t => t.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Response Templates
              </CardTitle>
              <CardDescription>
                Tạo các mẫu phản hồi để sử dụng nhanh
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có template nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {toneOptions.find(t => t.value === template.tone)?.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Đã dùng {template.useCount} lần
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Biến có thể sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
            <code className="bg-muted px-2 py-1 rounded">{'{customerName}'}</code>
            <code className="bg-muted px-2 py-1 rounded">{'{businessName}'}</code>
            <code className="bg-muted px-2 py-1 rounded">{'{locationName}'}</code>
            <code className="bg-muted px-2 py-1 rounded">{'{rating}'}</code>
            <code className="bg-muted px-2 py-1 rounded">{'{phone}'}</code>
            <code className="bg-muted px-2 py-1 rounded">{'{managerName}'}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// API Keys Tab
function ApiKeysTab() {
  const [showKey, setShowKey] = React.useState<{ [key: string]: boolean }>({})

  const apiKeys = [
    {
      id: 'openai',
      name: 'OpenAI API Key',
      icon: <Sparkles className="h-5 w-5" />,
      description: 'Dùng cho GPT-4o-mini tạo phản hồi',
      value: 'sk-proj-xxxxxxxxxxxxxxxxxxxxx',
      connected: true,
    },
    {
      id: 'google',
      name: 'Google Business Profile',
      icon: <Globe className="h-5 w-5" />,
      description: 'OAuth credentials cho GBP',
      value: '',
      connected: true,
    },
    {
      id: 'zalo',
      name: 'Zalo OA API',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'App ID và Secret cho Zalo',
      value: '',
      connected: false,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys & Integrations
        </CardTitle>
        <CardDescription>
          Quản lý các kết nối API của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiKeys.map((api) => (
          <div
            key={api.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                {api.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{api.name}</h4>
                  {api.connected ? (
                    <Badge variant="success" className="text-xs gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Đã kết nối
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Chưa kết nối
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{api.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {api.connected ? 'Cấu hình' : 'Kết nối'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Billing Tab
function BillingTab() {
  const currentPlan = {
    name: 'Free',
    price: 0,
    aiResponses: { used: 8, limit: 10 },
    locations: { used: 1, limit: 1 },
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gói hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">
                {currentPlan.price === 0 ? 'Miễn phí' : `$${currentPlan.price}/tháng`}
              </p>
            </div>
            <Button>Nâng cấp gói</Button>
          </div>

          {/* Usage */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Phản hồi AI</span>
                <span>{currentPlan.aiResponses.used}/{currentPlan.aiResponses.limit}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(currentPlan.aiResponses.used / currentPlan.aiResponses.limit) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Địa điểm</span>
                <span>{currentPlan.locations.used}/{currentPlan.locations.limit}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${(currentPlan.locations.used / currentPlan.locations.limit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <Badge className="w-fit bg-blue-500">Hiện tại</Badge>
            <CardTitle>Free</CardTitle>
            <CardDescription>Dành cho cửa hàng đơn lẻ</CardDescription>
            <div className="text-3xl font-bold">$0<span className="text-base font-normal text-muted-foreground">/tháng</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                1 địa điểm
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                10 phản hồi AI/tháng
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Phân tích cảm xúc
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="secondary" className="w-fit">Phổ biến</Badge>
            <CardTitle>Essential</CardTitle>
            <CardDescription>Dành cho SME đa địa điểm</CardDescription>
            <div className="text-3xl font-bold">$19<span className="text-base font-normal text-muted-foreground">/tháng</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                5 địa điểm
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Phản hồi AI không giới hạn
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Tích hợp Zalo OA
              </li>
            </ul>
            <Button className="w-full">Nâng cấp</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Pro</Badge>
            <CardTitle>Professional</CardTitle>
            <CardDescription>Dành cho chuỗi cửa hàng</CardDescription>
            <div className="text-3xl font-bold">$49<span className="text-base font-normal text-muted-foreground">/tháng</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Địa điểm không giới hạn
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Phát hiện review ảo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Hỗ trợ ưu tiên
              </li>
            </ul>
            <Button variant="outline" className="w-full">Liên hệ</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('profile')

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: <User className="h-4 w-4" /> },
    { id: 'notifications', label: 'Thông báo', icon: <Bell className="h-4 w-4" /> },
    { id: 'tone', label: 'Giọng điệu AI', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'templates', label: 'Templates', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'api', label: 'API Keys', icon: <Key className="h-4 w-4" /> },
    { id: 'billing', label: 'Thanh toán', icon: <CreditCard className="h-4 w-4" /> },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cài Đặt</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản và tùy chỉnh ứng dụng
          </p>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="pt-2">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'tone' && <ToneSettingsTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'api' && <ApiKeysTab />}
          {activeTab === 'billing' && <BillingTab />}
        </div>
      </div>
    </DashboardLayout>
  )
}
