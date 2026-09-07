import React from 'react';

export interface AsronLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'full' | 'mark-only' | 'monochrome';
  inverted?: boolean;
  showText?: boolean;
  logoUrl?: string | null;
}

/**
 * ASRON SAT Official Brand Logo
 * Displays the authentic high-resolution ASRON SAT brand mark without distortion or artificial approximation.
 */
export const AsronLogo: React.FC<AsronLogoProps> = ({
  size = 36,
  className = '',
  variant = 'mark-only',
  inverted = false,
  showText = true,
  logoUrl = null,
}) => {
  // Convert string size aliases to pixel values if needed
  const pixelSize = typeof size === 'number' ? size : size === 'sm' ? 28 : size === 'lg' ? 48 : size === 'xl' ? 64 : 36;

  // Use the custom logo URL if provided, otherwise default to the official authentic /logo.png
  const activeSrc = (logoUrl && logoUrl.trim() && logoUrl !== '/brand/logo.svg') ? logoUrl.trim() : '/logo.png';

  if (variant === 'full' && showText) {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <img
          src={activeSrc}
          alt="ASRON SAT"
          width={pixelSize}
          height={pixelSize}
          className="rounded-xl object-contain shrink-0 shadow-xs border border-slate-200/50 dark:border-slate-800/80"
          style={{ width: pixelSize, height: pixelSize }}
          loading="eager"
        />
        <div className="flex flex-col text-left leading-none">
          <span className="font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] text-base">
            ASRON SAT
          </span>
          <span className="text-[9px] font-mono tracking-wider uppercase text-[#64748B] dark:text-[#94A3B8] font-semibold mt-0.5">
            Digital SAT Intelligence
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt="ASRON SAT"
      width={pixelSize}
      height={pixelSize}
      className={`rounded-xl object-contain shrink-0 select-none shadow-xs border border-slate-200/30 dark:border-slate-800/50 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      loading="eager"
    />
  );
};

export default AsronLogo;
