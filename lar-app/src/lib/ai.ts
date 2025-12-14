import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Preferred model from settings (can be overridden per request)
export type AIProvider = 'openai' | 'gemini' | 'auto'

/**
 * Check if OpenAI is configured (dynamic check)
 */
function checkOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY
  return !!(key && key !== 'your-openai-api-key' && key.startsWith('sk-'))
}

/**
 * Check if Gemini is configured (dynamic check)
 */
function checkGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY
  return !!(key && key !== 'your-gemini-api-key' && key.startsWith('AIza'))
}

/**
 * Get OpenAI client (lazy initialization)
 */
function getOpenAIClient(): OpenAI | null {
  if (!checkOpenAIConfigured()) return null
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

/**
 * Get Gemini client (lazy initialization)
 */
function getGeminiClient(): GoogleGenerativeAI | null {
  if (!checkGeminiConfigured()) return null
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
}

/**
 * Get available AI providers
 */
export function getAvailableProviders(): { openai: boolean; gemini: boolean } {
  return {
    openai: checkOpenAIConfigured(),
    gemini: checkGeminiConfigured(),
  }
}

export type ToneType = 'FRIENDLY' | 'PROFESSIONAL' | 'EMPATHETIC' | 'CONCISE' | 'FORMAL'
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'

interface GenerateResponseParams {
  reviewContent: string
  reviewerName: string
  rating: number
  sentiment: Sentiment
  businessName: string
  businessCategory?: string
  tone: ToneType
  language?: 'vi' | 'en'
  preferredProvider?: AIProvider
}

interface SentimentAnalysisResult {
  sentiment: Sentiment
  score: number // -1 to 1
  keywords: string[]
  summary: string
}

// Tone descriptions in Vietnamese for prompt engineering
const TONE_PROMPTS: Record<ToneType, string> = {
  FRIENDLY: 'thân thiện, ấm áp, sử dụng ngôn ngữ gần gũi như nói chuyện với bạn bè',
  PROFESSIONAL: 'chuyên nghiệp, lịch sự, thể hiện sự tôn trọng và uy tín doanh nghiệp',
  EMPATHETIC: 'đồng cảm, thấu hiểu, thể hiện sự quan tâm chân thành đến cảm xúc của khách hàng',
  CONCISE: 'ngắn gọn, súc tích, đi thẳng vào vấn đề nhưng vẫn lịch sự',
  FORMAL: 'trang trọng, nghiêm túc, sử dụng ngôn ngữ chính thức và kính ngữ',
}

/**
 * Generate AI response for a review - Smart fallback between OpenAI and Gemini
 * - If preferredProvider is 'auto' or not specified: tries OpenAI first, falls back to Gemini
 * - If preferredProvider is 'openai': only uses OpenAI
 * - If preferredProvider is 'gemini': only uses Gemini
 * 
 * Cost comparison:
 * - OpenAI GPT-4o-mini: ~$0.15/1M input, ~$0.60/1M output
 * - Gemini 1.5 Flash: ~$0.075/1M input, ~$0.30/1M output
 */
export async function generateReviewResponse(params: GenerateResponseParams): Promise<{
  response: string
  tokensUsed: number
  model: string
  provider: AIProvider
}> {
  const { preferredProvider = 'auto' } = params
  
  // Normalize provider name (accept both 'gemini' and 'gemini-1.5-flash', etc.)
  const normalizedProvider = preferredProvider.startsWith('gemini') ? 'gemini' 
    : preferredProvider.startsWith('gpt') || preferredProvider.startsWith('openai') ? 'openai'
    : preferredProvider
  
  // Determine which provider to use (dynamic check)
  let useOpenAI = (normalizedProvider === 'openai' || normalizedProvider === 'auto') && checkOpenAIConfigured()
  let useGemini = (normalizedProvider === 'gemini' || normalizedProvider === 'auto') && checkGeminiConfigured()
  
  // Smart fallback: If preferred provider is not configured, try the other one
  if (normalizedProvider === 'openai' && !useOpenAI && checkGeminiConfigured()) {
    console.log('OpenAI preferred but not configured, falling back to Gemini')
    useGemini = true
  } else if (normalizedProvider === 'gemini' && !useGemini && checkOpenAIConfigured()) {
    console.log('Gemini preferred but not configured, falling back to OpenAI')
    useOpenAI = true
  }

  if (!useOpenAI && !useGemini) {
    throw new Error('Chưa cấu hình API key cho AI. Vui lòng thêm OPENAI_API_KEY hoặc GEMINI_API_KEY.')
  }
  
  // Try Gemini first if it's the chosen one
  if (useGemini && (normalizedProvider === 'gemini' || !useOpenAI)) {
    return generateWithGemini(params)
  }
  
  if (useOpenAI) {
    try {
      return await generateWithOpenAI(params)
    } catch (error) {
      console.error('OpenAI failed, trying Gemini fallback:', error)
      if (useGemini) {
        return generateWithGemini(params)
      }
      throw error
    }
  }
  
  // Fallback to Gemini if OpenAI not available (auto mode)
  if (useGemini) {
    return generateWithGemini(params)
  }
  
  throw new Error('Không có AI provider khả dụng.')
}

/**
 * Generate response using OpenAI GPT-4o-mini
 */
async function generateWithOpenAI(params: GenerateResponseParams): Promise<{
  response: string
  tokensUsed: number
  model: string
  provider: AIProvider
}> {
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('OpenAI client not configured')
  }
  
  const {
    reviewContent,
    reviewerName,
    rating,
    sentiment,
    businessName,
    businessCategory,
    tone,
    language = 'vi',
  } = params

  const systemPrompt = `Bạn là chuyên gia quản lý danh tiếng cho doanh nghiệp "${businessName}"${businessCategory ? ` (ngành ${businessCategory})` : ''}.
Nhiệm vụ: Viết phản hồi cho đánh giá của khách hàng trên Google Business Profile.

Yêu cầu phản hồi:
- Giọng điệu: ${TONE_PROMPTS[tone]}
- Ngôn ngữ: ${language === 'vi' ? 'Tiếng Việt' : 'English'}
- Độ dài: 50-150 từ
- Bắt đầu bằng lời chào với tên khách hàng: "${reviewerName}". Nếu tên là "User Name" hoặc "Khách hàng", hãy chào "Chào bạn".
- Nếu đánh giá tích cực: cảm ơn và mời khách quay lại
- Nếu đánh giá tiêu cực: xin lỗi, thể hiện sự thấu hiểu, đề xuất giải pháp
- Nếu trung lập: cảm ơn góp ý và hứa cải thiện
- Kết thúc bằng lời chúc hoặc lời mời quay lại

KHÔNG được:
- Hứa hẹn cụ thể về giảm giá, bồi thường
- Đề cập đến đối thủ cạnh tranh
- Sử dụng ngôn ngữ tiêu cực hoặc phòng thủ`

  const userPrompt = `Khách hàng: ${reviewerName}
Đánh giá: ${rating}/5 sao
Cảm xúc: ${sentiment === 'POSITIVE' ? 'Tích cực' : sentiment === 'NEGATIVE' ? 'Tiêu cực' : 'Trung lập'}
Nội dung đánh giá: "${reviewContent || 'Không có nội dung, chỉ có điểm số'}"

Hãy viết phản hồi phù hợp.`

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 300,
  })

  return {
    response: completion.choices[0]?.message?.content || '',
    tokensUsed: completion.usage?.total_tokens || 0,
    model: completion.model,
    provider: 'openai',
  }
}

/**
 * Generate response using Google Gemini
 */
async function generateWithGemini(params: GenerateResponseParams): Promise<{
  response: string
  tokensUsed: number
  model: string
  provider: AIProvider
}> {
  const {
    reviewContent,
    reviewerName,
    rating,
    sentiment,
    businessName,
    businessCategory,
    tone,
    language = 'vi',
  } = params

  const genAI = getGeminiClient()
  if (!genAI) {
    throw new Error('Gemini client not configured')
  }
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const model = genAI.getGenerativeModel({ model: geminiModel })

  const prompt = `Bạn là chuyên gia quản lý danh tiếng cho doanh nghiệp "${businessName}"${businessCategory ? ` (ngành ${businessCategory})` : ''}.

Viết phản hồi cho đánh giá sau:
- Khách hàng: ${reviewerName}
- Đánh giá: ${rating}/5 sao
- Cảm xúc: ${sentiment === 'POSITIVE' ? 'Tích cực' : sentiment === 'NEGATIVE' ? 'Tiêu cực' : 'Trung lập'}
- Nội dung: "${reviewContent || 'Không có nội dung'}"

Yêu cầu:
- Giọng điệu: ${TONE_PROMPTS[tone]}
- Ngôn ngữ: ${language === 'vi' ? 'Tiếng Việt' : 'English'}
- Độ dài: 50-150 từ
- Bắt đầu bằng lời chào với tên khách hàng: "${reviewerName}". Nếu tên là "User Name" hoặc "Khách hàng", hãy chào "Chào bạn".
- Nếu tiêu cực: xin lỗi và đề xuất giải pháp
- Kết thúc bằng lời chúc hoặc mời quay lại

KHÔNG được:
- Hứa hẹn cụ thể về giảm giá, bồi thường
- Đề cập đến đối thủ cạnh tranh
- Sử dụng ngôn ngữ tiêu cực hoặc phòng thủ`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  // Get token count if available
  let tokensUsed = 0
  if (result.response.usageMetadata) {
    tokensUsed = (result.response.usageMetadata.promptTokenCount || 0) + 
                 (result.response.usageMetadata.candidatesTokenCount || 0)
  }

  return {
    response: text,
    tokensUsed,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    provider: 'gemini',
  }
}

/**
 * Analyze sentiment of a review - Uses OpenAI or Gemini
 */
export async function analyzeSentiment(
  reviewContent: string,
  preferredProvider: AIProvider = 'auto'
): Promise<SentimentAnalysisResult> {
  if (!reviewContent || reviewContent.trim().length === 0) {
    return {
      sentiment: 'NEUTRAL',
      score: 0,
      keywords: [],
      summary: 'Không có nội dung để phân tích',
    }
  }

  const useOpenAI = (preferredProvider === 'openai' || preferredProvider === 'auto') && checkOpenAIConfigured()
  const useGemini = (preferredProvider === 'gemini' || preferredProvider === 'auto') && checkGeminiConfigured()
  
  if (!useOpenAI && !useGemini) {
    // Fallback to rule-based sentiment if no AI available
    return analyzeWithRules(reviewContent)
  }

  if (preferredProvider === 'gemini' && useGemini) {
    return analyzeSentimentWithGemini(reviewContent)
  }

  if (useOpenAI) {
    try {
      return await analyzeSentimentWithOpenAI(reviewContent)
    } catch (error) {
      console.error('OpenAI sentiment failed, trying Gemini:', error)
      if (useGemini) {
        return analyzeSentimentWithGemini(reviewContent)
      }
      return analyzeWithRules(reviewContent)
    }
  }

  return analyzeSentimentWithGemini(reviewContent)
}

/**
 * Rule-based sentiment analysis fallback
 */
function analyzeWithRules(reviewContent: string): SentimentAnalysisResult {
  const positiveWords = ['tốt', 'tuyệt', 'xuất sắc', 'hài lòng', 'thích', 'yêu', 'recommend', 'great', 'amazing', 'excellent', 'love', 'best']
  const negativeWords = ['tệ', 'kém', 'tồi', 'thất vọng', 'chán', 'dở', 'bad', 'terrible', 'worst', 'hate', 'disappointing', 'awful']
  
  const content = reviewContent.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0
  const foundKeywords: string[] = []
  
  positiveWords.forEach(word => {
    if (content.includes(word)) {
      positiveCount++
      foundKeywords.push(word)
    }
  })
  
  negativeWords.forEach(word => {
    if (content.includes(word)) {
      negativeCount++
      foundKeywords.push(word)
    }
  })
  
  const score = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount)
  let sentiment: Sentiment = 'NEUTRAL'
  if (score > 0.2) sentiment = 'POSITIVE'
  if (score < -0.2) sentiment = 'NEGATIVE'
  
  return {
    sentiment,
    score,
    keywords: foundKeywords.slice(0, 5),
    summary: `Phân tích bằng quy tắc: ${positiveCount} từ tích cực, ${negativeCount} từ tiêu cực`,
  }
}

/**
 * Analyze sentiment using OpenAI
 */
async function analyzeSentimentWithOpenAI(reviewContent: string): Promise<SentimentAnalysisResult> {
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('OpenAI not configured')
  }

  const prompt = `Phân tích cảm xúc của đánh giá sau đây và trả về JSON:

Đánh giá: "${reviewContent}"

Trả về JSON với format:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "score": số từ -1 (rất tiêu cực) đến 1 (rất tích cực),
  "keywords": ["từ khóa 1", "từ khóa 2", ...],
  "summary": "tóm tắt ngắn gọn nội dung đánh giá"
}

Chỉ trả về JSON, không có text khác.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 200,
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(completion.choices[0]?.message?.content || '{}')
  return {
    sentiment: result.sentiment || 'NEUTRAL',
    score: result.score || 0,
    keywords: result.keywords || [],
    summary: result.summary || '',
  }
}

/**
 * Analyze sentiment using Gemini
 */
async function analyzeSentimentWithGemini(reviewContent: string): Promise<SentimentAnalysisResult> {
  const genAI = getGeminiClient()
  if (!genAI) {
    return analyzeWithRules(reviewContent)
  }
  const model = genAI.getGenerativeModel({ 
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  })

  const prompt = `Phân tích cảm xúc của đánh giá sau đây và trả về JSON:

Đánh giá: "${reviewContent}"

Trả về JSON với format:
{
  "sentiment": "POSITIVE" hoặc "NEUTRAL" hoặc "NEGATIVE",
  "score": số từ -1 (rất tiêu cực) đến 1 (rất tích cực),
  "keywords": ["từ khóa 1", "từ khóa 2", ...],
  "summary": "tóm tắt ngắn gọn nội dung đánh giá"
}

Chỉ trả về JSON hợp lệ, không có text khác.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = JSON.parse(text)
    
    return {
      sentiment: parsed.sentiment || 'NEUTRAL',
      score: parsed.score || 0,
      keywords: parsed.keywords || [],
      summary: parsed.summary || '',
    }
  } catch (error) {
    console.error('Gemini sentiment analysis error:', error)
    return analyzeWithRules(reviewContent)
  }
}

/**
 * Detect suspicious reviews (AI Review Seeding Detection)
 * As recommended in the report for protecting SME reputation
 */
export async function detectSuspiciousReview(params: {
  reviewContent: string
  reviewerName: string
  reviewerReviewCount?: number
  reviewDate: Date
  otherReviewsFromSameDay?: number
}): Promise<{
  isSuspicious: boolean
  suspicionScore: number
  flags: string[]
  details: string
}> {
  const { reviewContent, reviewerName, reviewerReviewCount, reviewDate, otherReviewsFromSameDay } = params

  const flags: string[] = []
  let suspicionScore = 0

  // Check for generic/template-like content
  const genericPhrases = ['rất tốt', 'tuyệt vời', 'recommend', 'highly recommended', '5 sao']
  if (reviewContent && genericPhrases.some(phrase => reviewContent.toLowerCase().includes(phrase))) {
    if (reviewContent.length < 50) {
      flags.push('generic_short_text')
      suspicionScore += 0.2
    }
  }

  // Check for new account
  if (reviewerReviewCount !== undefined && reviewerReviewCount < 3) {
    flags.push('new_reviewer_account')
    suspicionScore += 0.15
  }

  // Check for bulk posting pattern
  if (otherReviewsFromSameDay !== undefined && otherReviewsFromSameDay > 5) {
    flags.push('bulk_posting_day')
    suspicionScore += 0.3
  }

  // Normalize score
  suspicionScore = Math.min(suspicionScore, 1)

  return {
    isSuspicious: suspicionScore > 0.5,
    suspicionScore,
    flags,
    details: flags.length > 0 
      ? `Phát hiện ${flags.length} dấu hiệu đáng ngờ` 
      : 'Không phát hiện dấu hiệu đáng ngờ',
  }
}
