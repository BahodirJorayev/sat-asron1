'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Database } from 'lucide-react';
import { AdminGlobalSettings } from '../../../components/AdminGlobalSettings';
import {
  fetchGlobalPlatformSettings,
  saveGlobalPlatformSettings,
  DEFAULT_GLOBAL_SETTINGS,
} from '../../../lib/adminApi';
import { GlobalPlatformSettings } from '../../../types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminSettingsPage() {
  const [globalSettings, setGlobalSettings] = useState<GlobalPlatformSettings>(DEFAULT_GLOBAL_SETTINGS);
  const [syncStatus, setSyncStatus] = useState<string>('Yuklanmoqda...');

  useEffect(() => {
    let isMounted = true;
    fetchGlobalPlatformSettings()
      .then((settings) => {
        if (isMounted && settings) {
          setGlobalSettings(settings);
          setSyncStatus('Sozlamalar faol');
        }
      })
      .catch((err) => {
        console.error('Failed to load global settings:', err);
        if (isMounted) setSyncStatus('Standart sozlamalar');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveSettings = async (settings: GlobalPlatformSettings) => {
    setGlobalSettings(settings);
    try {
      await saveGlobalPlatformSettings(settings);
    } catch (e) {
      console.error('Failed to persist global settings:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F8FAFC] p-4 sm:p-8 space-y-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboardga qaytish</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
            >
              <span>Admin Boshqaruv</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#E07A5F] bg-[#E07A5F]/10 border border-[#E07A5F]/20 px-3 py-1 rounded-lg">
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Governance & Xavfsizlik</span>
          </div>
        </div>

        {/* Core Global Settings Module */}
        <AdminGlobalSettings
          globalSettings={globalSettings}
          onSaveSettings={handleSaveSettings}
        />
      </div>
    </div>
  );
}
