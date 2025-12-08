import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return formatDate(d)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getSentimentColor(sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string {
  switch (sentiment) {
    case 'POSITIVE':
      return 'text-green-600 bg-green-100'
    case 'NEGATIVE':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getSentimentLabel(sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string {
  switch (sentiment) {
    case 'POSITIVE':
      return 'Tích cực'
    case 'NEGATIVE':
      return 'Tiêu cực'
    default:
      return 'Trung lập'
  }
}

export function getRatingStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc, r) => acc + r, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

// Pricing utilities based on report recommendations
export const PRICING_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceVND: 0,
    features: {
      maxLocations: 1,
      maxAiResponses: 10, // per month
      gbpEnabled: true,
      zaloOaEnabled: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  ESSENTIAL: {
    name: 'Essential',
    price: 19,
    priceVND: 475000,
    features: {
      maxLocations: 5,
      maxAiResponses: -1, // unlimited
      gbpEnabled: true,
      zaloOaEnabled: true,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 49,
    priceVND: 1225000,
    features: {
      maxLocations: -1, // unlimited
      maxAiResponses: -1,
      gbpEnabled: true,
      zaloOaEnabled: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
} as const

export type PlanType = keyof typeof PRICING_PLANS

export function formatCurrency(amount: number, currency: 'USD' | 'VND' = 'VND'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
