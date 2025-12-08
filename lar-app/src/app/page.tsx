'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ChevronDown,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">LAR</span>
            <Badge variant="secondary" className="ml-2">Beta</Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Tính năng
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Bảng giá
            </Link>
            <Link href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Dùng thử miễn phí</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="outline" className="mb-4">
          🚀 Tiết kiệm 90% thời gian quản lý đánh giá
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quản Lý Danh Tiếng Địa Phương
          <br />Bằng AI Cho SME Việt Nam
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Tự động hóa việc phản hồi đánh giá khách hàng trên Google Business Profile và Zalo OA. 
          Duy trì danh tiếng chuyên nghiệp 24/7 với chi phí thấp hơn thuê nhân viên.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8">
              Bắt đầu miễn phí
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Xem demo
            </Button>
          </Link>
        </div>
        
        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Bảo mật cao</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Thiết lập 5 phút</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            <span>Hỗ trợ tiếng Việt</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Tính Năng Nổi Bật</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            LAR giúp SME Việt Nam quản lý danh tiếng trực tuyến một cách thông minh và hiệu quả
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Phản Hồi AI Thông Minh</CardTitle>
              <CardDescription>
                Tự động tạo phản hồi cá nhân hóa cho mỗi đánh giá, phù hợp với giọng điệu thương hiệu của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  5 giọng điệu khác nhau
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Hỗ trợ tiếng Việt tự nhiên
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Phê duyệt trước khi gửi
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Tích Hợp Đa Nền Tảng</CardTitle>
              <CardDescription>
                Kết nối với Google Business Profile và Zalo OA - hai nền tảng quan trọng nhất cho SME Việt Nam.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Google Business Profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Zalo Official Account
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Đồng bộ tự động
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Phân Tích Cảm Xúc</CardTitle>
              <CardDescription>
                Tự động phân loại đánh giá theo cảm xúc và trích xuất từ khóa quan trọng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Tích cực / Tiêu cực / Trung lập
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Từ khóa phổ biến
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Xu hướng theo thời gian
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Thông Báo Thời Gian Thực</CardTitle>
              <CardDescription>
                Nhận thông báo ngay khi có đánh giá mới qua Zalo hoặc Email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Thông báo Zalo ZNS
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Email alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Ưu tiên đánh giá tiêu cực
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Phát Hiện Review Ảo</CardTitle>
              <CardDescription>
                AI phát hiện các đánh giá đáng ngờ, bảo vệ doanh nghiệp khỏi review seeding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Phân tích hành vi
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Cảnh báo tự động
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Báo cáo chi tiết
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Báo Cáo Chi Tiết</CardTitle>
              <CardDescription>
                Dashboard trực quan với các số liệu quan trọng để cải thiện dịch vụ.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Điểm trung bình
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Tỷ lệ phản hồi
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  So sánh địa điểm
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Bảng Giá Đơn Giản</h2>
          <p className="text-gray-600">
            Chọn gói phù hợp với quy mô doanh nghiệp của bạn
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Dành cho cửa hàng đơn lẻ</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/tháng</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  1 địa điểm GBP
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  10 phản hồi AI/tháng
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Phân tích cảm xúc cơ bản
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Zalo OA (không có)
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Bắt đầu miễn phí
              </Button>
            </CardContent>
          </Card>

          {/* Essential Plan */}
          <Card className="relative border-2 border-blue-500">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-500">Phổ biến nhất</Badge>
            </div>
            <CardHeader>
              <CardTitle>Essential</CardTitle>
              <CardDescription>Dành cho SME đa địa điểm</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-gray-500">/tháng</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  5 địa điểm GBP
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Phản hồi AI không giới hạn
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Tích hợp Zalo OA
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Thông báo Zalo ZNS
                </li>
              </ul>
              <Button className="w-full">
                Dùng thử 14 ngày
              </Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>Dành cho chuỗi cửa hàng</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-gray-500">/tháng</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Địa điểm không giới hạn
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Mọi tính năng Essential
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Phát hiện review ảo
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Hỗ trợ ưu tiên
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Liên hệ
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Xem LAR Hoạt Động</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm cách LAR giúp bạn quản lý đánh giá khách hàng một cách thông minh và hiệu quả
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Demo Video Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center relative overflow-hidden border">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="text-center z-10">
              <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-105 transition-transform">
                <div className="h-0 w-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-blue-600 border-b-[12px] border-b-transparent ml-1" />
              </div>
              <p className="text-gray-600 font-medium">Xem video demo (2 phút)</p>
            </div>
          </div>

          {/* Demo Steps */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Kết nối GBP</h3>
              <p className="text-sm text-gray-600">Đăng nhập và kết nối Google Business Profile của bạn chỉ trong 2 phút</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Tạo Phản Hồi</h3>
              <p className="text-sm text-gray-600">AI tự động phân tích và tạo phản hồi phù hợp với từng đánh giá</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Duyệt & Gửi</h3>
              <p className="text-sm text-gray-600">Xem trước, chỉnh sửa nếu cần và gửi phản hồi chỉ với một click</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Câu Hỏi Thường Gặp</h2>
          <p className="text-gray-600">
            Những thắc mắc phổ biến về LAR
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <FaqItem 
            question="LAR có miễn phí không?" 
            answer="Có! Gói Free cho phép bạn quản lý 1 địa điểm và sử dụng 10 phản hồi AI mỗi tháng hoàn toàn miễn phí. Bạn có thể nâng cấp lên gói Essential hoặc Professional khi cần thêm tính năng."
          />
          <FaqItem 
            question="LAR có hỗ trợ tiếng Việt không?" 
            answer="Có! LAR được thiết kế đặc biệt cho thị trường Việt Nam. AI của chúng tôi hiểu và tạo phản hồi bằng tiếng Việt tự nhiên, phù hợp với văn hóa giao tiếp của người Việt."
          />
          <FaqItem 
            question="Làm sao để kết nối Google Business Profile?" 
            answer="Rất đơn giản! Sau khi đăng ký, bạn chỉ cần click 'Kết nối GBP', đăng nhập tài khoản Google và chọn địa điểm kinh doanh. Quá trình chỉ mất khoảng 2 phút."
          />
          <FaqItem 
            question="Phản hồi AI có được gửi tự động không?" 
            answer="Không! Để đảm bảo chất lượng, mọi phản hồi AI đều phải được bạn xem trước và phê duyệt trước khi gửi. Bạn có thể chỉnh sửa nội dung nếu cần."
          />
          <FaqItem 
            question="LAR có phát hiện được review ảo không?" 
            answer="Có, tính năng này có trong gói Professional. AI sẽ phân tích các đặc điểm của đánh giá để phát hiện các review đáng ngờ và cảnh báo cho bạn."
          />
          <FaqItem 
            question="Tôi có thể hủy subscription bất cứ lúc nào không?" 
            answer="Có! Bạn có thể hủy subscription bất cứ lúc nào. Sau khi hủy, bạn vẫn có thể sử dụng dịch vụ đến hết chu kỳ thanh toán hiện tại."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng nâng cao danh tiếng doanh nghiệp?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn SME Việt Nam đang sử dụng LAR để quản lý đánh giá khách hàng một cách thông minh.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Bắt đầu miễn phí ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">LAR</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Nền tảng quản lý danh tiếng địa phương bằng AI dành cho doanh nghiệp vừa và nhỏ Việt Nam.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> TP. Hồ Chí Minh, Việt Nam
                </p>
                <p className="flex items-center gap-2">
                  📧 cuong.vhcc@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  📞 0987 939 605
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-blue-600">Tính năng</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600">Bảng giá</Link></li>
                <li><Link href="#faq" className="hover:text-blue-600">Câu hỏi thường gặp</Link></li>
                <li><Link href="#demo" className="hover:text-blue-600">Demo</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Pháp lý</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/terms" className="hover:text-blue-600">Điều khoản sử dụng</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600">Chính sách bảo mật</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600">Liên hệ</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 LAR - Local AI Responder. Được phát triển cho SME Việt Nam.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-gray-700">Điều khoản</Link>
              <Link href="/privacy" className="hover:text-gray-700">Bảo mật</Link>
              <Link href="/contact" className="hover:text-gray-700">Liên hệ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// FAQ Item Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  )
}
