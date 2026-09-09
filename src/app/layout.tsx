import type { Metadata, Viewport } from 'next';
import React from 'react';
import '../index.css';
import '../lib/supabase';
import { LanguageProvider } from '../context/LanguageContext';
import { PlatformSettingsProvider } from '../contexts/PlatformSettingsContext';
import { UserProfileProvider } from '../context/UserProfileContext';
import { PathnameNormalizer } from '../components/navigation/PathnameNormalizer';

export const metadata: Metadata = {
  title: 'ASRON SAT • Digital SAT Intelligence Platform',
  description: 'Digital SAT Preparation Platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ASRON SAT',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo.png', sizes: '1024x1024', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'ASRON SAT • Digital SAT Intelligence Platform',
    description: 'Digital SAT Preparation Platform with authentic Bluebook engine and Desmos intelligence.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ASRON SAT Platform Logo & Cover',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASRON SAT • Digital SAT Intelligence Platform',
    description: 'Digital SAT Preparation Platform with authentic Bluebook engine and Desmos intelligence.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#03165a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('aurasat-theme');
                  var isDark = false;
                  if (stored === 'dark') {
                    isDark = true;
                  } else if (stored === 'light') {
                    isDark = false;
                  } else if (stored === 'system') {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  } else {
                    isDark = false;
                  }
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                    root.setAttribute('data-theme', 'dark');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    root.setAttribute('data-theme', 'light');
                    root.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#03165a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ASRON SAT" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
      </head>
      <body className="bg-[#FAF7F2] dark:bg-[#0A0F1D] text-[#1C1917] dark:text-[#F8FAFC] antialiased min-h-screen">
        <PathnameNormalizer />
        <PlatformSettingsProvider>
          <LanguageProvider>
            <UserProfileProvider>
              {children}
            </UserProfileProvider>
          </LanguageProvider>
        </PlatformSettingsProvider>
      </body>
    </html>
  );
}
