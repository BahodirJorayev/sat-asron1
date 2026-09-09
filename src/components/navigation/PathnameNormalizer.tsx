'use client';

import { useEffect } from 'react';

export function PathnameNormalizer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    if (pathname.includes('/dashboard') && !hash.includes('dashboard')) {
      window.location.hash = '#/dashboard';
    } else if (pathname.includes('/questions') && !hash.includes('questions') && !hash.includes('qbank')) {
      window.location.hash = '#/questions';
    } else if (pathname.includes('/mocks') && !hash.includes('mocks') && !hash.includes('bluebook')) {
      window.location.hash = '#/mocks';
    } else if ((pathname.includes('/community') || pathname.includes('/chat')) && !hash.includes('community') && !hash.includes('chat')) {
      window.location.hash = '#/community';
    } else if (pathname.includes('/vocabulary') && !hash.includes('vocabulary') && !hash.includes('vocab')) {
      window.location.hash = '#/vocabulary';
    } else if (pathname.includes('/mistakes') && !hash.includes('mistakes') && !hash.includes('vault')) {
      window.location.hash = '#/mistakes';
    } else if (pathname.includes('/profile') && !hash.includes('profile')) {
      window.location.hash = '#/profile';
    } else if (pathname.includes('/admin') && !hash.includes('admin')) {
      window.location.hash = '#/admin';
    }
  }, []);

  return null;
}
