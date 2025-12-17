import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateRewardSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  imageBase64: z.string().optional(),
  pointsRequired: z.number().int().min(1).optional(),
  quantity: z.number().int().min(0).optional(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

/**
 * PATCH /api/rewards/[id]
 * Update a reward
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateRewardSchema.parse(body)

    const reward = await prisma.reward.findUnique({
      where: { id: params.id },
      include: { location: { include: { business: true } } }
    })

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    if (reward.location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let imageBinary = undefined
    if (data.imageBase64) {
      const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, "")
      imageBinary = Buffer.from(base64Data, 'base64')
    }

    // Remove imageBase64 from data object before passing to prisma
    const { imageBase64, startTime, endTime, ...updateData } = data

    const updatedReward = await prisma.reward.update({
      where: { id: params.id },
      data: {
        ...updateData,
        startTime: startTime ? new Date(startTime) : (startTime === null ? null : undefined),
        endTime: endTime ? new Date(endTime) : (endTime === null ? null : undefined),
        imageBinary: imageBinary,
      }
    })

    return NextResponse.json({ success: true, data: updatedReward })
  } catch (error) {
    console.error('Update reward error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/rewards/[id]
 * Delete a reward
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reward = await prisma.reward.findUnique({
      where: { id: params.id },
      include: { location: { include: { business: true } } }
    })

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    if (reward.location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.reward.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete reward error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
