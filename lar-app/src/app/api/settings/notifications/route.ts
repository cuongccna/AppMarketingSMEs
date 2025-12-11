import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/settings/notifications - Get notification settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        settings: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return settings with defaults
    const settings = (user.settings || {}) as any
    
    return NextResponse.json({
      emailNewReview: settings.emailNewReview ?? true,
      emailNegativeReview: settings.emailNegativeReview ?? true,
      emailWeeklyReport: settings.emailWeeklyReport ?? true,
      zaloNewReview: settings.zaloNewReview ?? false,
      zaloNegativeReview: settings.zaloNegativeReview ?? true,
      pushEnabled: settings.pushEnabled ?? false,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/settings/notifications - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      emailNewReview,
      emailNegativeReview,
      emailWeeklyReport,
      zaloNewReview,
      zaloNegativeReview,
      pushEnabled,
    } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailNewReview,
        emailNegativeReview,
        emailWeeklyReport,
        zaloNewReview,
        zaloNegativeReview,
        pushEnabled,
      },
      update: {
        emailNewReview,
        emailNegativeReview,
        emailWeeklyReport,
        zaloNewReview,
        zaloNegativeReview,
        pushEnabled,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
