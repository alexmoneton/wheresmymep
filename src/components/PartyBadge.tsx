interface PartyBadgeProps {
  party: string;
  className?: string;
}

const partyColors: Record<string, string> = {
  'Group of the European People\'s Party (Christian Democrats)': 'bg-blue-100 text-blue-800',
  'Group of the Progressive Alliance of Socialists and Democrats in the European Parliament': 'bg-red-100 text-red-800',
  'Renew Europe Group': 'bg-yellow-100 text-yellow-800',
  'Group of the Greens/European Free Alliance': 'bg-green-100 text-green-800',
  'European Conservatives and Reformists Group': 'bg-purple-100 text-purple-800',
  'Identity and Democracy Group': 'bg-gray-100 text-gray-800',
  'The Left group in the European Parliament - GUE/NGL': 'bg-pink-100 text-pink-800',
  'Patriots for Europe Group': 'bg-orange-100 text-orange-800',
  'Non-attached Members': 'bg-gray-100 text-gray-600',
};

const partyShortNames: Record<string, string> = {
  'Group of the European People\'s Party (Christian Democrats)': 'EPP',
  'Group of the Progressive Alliance of Socialists and Democrats in the European Parliament': 'S&D',
  'Renew Europe Group': 'RE',
  'Group of the Greens/European Free Alliance': 'Greens/EFA',
  'European Conservatives and Reformists Group': 'ECR',
  'Identity and Democracy Group': 'ID',
  'The Left group in the European Parliament - GUE/NGL': 'Left',
  'Patriots for Europe Group': 'Patriots',
  'Non-attached Members': 'NI',
};

export default function PartyBadge({ party, className = '' }: PartyBadgeProps) {
  if (!party || party === 'nan') {
    return <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 ${className}`}>NI</span>;
  }
  
  const colorClass = partyColors[party] || 'bg-gray-100 text-gray-600';
  const shortName = partyShortNames[party] || party.split(' ')[0];
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass} ${className}`}>
      {shortName}
    </span>
  );
}
