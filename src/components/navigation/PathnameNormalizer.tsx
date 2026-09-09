'use client';

import { useEffect } from 'react';

export function PathnameNormalizer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    if (pathname.includes('/dashboard') && !hash.includes('dashboard')) {
      window.location.hash = '#/dashboard';
    } else if (
      (pathname.includes('/questions') || pathname.includes('/qbank') || pathname.includes('/sqb') || pathname.includes('/practice')) &&
      !hash.includes('questions') && !hash.includes('qbank') && !hash.includes('sqb')
    ) {
      window.location.hash = '#/qbank';
    } else if (
      (pathname.includes('/mocks') || pathname.includes('/mock') || pathname.includes('/test') || pathname.includes('/bluebook')) &&
      !hash.includes('mocks') && !hash.includes('mock') && !hash.includes('bluebook')
    ) {
      window.location.hash = '#/bluebook';
    } else if (
      (pathname.includes('/community') || pathname.includes('/chat') || pathname.includes('/hamjamiyat')) &&
      !hash.includes('community') && !hash.includes('chat')
    ) {
      window.location.hash = '#/community';
    } else if (
      (pathname.includes('/vocabulary') || pathname.includes('/vocab') || pathname.includes('/lug')) &&
      !hash.includes('vocabulary') && !hash.includes('vocab')
    ) {
      window.location.hash = '#/vocab';
    } else if (
      (pathname.includes('/mistakes') || pathname.includes('/vault') || pathname.includes('/error') || pathname.includes('/xato')) &&
      !hash.includes('mistakes') && !hash.includes('vault')
    ) {
      window.location.hash = '#/vault';
    } else if (
      (pathname.includes('/profile') || pathname.includes('/settings') || pathname.includes('/setting')) &&
      !hash.includes('profile') && !hash.includes('setting')
    ) {
      window.location.hash = '#/profile';
    } else if (pathname.includes('/admin') && !hash.includes('admin')) {
      window.location.hash = '#/admin';
    } else if (pathname.includes('/arena') && !hash.includes('arena')) {
      window.location.hash = '#/arena';
    } else if ((pathname.includes('/ai-tutor') || pathname.includes('/tutor')) && !hash.includes('tutor')) {
      window.location.hash = '#/ai-tutor';
    } else if (pathname.includes('/roadmap') && !hash.includes('roadmap')) {
      window.location.hash = '#/roadmap';
    } else if ((pathname.includes('/daily-workout') || pathname.includes('/workout')) && !hash.includes('workout')) {
      window.location.hash = '#/daily-workout';
    } else if (pathname.includes('/blog') && !hash.includes('blog')) {
      window.location.hash = '#/blog';
    }
  }, []);

  return null;
}
