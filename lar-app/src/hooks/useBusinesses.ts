'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Business {
  id: string
  name: string
  category?: string
  description?: string
  googlePlaceId?: string
  zaloOaId?: string
  createdAt: string
  updatedAt: string
  _count?: {
    locations: number
  }
  locations?: Location[]
}

export interface Location {
  id: string
  businessId: string
  name: string
  address: string
  phone?: string
  googlePlaceId?: string
  zaloOaId?: string
  createdAt: string
  updatedAt: string
  _count?: {
    reviews: number
  }
}

interface UseBusinessesReturn {
  businesses: Business[]
  isLoading: boolean
  error: string | null
  fetchBusinesses: () => Promise<void>
  refetch: () => Promise<void>
  createBusiness: (data: Partial<Business>) => Promise<Business | null>
  updateBusiness: (id: string, data: Partial<Business>) => Promise<boolean>
  deleteBusiness: (id: string) => Promise<boolean>
  connectPlatform: (businessId: string, data: { platform: string; externalId: string; locationId: string }) => Promise<boolean>
  disconnectPlatform: (businessId: string, locationId: string, platform: string) => Promise<boolean>
  checkConnection: (businessId: string, locationId: string, platform: string) => Promise<{ status: string; message: string }>
}

export function useBusinesses(): UseBusinessesReturn {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBusinesses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/businesses')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch businesses')
      }

      const data = await response.json()
      setBusinesses(data.businesses || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setBusinesses([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const createBusiness = useCallback(async (data: Partial<Business>): Promise<Business | null> => {
    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create business')
      }

      const result = await response.json()
      await fetchBusinesses() // Refetch to update list
      return result.business
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business')
      return null
    }
  }, [fetchBusinesses])

  const updateBusiness = useCallback(async (id: string, data: Partial<Business>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update business')
      }

      await fetchBusinesses()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business')
      return false
    }
  }, [fetchBusinesses])

  const deleteBusiness = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete business')
      }

      await fetchBusinesses()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete business')
      return false
    }
  }, [fetchBusinesses])

  const connectPlatform = useCallback(async (
    businessId: string, 
    data: { platform: string; externalId: string; locationId: string }
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/connect-platform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to connect platform')
      }

      await fetchBusinesses()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect platform')
      return false
    }
  }, [fetchBusinesses])

  const disconnectPlatform = useCallback(async (
    businessId: string,
    locationId: string,
    platform: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/connect-platform?locationId=${locationId}&platform=${platform}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to disconnect platform')
      }

      await fetchBusinesses()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect platform')
      return false
    }
  }, [fetchBusinesses])

  const checkConnection = useCallback(async (
    businessId: string,
    locationId: string,
    platform: string
  ): Promise<{ status: string; message: string }> => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/check-connection?locationId=${locationId}&platform=${platform}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check connection')
      }

      return await response.json()
    } catch (err) {
      return { 
        status: 'ERROR', 
        message: err instanceof Error ? err.message : 'Failed to check connection' 
      }
    }
  }, [])

  return {
    businesses,
    isLoading,
    error,
    fetchBusinesses,
    refetch: fetchBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    connectPlatform,
    disconnectPlatform,
    checkConnection,
  }
}
