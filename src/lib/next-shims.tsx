import React from 'react';

/**
 * Universal Next.js shims for Vite environments.
 * Prevents Vite production bundling failures when Next.js primitives are referenced.
 */

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && href.startsWith('#')) {
      e.preventDefault();
      window.location.hash = href;
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default Link;

export function usePathname(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname || '/';
  }
  return '/';
}

export function useSearchParams(): URLSearchParams {
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search);
  }
  return new URLSearchParams();
}

export function useRouter() {
  return {
    push: (url: string) => {
      if (typeof window !== 'undefined') {
        if (url.startsWith('#')) {
          window.location.hash = url;
        } else {
          window.location.href = url;
        }
      }
    },
    replace: (url: string) => {
      if (typeof window !== 'undefined') {
        window.location.replace(url);
      }
    },
    back: () => {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    },
    forward: () => {
      if (typeof window !== 'undefined') {
        window.history.forward();
      }
    },
    prefetch: () => {},
    refresh: () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
  };
}
