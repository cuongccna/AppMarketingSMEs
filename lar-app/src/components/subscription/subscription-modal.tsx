'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
} from 'lucide-react'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: 'FREE' | 'ESSENTIAL' | 'PROFESSIONAL'
}

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    description: 'Dành cho cửa hàng đơn lẻ',
    features: [
      '1 địa điểm GBP',
      '10 phản hồi AI/tháng',
      'Phân tích cảm xúc cơ bản',
      'Email hỗ trợ',
    ],
    limitations: [
      'Không có Zalo OA',
      'Không phát hiện review ảo',
    ],
    buttonText: 'Gói hiện tại',
    buttonVariant: 'outline' as const,
    popular: false,
  },
  {
    id: 'ESSENTIAL',
    name: 'Essential',
    price: 19,
    description: 'Dành cho SME đa địa điểm',
    features: [
      '5 địa điểm GBP',
      'Phản hồi AI không giới hạn',
      'Tích hợp Zalo OA',
      'Thông báo Zalo ZNS',
      'Phân tích nâng cao',
      'Hỗ trợ chat',
    ],
    limitations: [],
    buttonText: 'Nâng cấp ngay',
    buttonVariant: 'default' as const,
    popular: true,
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 49,
    description: 'Dành cho chuỗi cửa hàng',
    features: [
      'Địa điểm không giới hạn',
      'Mọi tính năng Essential',
      'Phát hiện review ảo AI',
      'API access',
      'White-label reports',
      'Hỗ trợ ưu tiên 24/7',
      'Account manager riêng',
    ],
    limitations: [],
    buttonText: 'Liên hệ',
    buttonVariant: 'outline' as const,
    popular: false,
  },
]

export function SubscriptionModal({ isOpen, onClose, currentPlan = 'FREE' }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [step, setStep] = React.useState<'select' | 'payment'>('select')

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlan) return
    setSelectedPlan(planId)
  }

  const handleProceedToPayment = () => {
    if (selectedPlan === 'PROFESSIONAL') {
      // Open contact form or email
      window.location.href = 'mailto:sales@lar.vn?subject=Đăng ký gói Professional'
      return
    }
    setStep('payment')
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate Stripe checkout
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    alert('Chức năng thanh toán Stripe sẽ được tích hợp trong phiên bản production!')
    onClose()
  }

  const handleClose = () => {
    setStep('select')
    setSelectedPlan(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              {step === 'select' ? 'Chọn gói phù hợp' : 'Thanh toán'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {step === 'select' 
                ? 'Nâng cấp để mở khóa thêm tính năng' 
                : 'Hoàn tất thanh toán để kích hoạt gói mới'
              }
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {step === 'select' ? (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan
                const isSelected = plan.id === selectedPlan

                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      isCurrentPlan
                        ? 'border-blue-500 bg-blue-50/50'
                        : isSelected
                          ? 'border-green-500 bg-green-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-blue-600">Phổ biến nhất</Badge>
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="outline" className="bg-white">Gói hiện tại</Badge>
                      </div>
                    )}

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    )}

                    {/* Plan Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/tháng</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {plan.limitations.map((limitation, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button 
                onClick={handleProceedToPayment} 
                disabled={!selectedPlan || selectedPlan === currentPlan}
              >
                Tiếp tục
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Payment Form */}
            <div className="max-w-md mx-auto">
              {/* Selected Plan Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      Gói {plans.find(p => p.id === selectedPlan)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Thanh toán hàng tháng</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      ${plans.find(p => p.id === selectedPlan)?.price}
                    </span>
                    <span className="text-muted-foreground">/tháng</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Phương thức thanh toán</h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-blue-500 transition-colors bg-blue-50/50 border-blue-500">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Thẻ tín dụng / Thẻ ghi nợ</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, JCB</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Card Details (Placeholder) */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium">Số thẻ</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border rounded-lg mt-1"
                    disabled={isProcessing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ngày hết hạn</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border rounded-lg mt-1"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">CVV</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      className="w-full px-3 py-2 border rounded-lg mt-1"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                <Shield className="h-4 w-4" />
                <span>Thanh toán được bảo mật bởi Stripe. Chúng tôi không lưu thông tin thẻ của bạn.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep('select')} disabled={isProcessing}>
                  Quay lại
                </Button>
                <Button className="flex-1" onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Thanh toán ${plans.find(p => p.id === selectedPlan)?.price}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
