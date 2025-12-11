import { useState, useCallback } from 'react'

// Types
interface Profile {
  id: string
  name: string
  email: string
  image: string | null
  phone: string
  company: string
  createdAt: string
}

interface NotificationSettings {
  emailNewReview: boolean
  emailNegativeReview: boolean
  emailWeeklyReport: boolean
  zaloNewReview: boolean
  zaloNegativeReview: boolean
  pushEnabled: boolean
}

interface AIConfig {
  defaultTone: string
  customInstructions: string
  includeBusinessName: boolean
  includeManagerSignature: boolean
  managerName: string
  preferredModel: string
  autoGenerateResponses: boolean
}

interface Template {
  id: string
  userId: string | null
  name: string
  description: string | null
  content: string
  tone: string
  forSentiment: string | null
  forRating: number | null
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

// Profile Hook
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to update profile')
      }
      // Refresh profile
      await fetchProfile()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchProfile])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to change password')
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
  }
}

// Notifications Hook
export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings/notifications')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (data: Partial<NotificationSettings>) => {
    setIsLoading(true)
    setError(null)
    try {
      const newSettings = { ...settings, ...data }
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })
      if (!response.ok) throw new Error('Failed to update settings')
      setSettings(newSettings as NotificationSettings)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [settings])

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
  }
}

// AI Config Hook
export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings/ai-config')
      if (!response.ok) throw new Error('Failed to fetch config')
      const data = await response.json()
      setConfig(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateConfig = useCallback(async (data: Partial<AIConfig>) => {
    setIsLoading(true)
    setError(null)
    try {
      const newConfig = { ...config, ...data }
      const response = await fetch('/api/settings/ai-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      if (!response.ok) throw new Error('Failed to update config')
      setConfig(newConfig as AIConfig)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [config])

  return {
    config,
    isLoading,
    error,
    fetchConfig,
    updateConfig,
  }
}

// Templates Hook
export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTemplate = useCallback(async (data: {
    name: string
    content: string
    description?: string
    tone?: string
    forSentiment?: string
    forRating?: number
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create template')
      const newTemplate = await response.json()
      setTemplates(prev => [newTemplate, ...prev])
      return newTemplate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateTemplate = useCallback(async (id: string, data: Partial<Template>) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/settings/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update template')
      const updatedTemplate = await response.json()
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t))
      return updatedTemplate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/settings/templates/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete template')
      setTemplates(prev => prev.filter(t => t.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}
