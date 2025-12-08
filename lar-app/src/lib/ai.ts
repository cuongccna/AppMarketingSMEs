import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// OpenAI Client (GPT-4o-mini for cost optimization as per report)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Google Gemini Client (Alternative low-cost LLM)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
 * Generate AI response for a review using OpenAI GPT-4o-mini
 * Cost: ~$0.15/1M input tokens, ~$0.60/1M output tokens
 */
export async function generateReviewResponse(params: GenerateResponseParams): Promise<{
  response: string
  tokensUsed: number
  model: string
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

  const systemPrompt = `Bạn là chuyên gia quản lý danh tiếng cho doanh nghiệp "${businessName}"${businessCategory ? ` (ngành ${businessCategory})` : ''}.
Nhiệm vụ: Viết phản hồi cho đánh giá của khách hàng trên Google Business Profile.

Yêu cầu phản hồi:
- Giọng điệu: ${TONE_PROMPTS[tone]}
- Ngôn ngữ: ${language === 'vi' ? 'Tiếng Việt' : 'English'}
- Độ dài: 50-150 từ
- Bắt đầu bằng lời cảm ơn khách hàng đã dành thời gian đánh giá
- Đề cập tên khách hàng nếu có
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

  try {
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
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error('Không thể tạo phản hồi AI. Vui lòng thử lại.')
  }
}

/**
 * Analyze sentiment of a review using OpenAI
 */
export async function analyzeSentiment(reviewContent: string): Promise<SentimentAnalysisResult> {
  if (!reviewContent || reviewContent.trim().length === 0) {
    return {
      sentiment: 'NEUTRAL',
      score: 0,
      keywords: [],
      summary: 'Không có nội dung để phân tích',
    }
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

  try {
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
  } catch (error) {
    console.error('Sentiment Analysis Error:', error)
    return {
      sentiment: 'NEUTRAL',
      score: 0,
      keywords: [],
      summary: 'Lỗi phân tích',
    }
  }
}

/**
 * Alternative: Generate response using Google Gemini (backup LLM)
 * Cost: ~$0.075/1M input tokens, ~$0.30/1M output tokens for Gemini 1.5 Flash
 */
export async function generateReviewResponseGemini(params: GenerateResponseParams): Promise<{
  response: string
  tokensUsed: number
  model: string
}> {
  const {
    reviewContent,
    reviewerName,
    rating,
    sentiment,
    businessName,
    businessCategory,
    tone,
  } = params

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Bạn là chuyên gia quản lý danh tiếng cho doanh nghiệp "${businessName}"${businessCategory ? ` (ngành ${businessCategory})` : ''}.

Viết phản hồi cho đánh giá sau:
- Khách hàng: ${reviewerName}
- Đánh giá: ${rating}/5 sao
- Cảm xúc: ${sentiment === 'POSITIVE' ? 'Tích cực' : sentiment === 'NEGATIVE' ? 'Tiêu cực' : 'Trung lập'}
- Nội dung: "${reviewContent || 'Không có nội dung'}"

Yêu cầu:
- Giọng điệu: ${TONE_PROMPTS[tone]}
- Độ dài: 50-150 từ tiếng Việt
- Cảm ơn khách hàng, đề cập tên nếu có
- Nếu tiêu cực: xin lỗi và đề xuất giải pháp
- Kết thúc bằng lời chúc hoặc mời quay lại`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return {
      response: text,
      tokensUsed: 0, // Gemini doesn't return token count in same way
      model: 'gemini-1.5-flash',
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error('Không thể tạo phản hồi AI với Gemini. Vui lòng thử lại.')
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
