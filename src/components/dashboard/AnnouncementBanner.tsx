'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, X, ArrowUpRight, Sparkles, Bell, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PlatformAnnouncement } from '../../types';
import { fetchPlatformContent } from '../../lib/adminApi';

interface AnnouncementBannerProps {
  targetRoute?: 'dashboard' | 'landing' | 'all';
  className?: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  targetRoute = 'dashboard',
  className = '',
}) => {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Load dismissed announcement IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('asron_dismissed_announcements');
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read dismissed announcements from localStorage:', e);
    }
  }, []);

  // 2. Fetch active announcements from Supabase
  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      // Primary: Query public.announcements table
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Filter by target route (dashboard, all, or matching targetRoute)
        const relevant = data.filter((item: any) => {
          const route = item.target_route || 'dashboard';
          return route === targetRoute || route === 'all' || route === 'dashboard';
        });
        setAnnouncements(relevant);
      } else {
        // Fallback: Check platform_content table (dashboard_announcements key)
        const content = await fetchPlatformContent('dashboard_announcements');
        if (content && Array.isArray(content.content)) {
          const mapped: PlatformAnnouncement[] = content.content
            .filter((a: any) => a.is_active !== false)
            .map((a: any) => ({
              id: a.id || `ann-${Date.now()}`,
              title: a.title,
              content: a.text || a.content || '',
              target_route: 'dashboard',
              action_link: a.link ? (a.link.startsWith('/') ? a.link : `/${a.link}`) : undefined,
              is_active: true,
              created_at: a.date || new Date().toISOString(),
            }));
          setAnnouncements(mapped);
        }
      }
    } catch (err) {
      console.warn('AnnouncementBanner fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetRoute]);

  useEffect(() => {
    loadAnnouncements();

    // 3. Supabase Realtime subscription for instant postgres changes
    const channel = supabase
      .channel('public:announcements:banner')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setAnnouncements((prev) => prev.filter((a) => a.id !== deletedId));
            }
          } else if (payload.eventType === 'INSERT') {
            const newAnn = payload.new as PlatformAnnouncement;
            if (
              newAnn.is_active &&
              (newAnn.target_route === targetRoute ||
                newAnn.target_route === 'all' ||
                newAnn.target_route === 'dashboard')
            ) {
              setAnnouncements((prev) => [newAnn, ...prev.filter((a) => a.id !== newAnn.id)]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedAnn = payload.new as PlatformAnnouncement;
            if (!updatedAnn.is_active) {
              setAnnouncements((prev) => prev.filter((a) => a.id !== updatedAnn.id));
            } else {
              setAnnouncements((prev) =>
                prev.map((a) => (a.id === updatedAnn.id ? updatedAnn : a))
              );
            }
          }
        }
      )
      .subscribe();

    // 4. Cross-tab and local window event listener for instant cache invalidation
    const handleCustomDelete = (e: any) => {
      const deletedId = e?.detail?.id;
      if (deletedId) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== deletedId));
      }
    };
    window.addEventListener('asron_announcement_deleted', handleCustomDelete);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('asron_announcements');
      bc.onmessage = (event) => {
        if (event.data?.type === 'DELETE' && event.data?.id) {
          setAnnouncements((prev) => prev.filter((a) => a.id !== event.data.id));
        } else if (event.data?.type === 'REFRESH') {
          loadAnnouncements();
        }
      };
    } catch (e) {
      // BroadcastChannel not supported in environment
    }

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('asron_announcement_deleted', handleCustomDelete);
      if (bc) bc.close();
    };
  }, [loadAnnouncements, targetRoute]);

  // 5. Dismiss handler: stores ID in localStorage and removes from current view
  const handleDismiss = (id: string) => {
    try {
      const updated = Array.from(new Set([...dismissedIds, id]));
      setDismissedIds(updated);
      localStorage.setItem('asron_dismissed_announcements', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save dismissal:', e);
    }
  };

  // Filter out any dismissed items
  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));

  if (isLoading && announcements.length === 0) {
    return null; // Silent placeholder while loading
  }

  if (visibleAnnouncements.length === 0) {
    return null; // Zero visual footprint when no announcements
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAnnouncements.map((ann) => {
        const formattedDate = ann.created_at
          ? new Date(ann.created_at).toLocaleDateString('uz-UZ', {
              day: 'numeric',
              month: 'short',
            })
          : null;

        return (
          <aside
            key={ann.id}
            role="region"
            aria-label={`E'lon: ${ann.title}`}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs transition-all duration-200"
          >
            {/* Terracotta Hairline Left Accent */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 bottom-0 w-1 bg-[#E07A5F]"
            />

            <div className="flex items-start justify-between gap-3 pl-1.5 sm:pl-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Icon Mark */}
                <div className="p-2 rounded-xl bg-[#E07A5F]/10 text-[#E07A5F] shrink-0 mt-0.5">
                  <Megaphone size={16} strokeWidth={2.2} />
                </div>

                {/* Text Content */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#E07A5F]/15 text-[#E07A5F] tracking-wider">
                      {ann.category || "E'LON"}
                    </span>
                    {formattedDate && (
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {formattedDate}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-snug">
                    {ann.title}
                  </h3>

                  {ann.content && (
                    <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed line-clamp-2 sm:line-clamp-none max-w-3xl">
                      {ann.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions: Action Link + Dismiss (X) */}
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                {ann.action_link && (
                  <a
                    href={ann.action_link}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-bold hover:bg-[#E07A5F] dark:hover:bg-[#E07A5F] dark:hover:text-white transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>O'tish</span>
                    <ArrowUpRight size={13} strokeWidth={2.2} />
                  </a>
                )}

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => handleDismiss(ann.id)}
                  aria-label="E'lonni yopish"
                  title="E'lonni yopish"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </aside>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
