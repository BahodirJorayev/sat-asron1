'use client';

import React from 'react';
import { OnePrepLandingView } from './OnePrepLandingView';
import { useLandingContent } from '../hooks/useLandingContent';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';
import { User } from '../types';
import { SiteBrandingConfig, BlogArticle, UserTestimonial } from '../data/blogAndBrandingData';

export interface LandingViewProps {
  user: User;
  siteBranding: SiteBrandingConfig;
  platformContent?: Record<string, any>;
  blogArticles: BlogArticle[];
  testimonials?: UserTestimonial[];
  onOpenAuthModal: (mode?: 'signin' | 'signup') => void;
  onOpenDiagnostic: () => void;
  onOpenDailyWorkout: () => void;
  onOpenPaywall: () => void;
  onNavigateToBlog: () => void;
  onOpenAdminLogin?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = (props) => {
  const { content } = useLandingContent();

  useEffect(() => {
    const handleRedirectIfAuth = (user: any) => {
      if (user && typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
        if (window.location.pathname === '/' || window.location.pathname === '') {
          window.location.href = '/dashboard';
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        handleRedirectIfAuth(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleRedirectIfAuth(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const mergedBranding = {
    ...props.siteBranding,
    landingHeadline: content.hero_subtitle || props.siteBranding.landingHeadline,
  };

  return (
    <OnePrepLandingView
      {...props}
      siteBranding={mergedBranding}
      platformContent={{
        ...props.platformContent,
        landing_content: content,
      }}
    />
  );
};

export default LandingView;
