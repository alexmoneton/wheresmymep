import { NextRequest, NextResponse } from 'next/server'
import { loadData, listMEPs, type EnrichedMEP } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API: Starting data analysis...')
    
    // Load data from JSON files
    loadData()
    const meps = listMEPs()
    
    console.log(`Analytics API: Found ${meps.length} MEPs`)
    
    // Debug: Check first MEP structure
    if (meps.length > 0) {
      console.log('First MEP structure:', JSON.stringify(meps[0], null, 2))
    }

    // Filter MEPs with valid attendance data
    const mepsWithAttendance = meps.filter(mep => 
      mep.mep_id && 
      (mep.votes_total_period || 0) > 0 && 
      typeof mep.attendance_pct === 'number'
    )
    
    console.log(`Analytics API: Found ${mepsWithAttendance.length} MEPs with attendance data`)

    // Analyze political group variance
    const groupVariance = analyzeGroupVariance(mepsWithAttendance)

    // Analyze seasonality (simplified - we don't have monthly breakdown in JSON)
    const seasonality = analyzeSeasonality(mepsWithAttendance)

    // Analyze country size groups
    const ageGroups = analyzeAgeGroups(mepsWithAttendance)

    // Analyze country rankings
    const countryRankings = analyzeCountryRankings(mepsWithAttendance)

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
  }
}

function analyzeGroupVariance(meps: EnrichedMEP[]) {
  const groups = new Map<string, EnrichedMEP[]>()

  // Group MEPs by political group
  meps.forEach(mep => {
    const group = mep.party || 'Unknown'
    if (!groups.has(group)) {
      groups.set(group, [])
    }
    groups.get(group)!.push(mep)
  })

  const groupStats = Array.from(groups.entries()).map(([group, groupMeps]) => {
    const attendances = groupMeps
      .map(mep => mep.attendance_pct || 0)
      .filter(att => att > 0)

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

function analyzeSeasonality(meps: EnrichedMEP[]) {
  // Since we don't have monthly breakdown in the JSON data,
  // we'll return a simplified seasonality analysis
  // This could be enhanced by adding monthly data to the JSON files in the future
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // For now, return average attendance across all months
  const averageAttendance = meps.reduce((sum, mep) => sum + (mep.attendance_pct || 0), 0) / meps.length
  
  return months.map(month => ({
    month,
    average: averageAttendance,
    count: Math.floor(meps.length / 12) // Rough estimate
  }))
}

function analyzeAgeGroups(meps: EnrichedMEP[]) {
  // Since we don't have birth_date in the schema, let's analyze by country size instead
  // This gives us a different but interesting perspective on attendance patterns
  const countryGroups = new Map<string, EnrichedMEP[]>()

  // Group MEPs by country
  meps.forEach(mep => {
    const country = mep.country || 'Unknown'
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
    const attendances = allMeps
      .map(mep => mep.attendance_pct || 0)
      .filter(att => att > 0)

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

function analyzeCountryRankings(meps: EnrichedMEP[]) {
  console.log(`analyzeCountryRankings: Processing ${meps.length} MEPs`)
  
  const countryGroups = new Map<string, EnrichedMEP[]>()

  // Group MEPs by country
  meps.forEach(mep => {
    const country = mep.country || 'Unknown'
    if (!countryGroups.has(country)) {
      countryGroups.set(country, [])
    }
    countryGroups.get(country)!.push(mep)
  })
  
  console.log(`Country groups created: ${countryGroups.size} countries`)

  const countryStats = Array.from(countryGroups.entries()).map(([country, countryMeps]) => {
    const attendances = countryMeps
      .map(mep => mep.attendance_pct || 0)
      .filter(att => att > 0)

    const average = attendances.length > 0 
      ? attendances.reduce((sum, att) => sum + att, 0) / attendances.length 
      : 0

    return {
      country,
      average,
      count: countryMeps.length,
      meps: countryMeps.map(mep => ({
        name: mep.name,
        attendance: mep.attendance_pct || 0
      }))
    }
  }).sort((a, b) => b.average - a.average) // Sort by highest attendance first

  return {
    topCountries: countryStats.slice(0, 10), // Top 10 countries
    bottomCountries: countryStats.slice(-10).reverse(), // Bottom 10 countries
    allCountries: countryStats
  }
}
