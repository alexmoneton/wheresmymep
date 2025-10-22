interface PartyBadgeProps {
  party: string;
  className?: string;
}

const partyColors: Record<string, string> = {
  // Official European Parliament Groups
  'European People\'s Party (EPP)': 'bg-blue-100 text-blue-800',
  'Progressive Alliance of Socialists and Democrats (S&D)': 'bg-red-100 text-red-800',
  'Renew Europe (RE)': 'bg-yellow-100 text-yellow-800',
  'Greens/European Free Alliance (Greens/EFA)': 'bg-green-100 text-green-800',
  'European Conservatives and Reformists (ECR)': 'bg-purple-100 text-purple-800',
  'Identity and Democracy (ID)': 'bg-gray-100 text-gray-800',
  'The Left in the European Parliament (GUE/NGL)': 'bg-pink-100 text-pink-800',
  'The Patriots for Europe (PfE)': 'bg-orange-100 text-orange-800',
  'Europe of Sovereign Nations (ESN)': 'bg-indigo-100 text-indigo-800',
  'Non-attached (NI)': 'bg-gray-100 text-gray-600',
  
  // National parties (fallback)
  'Alternative Democratic Reform Party': 'bg-gray-100 text-gray-600',
  'Bulgarian Socialist Party': 'bg-red-100 text-red-800',
  'Communist Party of Greece (Interior)': 'bg-pink-100 text-pink-800',
  'Course of Freedom': 'bg-gray-100 text-gray-600',
  'Denmark Democrats - Inger Støjberg': 'bg-gray-100 text-gray-600',
  'Die PARTEI': 'bg-gray-100 text-gray-600',
  'Party of Progress': 'bg-gray-100 text-gray-600',
  'Progressive Party of Working People': 'bg-pink-100 text-pink-800',
  'Sahra Wagenknecht Alliance': 'bg-pink-100 text-pink-800',
  'Stačilo!': 'bg-gray-100 text-gray-600',
  'Sumar': 'bg-pink-100 text-pink-800',
};

const partyShortNames: Record<string, string> = {
  // Official European Parliament Groups
  'European People\'s Party (EPP)': 'EPP',
  'Progressive Alliance of Socialists and Democrats (S&D)': 'S&D',
  'Renew Europe (RE)': 'RE',
  'Greens/European Free Alliance (Greens/EFA)': 'Greens/EFA',
  'European Conservatives and Reformists (ECR)': 'ECR',
  'Identity and Democracy (ID)': 'ID',
  'The Left in the European Parliament (GUE/NGL)': 'Left',
  'The Patriots for Europe (PfE)': 'Patriots',
  'Europe of Sovereign Nations (ESN)': 'ESN',
  'Non-attached (NI)': 'NI',
  
  // National parties (show full name or abbreviated)
  'Alternative Democratic Reform Party': 'ADR',
  'Bulgarian Socialist Party': 'BSP',
  'Communist Party of Greece (Interior)': 'KKE',
  'Course of Freedom': 'Freedom',
  'Denmark Democrats - Inger Støjberg': 'Denmark Dems',
  'Die PARTEI': 'Die PARTEI',
  'Party of Progress': 'Progress',
  'Progressive Party of Working People': 'AKEL',
  'Sahra Wagenknecht Alliance': 'BSW',
  'Stačilo!': 'Stačilo!',
  'Sumar': 'Sumar',
};

export default function PartyBadge({ party, className = '' }: PartyBadgeProps) {
  if (!party || party === 'nan') {
    return <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 ${className}`}>NI</span>;
  }
  
  const colorClass = partyColors[party] || 'bg-gray-100 text-gray-600';
  const shortName = partyShortNames[party] || party;
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass} ${className}`}>
      {shortName}
    </span>
  );
}
