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
 * ASRON SAT Official Geometric Brand Logo
 * 4 rounded ascending block segments forming the signature growth delta / upward peak.
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

  // Brand Colors
  const fillWhite = '#FFFFFF';
  const fillNavy = '#001744';

  const markColor = inverted
    ? fillNavy
    : variant === 'monochrome'
    ? 'currentColor'
    : fillWhite;

  const textColor = inverted
    ? fillNavy
    : variant === 'monochrome'
    ? 'currentColor'
    : fillNavy;

  // If a custom logo URL is provided, display it directly
  if (logoUrl) {
    if (variant === 'full' && showText) {
      return (
        <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
          <img
            src={logoUrl}
            alt="Logo"
            className="rounded-xl object-cover shrink-0 shadow-xs border border-slate-200 dark:border-slate-800"
            style={{ width: pixelSize, height: pixelSize }}
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
        src={logoUrl}
        alt="Logo"
        className={`rounded-xl object-cover shrink-0 shadow-xs border border-slate-200 dark:border-slate-800 ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      />
    );
  }

  // Official Vector Geometry SVG (512x512)
  const GeometrySVG = (
    <svg
      viewBox="0 0 512 512"
      width={pixelSize}
      height={pixelSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <g fill={markColor}>
        <rect x="226" y="76" width="60" height="248" rx="28" transform="rotate(-45 256 200)" />
        <rect x="306" y="196" width="58" height="132" rx="28" transform="rotate(-45 335 262)" />
        <rect x="195" y="240" width="56" height="110" rx="26" transform="rotate(45 223 295)" />
        <rect x="261" y="240" width="56" height="110" rx="26" transform="rotate(-45 289 295)" />
      </g>
    </svg>
  );

  if (variant === 'mark-only') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-[#001744] text-white p-1.5 shadow-sm shrink-0 ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <svg
          viewBox="0 0 512 512"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#FFFFFF">
            <rect x="226" y="76" width="60" height="248" rx="28" transform="rotate(-45 256 200)" />
            <rect x="306" y="196" width="58" height="132" rx="28" transform="rotate(-45 335 262)" />
            <rect x="195" y="240" width="56" height="110" rx="26" transform="rotate(45 223 295)" />
            <rect x="261" y="240" width="56" height="110" rx="26" transform="rotate(-45 289 295)" />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <div
          className="rounded-xl bg-[#001744] flex items-center justify-center shadow-sm shrink-0"
          style={{ width: pixelSize, height: pixelSize, padding: pixelSize * 0.12 }}
        >
          <svg
            viewBox="0 0 512 512"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="#FFFFFF">
              <rect x="226" y="76" width="60" height="248" rx="28" transform="rotate(-45 256 200)" />
              <rect x="306" y="196" width="58" height="132" rx="28" transform="rotate(-45 335 262)" />
              <rect x="195" y="240" width="56" height="110" rx="26" transform="rotate(45 223 295)" />
              <rect x="261" y="240" width="56" height="110" rx="26" transform="rotate(-45 289 295)" />
            </g>
          </svg>
        </div>
        {showText && (
          <div className="flex flex-col text-left leading-none">
            <span className="font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] text-base">
              ASRON SAT
            </span>
            <span className="text-[9px] font-mono tracking-wider uppercase text-[#64748B] dark:text-[#94A3B8] font-semibold mt-0.5">
              Digital SAT Intelligence
            </span>
          </div>
        )}
      </div>
    );
  }

  // Monochrome / direct embed
  return GeometrySVG;
};

export default AsronLogo;
