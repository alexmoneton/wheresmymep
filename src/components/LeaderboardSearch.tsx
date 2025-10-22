'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

interface LeaderboardSearchProps {
  defaultValue?: string
  placeholder?: string
}

export function LeaderboardSearch({ defaultValue = '', placeholder = 'Search MEPs...' }: LeaderboardSearchProps) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Update query when searchParams change (e.g., when navigating back)
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    setQuery(urlQuery)
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/leaderboard?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/leaderboard')
    }
  }

  const handleClear = () => {
    setQuery('')
    router.push('/leaderboard')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="sr-only">Clear search</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </form>
  )
}


