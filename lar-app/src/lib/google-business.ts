import axios from 'axios'

interface GBPReview {
  reviewId: string
  reviewer: {
    displayName: string
    profilePhotoUrl?: string
  }
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
  comment?: string
  createTime: string
  updateTime: string
  reviewReply?: {
    comment: string
    updateTime: string
  }
}

interface GBPLocation {
  name: string
  locationName: string
  primaryPhone?: string
  address: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode?: string
    regionCode: string
  }
  latlng?: {
    latitude: number
    longitude: number
  }
  websiteUrl?: string
  regularHours?: any
  metadata?: any
}

// Convert star rating enum to number
function starRatingToNumber(rating: string): number {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  }
  return map[rating] || 3
}

/**
 * Google Business Profile API Client
 * Uses Google My Business API v4.9
 * 
 * Note: As per report, we use batch/standard processing for cost optimization
 */
export class GoogleBusinessProfileClient {
  private accessToken: string
  private baseUrl = 'https://mybusiness.googleapis.com/v4'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `GBP API Error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * List all accounts for the authenticated user
   */
  async listAccounts(): Promise<any[]> {
    const response = await this.request<{ accounts: any[] }>('/accounts')
    return response.accounts || []
  }

  /**
   * List all locations for an account
   */
  async listLocations(accountId: string): Promise<GBPLocation[]> {
    const response = await this.request<{ locations: GBPLocation[] }>(
      `/accounts/${accountId}/locations`
    )
    return response.locations || []
  }

  /**
   * Get reviews for a location
   * Uses pagination for efficient batch processing
   */
  async getReviews(
    accountId: string,
    locationId: string,
    pageSize = 50,
    pageToken?: string
  ): Promise<{ reviews: GBPReview[]; nextPageToken?: string }> {
    let endpoint = `/accounts/${accountId}/locations/${locationId}/reviews?pageSize=${pageSize}`
    if (pageToken) {
      endpoint += `&pageToken=${pageToken}`
    }

    const response = await this.request<{
      reviews: GBPReview[]
      nextPageToken?: string
      averageRating?: number
      totalReviewCount?: number
    }>(endpoint)

    return {
      reviews: response.reviews || [],
      nextPageToken: response.nextPageToken,
    }
  }

  /**
   * Reply to a review
   */
  async replyToReview(
    accountId: string,
    locationId: string,
    reviewId: string,
    comment: string
  ): Promise<void> {
    await this.request(
      `/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
      {
        method: 'PUT',
        body: JSON.stringify({ comment }),
      }
    )
  }

  /**
   * Delete a reply to a review
   */
  async deleteReply(
    accountId: string,
    locationId: string,
    reviewId: string
  ): Promise<void> {
    await this.request(
      `/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`,
      { method: 'DELETE' }
    )
  }
}

/**
 * DataForSEO API Client (Alternative for GBP data)
 * Uses Standard Queue for cost optimization as per report ($1.5 vs $5.4 per 1000 profiles)
 */
export class DataForSEOClient {
  private auth: string
  private baseUrl = 'https://api.dataforseo.com/v3'

  constructor(login: string, password: string) {
    this.auth = Buffer.from(`${login}:${password}`).toString('base64')
  }

  private async request<T>(endpoint: string, data?: any): Promise<T> {
    const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data.status_code !== 20000) {
      throw new Error(response.data.status_message || 'DataForSEO API Error')
    }

    return response.data
  }

  /**
   * Get Google Business reviews using Standard Queue (cost-optimized)
   * As per report: $1.5 per 1000 profiles vs $5.4 for Live Mode
   */
  async getBusinessReviews(placeId: string): Promise<any> {
    // Using Standard Queue endpoint for cost optimization
    const response = await this.request('/business_data/google/reviews/task_post', [
      {
        place_id: placeId,
        language_code: 'vi',
        location_name: 'Vietnam',
        priority: 1, // Standard priority for batch processing
      },
    ])

    return response
  }

  /**
   * Get task results (for batch processing)
   */
  async getTaskResults(taskId: string): Promise<any> {
    const response = await this.request(`/business_data/google/reviews/task_get/${taskId}`)
    return response
  }
}

// Transform GBP review to our internal format
export function transformGBPReview(review: GBPReview) {
  return {
    externalId: review.reviewId,
    authorName: review.reviewer.displayName,
    authorPhotoUrl: review.reviewer.profilePhotoUrl,
    rating: starRatingToNumber(review.starRating),
    content: review.comment || '',
    publishedAt: new Date(review.createTime),
    hasReply: !!review.reviewReply,
    replyContent: review.reviewReply?.comment,
    replyDate: review.reviewReply ? new Date(review.reviewReply.updateTime) : null,
  }
}
