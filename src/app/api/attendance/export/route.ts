import { NextRequest, NextResponse } from 'next/server'
import { listMEPs } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    // Get all MEPs with attendance data
    const allMEPs = listMEPs()
    
    // Filter MEPs with valid data (same logic as leaderboard)
    const filteredMEPs = allMEPs.filter(mep => {
      // Must have an ID and attendance data
      if (!mep.mep_id || (mep.votes_total_period || 0) === 0) {
        return false
      }
      
      // Exclude MEPs on sick leave
      if (mep.sick_leave) {
        return false
      }
      
      return true
    })

    // Create CSV headers
    const headers = [
      'MEP ID',
      'Name',
      'Country',
      'Party',
      'National Party',
      'Votes Total Period',
      'Votes Cast',
      'Attendance Percentage',
      'Partial Term'
    ]

    // Create CSV rows
    const rows = filteredMEPs.map(mep => [
      mep.mep_id || '',
      mep.name || '',
      mep.country || '',
      mep.party || '',
      mep.national_party || '',
      mep.votes_total_period || 0,
      mep.votes_cast || 0,
      mep.attendance_pct || 0,
      mep.partial_term ? 'Yes' : 'No'
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    // Create filename with current date
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `mep-attendance-${currentDate}.csv`

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error exporting attendance data:', error)
    return NextResponse.json(
      { error: 'Failed to export attendance data' },
      { status: 500 }
    )
  }
}
