'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface UserProfileData {
  id: string;
  email?: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  phoneNumber?: string;
  targetScore?: number;
  targetExamDate?: string;
  planTier?: string;
  role?: string;
  streakDays?: number;
  xpPoints?: number;
  updatedAt?: string;
}

export interface UserProfileContextValue {
  profile: UserProfileData | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

export interface UserProfileProviderProps {
  children: ReactNode;
  initialUser?: User;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({
  children,
  initialUser,
}) => {
  const [profile, setProfile] = useState<UserProfileData | null>(() => {
    if (initialUser) {
      return {
        id: initialUser.id,
        email: initialUser.email,
        fullName: initialUser.fullName || initialUser.username || 'Talaba',
        username: initialUser.username || 'talaba',
        avatarUrl: initialUser.avatarUrl,
        phoneNumber: initialUser.phoneNumber,
        targetScore: initialUser.targetScore,
        targetExamDate: initialUser.targetExamDate,
        planTier: initialUser.planTier,
        role: initialUser.role,
        streakDays: initialUser.streakDays,
        xpPoints: initialUser.xpPoints,
      };
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem('aurasat_user_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            id: parsed.id,
            email: parsed.email,
            fullName: parsed.fullName || parsed.username || 'Talaba',
            username: parsed.username || 'talaba',
            avatarUrl: parsed.avatarUrl,
            phoneNumber: parsed.phoneNumber,
            targetScore: parsed.targetScore,
            targetExamDate: parsed.targetExamDate,
            planTier: parsed.planTier,
            role: parsed.role,
            streakDays: parsed.streakDays,
            xpPoints: parsed.xpPoints,
          };
        }
      } catch {}
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize profile from Supabase
  const fetchProfile = useCallback(async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        const mapped: UserProfileData = {
          id: data.id,
          email: data.email || user.email || '',
          fullName: data.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Talaba',
          username: data.username || user.user_metadata?.username || 'talaba',
          avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          phoneNumber: data.phone_number || user.user_metadata?.phone || '',
          targetScore: data.target_score || 1550,
          targetExamDate: data.target_exam_date || '2026-10-03',
          planTier: data.plan_tier || 'FREE',
          role: data.role || 'STUDENT',
          streakDays: data.streak_days || 0,
          xpPoints: data.xp_points || 0,
          updatedAt: data.updated_at,
        };
        setProfile(mapped);
      }
    } catch (err) {
      console.warn('UserProfile fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to real-time profile changes for auth.uid()
  useEffect(() => {
    let isMounted = true;
    let realtimeChannel: any = null;

    const setupSubscription = async () => {
      await fetchProfile();

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user || !isMounted) return;

      // Supabase Realtime channel listening to postgres_changes on profiles for this specific user
      const channelName = `user_profile_sync_${user.id}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload: any) => {
            if (payload.new && isMounted) {
              setProfile((prev) => {
                const nextFullName = payload.new.full_name || prev?.fullName || 'Talaba';
                const nextUsername = payload.new.username || prev?.username || 'talaba';
                const nextAvatar = payload.new.avatar_url !== undefined ? payload.new.avatar_url : prev?.avatarUrl;
                const nextTargetScore = payload.new.target_score || prev?.targetScore;

                const updated: UserProfileData = {
                  ...(prev || { id: user.id }),
                  id: payload.new.id || user.id,
                  fullName: nextFullName,
                  username: nextUsername,
                  avatarUrl: nextAvatar,
                  targetScore: nextTargetScore,
                  planTier: payload.new.plan_tier || prev?.planTier,
                  role: payload.new.role || prev?.role,
                  updatedAt: payload.new.updated_at,
                };

                // Sync to localStorage
                if (typeof localStorage !== 'undefined') {
                  try {
                    const saved = localStorage.getItem('aurasat_user_profile');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      localStorage.setItem(
                        'aurasat_user_profile',
                        JSON.stringify({ ...parsed, ...updated })
                      );
                    }
                  } catch {}
                }

                // Broadcast across window
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('asron_profile_updated', { detail: updated }));
                  window.dispatchEvent(new CustomEvent('profile_updated', { detail: updated }));
                }

                return updated;
              });
            }
          }
        )
        .subscribe();

      if (!isMounted) {
        supabase.removeChannel(channel);
      } else {
        realtimeChannel = channel;
      }
    };

    setupSubscription();

    // Listen to local window events and cross-tab BroadcastChannel
    const handleLocalProfileUpdate = (e: any) => {
      if (e && e.detail && isMounted) {
        const u = e.detail;
        setProfile((prev) => ({
          ...(prev || { id: u.id || '' }),
          fullName: u.fullName || u.full_name || prev?.fullName || 'Talaba',
          username: u.username || prev?.username || 'talaba',
          avatarUrl: u.avatarUrl !== undefined ? u.avatarUrl : (u.avatar_url !== undefined ? u.avatar_url : prev?.avatarUrl),
          targetScore: u.targetScore || u.target_score || prev?.targetScore,
          phoneNumber: u.phoneNumber || u.phone_number || prev?.phoneNumber,
        }));
      } else if (isMounted) {
        // Plain Event('profileUpdated') - re-fetch profile directly from Supabase
        fetchProfile();
      }
    };

    window.addEventListener('profileUpdated', handleLocalProfileUpdate);
    window.addEventListener('asron_profile_updated', handleLocalProfileUpdate);
    window.addEventListener('profile_updated', handleLocalProfileUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('asron_profile_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'profile_updated' && event.data?.user && isMounted) {
          const u = event.data.user;
          setProfile((prev) => ({
            ...(prev || { id: u.id || '' }),
            fullName: u.fullName || u.full_name || prev?.fullName || 'Talaba',
            username: u.username || prev?.username || 'talaba',
            avatarUrl: u.avatarUrl || u.avatar_url || prev?.avatarUrl,
            targetScore: u.targetScore || u.target_score || prev?.targetScore,
          }));
        }
      };
    } catch {}

    return () => {
      isMounted = false;
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
      window.removeEventListener('profileUpdated', handleLocalProfileUpdate);
      window.removeEventListener('asron_profile_updated', handleLocalProfileUpdate);
      window.removeEventListener('profile_updated', handleLocalProfileUpdate);
      if (bc) bc.close();
    };
  }, [fetchProfile]);

  // Optimistic profile update that persists to Supabase and broadcasts globally
  const updateProfile = useCallback(
    async (updates: Partial<UserProfileData>): Promise<boolean> => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const activeId = authData?.user?.id || profile?.id;
        if (!activeId) return false;

        // 1. Optimistic local update
        setProfile((prev) => {
          const next = { ...(prev || { id: activeId }), ...updates } as UserProfileData;
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('aurasat_user_profile', JSON.stringify(next));
            } catch {}
          }
          return next;
        });

        // 2. Broadcast events immediately so UI components react without latency
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('asron_profile_updated', { detail: updates }));
          window.dispatchEvent(new CustomEvent('profile_updated', { detail: updates }));
          try {
            const bc = new BroadcastChannel('asron_profile_channel');
            bc.postMessage({ type: 'profile_updated', user: updates });
            bc.close();
          } catch {}
        }

        // 3. Persist to Supabase public.profiles
        const dbPayload: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName.trim();
        if (updates.username !== undefined) dbPayload.username = updates.username.trim().toLowerCase().replace(/^@/, '');
        if (updates.avatarUrl !== undefined) dbPayload.avatar_url = updates.avatarUrl.trim();
        if (updates.targetScore !== undefined) dbPayload.target_score = Number(updates.targetScore);
        if (updates.phoneNumber !== undefined) dbPayload.phone_number = updates.phoneNumber.trim();
        if (updates.targetExamDate !== undefined) dbPayload.target_exam_date = updates.targetExamDate;

        const { error } = await supabase
          .from('profiles')
          .update(dbPayload)
          .eq('id', activeId);

        if (error) {
          console.warn('Direct profile update note:', error.message);
          // If update failed (e.g. updated_at column issue), retry without updated_at
          delete dbPayload.updated_at;
          await supabase.from('profiles').update(dbPayload).eq('id', activeId);
        }

        // 4. Update Supabase Auth user metadata
        try {
          await supabase.auth.updateUser({
            data: {
              full_name: dbPayload.full_name,
              name: dbPayload.full_name,
              username: dbPayload.username,
              avatar_url: dbPayload.avatar_url,
              picture: dbPayload.avatar_url,
              phone: dbPayload.phone_number,
              target_score: dbPayload.target_score,
            },
          });
        } catch {}

        return true;
      } catch (err) {
        console.error('Failed to update profile:', err);
        return false;
      }
    },
    [profile?.id]
  );

  // Upload Avatar to Supabase 'avatars' storage bucket with fallback
  const uploadAvatar = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const activeUser = authData?.user;
        const activeId = activeUser?.id || profile?.id;
        if (!activeId) throw new Error('Foydalanuvchi tizimga kirmagan.');

        const fileExt = file.name.split('.').pop() || 'jpg';
        const filePath = `${activeId}/${Date.now()}.${fileExt}`;

        let publicUrl: string | null = null;

        // 1. Upload to Supabase 'avatars' bucket
        try {
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true, contentType: file.type });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            publicUrl = urlData.publicUrl;
          } else {
            console.warn('Storage upload notice:', uploadError.message);
          }
        } catch (storageErr) {
          console.warn('Storage bucket upload notice:', storageErr);
        }

        // Resilient fallback: Convert file to Base64 data URI if bucket upload failed
        if (!publicUrl) {
          publicUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        if (publicUrl) {
          // 2. Persist to public.profiles table
          await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', activeId);

          // 3. Update Auth user metadata
          try {
            await supabase.auth.updateUser({
              data: { avatar_url: publicUrl },
            });
          } catch (e) {}

          // 4. Update local profile state and broadcast globally
          await updateProfile({ avatarUrl: publicUrl });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { avatar_url: publicUrl, avatarUrl: publicUrl } }));
            window.dispatchEvent(new CustomEvent('asron_profile_updated', { detail: { avatar_url: publicUrl, avatarUrl: publicUrl } }));
          }
        }

        return publicUrl;
      } catch (err) {
        console.error('Avatar upload error:', err);
        throw err;
      }
    },
    [profile?.id, updateProfile]
  );

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        isLoading,
        updateProfile,
        uploadAvatar,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextValue => {
  const context = useContext(UserProfileContext);
  if (!context) {
    // Return fallback context value if component is rendered outside provider
    return {
      profile: null,
      isLoading: false,
      updateProfile: async () => false,
      uploadAvatar: async () => null,
      refreshProfile: async () => {},
    };
  }
  return context;
};

export default UserProfileContext;
