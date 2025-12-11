import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/settings/ai-config - Get AI configuration settings
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

    const settings = (user.settings || {}) as any
    
    return NextResponse.json({
      defaultTone: settings.defaultTone ?? 'FRIENDLY',
      customInstructions: settings.customInstructions ?? '',
      includeBusinessName: settings.includeBusinessName ?? true,
      includeManagerSignature: settings.includeManagerSignature ?? false,
      managerName: settings.managerName ?? '',
      preferredModel: settings.preferredModel ?? 'gpt-4o-mini',
      autoGenerateResponses: settings.autoGenerateResponses ?? false,
    })
  } catch (error) {
    console.error('Get AI config error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/settings/ai-config - Update AI configuration settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      defaultTone,
      customInstructions,
      includeBusinessName,
      includeManagerSignature,
      managerName,
      preferredModel,
      autoGenerateResponses,
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
        defaultTone,
        customInstructions,
        includeBusinessName,
        includeManagerSignature,
        managerName,
        preferredModel,
        autoGenerateResponses,
      },
      update: {
        defaultTone,
        customInstructions,
        includeBusinessName,
        includeManagerSignature,
        managerName,
        preferredModel,
        autoGenerateResponses,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update AI config error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
