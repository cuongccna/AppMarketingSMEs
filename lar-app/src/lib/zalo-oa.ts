import axios from 'axios'

/**
 * Zalo OA (Official Account) API Client
 * As per report: Zalo OA is a strategic platform for Vietnamese SMEs
 * Integration provides competitive moat against global competitors
 */

interface ZaloOAConfig {
  appId: string
  appSecret: string
  accessToken: string
}

interface ZaloFollower {
  user_id: string
  display_name: string
  avatar: string
  user_gender: number
  user_id_by_app: string
}

interface ZaloMessage {
  msg_id: string
  src: number
  time: number
  type: string
  message: any
  from_id: string
  to_id: string
  from_display_name: string
  from_avatar: string
}

interface ZaloArticle {
  id: string
  title: string
  description: string
  thumb: string
  status: number
  total_view: number
  total_like: number
  created_time: number
}

export class ZaloOAClient {
  private config: ZaloOAConfig
  private baseUrl = 'https://openapi.zalo.me/v2.0/oa'

  constructor(config: ZaloOAConfig) {
    this.config = config
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await axios({
      method,
      url,
      headers: {
        'access_token': this.config.accessToken,
        'Content-Type': 'application/json',
      },
      data,
    })

    if (response.data.error !== 0) {
      throw new Error(response.data.message || `Zalo OA API Error: ${response.data.error}`)
    }

    return response.data.data
  }

  /**
   * Get OA Profile information
   */
  async getProfile(): Promise<any> {
    return this.request('/getoa')
  }

  /**
   * Get list of followers
   */
  async getFollowers(offset = 0, count = 50): Promise<{
    followers: ZaloFollower[]
    total: number
  }> {
    const response = await this.request<any>(
      `/getfollowers?data={"offset":${offset},"count":${count}}`
    )
    return {
      followers: response.followers || [],
      total: response.total || 0,
    }
  }

  /**
   * Get follower profile
   */
  async getFollowerProfile(userId: string): Promise<ZaloFollower> {
    return this.request<ZaloFollower>(
      `/getprofile?data={"user_id":"${userId}"}`
    )
  }

  /**
   * Send text message to a user
   */
  async sendTextMessage(userId: string, text: string): Promise<{ msg_id: string }> {
    return this.request<{ msg_id: string }>('/message', 'POST', {
      recipient: { user_id: userId },
      message: { text },
    })
  }

  /**
   * Send notification using ZNS (Zalo Notification Service)
   * Used for alerting business owners about new reviews
   */
  async sendZNSNotification(
    phone: string,
    templateId: string,
    templateData: Record<string, string>
  ): Promise<any> {
    // ZNS uses different endpoint
    const response = await axios.post(
      'https://business.openapi.zalo.me/message/template',
      {
        phone,
        template_id: templateId,
        template_data: templateData,
      },
      {
        headers: {
          'access_token': this.config.accessToken,
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.error !== 0) {
      throw new Error(response.data.message || 'ZNS API Error')
    }

    return response.data.data
  }

  /**
   * Get conversation messages with a user
   */
  async getConversation(
    userId: string,
    offset = 0,
    count = 10
  ): Promise<ZaloMessage[]> {
    const response = await this.request<any>(
      `/conversation?data={"user_id":"${userId}","offset":${offset},"count":${count}}`
    )
    return response.data || []
  }

  /**
   * Get list of articles (posts) from OA
   */
  async getArticles(offset = 0, limit = 10): Promise<ZaloArticle[]> {
    const response = await this.request<any>(
      `/article/getslice?data={"offset":${offset},"limit":${limit},"type":"normal"}`
    )
    return response.articles || []
  }

  /**
   * Reply to a customer message
   */
  async replyToMessage(
    userId: string,
    messageId: string,
    text: string
  ): Promise<{ msg_id: string }> {
    return this.request<{ msg_id: string }>('/message', 'POST', {
      recipient: { user_id: userId },
      message: { text },
      attachment: { type: 'template', payload: { template_type: 'media' } },
    })
  }

  /**
   * Create a webhook for receiving messages and events
   */
  async registerWebhook(webhookUrl: string): Promise<void> {
    // This typically needs to be done via Zalo Developer Console
    // But we can verify the webhook here
    console.log(`Webhook URL to register in Zalo Developer Console: ${webhookUrl}`)
  }
}

/**
 * Helper to create ZaloOA client from environment variables
 */
export function createZaloOAClient(): ZaloOAClient {
  return new ZaloOAClient({
    appId: process.env.ZALO_APP_ID || '',
    appSecret: process.env.ZALO_APP_SECRET || '',
    accessToken: process.env.ZALO_OA_ACCESS_TOKEN || '',
  })
}

/**
 * Zalo OA Webhook Event Types
 */
export enum ZaloEventType {
  USER_SEND_TEXT = 'user_send_text',
  USER_SEND_IMAGE = 'user_send_image',
  USER_SEND_STICKER = 'user_send_sticker',
  USER_SEND_GIF = 'user_send_gif',
  USER_SEND_FILE = 'user_send_file',
  USER_SEND_AUDIO = 'user_send_audio',
  USER_SEND_VIDEO = 'user_send_video',
  USER_SEND_LINK = 'user_send_link',
  USER_SEND_LOCATION = 'user_send_location',
  USER_SUBMIT_INFO = 'user_submit_info',
  FOLLOW = 'follow',
  UNFOLLOW = 'unfollow',
  OA_SEND_TEXT = 'oa_send_text',
  OA_SEND_IMAGE = 'oa_send_image',
  OA_SEND_LIST = 'oa_send_list',
  OA_SEND_FILE = 'oa_send_file',
}

export interface ZaloWebhookEvent {
  app_id: string
  oa_id: string
  user_id_by_app: string
  event_name: ZaloEventType
  timestamp: string
  sender: {
    id: string
  }
  recipient: {
    id: string
  }
  message?: {
    msg_id: string
    text?: string
    attachments?: any[]
  }
}

/**
 * Process incoming Zalo webhook event
 */
export async function processZaloWebhook(event: ZaloWebhookEvent): Promise<void> {
  switch (event.event_name) {
    case ZaloEventType.USER_SEND_TEXT:
      // Handle incoming text message
      console.log(`New message from ${event.sender.id}: ${event.message?.text}`)
      break
    case ZaloEventType.FOLLOW:
      // Handle new follower
      console.log(`New follower: ${event.sender.id}`)
      break
    case ZaloEventType.UNFOLLOW:
      // Handle unfollow
      console.log(`User unfollowed: ${event.sender.id}`)
      break
    default:
      console.log(`Unhandled event: ${event.event_name}`)
  }
}
