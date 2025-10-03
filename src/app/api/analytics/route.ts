import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all MEPs with their attendance data
    const meps = await prisma.mEP.findMany({
      include: {
        votes: {
          include: {
            vote: true
          }
        }
      }
    })

    // Get all votes to determine location and timing
    const votes = await prisma.vote.findMany({
      select: {
        id: true,
        date: true,
        location: true,
        title: true
      }
    })

    // Create a map of vote locations and dates
    const voteMap = new Map()
    votes.forEach(vote => {
      voteMap.set(vote.id, {
        date: vote.date,
        location: vote.location,
        title: vote.title
      })
    })

    // Analyze Strasbourg vs Brussels attendance
    const strasbourgVotes = votes.filter(v => v.location?.toLowerCase().includes('strasbourg'))
    const brusselsVotes = votes.filter(v => v.location?.toLowerCase().includes('brussels'))

    const strasbourgAttendance = calculateAverageAttendance(meps, strasbourgVotes.map(v => v.id))
    const brusselsAttendance = calculateAverageAttendance(meps, brusselsVotes.map(v => v.id))

    // Analyze political group variance
    const groupVariance = analyzeGroupVariance(meps, votes.map(v => v.id))

    // Analyze seasonality
    const seasonality = analyzeSeasonality(meps, votes)

    // Analyze age groups
    const ageGroups = analyzeAgeGroups(meps, votes.map(v => v.id))

    const analyticsData = {
      strasbourgVsBrussels: {
        strasbourg: {
          average: strasbourgAttendance.average,
          count: strasbourgVotes.length
        },
        brussels: {
          average: brusselsAttendance.average,
          count: brusselsVotes.length
        },
        difference: strasbourgAttendance.average - brusselsAttendance.average,
        significance: Math.abs(strasbourgAttendance.average - brusselsAttendance.average) > 5 ? 'Significant' : 'Minor'
      },
      groupVariance: groupVariance,
      seasonality: seasonality,
      ageGroups: ageGroups
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
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
    const attended = mepVotes.filter((v: any) => v.attended).length
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
      const attended = mepVotes.filter((v: any) => v.attended).length
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
      stats.attended += mepVotes.filter((v: any) => v.attended).length
    })
  })

  return Array.from(monthlyStats.entries()).map(([month, stats]) => ({
    month,
    average: stats.total > 0 ? (stats.attended / stats.total) * 100 : 0,
    count: stats.sessions
  }))
}

function analyzeAgeGroups(meps: any[], voteIds: string[]) {
  const ageGroups = new Map<string, any[]>()

  // Group MEPs by age
  meps.forEach(mep => {
    if (mep.birth_date) {
      const age = new Date().getFullYear() - new Date(mep.birth_date).getFullYear()
      let ageGroup = 'Unknown'
      
      if (age < 35) ageGroup = 'Under 35'
      else if (age < 45) ageGroup = '35-44'
      else if (age < 55) ageGroup = '45-54'
      else if (age < 65) ageGroup = '55-64'
      else ageGroup = '65+'

      if (!ageGroups.has(ageGroup)) {
        ageGroups.set(ageGroup, [])
      }
      ageGroups.get(ageGroup)!.push(mep)
    }
  })

  const ageGroupStats = Array.from(ageGroups.entries()).map(([ageGroup, groupMeps]) => {
    const attendances = groupMeps.map(mep => {
      const mepVotes = mep.votes.filter((v: any) => voteIds.includes(v.voteId))
      const attended = mepVotes.filter((v: any) => v.attended).length
      return mepVotes.length > 0 ? (attended / mepVotes.length) * 100 : 0
    }).filter(att => att > 0)

    const average = attendances.length > 0 
      ? attendances.reduce((sum, att) => sum + att, 0) / attendances.length 
      : 0

    return {
      ageGroup,
      average,
      count: groupMeps.length
    }
  }).sort((a, b) => {
    // Sort by age group order
    const order = ['Under 35', '35-44', '45-54', '55-64', '65+', 'Unknown']
    return order.indexOf(a.ageGroup) - order.indexOf(b.ageGroup)
  })

  return ageGroupStats
}
