'use client'

import { useState, useEffect, useCallback } from 'react'

export interface LocationSentiment {
  positive: number
  neutral: number
  negative: number
}

export interface LocationData {
  id: string
  name: string
  address: string
  city?: string
  district?: string
  phone?: string
  businessId: string
  businessName: string
  totalReviews: number
  averageRating: number
  ratingTrend: 'up' | 'down' | 'stable'
  pendingResponses: number
  sentiment: LocationSentiment
  lastReview: string | null
  gbpUrl?: string
  platformConnections?: any[]
  createdAt: string
}

interface UseLocationsOptions {
  businessId?: string
}

export function useLocations(options: UseLocationsOptions = {}) {
  const [locations, setLocations] = useState<LocationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (options.businessId) {
        params.append('businessId', options.businessId)
      }
      
      const url = `/api/locations${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }
      
      const data = await response.json()
      
      // Transform API data to match our interface
      const transformedLocations: LocationData[] = (data.locations || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        district: loc.district,
        phone: loc.phone,
        businessId: loc.businessId,
        businessName: loc.business?.name || '',
        totalReviews: loc._count?.reviews || 0,
        averageRating: loc.averageRating || 0,
        ratingTrend: calculateTrend(loc.ratingHistory),
        pendingResponses: loc.pendingResponseCount || 0,
        sentiment: {
          positive: loc.positiveReviews || 0,
          neutral: loc.neutralReviews || 0,
          negative: loc.negativeReviews || 0,
        },
        lastReview: loc.lastReviewDate || null,
        gbpUrl: loc.gbpUrl || loc.platformConnections?.find((p: any) => p.platform === 'GBP')?.profileUrl,
        platformConnections: loc.platformConnections,
        createdAt: loc.createdAt,
      }))
      
      setLocations(transformedLocations)
    } catch (err) {
      console.error('Fetch locations error:', err)
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setIsLoading(false)
    }
  }, [options.businessId])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const addLocation = async (data: {
    businessId: string
    name: string
    address: string
    phone?: string
    city?: string
    district?: string
  }) => {
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add location')
      }
      
      await fetchLocations()
      return { success: true }
    } catch (err) {
      console.error('Add location error:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Đã xảy ra lỗi' }
    }
  }

  const deleteLocation = async (locationId: string) => {
    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete location')
      }
      
      await fetchLocations()
      return { success: true }
    } catch (err) {
      console.error('Delete location error:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Đã xảy ra lỗi' }
    }
  }

  const updateLocation = async (locationId: string, data: Partial<LocationData>) => {
    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update location')
      }
      
      await fetchLocations()
      return { success: true }
    } catch (err) {
      console.error('Update location error:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Đã xảy ra lỗi' }
    }
  }

  return {
    locations,
    isLoading,
    error,
    refetch: fetchLocations,
    addLocation,
    deleteLocation,
    updateLocation,
  }
}

// Helper function to calculate rating trend
function calculateTrend(ratingHistory?: { rating: number; date: string }[]): 'up' | 'down' | 'stable' {
  if (!ratingHistory || ratingHistory.length < 2) return 'stable'
  
  const sorted = [...ratingHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  const recent = sorted.slice(0, 5).reduce((sum, r) => sum + r.rating, 0) / Math.min(5, sorted.length)
  const previous = sorted.slice(5, 10).reduce((sum, r) => sum + r.rating, 0) / Math.min(5, sorted.length - 5)
  
  if (previous === 0) return 'stable'
  
  const diff = recent - previous
  if (diff > 0.2) return 'up'
  if (diff < -0.2) return 'down'
  return 'stable'
}
