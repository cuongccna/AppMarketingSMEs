'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Sparkles,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">LAR</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Liên Hệ Với Chúng Tôi</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Bạn có câu hỏi hoặc cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn sàng giúp đỡ bạn. 
            Hãy liên hệ ngay!
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a 
                      href="mailto:cuong.vhcc@gmail.com" 
                      className="text-blue-600 hover:underline"
                    >
                      cuong.vhcc@gmail.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Phản hồi trong vòng 24 giờ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Hotline</h3>
                    <a 
                      href="tel:0987939605" 
                      className="text-green-600 hover:underline text-lg font-medium"
                    >
                      0987 939 605
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Thứ 2 - Thứ 6: 8:00 - 18:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Địa chỉ</h3>
                    <p className="text-gray-700">
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Hỗ trợ từ xa toàn quốc
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Giờ làm việc</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Thứ 2 - Thứ 6:</span> 8:00 - 18:00</p>
                      <p><span className="text-muted-foreground">Thứ 7:</span> 8:00 - 12:00</p>
                      <p><span className="text-muted-foreground">Chủ nhật:</span> Nghỉ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Gửi tin nhắn cho chúng tôi
                </CardTitle>
                <CardDescription>
                  Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Cảm ơn bạn đã liên hệ!</h3>
                    <p className="text-muted-foreground mb-6">
                      Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Gửi tin nhắn khác
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Nguyễn Văn A"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Số điện thoại
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="0912 345 678"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Chủ đề <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="VD: Hỏi về gói dịch vụ"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Nội dung tin nhắn <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Mô tả chi tiết câu hỏi hoặc yêu cầu của bạn..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="text-red-500">*</span> Thông tin bắt buộc
                      </p>
                      <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Gửi tin nhắn
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* FAQ Teaser */}
            <Card className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Câu hỏi thường gặp</h3>
                    <p className="text-sm text-muted-foreground">
                      Có thể câu hỏi của bạn đã được giải đáp trong phần FAQ
                    </p>
                  </div>
                  <Link href="/#faq">
                    <Button variant="outline">
                      Xem FAQ
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">LAR - AI Danh Tiếng Việt</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-gray-700">Điều khoản</Link>
              <Link href="/privacy" className="hover:text-gray-700">Bảo mật</Link>
              <Link href="/contact" className="hover:text-gray-700">Liên hệ</Link>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 LAR. Được phát triển cho SME Việt Nam.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
