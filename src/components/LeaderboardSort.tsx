'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface LeaderboardSortProps {
  sortBy: string
  sortOrder: string
}

export default function LeaderboardSort({ sortBy, sortOrder }: LeaderboardSortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', newSortBy)
    params.delete('page') // Reset to page 1 when sorting changes
    router.push(`/leaderboard?${params.toString()}`)
  }

  const handleOrderToggle = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc'
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortOrder', newOrder)
    params.delete('page') // Reset to page 1 when order changes
    router.push(`/leaderboard?${params.toString()}`)
  }

  return (
    <div className="flex gap-2">
      <select
        value={sortBy}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="attendance">Sort by Attendance</option>
        <option value="party">Sort by Party</option>
        <option value="country">Sort by Country</option>
        <option value="name">Sort by Name</option>
      </select>
      
      <button
        onClick={handleOrderToggle}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={`Currently ${sortOrder === 'desc' ? 'descending' : 'ascending'}. Click to toggle.`}
      >
        {sortOrder === 'desc' ? '↓' : '↑'}
      </button>
    </div>
  )
}
