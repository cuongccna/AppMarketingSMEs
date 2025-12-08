'use client'

import { useState, useEffect, useCallback } from 'react'

export interface DashboardData {
  overview: {
    totalReviews: number
    averageRating: number
    responseRate: number
    pendingResponses: number
    ratingChange: number
    responseRateChange: number
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
  }[]
  topKeywords: {
    keyword: string
    count: number
    sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  }[]
  recentReviews: any[]
}

interface UseDashboardOptions {
  businessId?: string
  locationId?: string
  dateRange?: string // '7d', '30d', '90d', 'all'
}

interface UseDashboardReturn {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Default mock data for when API fails or during development
const defaultDashboardData: DashboardData = {
  overview: {
    totalReviews: 0,
    averageRating: 0,
    responseRate: 0,
    pendingResponses: 0,
    ratingChange: 0,
    responseRateChange: 0,
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
  recentReviews: [],
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.businessId) params.set('businessId', options.businessId)
      if (options.locationId) params.set('locationId', options.locationId)
      if (options.dateRange) params.set('dateRange', options.dateRange)

      const response = await fetch(`/api/analytics/dashboard?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch dashboard data')
      }

      const dashboardData: DashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Use default data on error
      setData(defaultDashboardData)
    } finally {
      setIsLoading(false)
    }
  }, [options.businessId, options.locationId, options.dateRange])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  }
}
