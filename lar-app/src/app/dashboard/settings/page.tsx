'use client'

import React, { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
  AlertCircle,
} from 'lucide-react'
import { useProfile, useNotifications, useAIConfig, useTemplates } from '@/hooks'

// Tabs Component
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

// Toast notification helper
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

const toneOptions = [
  { value: 'FRIENDLY', label: 'Thân thiện', description: 'Gần gũi, tự nhiên' },
  { value: 'PROFESSIONAL', label: 'Chuyên nghiệp', description: 'Trang trọng, lịch sự' },
  { value: 'EMPATHETIC', label: 'Đồng cảm', description: 'Thấu hiểu, quan tâm' },
  { value: 'CONCISE', label: 'Ngắn gọn', description: 'Súc tích, trọng tâm' },
  { value: 'FORMAL', label: 'Trang trọng', description: 'Nghiêm túc, chuẩn mực' },
]

const modelOptions = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Nhanh, tiết kiệm chi phí' },
  { value: 'gpt-4o', label: 'GPT-4o', description: 'Mạnh mẽ nhất' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Google AI, nhanh' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Google AI, mạnh' },
]

// Profile Tab with real API
function ProfileTab() {
  const { profile, isLoading, error, fetchProfile, updateProfile, changePassword } = useProfile()
  const [localProfile, setLocalProfile] = React.useState({
    name: '',
    phone: '',
    company: '',
  })
  const [passwords, setPasswords] = React.useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile) {
      setLocalProfile({
        name: profile.name || '',
        phone: profile.phone || '',
        company: profile.company || '',
      })
    }
  }, [profile])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    const success = await updateProfile(localProfile)
    setIsSaving(false)
    if (success) {
      showToast('Đã lưu thông tin thành công!')
    } else {
      showToast(error || 'Có lỗi xảy ra', 'error')
    }
  }

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showToast('Mật khẩu mới không khớp', 'error')
      return
    }
    if (passwords.new.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error')
      return
    }
    setIsSaving(true)
    const success = await changePassword(passwords.current, passwords.new)
    setIsSaving(false)
    if (success) {
      showToast('Đã đổi mật khẩu thành công!')
      setPasswords({ current: '', new: '', confirm: '' })
    } else {
      showToast(error || 'Có lỗi xảy ra', 'error')
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
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
                value={localProfile.name}
                onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tên công ty</label>
              <Input
                value={localProfile.company}
                onChange={(e) => setLocalProfile({ ...localProfile, company: e.target.value })}
                placeholder="Công ty của bạn"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input
                value={localProfile.phone}
                onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
                placeholder="0912 345 678"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Mật khẩu mới</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={handleChangePassword}
                disabled={isSaving || !passwords.current || !passwords.new}
              >
                {isSaving ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Notifications Tab with real API
function NotificationsTab() {
  const { settings, isLoading, error, fetchSettings, updateSettings } = useNotifications()
  const [localSettings, setLocalSettings] = React.useState({
    emailNewReview: true,
    emailNegativeReview: true,
    emailWeeklyReport: true,
    zaloNewReview: false,
    zaloNegativeReview: true,
    pushEnabled: false,
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggle = (key: keyof typeof localSettings) => {
    setLocalSettings({ ...localSettings, [key]: !localSettings[key] })
  }

  const handleSave = async () => {
    setIsSaving(true)
    const success = await updateSettings(localSettings)
    setIsSaving(false)
    if (success) {
      showToast('Đã lưu cài đặt thông báo!')
    } else {
      showToast(error || 'Có lỗi xảy ra', 'error')
    }
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

  if (isLoading && !settings) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {toast && <Toast message={toast.message} type={toast.type} />}
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
              <ToggleSwitch checked={localSettings.emailNewReview} onChange={() => handleToggle('emailNewReview')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Đánh giá tiêu cực</p>
                <p className="text-sm text-muted-foreground">Nhận email ngay khi có đánh giá 1-2 sao</p>
              </div>
              <ToggleSwitch checked={localSettings.emailNegativeReview} onChange={() => handleToggle('emailNegativeReview')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Báo cáo tuần</p>
                <p className="text-sm text-muted-foreground">Nhận email tổng kết mỗi tuần</p>
              </div>
              <ToggleSwitch checked={localSettings.emailWeeklyReport} onChange={() => handleToggle('emailWeeklyReport')} />
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
              <ToggleSwitch checked={localSettings.zaloNewReview} onChange={() => handleToggle('zaloNewReview')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Đánh giá tiêu cực</p>
                <p className="text-sm text-muted-foreground">Nhận Zalo ngay khi có đánh giá tiêu cực</p>
              </div>
              <ToggleSwitch checked={localSettings.zaloNegativeReview} onChange={() => handleToggle('zaloNegativeReview')} />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Push Notifications
          </h3>
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Bật thông báo đẩy</p>
                <p className="text-sm text-muted-foreground">Nhận thông báo trên trình duyệt</p>
              </div>
              <ToggleSwitch checked={localSettings.pushEnabled} onChange={() => handleToggle('pushEnabled')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Tone Settings Tab with real API
function ToneSettingsTab() {
  const { config, isLoading, error, fetchConfig, updateConfig } = useAIConfig()
  const [localConfig, setLocalConfig] = React.useState({
    defaultTone: 'FRIENDLY',
    customInstructions: '',
    includeBusinessName: true,
    includeManagerSignature: false,
    managerName: '',
    preferredModel: 'gpt-4o-mini',
    autoGenerateResponses: false,
  })
  const [isSaving, setIsSaving] = React.useState(false)
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const success = await updateConfig(localConfig)
    setIsSaving(false)
    if (success) {
      showToast('Đã lưu cài đặt AI!')
    } else {
      showToast(error || 'Có lỗi xảy ra', 'error')
    }
  }

  if (isLoading && !config) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {toast && <Toast message={toast.message} type={toast.type} />}
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
        {/* AI Model */}
        <div>
          <label className="text-sm font-medium">Model AI</label>
          <Select
            value={localConfig.preferredModel}
            onValueChange={(value) => setLocalConfig({ ...localConfig, preferredModel: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.label}</span>
                    <span className="text-muted-foreground">- {model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Default Tone */}
        <div>
          <label className="text-sm font-medium">Giọng điệu mặc định</label>
          <Select
            value={localConfig.defaultTone}
            onValueChange={(value) => setLocalConfig({ ...localConfig, defaultTone: value })}
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
            value={localConfig.customInstructions}
            onChange={(e) => setLocalConfig({ ...localConfig, customInstructions: e.target.value })}
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
              id="autoGenerateResponses"
              checked={localConfig.autoGenerateResponses}
              onChange={(e) => setLocalConfig({ ...localConfig, autoGenerateResponses: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="autoGenerateResponses" className="text-sm">
              Tự động tạo phản hồi AI cho đánh giá mới
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeBusinessName"
              checked={localConfig.includeBusinessName}
              onChange={(e) => setLocalConfig({ ...localConfig, includeBusinessName: e.target.checked })}
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
              checked={localConfig.includeManagerSignature}
              onChange={(e) => setLocalConfig({ ...localConfig, includeManagerSignature: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="includeManagerSignature" className="text-sm">
              Thêm chữ ký người quản lý
            </label>
          </div>

          {localConfig.includeManagerSignature && (
            <div className="pl-7">
              <Input
                placeholder="Tên người quản lý (VD: Nguyễn Văn A - Quản lý)"
                value={localConfig.managerName}
                onChange={(e) => setLocalConfig({ ...localConfig, managerName: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Templates Tab with real API
function TemplatesTab() {
  const { templates, isLoading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useTemplates()
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState<typeof templates[0] | null>(null)
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa template này?')) {
      const success = await deleteTemplate(id)
      if (success) {
        showToast('Đã xóa template!')
      } else {
        showToast('Không thể xóa template', 'error')
      }
    }
  }

  const handleCreateTemplate = async (data: { name: string; content: string; tone: string }) => {
    const result = await createTemplate(data)
    if (result) {
      showToast('Đã tạo template mới!')
      setShowAddModal(false)
    } else {
      showToast('Không thể tạo template', 'error')
    }
  }

  if (isLoading && templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
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
              <Button variant="outline" className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo template đầu tiên
              </Button>
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
                          {toneOptions.find(t => t.value === template.tone)?.label || template.tone}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Đã dùng {template.usageCount} lần
                        </span>
                        {!template.userId && (
                          <Badge variant="secondary" className="text-xs">Hệ thống</Badge>
                        )}
                      </div>
                    </div>
                    {template.userId && (
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
                    )}
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

      {/* Add Template Modal */}
      {showAddModal && (
        <AddTemplateModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateTemplate}
        />
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSubmit={async (data) => {
            const result = await updateTemplate(editingTemplate.id, data)
            if (result) {
              showToast('Đã cập nhật template!')
              setEditingTemplate(null)
            } else {
              showToast('Không thể cập nhật template', 'error')
            }
          }}
        />
      )}
    </div>
  )
}

// Add Template Modal
function AddTemplateModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (data: { name: string; content: string; tone: string }) => void
}) {
  const [name, setName] = React.useState('')
  const [content, setContent] = React.useState('')
  const [tone, setTone] = React.useState('PROFESSIONAL')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onSubmit({ name, content, tone })
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
        <h2 className="text-xl font-bold mb-4">Thêm Template Mới</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên template</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cảm ơn đánh giá 5 sao"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Giọng điệu</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Nội dung</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cảm ơn {customerName} đã dành thời gian đánh giá {businessName}..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !name || !content}>
              {isLoading ? 'Đang tạo...' : 'Tạo template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Template Modal
function EditTemplateModal({ template, onClose, onSubmit }: {
  template: { id: string; name: string; content: string; tone: string }
  onClose: () => void
  onSubmit: (data: { name: string; content: string; tone: string }) => void
}) {
  const [name, setName] = React.useState(template.name)
  const [content, setContent] = React.useState(template.content)
  const [tone, setTone] = React.useState(template.tone)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onSubmit({ name, content, tone })
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa Template</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tên template</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Giọng điệu</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Nội dung</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !name || !content}>
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// API Keys Tab
function ApiKeysTab() {
  const apiKeys = [
    {
      id: 'openai',
      name: 'OpenAI API Key',
      icon: <Sparkles className="h-5 w-5" />,
      description: 'Dùng cho GPT-4o-mini tạo phản hồi',
      connected: true,
    },
    {
      id: 'google',
      name: 'Google Business Profile',
      icon: <Globe className="h-5 w-5" />,
      description: 'OAuth credentials cho GBP',
      connected: true,
    },
    {
      id: 'zalo',
      name: 'Zalo OA API',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'App ID và Secret cho Zalo',
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
          Quản lý các kết nối API của bạn. API keys được cấu hình bởi quản trị viên.
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
                    <Badge className="text-xs gap-1 bg-green-100 text-green-800">
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
              {api.connected ? 'Xem chi tiết' : 'Liên hệ Admin'}
            </Button>
          </div>
        ))}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            API keys được quản lý ở cấp hệ thống để đảm bảo bảo mật.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Billing Tab
function BillingTab() {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleUpgrade = async (plan: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      
      if (response.ok) {
        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentPlan = {
    name: 'Free',
    price: 0,
    aiResponses: { used: 8, limit: 10 },
    locations: { used: 1, limit: 1 },
  }

  return (
    <div className="space-y-6">
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
            <Button onClick={() => handleUpgrade('ESSENTIAL')} disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Nâng cấp gói'}
            </Button>
          </div>

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

        <Card className="border-2 border-purple-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-lg">
            Phổ biến
          </div>
          <CardHeader>
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
            <Button 
              className="w-full" 
              onClick={() => handleUpgrade('ESSENTIAL')}
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Nâng cấp'}
            </Button>
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
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleUpgrade('PROFESSIONAL')}
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Liên hệ'}
            </Button>
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
