'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface LandingContent {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  features: any[];
  faq: any[];
  testimonials: any[];
  updated_at?: string;
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  id: 'main_content',
  hero_title: 'Score 1500+ on the Digital SAT',
  hero_subtitle: 'SAT imtihoniga professional tayyorgarlik',
  features: [],
  faq: [],
  testimonials: [],
  updated_at: new Date().toISOString(),
};

const STORAGE_KEY = 'asron_landing_content';

export async function fetchLandingContent(): Promise<LandingContent> {
  try {
    const { data, error } = await supabase
      .from('landing_content')
      .select('*')
      .eq('id', 'main_content')
      .maybeSingle();

    if (!error && data) {
      const merged: LandingContent = {
        ...DEFAULT_LANDING_CONTENT,
        ...data,
      };
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      }
      return merged;
    }
  } catch (err) {
    console.warn('Failed to fetch landing_content from Supabase:', err);
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_LANDING_CONTENT, ...JSON.parse(saved) };
    } catch {}
  }

  return DEFAULT_LANDING_CONTENT;
}

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...DEFAULT_LANDING_CONTENT, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_LANDING_CONTENT;
  });
  const [loading, setLoading] = useState(true);

  const refreshContent = useCallback(async () => {
    try {
      const data = await fetchLandingContent();
      setContent(data);
    } catch (e) {
      console.warn('Error refreshing landing content:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();

    const channel = supabase
      .channel('public:landing_content')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'landing_content' },
        (payload: any) => {
          if (payload.new && payload.new.id === 'main_content') {
            const fresh: LandingContent = {
              ...DEFAULT_LANDING_CONTENT,
              ...payload.new,
            };
            setContent(fresh);
            if (typeof localStorage !== 'undefined') {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
              } catch {}
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshContent]);

  return { content, loading, refreshContent };
}

export default useLandingContent;
