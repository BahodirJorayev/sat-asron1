import React from 'react';

/**
 * Universal Next.js shims for Vite & SPA environments.
 * Prevents static 404s on hosts like Vercel by leveraging client-side pushState
 * and dispatching navigation events to synchronise App Router and SPA states.
 */

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
}

function handleInternalNavigation(url: string, replace = false) {
  if (typeof window === 'undefined') return;

  const targetPath = url.split('?')[0];

  // Map path to canonical SPA hash fallback
  const pathToHash: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/': 'dashboard',
    '/questions': 'qbank',
    '/mocks': 'bluebook',
    '/vocabulary': 'vocab',
    '/mistakes': 'vault',
    '/chat': 'community',
    '/community': 'community',
    '/profile': 'profile',
    '/admin': 'admin',
    '/login': 'landing',
    '/register': 'landing',
  };

  const matchedHash = pathToHash[targetPath];

  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }

  if (matchedHash) {
    window.location.hash = `#/${matchedHash}`;
  }

  // Dispatch events for activeTab listeners across the app
  window.dispatchEvent(new CustomEvent('asron_navigate', { detail: { href: url, path: targetPath } }));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  onClick,
  replace,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;

    if (href.startsWith('#')) {
      e.preventDefault();
      window.location.hash = href;
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (!href.startsWith('http') && !href.startsWith('//') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      // Internal navigation: prevent static 404 page reload
      e.preventDefault();
      handleInternalNavigation(href, replace);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default Link;

function resolveCurrentPath(): string {
  if (typeof window !== 'undefined') {
    const p = window.location.pathname;
    if (p && p !== '/') return p;
    // Fallback from hash
    const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
    if (hash === 'dashboard') return '/dashboard';
    if (hash === 'qbank' || hash === 'questions') return '/questions';
    if (hash === 'bluebook' || hash === 'mocks') return '/mocks';
    if (hash === 'vocab' || hash === 'vocabulary') return '/vocabulary';
    if (hash === 'vault' || hash === 'mistakes') return '/mistakes';
    if (hash === 'community' || hash.startsWith('chat')) return '/chat';
    if (hash === 'profile') return '/profile';
    if (hash === 'admin') return '/admin';
    return p || '/dashboard';
  }
  return '/dashboard';
}

export function usePathname(): string {
  const [pathname, setPathname] = React.useState<string>(resolveCurrentPath);

  React.useEffect(() => {
    const handleLocationChange = () => {
      setPathname(resolveCurrentPath());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('asron_navigate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('asron_navigate', handleLocationChange);
    };
  }, []);

  return pathname;
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
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else if (!url.startsWith('http') && !url.startsWith('//')) {
          handleInternalNavigation(url, false);
        } else {
          window.location.href = url;
        }
      }
    },
    replace: (url: string) => {
      if (typeof window !== 'undefined') {
        if (url.startsWith('#')) {
          window.location.hash = url;
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else if (!url.startsWith('http') && !url.startsWith('//')) {
          handleInternalNavigation(url, true);
        } else {
          window.location.replace(url);
        }
      }
    },
    back: () => {
      if (typeof window !== 'undefined') {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          handleInternalNavigation('/dashboard', true);
        }
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
