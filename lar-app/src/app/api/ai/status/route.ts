import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAvailableProviders } from '@/lib/ai'

export const dynamic = 'force-dynamic'

/**
 * GET /api/ai/status
 * Check AI providers availability status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const providers = getAvailableProviders()
    
    return NextResponse.json({
      success: true,
      providers,
      hasAnyProvider: providers.openai || providers.gemini,
      recommendation: !providers.openai && providers.gemini 
        ? 'Đang sử dụng Gemini. Thêm OPENAI_API_KEY để có thêm tùy chọn.'
        : providers.openai && !providers.gemini
        ? 'Đang sử dụng OpenAI. Thêm GEMINI_API_KEY để có fallback.'
        : providers.openai && providers.gemini
        ? 'Cả OpenAI và Gemini đều khả dụng. Hệ thống sẽ tự động chọn provider tốt nhất.'
        : 'Chưa cấu hình AI. Vui lòng thêm OPENAI_API_KEY hoặc GEMINI_API_KEY vào .env',
    })
  } catch (error) {
    console.error('AI status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
