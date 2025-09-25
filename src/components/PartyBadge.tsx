'use client';

import { Badge } from '@/components/ui/badge';

interface PartyBadgeProps {
  party: string;
  className?: string;
}

// Party color mapping for visual distinction
const partyColors: Record<string, string> = {
  'European People\'s Party': 'bg-blue-100 text-blue-800',
  'Progressive Alliance of Socialists and Democrats': 'bg-red-100 text-red-800',
  'Renew Europe': 'bg-yellow-100 text-yellow-800',
  'Greens/European Free Alliance': 'bg-green-100 text-green-800',
  'Identity and Democracy': 'bg-purple-100 text-purple-800',
  'European Conservatives and Reformists': 'bg-orange-100 text-orange-800',
  'The Left': 'bg-pink-100 text-pink-800',
  'Non-attached': 'bg-gray-100 text-gray-800',
};

export default function PartyBadge({ party, className = '' }: PartyBadgeProps) {
  const colorClass = partyColors[party] || 'bg-gray-100 text-gray-800';
  
  return (
    <Badge className={`${colorClass} ${className}`} variant="secondary">
      {party}
    </Badge>
  );
}