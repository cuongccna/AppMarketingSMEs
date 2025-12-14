import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface SubscriptionUsage {
  aiResponsesUsed: number
  aiResponsesLimit: number
  tokensUsed: number
  locationsUsed: number
  locationsLimit: number
}

interface SubscriptionData {
  subscription: any
  planDetails: any
  usage: SubscriptionUsage
}

export function useSubscription() {
  const { data: session } = useSession()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/subscription')
      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }
      const data = await response.json()
      setData(data)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchSubscription()
    }
  }, [session])

  return {
    subscription: data?.subscription,
    planDetails: data?.planDetails,
    usage: data?.usage,
    isLoading,
    error,
    refreshSubscription: fetchSubscription
  }
}
