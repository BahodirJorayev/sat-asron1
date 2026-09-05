import React, { useState } from 'react';

interface EntityAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'rounded' | 'circle';
  className?: string;
  isOnline?: boolean;
}

/**
 * Extracts a crisp 2-letter monogram from entity or user name.
 * E.g. "SAT Math Club" -> "SM", "Alisher Navoiy" -> "AN", "Physics" -> "PH".
 */
export function getMonogramInitials(name?: string): string {
  if (!name) return 'AS';
  const clean = name
    .replace(/^[@#\s]+/, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();

  if (!clean) return 'AS';

  const parts = clean.split(/[\s_\-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

const sizeClasses: Record<string, { container: string; text: string; onlineBadge: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', onlineBadge: 'w-1.5 h-1.5 bottom-0 right-0' },
  sm: { container: 'w-8 h-8', text: 'text-xs', onlineBadge: 'w-2 h-2 bottom-0 right-0' },
  md: { container: 'w-10 h-10', text: 'text-sm', onlineBadge: 'w-2.5 h-2.5 bottom-0 right-0' },
  lg: { container: 'w-12 h-12', text: 'text-base', onlineBadge: 'w-3 h-3 bottom-0.5 right-0.5' },
  xl: { container: 'w-16 h-16', text: 'text-xl', onlineBadge: 'w-3.5 h-3.5 bottom-0.5 right-0.5' },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl', onlineBadge: 'w-4 h-4 bottom-1 right-1' },
};

export const EntityAvatar: React.FC<EntityAvatarProps> = ({
  name = '',
  avatarUrl,
  size = 'md',
  shape = 'rounded',
  className = '',
  isOnline = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getMonogramInitials(name);
  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  // Check if image is a real uploaded URL (not empty or broken)
  const hasRealImage = Boolean(avatarUrl && !imageError && avatarUrl.trim() !== '');

  return (
    <div className={`relative inline-flex shrink-0 select-none ${sizeConfig.container} ${className}`}>
      {hasRealImage ? (
        <img
          src={avatarUrl!}
          alt={name}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover border border-[#E2E8F0] dark:border-[#1E293B] ${shapeClass}`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-mono font-bold tracking-wider 
            bg-[#E2E8F0] text-[#0F172A] dark:bg-[#1E293B] dark:text-[#F8FAFC] 
            border border-[#CBD5E1] dark:border-[#334155]/80 shadow-2xs ${sizeConfig.text} ${shapeClass}`}
          aria-label={name}
        >
          {initials}
        </div>
      )}

      {isOnline && (
        <span
          className={`absolute rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121A2F] ${sizeConfig.onlineBadge}`}
          title="Onlayn"
        />
      )}
    </div>
  );
};
