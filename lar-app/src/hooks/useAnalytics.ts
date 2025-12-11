'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AnalyticsData {
  overview: {
    totalReviews: number
    averageRating: number
    responseRate: number
    pendingResponses: number
  }
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  sentimentPercentage: {
    positive: number
    neutral: number
    negative: number
  }
  trend: {
    date: string
    newReviews: number
    positiveCount: number
    negativeCount: number
    neutralCount: number
    responsesCount?: number
  }[]
  topKeywords: {
    keyword: string
    count: number
  }[]
  locations?: {
    id: string
    name: string
  }[]
}

interface UseAnalyticsOptions {
  locationId?: string
  days?: number
}

// Fallback data for development/error states
const fallbackData: AnalyticsData = {
  overview: {
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    pendingResponses: 0,
  },
  sentiment: {
    positive: 0,
    neutral: 0,
    negative: 0,
  },
  sentimentPercentage: {
    positive: 0,
    neutral: 0,
    negative: 0,
  },
  trend: [],
  topKeywords: [],
  locations: [],
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const [data, setData] = useState<AnalyticsData>(fallbackData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.locationId) params.set('locationId', options.locationId)
      if (options.days) params.set('days', options.days.toString())

      const response = await fetch(`/api/analytics/dashboard?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch analytics')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Fetch analytics error:', err)
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
      // Keep fallback data on error
    } finally {
      setIsLoading(false)
    }
  }, [options.locationId, options.days])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
  }
}
