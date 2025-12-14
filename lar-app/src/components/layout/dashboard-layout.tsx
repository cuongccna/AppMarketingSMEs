'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  MessageSquare,
  Building2,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bell,
  User,
  CreditCard,
  ThumbsDown,
  Zap,
  CheckCircle2,
  ExternalLink,
  Users,
  ScanLine,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SubscriptionModal } from '@/components/subscription/subscription-modal'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Đánh Giá', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'Doanh Nghiệp', href: '/dashboard/businesses', icon: Building2 },
  { name: 'Địa Điểm', href: '/dashboard/locations', icon: MapPin },
  { name: 'Khách Hàng', href: '/dashboard/customers', icon: Users },
  { name: 'Quét QR', href: '/dashboard/scan', icon: ScanLine },
  { name: 'Phân Tích', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Cài Đặt', href: '/dashboard/settings', icon: Settings },
]

type Notification = {
  id: string
  type: string
  title: string
  message: string
  time: string
  read: boolean
  link: string
}

// Notification Dropdown Component
function NotificationDropdown({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'negative_review':
        return <ThumbsDown className="h-4 w-4 text-red-600" />
      case 'ai_ready':
        return <Sparkles className="h-4 w-4 text-blue-600" />
      case 'new_review':
        return <MessageSquare className="h-4 w-4 text-green-600" />
      case 'sync_complete':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có thông báo mới</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link}
              onClick={onClose}
              className={cn(
                "flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-0",
                !notification.read && "bg-blue-50/50"
              )}
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !notification.read && "font-medium")}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.time}
                </p>
              </div>
              {!notification.read && (
                <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600 mt-2" />
              )}
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-2">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 py-2"
        >
          Xem tất cả thông báo
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

// User Dropdown Component
function UserDropdown({ 
  isOpen, 
  onClose,
  user 
}: { 
  isOpen: boolean
  onClose: () => void
  user: { name?: string | null; email?: string | null } | undefined
}) {
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border z-50 overflow-hidden"
    >
      {/* User Info */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <p className="font-medium truncate">{user?.name || 'User'}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          <User className="h-4 w-4" />
          Hồ sơ cá nhân
        </Link>
        <Link
          href="/dashboard/settings?tab=billing"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Thanh toán
        </Link>
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Cài đặt
        </Link>
      </div>

      {/* Logout */}
      <div className="border-t py-2">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [notificationOpen, setNotificationOpen] = React.useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <img 
              src="/images/logo.svg" 
              alt="LAR Logo" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="font-bold text-lg">LAR</h1>
              <p className="text-xs text-muted-foreground">AI Danh Tiếng Việt</p>
            </div>
            <button
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Subscription Status */}
          <div className="px-3 py-4 border-t">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Gói Free</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                8/10 phản hồi AI còn lại
              </p>
              <Button 
                size="sm" 
                className="w-full" 
                variant="default"
                onClick={() => setSubscriptionModalOpen(true)}
              >
                Nâng cấp
              </Button>
            </div>
          </div>

          {/* User */}
          <div className="px-3 py-4 border-t">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1" />

            {/* Notification Button with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationOpen(!notificationOpen)
                  setUserDropdownOpen(false)
                }}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              <NotificationDropdown 
                isOpen={notificationOpen} 
                onClose={() => setNotificationOpen(false)} 
              />
            </div>

            {/* User Button with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen)
                  setNotificationOpen(false)
                }}
                className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
              </button>
              <UserDropdown 
                isOpen={userDropdownOpen} 
                onClose={() => setUserDropdownOpen(false)}
                user={session?.user}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        currentPlan="FREE"
      />
    </div>
  )
}
