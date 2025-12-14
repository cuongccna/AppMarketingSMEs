import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch location with related data
    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        business: { select: { userId: true } },
        _count: {
          select: { reviews: true },
        },
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch review stats
    const reviewStats = await prisma.review.aggregate({
      where: { locationId: params.id },
      _avg: { rating: true },
      _count: true,
    })

    const respondedCount = await prisma.review.count({
      where: {
        locationId: params.id,
        status: 'RESPONDED',
      },
    })

    // --- Audit Logic ---

    const auditResults = []
    let totalScore = 0
    let maxScore = 0

    // 1. Profile Completeness (40 points)
    const checks = [
      { field: 'name', label: 'Tên doanh nghiệp', weight: 10 },
      { field: 'address', label: 'Địa chỉ', weight: 10 },
      { field: 'phone', label: 'Số điện thoại', weight: 10 },
      { field: 'coverImage', label: 'Ảnh bìa', weight: 10 },
    ]

    checks.forEach(check => {
      maxScore += check.weight
      if (location[check.field as keyof typeof location]) {
        totalScore += check.weight
        auditResults.push({
          category: 'Profile',
          item: check.label,
          status: 'PASS',
          score: check.weight,
          maxScore: check.weight,
          message: 'Đã cập nhật đầy đủ',
        })
      } else {
        auditResults.push({
          category: 'Profile',
          item: check.label,
          status: 'FAIL',
          score: 0,
          maxScore: check.weight,
          message: 'Chưa cập nhật thông tin này',
        })
      }
    })

    // 2. Reputation Health (30 points)
    // Rating > 4.0 (15 points)
    maxScore += 15
    const avgRating = reviewStats._avg.rating || 0
    if (avgRating >= 4.5) {
      totalScore += 15
      auditResults.push({
        category: 'Reputation',
        item: 'Điểm đánh giá trung bình',
        status: 'PASS',
        score: 15,
        maxScore: 15,
        message: `Tuyệt vời! ${avgRating.toFixed(1)}/5 sao`,
      })
    } else if (avgRating >= 4.0) {
      totalScore += 10
      auditResults.push({
        category: 'Reputation',
        item: 'Điểm đánh giá trung bình',
        status: 'WARNING',
        score: 10,
        maxScore: 15,
        message: `Khá tốt (${avgRating.toFixed(1)}/5), nhưng cần cải thiện để đạt > 4.5`,
      })
    } else {
      auditResults.push({
        category: 'Reputation',
        item: 'Điểm đánh giá trung bình',
        status: 'FAIL',
        score: 0,
        maxScore: 15,
        message: `Thấp (${avgRating.toFixed(1)}/5). Cần cải thiện chất lượng dịch vụ ngay`,
      })
    }

    // Review Count > 10 (15 points)
    maxScore += 15
    const reviewCount = reviewStats._count
    if (reviewCount >= 20) {
      totalScore += 15
      auditResults.push({
        category: 'Reputation',
        item: 'Số lượng đánh giá',
        status: 'PASS',
        score: 15,
        maxScore: 15,
        message: `Tốt (${reviewCount} đánh giá)`,
      })
    } else if (reviewCount >= 5) {
      totalScore += 8
      auditResults.push({
        category: 'Reputation',
        item: 'Số lượng đánh giá',
        status: 'WARNING',
        score: 8,
        maxScore: 15,
        message: `Còn ít (${reviewCount} đánh giá). Cần khuyến khích khách hàng đánh giá thêm`,
      })
    } else {
      auditResults.push({
        category: 'Reputation',
        item: 'Số lượng đánh giá',
        status: 'FAIL',
        score: 0,
        maxScore: 15,
        message: `Quá ít (${reviewCount} đánh giá). Uy tín chưa cao`,
      })
    }

    // 3. Engagement (30 points)
    // Response Rate > 90% (30 points)
    maxScore += 30
    const responseRate = reviewCount > 0 ? (respondedCount / reviewCount) * 100 : 0
    
    if (responseRate >= 90) {
      totalScore += 30
      auditResults.push({
        category: 'Engagement',
        item: 'Tỷ lệ phản hồi',
        status: 'PASS',
        score: 30,
        maxScore: 30,
        message: `Xuất sắc (${Math.round(responseRate)}%)`,
      })
    } else if (responseRate >= 70) {
      totalScore += 15
      auditResults.push({
        category: 'Engagement',
        item: 'Tỷ lệ phản hồi',
        status: 'WARNING',
        score: 15,
        maxScore: 30,
        message: `Khá (${Math.round(responseRate)}%). Cần trả lời thường xuyên hơn`,
      })
    } else {
      auditResults.push({
        category: 'Engagement',
        item: 'Tỷ lệ phản hồi',
        status: 'FAIL',
        score: 0,
        maxScore: 30,
        message: `Thấp (${Math.round(responseRate)}%). Bạn đang bỏ lỡ tương tác với khách hàng`,
      })
    }

    const overallScore = Math.round((totalScore / maxScore) * 100)

    return NextResponse.json({
      overallScore,
      auditResults,
      locationName: location.name,
    })

  } catch (error) {
    console.error('SEO Audit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
