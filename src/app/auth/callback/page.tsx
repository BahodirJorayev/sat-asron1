'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase, setAuthCookie, mapSupabaseUserToAppUser } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        if (typeof window === 'undefined') return;

        // 1. Check for ?code= param in URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // 2. Fetch session (handles exchanged code or implicit hash #access_token=)
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (user) {
          const authIntent = typeof window !== 'undefined' ? localStorage.getItem('asron_auth_intent') : null;

          // Strictly enforce One User = One Profile (no duplicate creation or overwrite)
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          let profile = existingProfile;
          if (!profile && user.email) {
            const { data: profileByEmail } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', user.email)
              .maybeSingle();
            if (profileByEmail) profile = profileByEmail;
          }

          // Strict Guard 1: Sign up attempt with existing account
          if (authIntent === 'signup' && profile) {
            localStorage.removeItem('asron_auth_intent');
            await supabase.auth.signOut();
            const notice = {
              type: 'warning',
              message: "Sizda allaqachon akkaunt mavjud. Iltimos, Kirish (Log In) orqali kiring.",
              targetTab: 'signin',
            };
            localStorage.setItem('asron_auth_notice', JSON.stringify(notice));
            if (isMounted) {
              router.push('/login');
              window.location.href = '/login';
            }
            return;
          }

          // Strict Guard 2: Log in attempt with non-existing account
          if (authIntent === 'signin' && !profile) {
            localStorage.removeItem('asron_auth_intent');
            await supabase.auth.signOut();
            const notice = {
              type: 'error',
              message: "Bunday akkaunt topilmadi. Iltimos, avval ro'yxatdan o'ting.",
              targetTab: 'signup',
            };
            localStorage.setItem('asron_auth_notice', JSON.stringify(notice));
            if (isMounted) {
              router.push('/register');
              window.location.href = '/register';
            }
            return;
          }

          if (authIntent === 'signup' && !profile) {
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Talaba',
              username: user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            });
          } else if (!profile) {
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Talaba',
              username: user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            });
          }

          localStorage.removeItem('asron_auth_intent');
          localStorage.removeItem('asron_auth_notice');

          const appUser = mapSupabaseUserToAppUser(user, {
            fullName: profile?.full_name,
            username: profile?.username,
            avatarUrl: profile?.avatar_url,
          });

          setAuthCookie(appUser);
          localStorage.setItem('aurasat_user_profile', JSON.stringify(appUser));
          localStorage.setItem('aura_sat_auth_user', JSON.stringify(appUser));
        }

        // 3. Navigate smoothly to /dashboard
        if (isMounted) {
          router.push('/dashboard');
          router.refresh();
          window.location.href = '/dashboard';
        }
      } catch (err: any) {
        console.error('Auth callback processing error:', err);
        if (isMounted) {
          router.push('/dashboard');
          window.location.href = '/dashboard';
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E07A5F]" />
        <p className="text-xs font-mono text-slate-400">Tizimga ulanmoqda, iltimos kuting...</p>
      </div>
    </div>
  );
}
