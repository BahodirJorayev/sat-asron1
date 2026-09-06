'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, X } from 'lucide-react';

export type ModuleVisibility = 'active' | 'locked' | 'hidden';

export interface ModuleStatuses {
  questions: ModuleVisibility;
  mocks: ModuleVisibility;
  vocabulary: ModuleVisibility;
  mistakes: ModuleVisibility;
  community: ModuleVisibility;
}

export interface PlatformSettings {
  id: string;
  platform_title: string;
  tagline: string | null;
  logo_url: string | null;
  modules_status: ModuleStatuses;
  updated_at?: string;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'global_config',
  platform_title: 'ASRON SAT',
  tagline: 'Digital SAT Platform',
  logo_url: null,
  modules_status: {
    questions: 'active',
    mocks: 'active',
    vocabulary: 'active',
    mistakes: 'active',
    community: 'active',
  },
};

const STORAGE_KEY = 'asron_platform_settings';
const EVENT_NAME = 'asron_platform_settings_changed';
const BROADCAST_CHANNEL_NAME = 'asron_platform_settings_channel';

// Dynamic DOM Brand Asset (Favicon, Apple Touch Icon, Document Title) Updater
const updateDomBrandAssets = (title?: string, logoUrl?: string | null) => {
  if (typeof document === 'undefined') return;
  try {
    const activeIconUrl = logoUrl && logoUrl.trim() ? logoUrl.trim() : '/logo.svg';

    // 1. Favicon / Icon link
    let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'shortcut icon';
      document.head.appendChild(iconLink);
    }
    iconLink.href = activeIconUrl;
    if (activeIconUrl.endsWith('.svg')) {
      iconLink.type = 'image/svg+xml';
    }

    // 2. Apple Touch Icon link
    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = activeIconUrl;

    // 3. Dynamic Title
    if (title && title.trim()) {
      const currentTitle = document.title;
      if (!currentTitle || currentTitle.startsWith('ASRON SAT') || currentTitle.includes('Digital SAT')) {
        document.title = `${title.trim()} • Digital SAT Platform`;
      }
    }
  } catch (err) {
    console.warn('Failed to update DOM brand assets:', err);
  }
};

interface PlatformSettingsContextValue {
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
  isModuleActive: (mod: keyof ModuleStatuses) => boolean;
  isModuleLocked: (mod: keyof ModuleStatuses) => boolean;
  isModuleHidden: (mod: keyof ModuleStatuses) => boolean;
  getModuleStatus: (mod: keyof ModuleStatuses) => ModuleVisibility;
  showLockedNotice: (moduleName?: string) => void;
}

const PlatformSettingsContext = createContext<PlatformSettingsContextValue | undefined>(undefined);

export const PlatformSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const initial = {
            ...DEFAULT_PLATFORM_SETTINGS,
            ...parsed,
            modules_status: {
              ...DEFAULT_PLATFORM_SETTINGS.modules_status,
              ...(parsed.modules_status || {}),
            },
          };
          updateDomBrandAssets(initial.platform_title, initial.logo_url);
          return initial;
        }
      } catch (e) {
        console.warn('Failed to parse cached platform settings:', e);
      }
      updateDomBrandAssets(DEFAULT_PLATFORM_SETTINGS.platform_title, DEFAULT_PLATFORM_SETTINGS.logo_url);
    }
    return DEFAULT_PLATFORM_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lockedNoticeModule, setLockedNoticeModule] = useState<string | null>(null);

  const applySettingsLocally = useCallback((fresh: PlatformSettings) => {
    setSettings(fresh);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: fresh }));

        // BroadcastChannel for instant inter-tab zero-latency sync
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          bc.postMessage(fresh);
          bc.close();
        }
      } catch (e) {
        console.warn('Failed to cache platform settings:', e);
      }
      updateDomBrandAssets(fresh.platform_title, fresh.logo_url);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 'global_config')
        .maybeSingle();

      if (!error && data) {
        const merged: PlatformSettings = {
          id: data.id || 'global_config',
          platform_title: data.platform_title || 'ASRON SAT',
          tagline: data.tagline || null,
          logo_url: data.logo_url || null,
          modules_status: {
            ...DEFAULT_PLATFORM_SETTINGS.modules_status,
            ...(data.modules_status || {}),
          },
          updated_at: data.updated_at,
        };
        applySettingsLocally(merged);
      }
    } catch (err) {
      console.warn('Failed to fetch platform_settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applySettingsLocally]);

  // Initial fetch and Realtime subscription
  useEffect(() => {
    refreshSettings();

    // 1. Supabase Realtime channel for instant cross-device/user synchronization
    const channel = supabase
      .channel('public:platform_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_settings' },
        (payload: any) => {
          if (payload.new && payload.new.id === 'global_config') {
            const fresh: PlatformSettings = {
              id: payload.new.id,
              platform_title: payload.new.platform_title || 'ASRON SAT',
              tagline: payload.new.tagline || null,
              logo_url: payload.new.logo_url || null,
              modules_status: {
                ...DEFAULT_PLATFORM_SETTINGS.modules_status,
                ...(payload.new.modules_status || {}),
              },
              updated_at: payload.new.updated_at,
            };
            applySettingsLocally(fresh);
          }
        }
      )
      .subscribe();

    // 2. Inter-tab / local event listener
    const handleLocalChange = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
        updateDomBrandAssets(e.detail.platform_title, e.detail.logo_url);
      }
    };
    window.addEventListener(EVENT_NAME, handleLocalChange);

    // 3. BroadcastChannel listener for zero-latency cross-tab synchronization
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            setSettings(event.data);
            updateDomBrandAssets(event.data.platform_title, event.data.logo_url);
          }
        };
      } catch (e) {
        console.warn('Failed to initialize BroadcastChannel:', e);
      }
    }

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener(EVENT_NAME, handleLocalChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [refreshSettings, applySettingsLocally]);

  const updateSettings = useCallback(
    async (patch: Partial<PlatformSettings>) => {
      const merged: PlatformSettings = {
        ...settings,
        ...patch,
        modules_status: {
          ...settings.modules_status,
          ...(patch.modules_status || {}),
        },
        updated_at: new Date().toISOString(),
      };

      // Optimistic local update
      applySettingsLocally(merged);

      try {
        const { error } = await supabase.from('platform_settings').upsert({
          id: 'global_config',
          platform_title: merged.platform_title,
          tagline: merged.tagline,
          logo_url: merged.logo_url,
          modules_status: merged.modules_status,
          updated_at: merged.updated_at,
        });

        if (error) {
          console.error('Failed to persist platform_settings to Supabase:', error.message);
          throw error;
        }
      } catch (err) {
        console.error('Error updating platform settings:', err);
        throw err;
      }
    },
    [settings, applySettingsLocally]
  );

  const getModuleStatus = useCallback(
    (mod: keyof ModuleStatuses): ModuleVisibility => {
      return settings.modules_status?.[mod] || 'active';
    },
    [settings.modules_status]
  );

  const isModuleActive = useCallback(
    (mod: keyof ModuleStatuses): boolean => {
      return getModuleStatus(mod) === 'active';
    },
    [getModuleStatus]
  );

  const isModuleLocked = useCallback(
    (mod: keyof ModuleStatuses): boolean => {
      return getModuleStatus(mod) === 'locked';
    },
    [getModuleStatus]
  );

  const isModuleHidden = useCallback(
    (mod: keyof ModuleStatuses): boolean => {
      return getModuleStatus(mod) === 'hidden';
    },
    [getModuleStatus]
  );

  const showLockedNotice = useCallback((moduleName?: string) => {
    setLockedNoticeModule(moduleName || 'ushbu');
  }, []);

  return (
    <PlatformSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        refreshSettings,
        isLoading,
        isModuleActive,
        isModuleLocked,
        isModuleHidden,
        getModuleStatus,
        showLockedNotice,
      }}
    >
      {children}

      {/* Clean Linear/Apple-grade Locked Module Notice Modal */}
      {lockedNoticeModule && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Lock size={22} className="stroke-[2.2]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bo'lim vaqtincha yopiq
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Ushbu bo'limda yangilanish ishlari olib borilmoqda. Tez orada qayta ishga tushadi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLockedNoticeModule(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </PlatformSettingsContext.Provider>
  );
};

export const usePlatformSettings = (): PlatformSettingsContextValue => {
  const ctx = useContext(PlatformSettingsContext);
  if (!ctx) {
    // Return safe fallback if used outside Provider so components never break
    let cached: PlatformSettings = DEFAULT_PLATFORM_SETTINGS;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) cached = { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) };
      } catch {}
    }
    return {
      settings: cached,
      updateSettings: async () => {},
      refreshSettings: async () => {},
      isLoading: false,
      isModuleActive: (m) => (cached.modules_status?.[m] || 'active') === 'active',
      isModuleLocked: (m) => (cached.modules_status?.[m] || 'active') === 'locked',
      isModuleHidden: (m) => (cached.modules_status?.[m] || 'active') === 'hidden',
      getModuleStatus: (m) => cached.modules_status?.[m] || 'active',
      showLockedNotice: () => {},
    };
  }
  return ctx;
};
