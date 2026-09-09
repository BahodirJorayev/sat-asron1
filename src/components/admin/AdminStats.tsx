'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Radio, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';

export interface AdminUserMetrics {
  totalStudents: number;
  onlineCount: number;
  recentScholars: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  refreshMetrics: () => Promise<void>;
}

/**
 * Hook to fetch and synchronize live admin metrics with Supabase Realtime Presence & Database Changes
 */
export function useAdminUserMetrics(initialCount: number = 0): AdminUserMetrics {
  const [totalStudents, setTotalStudents] = useState<number>(initialCount);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [recentScholars, setRecentScholars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 1. Total Registered Users Count query
  const fetchTotalUsersCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setTotalStudents(count);
      }
    } catch (err) {
      console.error('Failed to fetch total users count:', err);
    }
  }, []);

  // 2. Fetch recent registered scholars
  const fetchRecentScholars = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, created_at, plan_tier, role, avatar_url')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentScholars(data);
      }
    } catch (err) {
      console.error('Failed to fetch recent scholars:', err);
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTotalUsersCount(), fetchRecentScholars()]);
    setIsRefreshing(false);
  }, [fetchTotalUsersCount, fetchRecentScholars]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchTotalUsersCount(), fetchRecentScholars()]);
      if (isMounted) setIsLoading(false);
    };
    init();

    // 3. Supabase Realtime Presence: Track live active connections
    const presenceChannel = supabase.channel('asron-online-presence', {
      config: { presence: { key: `admin-monitor-${Math.random().toString(36).substring(2, 9)}` } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        if (!isMounted) return;
        const state = presenceChannel.presenceState();
        const activeKeys = Object.keys(state);
        setOnlineCount(Math.max(1, activeKeys.length));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            role: 'admin-monitor',
            online_at: new Date().toISOString(),
          });
        }
      });

    // 4. Supabase Postgres Changes: Auto-update count when any user registers or updates profile
    const profilesRealtimeChannel = supabase
      .channel('admin_stats_profiles_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          if (isMounted) {
            fetchTotalUsersCount();
            fetchRecentScholars();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(profilesRealtimeChannel);
    };
  }, [fetchTotalUsersCount, fetchRecentScholars]);

  return {
    totalStudents,
    onlineCount,
    recentScholars,
    isLoading,
    isRefreshing,
    refreshMetrics,
  };
}

export interface AdminStatsProps {
  initialUsersCount?: number;
  className?: string;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  initialUsersCount = 0,
  className = '',
}) => {
  const {
    totalStudents,
    onlineCount,
    isRefreshing,
    refreshMetrics,
  } = useAdminUserMetrics(initialUsersCount);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {/* 1. Total Registered Students Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Jami O'quvchilar Soni
          </span>
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-extrabold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
            {totalStudents}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Supabase public.profiles (Jonli hisob)</span>
          </div>
        </div>
      </div>

      {/* 2. Currently Active / Online Users Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ayni Vaqtda Onlayn
          </span>
          <div className="relative p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-extrabold font-mono text-emerald-500 dark:text-emerald-400">
              {onlineCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Presence kanali</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refreshMetrics()}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
