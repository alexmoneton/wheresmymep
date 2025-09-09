interface SpecialRoleBadgeProps {
  role: string;
  className?: string;
}

export default function SpecialRoleBadge({ role, className = "" }: SpecialRoleBadgeProps) {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'president':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vice-president':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'chair':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)} ${className}`}>
      {role}
    </span>
  );
}
