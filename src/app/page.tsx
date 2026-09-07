'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { LandingView } from '../components/LandingView';
import { INITIAL_USER } from '../data/mockDatabase';
import { INITIAL_SITE_CONFIG, INITIAL_BLOG_ARTICLES, INITIAL_TESTIMONIALS } from '../data/blogAndBrandingData';

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Listen for instant auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && isMounted) {
        // Enforce 1 user = 1 profile
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Talaba',
              username: session.user.email?.split('@')[0] || `user_${session.user.id.slice(0, 5)}`,
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
            });
          }
        } catch {}

        router.push('/dashboard');
        router.refresh();
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
      }
    });

    // 2. Initial session check on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && isMounted) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Talaba',
              username: session.user.email?.split('@')[0] || `user_${session.user.id.slice(0, 5)}`,
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
            });
          }
        } catch {}

        router.push('/dashboard');
        router.refresh();
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
      } else if (isMounted) {
        setChecking(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0A0F1D] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#E07A5F] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <LandingView
      user={INITIAL_USER}
      siteBranding={INITIAL_SITE_CONFIG}
      blogArticles={INITIAL_BLOG_ARTICLES}
      testimonials={INITIAL_TESTIMONIALS}
      onOpenAuthModal={(mode) => router.push(mode === 'signup' ? '/register' : '/login')}
      onOpenDiagnostic={() => router.push('/dashboard')}
      onOpenDailyWorkout={() => router.push('/dashboard')}
      onOpenPaywall={() => router.push('/dashboard')}
      onNavigateToBlog={() => router.push('/dashboard')}
    />
  );
}
