import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, Role, PlanTier } from '../types';

declare const process: any;

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

// Attach to globalThis / window to guarantee zero "supabase is not defined" runtime exceptions
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).supabase = supabase;
}

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

  const determinedRole: Role =
    email.toLowerCase().includes('admin') || metadata.role === 'SUPER_ADMIN' || customDetails?.role === 'SUPER_ADMIN'
      ? 'SUPER_ADMIN'
      : email.toLowerCase().includes('admin') || customDetails?.role === 'ADMIN'
      ? 'ADMIN'
      : 'STUDENT';

  return {
    id: sbUser.id,
    email: email,
    username: customDetails?.username || metadata.username || defaultUsername,
    fullName: customDetails?.fullName || metadata.full_name || metadata.name || defaultName,
    phoneNumber: customDetails?.phoneNumber || metadata.phone || metadata.phoneNumber || '',
    avatarUrl:
      customDetails?.avatarUrl ||
      metadata.avatar_url ||
      metadata.picture ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${sbUser.id}`,
    bio: customDetails?.bio || metadata.bio || 'Digital SAT Aspirant',
    role: determinedRole,
    planTier: customDetails?.planTier || (metadata.plan_tier as PlanTier) || 'STANDARD',
    targetScore: customDetails?.targetScore || metadata.target_score || 1450,
    highestScore: customDetails?.highestScore ?? metadata.highest_score ?? 0,
    baselineScore: customDetails?.baselineScore ?? metadata.baseline_score ?? 0,
    potentialScore: customDetails?.potentialScore ?? 0,
    predictedScore: customDetails?.predictedScore ?? 0,
    weakestSubSkills: customDetails?.weakestSubSkills || [],
    targetExamDate: customDetails?.targetExamDate || '2026-10-04',
    streakDays: customDetails?.streakDays ?? 0,
    streakFreezes: customDetails?.streakFreezes ?? 0,
    xpPoints: customDetails?.xpPoints ?? 0,
    isOnline: true,
    testsCompletedCount: customDetails?.testsCompletedCount ?? 0,
    totalQuestionsDone: customDetails?.totalQuestionsDone ?? 0,
    overallAccuracy: customDetails?.overallAccuracy ?? 0,
    scholarId: customDetails?.scholarId || `ASRON-${sbUser.id.slice(0, 6).toUpperCase()}`,
    unseenTierUpgrade: customDetails?.unseenTierUpgrade ?? false,
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
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('Supabase Google OAuth error:', error);
      return { data: null, error };
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

// Resolve email or username identifier to authentic email
export async function resolveLoginIdentifierToEmail(identifier: string): Promise<string> {
  const trimmed = identifier.trim();
  if (trimmed.includes('@') && trimmed.includes('.')) {
    return trimmed.toLowerCase();
  }
  const cleanUsername = trimmed.toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
  try {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', cleanUsername)
      .maybeSingle();
    if (data?.email && data.email.includes('@')) {
      return data.email.toLowerCase();
    }
  } catch {}
  return `${cleanUsername}@asron.sat`;
}

// Email or Username / Password Sign In
export async function signInWithEmail(
  identifierOrEmail: string,
  pass: string
): Promise<{ data: { user?: User } | null; error: any }> {
  try {
    if (!identifierOrEmail?.trim() || !pass) {
      return { data: null, error: { message: "Foydalanuvchi nomi yoki parol noto'g'ri." } };
    }

    const email = await resolveLoginIdentifierToEmail(identifierOrEmail);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error || !data?.user) {
      console.warn('Supabase login error:', error?.message);
      return {
        data: null,
        error: {
          message: "Foydalanuvchi nomi yoki parol noto'g'ri.",
          raw: error,
        },
      };
    }

    let customProfile: Partial<User> | undefined;
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, target_score')
        .eq('id', data.user.id)
        .maybeSingle();
      if (prof) {
        customProfile = {
          fullName: prof.full_name,
          username: prof.username,
          avatarUrl: prof.avatar_url,
          targetScore: prof.target_score,
        };
      }
    } catch {}

    const appUser = mapSupabaseUserToAppUser(data.user, customProfile);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aurasat_user_profile', JSON.stringify(appUser));
      localStorage.setItem('aura_sat_auth_user', JSON.stringify(appUser));
      saveUserToRegisteredIndex(appUser);
    }
    setAuthCookie(appUser);
    return { data: { user: appUser }, error: null };
  } catch (err: any) {
    return { data: null, error: { message: "Foydalanuvchi nomi yoki parol noto'g'ri.", raw: err } };
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

    const createdUser: User = mapSupabaseUserToAppUser(data.user, {
      fullName: cleanFullName,
      username: cleanUsername,
      phoneNumber: phone?.trim() || '',
    });

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aurasat_user_profile', JSON.stringify(createdUser));
      localStorage.setItem('aura_sat_auth_user', JSON.stringify(createdUser));
      saveUserToRegisteredIndex(createdUser);
    }
    setAuthCookie(createdUser);

    return { data: { user: createdUser }, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// Simplified Registration: Full Name, Username, Password ONLY (Deterministic synthetic email)
export async function signUpWithUsername(
  fullName: string,
  username: string,
  pass: string
): Promise<{ data: { user?: User } | null; error: any }> {
  try {
    const cleanUsername = username.trim().toLowerCase().replace('@', '').replace(/[^a-z0-9_]/g, '');
    const cleanFullName = fullName.trim();
    if (!cleanFullName) {
      return { data: null, error: { message: "To'liq ism kiritilishi shart." } };
    }
    if (!cleanUsername) {
      return { data: null, error: { message: "Username (@) kiritilishi shart." } };
    }
    if (!pass || pass.length < 6) {
      return { data: null, error: { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." } };
    }

    const syntheticEmail = `${cleanUsername}@asron.sat`;

    const { data, error } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: pass,
      options: {
        data: {
          full_name: cleanFullName,
          username: cleanUsername,
          phone: '',
        },
      },
    });

    if (error) {
      console.warn('Supabase username signup error:', error.message);
      return { data: null, error };
    }

    if (!data?.user) {
      return { data: null, error: { message: "Ro'yxatdan o'tishda xatolik yuz berdi." } };
    }

    // Direct profile insertion: Upsert row to public.profiles table
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: syntheticEmail,
        full_name: cleanFullName,
        username: cleanUsername,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        target_score: 1500,
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Profiles table sync error:', e);
    }

    // Initialize user_progress row for cross-device synchronization
    try {
      await supabase.from('user_progress').upsert({
        user_id: data.user.id,
        streak_days: 0,
        total_questions_done: 0,
        overall_accuracy: 0,
        completed_questions: {},
        mock_results: {},
        mistakes_log: [],
        vocab_mastery: {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('User progress table init notice:', e);
    }

    const createdUser: User = mapSupabaseUserToAppUser(data.user, {
      fullName: cleanFullName,
      username: cleanUsername,
      email: syntheticEmail,
      phoneNumber: '',
    });

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aurasat_user_profile', JSON.stringify(createdUser));
      localStorage.setItem('aura_sat_auth_user', JSON.stringify(createdUser));
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

export default supabase;
