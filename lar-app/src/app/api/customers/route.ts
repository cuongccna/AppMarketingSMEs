import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const userId = (session.user as any).id

    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Verify business ownership if businessId is provided
    if (businessId) {
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          userId: userId,
        },
      })

      if (!business) {
        return new NextResponse('Business not found or unauthorized', { status: 404 })
      }
    } else {
      // If no businessId, get all businesses for user
      // But for simplicity, let's require businessId or fetch for all user's businesses
    }

    const whereClause: any = {
      business: {
        userId: userId,
      },
    }

    if (businessId) {
      whereClause.businessId = businessId
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        include: {
          business: {
            select: { name: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where: whereClause }),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('[CUSTOMERS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const userId = (session.user as any).id

    const body = await req.json()
    const { name, phone, email, businessId, notes, tags } = body

    if (!businessId || !name) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: userId,
      },
    })

    if (!business) {
      return new NextResponse('Business not found or unauthorized', { status: 404 })
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        businessId,
        notes,
        tags: tags || [],
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('[CUSTOMERS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
