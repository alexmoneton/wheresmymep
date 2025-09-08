interface CountryFlagProps {
  country: string;
  className?: string;
}

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
  'United Kingdom': '🇬🇧',
  'Kingdom of Denmark': '🇩🇰',
  'Kingdom of the Netherlands': '🇳🇱',
  'German Democratic Republic': '🇩🇪',
  'Polish People\'s Republic': '🇵🇱',
  'Socialist Federal Republic of Yugoslavia': '🇷🇸',
  'Soviet Union': '🇷🇺',
  'State of Palestine': '🇵🇸',
  'Tunisia': '🇹🇳',
  'Algeria': '🇩🇿',
  'Morocco': '🇲🇦',
  'Bosnia and Herzegovina': '🇧🇦',
  'United States': '🇺🇸',
};

export default function CountryFlag({ country, className = '' }: CountryFlagProps) {
  const flag = countryFlags[country] || '🏳️';
  return <span className={className}>{flag}</span>;
}
