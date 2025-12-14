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

    // Calculate previous period
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)

    // Get previous period aggregates
    const prevReviewAggregates = await prisma.review.aggregate({
      where: {
        locationId: { in: locationIds },
        publishedAt: { gte: previousStartDate, lt: startDate },
      },
      _count: true,
      _avg: { rating: true },
    })

    const prevStatusStats = await prisma.review.groupBy({
      by: ['status'],
      where: {
        locationId: { in: locationIds },
        publishedAt: { gte: previousStartDate, lt: startDate },
      },
      _count: true,
    })
    
    const prevReviewStats = await prisma.review.groupBy({
      by: ['sentiment'],
      where: {
        locationId: { in: locationIds },
        publishedAt: { gte: previousStartDate, lt: startDate },
      },
      _count: true,
    })

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

    // Calculate changes
    const prevTotalReviews = prevReviewAggregates._count
    const reviewsChange = prevTotalReviews > 0 
      ? Math.round(((reviewAggregates._count - prevTotalReviews) / prevTotalReviews) * 100) 
      : 0

    const prevAvgRating = prevReviewAggregates._avg.rating || 0
    const ratingChange = Math.round(((reviewAggregates._avg.rating || 0) - prevAvgRating) * 10) / 10

    const prevRespondedCount = prevStatusStats.find(s => s.status === 'RESPONDED')?._count || 0
    const prevResponseRate = prevTotalReviews > 0
      ? Math.round((prevRespondedCount / prevTotalReviews) * 100)
      : 0
    const responseRateChange = responseRate - prevResponseRate

    const prevPositiveCount = prevReviewStats.find(s => s.sentiment === 'POSITIVE')?._count || 0
    const prevPositiveRate = prevTotalReviews > 0
      ? Math.round((prevPositiveCount / prevTotalReviews) * 100)
      : 0
    const currentPositiveRate = reviewAggregates._count > 0
      ? Math.round((sentimentData.positive / reviewAggregates._count) * 100)
      : 0
    const positiveChange = currentPositiveRate - prevPositiveRate

    // 1. Rating Distribution
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        locationId: { in: locationIds },
        publishedAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    })

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const count = ratingStats.find(s => s.rating === rating)?._count || 0
      return {
        rating: `${rating} sao`,
        count,
        percentage: reviewAggregates._count > 0 ? Math.round((count / reviewAggregates._count) * 100) : 0
      }
    })

    // 2. Location Stats
    const locationStats = await Promise.all(locations.map(async (loc) => {
      const locReviews = await prisma.review.aggregate({
        where: {
          locationId: loc.id,
          publishedAt: { gte: startDate, lte: endDate },
        },
        _count: true,
        _avg: { rating: true },
      })
      
      const locResponded = await prisma.review.count({
        where: {
          locationId: loc.id,
          publishedAt: { gte: startDate, lte: endDate },
          status: 'RESPONDED'
        }
      })

      return {
        name: loc.name,
        reviews: locReviews._count,
        rating: Math.round((locReviews._avg.rating || 0) * 10) / 10,
        responses: locResponded,
        responseRate: locReviews._count > 0 ? Math.round((locResponded / locReviews._count) * 100) : 0
      }
    }))

    // 3. Monthly Data (Last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1) // Start of month

    const monthlyAnalytics = await prisma.locationAnalytics.findMany({
      where: {
        locationId: { in: locationIds },
        date: { gte: sixMonthsAgo },
      },
    })

    const monthlyDataMap: Record<string, any> = {}
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`
      const label = `Th${d.getMonth() + 1}`
      monthlyDataMap[key] = { month: label, reviews: 0, positive: 0, negative: 0, neutral: 0, sortKey: d.getTime() }
    }

    monthlyAnalytics.forEach(a => {
      const key = `${a.date.getMonth() + 1}/${a.date.getFullYear()}`
      if (monthlyDataMap[key]) {
        monthlyDataMap[key].reviews += a.newReviews
        monthlyDataMap[key].positive += a.positiveCount
        monthlyDataMap[key].negative += a.negativeCount
        monthlyDataMap[key].neutral += a.neutralCount
      }
    })

    const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.sortKey - b.sortKey)

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
      ratingDistribution,
      locationStats,
      monthlyData,
      changes: {
        reviewsChange,
        ratingChange,
        responseRateChange,
        positiveChange,
      }
    })
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
