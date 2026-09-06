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
          // Sync profile to public.profiles if needed
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, target_score')
            .eq('id', user.id)
            .maybeSingle();

          if (!profile) {
            const meta = user.user_metadata || {};
            const cleanName = meta.full_name || meta.name || 'Talaba';
            const cleanUser = meta.username || user.email?.split('@')[0] || 'user';
            const cleanAvatar = meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`;
            await supabase.from('profiles').upsert({
              id: user.id,
              full_name: cleanName,
              username: cleanUser,
              avatar_url: cleanAvatar,
              target_score: 1500,
            });
          }

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
