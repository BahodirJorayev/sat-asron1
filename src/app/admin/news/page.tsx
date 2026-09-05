'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { AdminNewsCMS } from '../../../components/AdminNewsCMS';

export default function AdminNewsPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F8FAFC] p-4 sm:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboardga qaytish</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-[#E07A5F]">
            <Megaphone className="w-4 h-4" />
            <span>Platform Announcements Control</span>
          </div>
        </div>

        {/* Core CMS */}
        <AdminNewsCMS />
      </div>
    </div>
  );
}
