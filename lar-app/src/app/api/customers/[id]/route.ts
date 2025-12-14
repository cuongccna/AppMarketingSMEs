import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const userId = (session.user as any).id

    const customer = await prisma.customer.findUnique({
      where: {
        id: params.id,
      },
      include: {
        business: true,
        reviews: {
          orderBy: { publishedAt: 'desc' },
          include: {
            location: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 })
    }

    // Verify ownership
    if (customer.business?.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('[CUSTOMER_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const userId = (session.user as any).id

    const body = await req.json()
    const { name, phone, email, notes, tags } = body

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { business: true },
    })

    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 })
    }

    if (customer.business?.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        email,
        notes,
        tags,
      },
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error('[CUSTOMER_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const userId = (session.user as any).id

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { business: true },
    })

    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 })
    }

    if (customer.business?.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.customer.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CUSTOMER_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
