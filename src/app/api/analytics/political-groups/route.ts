import { NextRequest, NextResponse } from 'next/server'
import { loadData, listMEPs, type EnrichedMEP } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    console.log('Political Groups Analytics API: Starting analysis...')
    
    // Load data from JSON files
    loadData()
    const meps = listMEPs()
    
    console.log(`Political Groups Analytics API: Found ${meps.length} MEPs`)
    
    // Filter MEPs with valid attendance data and political group affiliation
    const mepsWithAttendance = meps.filter(mep => 
      mep.mep_id && 
      (mep.votes_total_period || 0) > 0 && 
      typeof mep.attendance_pct === 'number' &&
      mep.party && mep.party.trim() !== '' // Must have a political group
    )
    
    console.log(`Political Groups Analytics API: Found ${mepsWithAttendance.length} MEPs with attendance data and political groups`)

    // Group MEPs by political group
    const groupMap = new Map<string, EnrichedMEP[]>()

    mepsWithAttendance.forEach(mep => {
      const group = mep.party || 'Unknown'
      if (!groupMap.has(group)) {
        groupMap.set(group, [])
      }
      groupMap.get(group)!.push(mep)
    })

    // Function to determine political spectrum position
    const getPoliticalSpectrum = (groupName: string) => {
      const group = groupName.toLowerCase();
      
      // Left-wing groups
      if (group.includes('left') || group.includes('communist') || group.includes('socialist alliance')) {
        return { position: 1, label: 'Far Left', color: '#DC2626' }; // Red
      }
      if (group.includes('progressive alliance of socialists') || group.includes('socialists and democrats')) {
        return { position: 2, label: 'Left', color: '#EF4444' }; // Light Red
      }
      if (group.includes('greens') || group.includes('european free alliance')) {
        return { position: 3, label: 'Left-Center', color: '#10B981' }; // Green
      }
      
      // Center groups
      if (group.includes('renew europe') || group.includes('liberal')) {
        return { position: 4, label: 'Center', color: '#3B82F6' }; // Blue
      }
      
      // Right-wing groups
      if (group.includes('european people\'s party') || group.includes('christian democrats')) {
        return { position: 5, label: 'Right-Center', color: '#8B5CF6' }; // Purple
      }
      if (group.includes('conservatives and reformists') || group.includes('european conservatives')) {
        return { position: 6, label: 'Right', color: '#F59E0B' }; // Orange
      }
      if (group.includes('identity and democracy') || group.includes('patriots for europe')) {
        return { position: 7, label: 'Far Right', color: '#6B7280' }; // Gray
      }
      
      // Default for unknown groups
      return { position: 4, label: 'Unknown', color: '#9CA3AF' }; // Light Gray
    };

    // Calculate average attendance for each group
    const groupStats = Array.from(groupMap.entries()).map(([group, groupMeps]) => {
      const attendances = groupMeps
        .map(mep => mep.attendance_pct || 0)
        .filter(att => att > 0)

      const average = attendances.length > 0 
        ? attendances.reduce((sum, att) => sum + att, 0) / attendances.length 
        : 0

      const spectrum = getPoliticalSpectrum(group);

      return {
        group,
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: groupMeps.length,
        spectrum: spectrum,
        meps: groupMeps.map(mep => ({
          name: mep.name,
          attendance: mep.attendance_pct || 0
        }))
      }
    }).sort((a, b) => a.spectrum.position - b.spectrum.position) // Sort by political spectrum (left to right)

    console.log(`Political Groups Analytics API: Generated stats for ${groupStats.length} political groups`)

    return NextResponse.json({
      groups: groupStats,
      totalMeps: mepsWithAttendance.length,
      totalGroups: groupStats.length
    })
  } catch (error) {
    console.error('Political Groups Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate political groups analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
