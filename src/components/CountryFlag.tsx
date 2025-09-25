'use client';

interface CountryFlagProps {
  country: string;
  className?: string;
}

// Simple country flag emoji mapping
const countryFlags: Record<string, string> = {
  'Austria': '🇦🇹',
  'Belgium': '🇧🇪',
  'Bulgaria': '🇧🇬',
  'Croatia': '🇭🇷',
  'Cyprus': '🇨🇾',
  'Czech Republic': '🇨🇿',
  'Denmark': '🇩🇰',
  'Estonia': '🇪🇪',
  'Finland': '🇫🇮',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Greece': '🇬🇷',
  'Hungary': '🇭🇺',
  'Ireland': '🇮🇪',
  'Italy': '🇮🇹',
  'Latvia': '🇱🇻',
  'Lithuania': '🇱🇹',
  'Luxembourg': '🇱🇺',
  'Malta': '🇲🇹',
  'Netherlands': '🇳🇱',
  'Poland': '🇵🇱',
  'Portugal': '🇵🇹',
  'Romania': '🇷🇴',
  'Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮',
  'Spain': '🇪🇸',
  'Sweden': '🇸🇪',
};

export default function CountryFlag({ country, className = '' }: CountryFlagProps) {
  const flag = countryFlags[country] || '🏳️';
  
  return (
    <span className={className} title={country}>
      {flag}
    </span>
  );
}