'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Review {
  id: string
  authorName: string
  authorPhotoUrl?: string
  rating: number
  content?: string
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  status: string
  publishedAt: string
  keywords: string[]
  platform: string
  externalId: string
  location: {
    id: string
    name: string
    address: string
  }
  responses?: {
    id: string
    content: string
    status: string
    isAiGenerated: boolean
    tone?: string
    createdAt: string
  }[]
}

interface ReviewsResponse {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseReviewsOptions {
  locationId?: string
  businessId?: string
  sentiment?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

interface UseReviewsReturn {
  reviews: Review[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  refetch: () => Promise<void>
  generateResponse: (reviewId: string, tone?: string) => Promise<boolean>
  approveResponse: (responseId: string, editedContent?: string) => Promise<boolean>
  syncReviews: () => Promise<boolean>
  isGenerating: string | null
  isSyncing: boolean
}

export function useReviews(options: UseReviewsOptions = {}): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.locationId) params.set('locationId', options.locationId)
      if (options.businessId) params.set('businessId', options.businessId)
      if (options.sentiment && options.sentiment !== 'all') params.set('sentiment', options.sentiment)
      if (options.status && options.status !== 'all') params.set('status', options.status)
      if (options.search) params.set('search', options.search)
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())

      const response = await fetch(`/api/reviews?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch reviews')
      }

      const data: ReviewsResponse = await response.json()
      setReviews(data.reviews)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Return mock data on error for development
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }, [options.locationId, options.businessId, options.sentiment, options.status, options.search, options.page, options.limit])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const generateResponse = useCallback(async (reviewId: string, tone = 'PROFESSIONAL'): Promise<boolean> => {
    try {
      setIsGenerating(reviewId)
      
      const response = await fetch('/api/reviews/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, tone }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate response')
      }

      const data = await response.json()
      
      // Update local state with new response
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            status: 'AI_DRAFT_READY',
            responses: [
              {
                id: data.response.id,
                content: data.response.content,
                status: 'PENDING_APPROVAL',
                isAiGenerated: true,
                tone: data.response.tone,
                createdAt: new Date().toISOString(),
              },
              ...(review.responses || []),
            ],
          }
        }
        return review
      }))

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate response')
      return false
    } finally {
      setIsGenerating(null)
    }
  }, [])

  const approveResponse = useCallback(async (responseId: string, editedContent?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId, editedContent }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve response')
      }

      // Update local state
      setReviews(prev => prev.map(review => {
        const updatedResponses = review.responses?.map(resp => {
          if (resp.id === responseId) {
            return { ...resp, status: 'APPROVED', content: editedContent || resp.content }
          }
          return resp
        })
        
        if (review.responses?.some(r => r.id === responseId)) {
          return { ...review, status: 'PENDING_RESPONSE', responses: updatedResponses }
        }
        return review
      }))

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve response')
      return false
    }
  }, [])

  const syncReviews = useCallback(async (): Promise<boolean> => {
    try {
      setIsSyncing(true)
      
      const response = await fetch('/api/reviews/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          businessId: options.businessId,
          locationId: options.locationId 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync reviews')
      }

      // Refetch reviews after sync
      await fetchReviews()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync reviews')
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [options.businessId, options.locationId, fetchReviews])

  return {
    reviews,
    isLoading,
    error,
    pagination,
    refetch: fetchReviews,
    generateResponse,
    approveResponse,
    syncReviews,
    isGenerating,
    isSyncing,
  }
}
