import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API: Starting database queries...')
    
    // Get all MEPs with their attendance data
    const meps = await prisma.mEP.findMany({
      include: {
        votes: {
          include: {
            vote: true
          }
        },
        party: true,
        country: true
      }
    })
    
    console.log(`Analytics API: Found ${meps.length} MEPs`)
    
    // Debug: Check first MEP structure
    if (meps.length > 0) {
      console.log('First MEP structure:', JSON.stringify(meps[0], null, 2))
    }

    // Get all votes to determine timing
    const votes = await prisma.vote.findMany({
      select: {
        id: true,
        date: true,
        title: true
      }
    })
    
    console.log(`Analytics API: Found ${votes.length} votes`)
    
    // Debug: Check first vote structure
    if (votes.length > 0) {
      console.log('First vote structure:', JSON.stringify(votes[0], null, 2))
    }

    // Since we don't have location data, let's analyze by date patterns instead
    // Group votes by month to see seasonal patterns
    const votesByMonth = new Map<string, string[]>()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    votes.forEach(vote => {
      const date = new Date(vote.date)
      const month = months[date.getMonth()]
      if (!votesByMonth.has(month)) {
        votesByMonth.set(month, [])
      }
      votesByMonth.get(month)!.push(vote.id)
    })

    // No location data available for Strasbourg vs Brussels comparison

    // Analyze political group variance
    const groupVariance = analyzeGroupVariance(meps, votes.map(v => v.id))

    // Analyze seasonality using the grouped votes
    const seasonality = analyzeSeasonality(meps, votesByMonth)

    // Analyze country size groups
    const ageGroups = analyzeAgeGroups(meps, votes.map(v => v.id))

    // Analyze country rankings
    const countryRankings = analyzeCountryRankings(meps, votes.map(v => v.id))

    const analyticsData = {
      groupVariance: groupVariance,
      seasonality: seasonality,
      ageGroups: ageGroups,
      countryRankings: countryRankings
    }

    console.log('Analytics API: Successfully generated analytics data')
    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
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
    const group = mep.party?.euGroup || mep.party?.name || 'Unknown'
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

function analyzeSeasonality(meps: any[], votesByMonth: Map<string, string[]>) {
  const monthlyStats = new Map<string, { total: number, attended: number, sessions: number }>()

  // Initialize months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  months.forEach(month => {
    monthlyStats.set(month, { total: 0, attended: 0, sessions: 0 })
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

function analyzeCountryRankings(meps: any[], voteIds: string[]) {
  console.log(`analyzeCountryRankings: Processing ${meps.length} MEPs with ${voteIds.length} votes`)
  
  const countryGroups = new Map<string, any[]>()

  // Group MEPs by country
  meps.forEach(mep => {
    const country = mep.country?.name || 'Unknown'
    if (!countryGroups.has(country)) {
      countryGroups.set(country, [])
    }
    countryGroups.get(country)!.push(mep)
  })
  
  console.log(`Country groups created: ${countryGroups.size} countries`)

  const countryStats = Array.from(countryGroups.entries()).map(([country, countryMeps]) => {
    const attendances = countryMeps.map(mep => {
      const mepVotes = mep.votes.filter((v: any) => voteIds.includes(v.voteId))
      const attended = mepVotes.filter((v: any) => v.choice !== 'absent').length
      
      // Debug first MEP
      if (countryMeps.indexOf(mep) === 0) {
        console.log(`Debug ${country} MEP ${mep.firstName} ${mep.lastName}:`)
        console.log(`  - Total votes for MEP: ${mep.votes.length}`)
        console.log(`  - Votes matching voteIds: ${mepVotes.length}`)
        console.log(`  - Attended votes: ${attended}`)
        console.log(`  - Sample vote:`, mep.votes[0])
      }
      
      return mepVotes.length > 0 ? (attended / mepVotes.length) * 100 : 0
    }).filter(att => att > 0)

    const average = attendances.length > 0 
      ? attendances.reduce((sum, att) => sum + att, 0) / attendances.length 
      : 0

    return {
      country,
      average,
      count: countryMeps.length,
      meps: countryMeps.map(mep => ({
        name: mep.firstName + ' ' + mep.lastName,
        attendance: attendances[countryMeps.indexOf(mep)] || 0
      }))
    }
  }).sort((a, b) => b.average - a.average) // Sort by highest attendance first

  return {
    topCountries: countryStats.slice(0, 10), // Top 10 countries
    bottomCountries: countryStats.slice(-10).reverse(), // Bottom 10 countries
    allCountries: countryStats
  }
}
