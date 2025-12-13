import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics for user's businesses
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')
    const days = parseInt(searchParams.get('days') || '30')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Build where clause for locations
    const locationWhere: any = {
      business: { userId },
    }
    if (locationId) {
      locationWhere.id = locationId
    }

    // Get user's locations
    const locations = await prisma.location.findMany({
      where: locationWhere,
      select: { id: true, name: true },
    })

    const locationIds = locations.map(l => l.id)

    // Get review statistics
    const reviewStats = await prisma.review.groupBy({
      by: ['sentiment'],
      where: {
        locationId: { in: locationIds },
        publishedAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    })

    // Get total reviews and average rating
    const reviewAggregates = await prisma.review.aggregate({
      where: {
        locationId: { in: locationIds },
        publishedAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      _avg: { rating: true },
    })

    // Get reviews by status
    const statusStats = await prisma.review.groupBy({
      by: ['status'],
      where: {
        locationId: { in: locationIds },
        publishedAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    })

    // Get reviews trend (daily)
    const dailyAnalytics = await prisma.locationAnalytics.findMany({
      where: {
        locationId: { in: locationIds },
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    })

    // Aggregate daily data
    const dailyTrend: Record<string, any> = {}
    dailyAnalytics.forEach(a => {
      const dateKey = a.date.toISOString().split('T')[0]
      if (!dailyTrend[dateKey]) {
        dailyTrend[dateKey] = {
          date: dateKey,
          newReviews: 0,
          positiveCount: 0,
          negativeCount: 0,
          neutralCount: 0,
          responsesCount: 0,
        }
      }
      dailyTrend[dateKey].newReviews += a.newReviews
      dailyTrend[dateKey].positiveCount += a.positiveCount
      dailyTrend[dateKey].negativeCount += a.negativeCount
      dailyTrend[dateKey].neutralCount += a.neutralCount
      dailyTrend[dateKey].responsesCount += a.responsesCount
    })

    // Get top keywords from recent reviews
    const recentReviews = await prisma.review.findMany({
      where: {
        locationId: { in: locationIds },
        publishedAt: { gte: startDate, lte: endDate },
      },
      select: { keywords: true },
    })

    const keywordCounts: Record<string, number> = {}
    recentReviews.forEach(r => {
      r.keywords.forEach(k => {
        keywordCounts[k] = (keywordCounts[k] || 0) + 1
      })
    })

    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))

    // Get response rate
    const respondedCount = statusStats.find(s => s.status === 'RESPONDED')?._count || 0
    const responseRate = reviewAggregates._count > 0
      ? Math.round((respondedCount / reviewAggregates._count) * 100)
      : 0

    // Format sentiment stats
    const sentimentData = {
      positive: reviewStats.find(s => s.sentiment === 'POSITIVE')?._count || 0,
      neutral: reviewStats.find(s => s.sentiment === 'NEUTRAL')?._count || 0,
      negative: reviewStats.find(s => s.sentiment === 'NEGATIVE')?._count || 0,
    }

    return NextResponse.json({
      overview: {
        totalReviews: reviewAggregates._count,
        averageRating: Math.round((reviewAggregates._avg.rating || 0) * 10) / 10,
        responseRate,
        pendingResponses: statusStats.find(s => s.status === 'NEW')?._count || 0,
      },
      sentiment: sentimentData,
      sentimentPercentage: {
        positive: reviewAggregates._count > 0
          ? Math.round((sentimentData.positive / reviewAggregates._count) * 100)
          : 0,
        neutral: reviewAggregates._count > 0
          ? Math.round((sentimentData.neutral / reviewAggregates._count) * 100)
          : 0,
        negative: reviewAggregates._count > 0
          ? Math.round((sentimentData.negative / reviewAggregates._count) * 100)
          : 0,
      },
      trend: Object.values(dailyTrend),
      topKeywords,
      locations: locations.length,
      dateRange: { start: startDate, end: endDate },
    })
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
