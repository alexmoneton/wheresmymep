import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Stats | Where\'s My MEP?',
  description: 'Admin statistics and metrics dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminStatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


