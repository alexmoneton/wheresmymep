import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data to test the API structure
    // TODO: Replace with real database queries once we confirm the API works
    const analyticsData = {
      strasbourgVsBrussels: {
        strasbourg: {
          average: 78.5,
          count: 24
        },
        brussels: {
          average: 82.3,
          count: 36
        },
        difference: -3.8,
        significance: 'Minor'
      },
      groupVariance: [
        { group: 'EPP', variance: 12.5, average: 85.2, count: 178 },
        { group: 'S&D', variance: 15.3, average: 82.1, count: 145 },
        { group: 'Renew', variance: 18.7, average: 79.8, count: 102 },
        { group: 'Greens/EFA', variance: 22.1, average: 76.5, count: 72 },
        { group: 'ECR', variance: 14.2, average: 81.3, count: 68 },
        { group: 'ID', variance: 25.6, average: 72.1, count: 58 }
      ],
      seasonality: [
        { month: 'Jan', average: 79.2, count: 8 },
        { month: 'Feb', average: 81.5, count: 6 },
        { month: 'Mar', average: 83.1, count: 7 },
        { month: 'Apr', average: 80.8, count: 5 },
        { month: 'May', average: 77.3, count: 6 },
        { month: 'Jun', average: 75.9, count: 4 },
        { month: 'Jul', average: 72.1, count: 3 },
        { month: 'Aug', average: 68.5, count: 2 },
        { month: 'Sep', average: 82.7, count: 6 },
        { month: 'Oct', average: 84.2, count: 7 },
        { month: 'Nov', average: 81.8, count: 6 },
        { month: 'Dec', average: 78.4, count: 5 }
      ],
      ageGroups: [
        { ageGroup: 'Large Countries (10+ MEPs)', average: 81.2, count: 245 },
        { ageGroup: 'Medium Countries (5-9 MEPs)', average: 79.8, count: 156 },
        { ageGroup: 'Small Countries (1-4 MEPs)', average: 76.3, count: 89 }
      ]
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function calculateAverageAttendance(meps: any[], voteIds: string[]) {
  if (voteIds.length === 0) return { average: 0, count: 0 }

  let totalAttendance = 0
  let totalPossible = 0

    meps.forEach(mep => {
      const mepVotes = mep.votes.filter((v: any) => voteIds.includes(v.voteId))
      const attended = mepVotes.filter((v: any) => v.choice !== 'absent').length
      totalAttendance += attended
      totalPossible += mepVotes.length
    })

  return {
    average: totalPossible > 0 ? (totalAttendance / totalPossible) * 100 : 0,
    count: totalPossible
  }
}

function analyzeGroupVariance(meps: any[], voteIds: string[]) {
  const groups = new Map<string, any[]>()

  // Group MEPs by political group
  meps.forEach(mep => {
    const group = mep.party || 'Unknown'
    if (!groups.has(group)) {
      groups.set(group, [])
    }
    groups.get(group)!.push(mep)
  })

  const groupStats = Array.from(groups.entries()).map(([group, groupMeps]) => {
    const attendances = groupMeps.map(mep => {
      const mepVotes = mep.votes.filter((v: any) => voteIds.includes(v.voteId))
      const attended = mepVotes.filter((v: any) => v.choice !== 'absent').length
      return mepVotes.length > 0 ? (attended / mepVotes.length) * 100 : 0
    }).filter(att => att > 0)

    if (attendances.length === 0) {
      return {
        group,
        variance: 0,
        average: 0,
        count: groupMeps.length
      }
    }

    const average = attendances.reduce((sum, att) => sum + att, 0) / attendances.length
    const variance = attendances.reduce((sum, att) => sum + Math.pow(att - average, 2), 0) / attendances.length

    return {
      group,
      variance: Math.sqrt(variance), // Standard deviation
      average,
      count: groupMeps.length
    }
  }).sort((a, b) => b.variance - a.variance)

  return groupStats
}

function analyzeSeasonality(meps: any[], votes: any[]) {
  const monthlyStats = new Map<string, { total: number, attended: number, sessions: number }>()

  // Initialize months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  months.forEach(month => {
    monthlyStats.set(month, { total: 0, attended: 0, sessions: 0 })
  })

  // Group votes by month
  const votesByMonth = new Map<string, string[]>()
  votes.forEach(vote => {
    const date = new Date(vote.date)
    const month = months[date.getMonth()]
    if (!votesByMonth.has(month)) {
      votesByMonth.set(month, [])
    }
    votesByMonth.get(month)!.push(vote.id)
  })

  // Calculate attendance for each month
  votesByMonth.forEach((voteIds, month) => {
    const stats = monthlyStats.get(month)!
    stats.sessions = voteIds.length

    meps.forEach(mep => {
      const mepVotes = mep.votes.filter((v: any) => voteIds.includes(v.voteId))
      stats.total += mepVotes.length
      stats.attended += mepVotes.filter((v: any) => v.choice !== 'absent').length
    })
  })

  return Array.from(monthlyStats.entries()).map(([month, stats]) => ({
    month,
    average: stats.total > 0 ? (stats.attended / stats.total) * 100 : 0,
    count: stats.sessions
  }))
}

function analyzeAgeGroups(meps: any[], voteIds: string[]) {
  // Since we don't have birth_date in the schema, let's analyze by country size instead
  // This gives us a different but interesting perspective on attendance patterns
  const countryGroups = new Map<string, any[]>()

  // Group MEPs by country
  meps.forEach(mep => {
    const country = mep.country?.name || 'Unknown'
    if (!countryGroups.has(country)) {
      countryGroups.set(country, [])
    }
    countryGroups.get(country)!.push(mep)
  })

  // Sort countries by MEP count and group them
  const countryStats = Array.from(countryGroups.entries())
    .map(([country, groupMeps]) => ({
      country,
      count: groupMeps.length,
      meps: groupMeps
    }))
    .sort((a, b) => b.count - a.count)

  // Create size-based groups
  const sizeGroups = {
    'Large Countries (10+ MEPs)': countryStats.filter(c => c.count >= 10),
    'Medium Countries (5-9 MEPs)': countryStats.filter(c => c.count >= 5 && c.count < 10),
    'Small Countries (1-4 MEPs)': countryStats.filter(c => c.count < 5)
  }

  const ageGroupStats = Object.entries(sizeGroups).map(([groupName, countries]) => {
    const allMeps = countries.flatMap(c => c.meps)
    const attendances = allMeps.map(mep => {
      const mepVotes = mep.votes.filter((v: any) => voteIds.includes(v.voteId))
      const attended = mepVotes.filter((v: any) => v.choice !== 'absent').length
      return mepVotes.length > 0 ? (attended / mepVotes.length) * 100 : 0
    }).filter(att => att > 0)

    const average = attendances.length > 0 
      ? attendances.reduce((sum, att) => sum + att, 0) / attendances.length 
      : 0

    return {
      ageGroup: groupName,
      average,
      count: allMeps.length
    }
  })

  return ageGroupStats
}
