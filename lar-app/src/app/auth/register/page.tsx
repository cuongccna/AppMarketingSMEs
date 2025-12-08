'use client'

import React from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Mail, Lock, User, Chrome, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Có lỗi xảy ra')
      } else {
        // Auto sign in after registration
        await signIn('credentials', {
          email,
          password,
          callbackUrl: '/dashboard',
        })
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl flex gap-8">
        {/* Benefits Section */}
        <div className="hidden lg:flex flex-col justify-center flex-1 p-8">
          <h2 className="text-3xl font-bold mb-6">
            Bắt đầu quản lý danh tiếng
            <br />
            <span className="text-blue-600">miễn phí ngay hôm nay</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Thiết lập trong 5 phút</p>
                <p className="text-sm text-gray-600">
                  Kết nối Google Business Profile của bạn và bắt đầu ngay
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">10 phản hồi AI miễn phí/tháng</p>
                <p className="text-sm text-gray-600">
                  Trải nghiệm sức mạnh AI mà không tốn chi phí
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Không cần thẻ tín dụng</p>
                <p className="text-sm text-gray-600">
                  Đăng ký miễn phí, nâng cấp khi bạn sẵn sàng
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Hỗ trợ tiếng Việt hoàn toàn</p>
                <p className="text-sm text-gray-600">
                  AI tạo phản hồi tự nhiên như người Việt viết
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Tạo tài khoản LAR</CardTitle>
            <CardDescription>
              Bắt đầu quản lý danh tiếng bằng AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Họ tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Điều khoản sử dụng
                </Link>
                {' '}và{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Chính sách bảo mật
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản miễn phí'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Hoặc</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Đăng ký với Google
            </Button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Đăng nhập
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
