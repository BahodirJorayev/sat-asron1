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

    const processAuthUser = async (user: any) => {
      try {
        const authIntent = typeof window !== 'undefined' ? localStorage.getItem('asron_auth_intent') : null;

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email, username, full_name')
          .eq('id', user.id)
          .maybeSingle();

        let profile = existingProfile;
        if (!profile && user.email) {
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('id, email, username, full_name')
            .eq('email', user.email)
            .maybeSingle();
          if (profileByEmail) profile = profileByEmail;
        }

        // Sign Up guard: account already exists
        if (authIntent === 'signup' && profile) {
          localStorage.removeItem('asron_auth_intent');
          await supabase.auth.signOut();
          const notice = {
            type: 'warning',
            message: "Sizda allaqachon akkaunt mavjud. Iltimos, Kirish (Log In) orqali kiring.",
            targetTab: 'signin',
          };
          localStorage.setItem('asron_auth_notice', JSON.stringify(notice));
          router.push('/login');
          return;
        }

        // Log In guard: account not found
        if (authIntent === 'signin' && !profile) {
          localStorage.removeItem('asron_auth_intent');
          await supabase.auth.signOut();
          const notice = {
            type: 'error',
            message: "Bunday akkaunt topilmadi. Iltimos, avval ro'yxatdan o'ting.",
            targetTab: 'signup',
          };
          localStorage.setItem('asron_auth_notice', JSON.stringify(notice));
          router.push('/register');
          return;
        }

        // Valid new sign up
        if (authIntent === 'signup' && !profile) {
          localStorage.removeItem('asron_auth_intent');
          localStorage.removeItem('asron_auth_notice');
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Talaba',
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          });
        } else if (authIntent === 'signin') {
          localStorage.removeItem('asron_auth_intent');
          localStorage.removeItem('asron_auth_notice');
        } else if (!profile) {
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Talaba',
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          });
        }

        if (isMounted) {
          router.push('/dashboard');
          router.refresh();
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          }
        }
      } catch (err) {
        console.error('Error processing auth user on root page:', err);
      }
    };

    // 1. Listen for instant auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && isMounted) {
        await processAuthUser(session.user);
      }
    });

    // 2. Initial session check on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && isMounted) {
        await processAuthUser(session.user);
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
