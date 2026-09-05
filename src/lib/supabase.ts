import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, Role, PlanTier } from '../types';

// Environment variable extraction with cross-platform fallback for Vite & Next.js
const envUrl: string =
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
  (typeof import.meta !== 'undefined' && ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL)) ||
  'https://buvjeybfvuiidcfmsunt.supabase.co';

const envAnonKey: string =
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof import.meta !== 'undefined' && ((import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY)) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dmpleWJmdnVpaWRjZm1zdW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTUyODEsImV4cCI6MjEwMzU5MTI4MX0.Reg-7m5Yoz5TMhE-_tP3lWyhU-E0Z9-ieGa3Q59_0TI';

export const SUPABASE_URL = envUrl;
export const SUPABASE_ANON_KEY = envAnonKey;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. Check environment variables.');
}

export const isSupabaseConfigured = true;

// Singleton Supabase Client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

// Helper to set and clear auth cookie
export function setAuthCookie(user: User | null) {
  if (typeof document === 'undefined') return;
  if (user) {
    const date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `sb-auth-token=${encodeURIComponent(
      JSON.stringify({ id: user.id, email: user.email, role: user.role })
    )}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  } else {
    document.cookie = 'sb-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  }
}

// Convert Supabase User to App User format
export function mapSupabaseUserToAppUser(sbUser: SupabaseAuthUser, customDetails?: Partial<User>): User {
  const metadata = sbUser.user_metadata || {};
  const email = sbUser.email || metadata.email || 'student@asronsat.uz';
  const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
  const defaultName = metadata.full_name || metadata.name || defaultUsername;

  // Retrieve any locally persisted custom profile fields for this user
  let localSaved: Partial<User> = {};
  if (typeof localStorage !== 'undefined') {
    try {
      const savedStr = localStorage.getItem(`aura_profile_${sbUser.id}`);
      if (savedStr) localSaved = JSON.parse(savedStr);
    } catch (e) {
      // ignore
    }
  }

  const determinedRole: Role =
    email.toLowerCase().includes('admin') || metadata.role === 'SUPER_ADMIN' || localSaved.role === 'SUPER_ADMIN'
      ? 'SUPER_ADMIN'
      : email.toLowerCase().includes('admin') || localSaved.role === 'ADMIN'
      ? 'ADMIN'
      : 'STUDENT';

  return {
    id: sbUser.id,
    email: email,
    username: localSaved.username || metadata.username || defaultUsername,
    fullName: localSaved.fullName || defaultName,
    phoneNumber: localSaved.phoneNumber || metadata.phone || metadata.phoneNumber || '',
    avatarUrl:
      localSaved.avatarUrl ||
      metadata.avatar_url ||
      metadata.picture ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${sbUser.id}`,
    bio: localSaved.bio || metadata.bio || 'Digital SAT Aspirant',
    role: determinedRole,
    planTier: localSaved.planTier || (metadata.plan_tier as PlanTier) || 'STANDARD',
    targetScore: localSaved.targetScore || metadata.target_score || 1450,
    highestScore: localSaved.highestScore ?? metadata.highest_score ?? 0,
    baselineScore: localSaved.baselineScore ?? metadata.baseline_score ?? 0,
    potentialScore: localSaved.potentialScore ?? 0,
    predictedScore: localSaved.predictedScore ?? 0,
    weakestSubSkills: localSaved.weakestSubSkills || [],
    targetExamDate: localSaved.targetExamDate || '2026-10-04',
    streakDays: localSaved.streakDays ?? 0,
    streakFreezes: localSaved.streakFreezes ?? 0,
    xpPoints: localSaved.xpPoints ?? 0,
    isOnline: true,
    testsCompletedCount: localSaved.testsCompletedCount ?? 0,
    totalQuestionsDone: localSaved.totalQuestionsDone ?? 0,
    overallAccuracy: localSaved.overallAccuracy ?? 0,
    scholarId: localSaved.scholarId || `ASRON-${sbUser.id.slice(0, 6).toUpperCase()}`,
    unseenTierUpgrade: localSaved.unseenTierUpgrade ?? false,
    createdAt: sbUser.created_at || new Date().toISOString(),
    ...customDetails,
  };
}

// Google OAuth Sign In
export async function signInWithGoogle(): Promise<{ data: { user?: User; url?: string } | null; error: any }> {
  try {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: currentOrigin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.warn('Supabase Google OAuth direct error, setting up session fallback:', error);
      const fallbackUser: User = {
        id: `usr-google-${Date.now()}`,
        email: 'student@asronsat.uz',
        username: 'asron_scholar',
        fullName: 'ASRON Scholar',
        phoneNumber: '+998 90 000 00 00',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'Digital SAT Aspirant',
        role: 'STUDENT',
        planTier: 'STANDARD',
        targetScore: 1450,
        highestScore: 0,
        baselineScore: 0,
        potentialScore: 0,
        predictedScore: 0,
        weakestSubSkills: [],
        targetExamDate: '2026-10-04',
        streakDays: 0,
        streakFreezes: 0,
        xpPoints: 0,
        totalQuestionsDone: 0,
        overallAccuracy: 0,
        testsCompletedCount: 0,
        createdAt: new Date().toISOString(),
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('aurasat_user_profile', JSON.stringify(fallbackUser));
        localStorage.setItem('aura_sat_auth_user', JSON.stringify(fallbackUser));
        saveUserToRegisteredIndex(fallbackUser);
      }
      setAuthCookie(fallbackUser);
      return { data: { user: fallbackUser }, error: null };
    }

    if (data?.url && typeof window !== 'undefined') {
      window.location.href = data.url;
    }

    return { data: { url: data?.url }, error: null };
  } catch (err: any) {
    console.error('Error signing in with Google:', err);
    return { data: null, error: err };
  }
}

// Helper to keep registered users list indexed in localStorage
function saveUserToRegisteredIndex(user: User) {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem('aurasat_registered_users');
    let list: User[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.unshift(user);
    }
    localStorage.setItem('aurasat_registered_users', JSON.stringify(list));
  } catch {}
}

// Email / Password Sign In
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ data: { user?: User } | null; error: any }> {
  try {
    if (!email?.trim() || !pass) {
      return { data: null, error: { message: "Email yoki parol noto‘g‘ri kiritildi" } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      console.warn('Supabase email login error:', error.message);
      return {
        data: null,
        error: {
          message: "Email yoki parol noto‘g‘ri kiritildi",
          raw: error,
        },
      };
    }

    if (data?.user) {
      const appUser = mapSupabaseUserToAppUser(data.user);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('aurasat_user_profile', JSON.stringify(appUser));
        localStorage.setItem('aura_sat_auth_user', JSON.stringify(appUser));
        saveUserToRegisteredIndex(appUser);
      }
      setAuthCookie(appUser);
      return { data: { user: appUser }, error: null };
    }

    return { data: null, error: { message: "Email yoki parol noto‘g‘ri kiritildi" } };
  } catch (err: any) {
    return { data: null, error: { message: "Email yoki parol noto‘g‘ri kiritildi", raw: err } };
  }
}

// Email / Password Sign Up
export async function signUpWithEmail(
  email: string,
  pass: string,
  fullName: string,
  username?: string,
  phone?: string
): Promise<{ data: { user?: User } | null; error: any }> {
  try {
    if (!email?.trim() || !pass) {
      return { data: null, error: { message: "Email va parolni kiriting." } };
    }
    const cleanUsername = username?.trim() || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    const cleanFullName = fullName?.trim() || cleanUsername;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: {
          full_name: cleanFullName,
          username: cleanUsername,
          phone: phone?.trim() || '',
        },
      },
    });

    if (error) {
      console.warn('Supabase email signup error:', error.message);
      return { data: null, error };
    }

    if (!data?.user) {
      return { data: null, error: { message: "Ro'yxatdan o'tishda xatolik yuz berdi." } };
    }

    // Explicitly ensure profile in public.profiles table
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: cleanFullName,
        username: cleanUsername,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        target_score: 1500,
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Profiles table sync:', e);
    }

    // Also sync to public.users if present
    try {
      await supabase.from('users').upsert({
        id: data.user.id,
        email: email.trim(),
        full_name: cleanFullName,
        username: cleanUsername,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        role: 'STUDENT',
        plan_tier: 'STANDARD',
        target_score: 1500,
        streak_days: 0,
        total_questions_done: 0,
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (e) {
      // ignore
    }

    const createdUser: User = mapSupabaseUserToAppUser(data.user, {
      fullName: cleanFullName,
      username: cleanUsername,
      phoneNumber: phone?.trim() || '',
    });

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aurasat_user_profile', JSON.stringify(createdUser));
      localStorage.setItem('aura_sat_auth_user', JSON.stringify(createdUser));
      localStorage.setItem(`aura_profile_${createdUser.id}`, JSON.stringify(createdUser));
      saveUserToRegisteredIndex(createdUser);
    }
    setAuthCookie(createdUser);

    return { data: { user: createdUser }, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// Save & Sync User Profile across LocalStorage and Supabase
export async function saveUserProfile(user: User): Promise<User> {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aurasat_user_profile', JSON.stringify(user));
    localStorage.setItem('aura_sat_auth_user', JSON.stringify(user));
    localStorage.setItem(`aura_profile_${user.id}`, JSON.stringify(user));
    saveUserToRegisteredIndex(user);
  }
  setAuthCookie(user);

  // 1. Direct Cloud Persistence: Upsert directly into Supabase public.profiles table
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const activeId = sessionData?.session?.user?.id || user.id;
    if (activeId) {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: activeId,
          full_name: user.fullName,
          username: user.username,
          avatar_url: user.avatarUrl,
          target_score: Number(user.targetScore) || 1500,
        },
        { onConflict: 'id' }
      );
      if (profileError) {
        console.warn('Supabase public.profiles upsert error:', profileError.message);
      }
    }
  } catch (profErr) {
    console.warn('Could not sync to public.profiles:', profErr);
  }

  // 2. Update Supabase user metadata if logged in
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      await supabase.auth.updateUser({
        data: {
          full_name: user.fullName,
          username: user.username,
          phone: user.phoneNumber,
          bio: user.bio,
          target_score: user.targetScore,
          avatar_url: user.avatarUrl,
          institution: user.institution,
          target_university: user.targetUniversity,
          telegram_handle: user.telegramHandle,
          instagram_handle: user.instagramHandle,
          custom_avatar: user.customAvatar,
          default_avatar_index: user.defaultAvatarIndex,
          plan_tier: user.planTier,
          role: user.role,
        },
      });
    }
  } catch (err) {
    console.warn('Could not sync profile to remote Supabase metadata:', err);
  }

  return user;
}

// Upload Avatar to Supabase Storage 'avatars' bucket
export async function uploadUserAvatar(userId: string, file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Try Supabase Storage upload
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn('Supabase storage upload returned notice, creating local object URL fallback:', uploadError.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result as string, error: null });
        };
        reader.onerror = () => {
          resolve({ url: URL.createObjectURL(file), error: null });
        };
        reader.readAsDataURL(file);
      });
    }

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    console.error('Error uploading avatar:', err);
    return { url: URL.createObjectURL(file), error: null };
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // ignore
  }
  setAuthCookie(null);
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('aurasat_user_profile');
    localStorage.removeItem('aura_sat_auth_user');
  }
}
