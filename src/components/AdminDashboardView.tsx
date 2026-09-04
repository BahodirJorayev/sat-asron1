import React, { useState } from 'react';
import { 
  Users, BookOpen, HelpCircle, CheckCircle2, 
  RefreshCw, Radio, ArrowUpRight, Terminal, 
  ShieldCheck, Layers, ChevronRight, BarChart3,
  Sparkles, Settings, Eye
} from 'lucide-react';
import { User, Question, MockTest, PaymentReceipt, GlobalPlatformSettings } from '../types';

interface AdminDashboardViewProps {
  users: User[];
  questions: Question[];
  mockTests: MockTest[];
  receipts: PaymentReceipt[];
  globalSettings: GlobalPlatformSettings;
  onNavigateTab: (tabId: string) => void;
  onApproveReceipt?: (id: string) => void;
  onTriggerEmergencyMode?: (enabled: boolean) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  questions,
  mockTests,
  receipts,
  globalSettings,
  onNavigateTab,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeOnlineCount, setActiveOnlineCount] = useState(() => Math.floor(Math.random() * 8) + 14);

  // Exact 4 KPI Metrics requested
  const totalUsersCount = users.length;
  const activePublishedMocksCount = mockTests.filter((m) => m.isPublished).length;
  const totalQuestionsCount = questions.length;
  const totalSubmissionsCount = mockTests.reduce((acc, t) => acc + (t.attemptsCount || 0), 0);

  const handleRefreshPulse = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setActiveOnlineCount(Math.floor(Math.random() * 6) + 16);
      setIsRefreshing(false);
    }, 500);
  };

  // Recent system logs in Uzbek (Executive Minimalism, no cartoon emojis)
  const [activityLogs] = useState([
    {
      id: 'act-1',
      type: 'MOCK_SUBMIT',
      text: 'O‘quvchi @jasurbek_sat "Bluebook Rasmiy Mock #1" testini yakunladi (Natija: 1510)',
      time: '3 daqiqa oldin',
      badge: 'MOCK TEST',
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'act-2',
      type: 'NEW_SCHOLAR',
      text: 'Yangi talaba @aziza_sat platformada ro‘yxatdan o‘tdi (Maqsad: 1550+)',
      time: '12 daqiqa oldin',
      badge: 'RO‘YXATDAN O‘TISH',
      badgeClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    },
    {
      id: 'act-3',
      type: 'QUESTION_BANK',
      text: 'Savollar bankiga 20 ta yangi "Advanced Math" masalalari kiritildi',
      time: '28 daqiqa oldin',
      badge: 'SAVOLLAR BANKI',
      badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      id: 'act-4',
      type: 'ACCESS_CODE',
      text: 'Maxsus kurs mock testi uchun "ASRON-2026" kodi bilan muvaffaqiyatli kirish qayd etildi',
      time: '45 daqiqa oldin',
      badge: 'XAVFSIZLIK',
      badgeClass: 'text-[#E07A5F] bg-[#E07A5F]/10 border-[#E07A5F]/30',
    },
    {
      id: 'act-5',
      type: 'SYSTEM',
      text: 'Platforma sozlamalari va Desmos formulalari replikatsiyasi yangilandi',
      time: '1 soat oldin',
      badge: 'TIZIM',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  ]);

  return (
    <div id="admin-dashboard-view" className="space-y-6 font-sans">
      {/* Top Banner / Pulse Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                ASRON SAT Boshqaruv Markazi
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                Tizim Faol
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Hozirda platformada {totalUsersCount} nafar o‘quvchi ro‘yxatdan o‘tgan, {activeOnlineCount} nafar foydalanuvchi faol holatda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-refresh-pulse"
            onClick={handleRefreshPulse}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] hover:bg-[#F1F5F9] dark:hover:bg-[#1A233A] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>

          <button
            id="btn-quick-manage-mocks"
            onClick={() => onNavigateTab('mocks')}
            className="px-4 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <span>Mock Testlar</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* KPI Grid: Exactly the 4 Specified Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Jami o'quvchilar soni */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              Jami o'quvchilar soni
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono">
              {totalUsersCount}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>100% bepul to‘liq kirish</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Faol testlar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              Faol testlar
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono">
              {activePublishedMocksCount}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 flex items-center gap-1.5">
              <span>{mockTests.length} jami mock testdan</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Jami savollar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              Jami savollar
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono">
              {totalQuestionsCount}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 flex items-center gap-1.5">
              <span>Reading & Writing va Math</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Topshirilgan mocklar soni */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              Topshirilgan mocklar soni
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono">
              {totalSubmissionsCount}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 flex items-center gap-1.5">
              <span>Umumiy topshirilgan urinishlar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Realtime Activity Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  So'nggi Harakatlar va Tizim Jurnali
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Talabalar faoliyati, topshirilgan testlar va platforma yangilanishlari.
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#0A0F1D] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E293B] text-[10px] font-mono font-bold">
                JONLI OQIM
              </div>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {activityLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${log.badgeClass}`}>
                        {log.badge}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">{log.time}</span>
                    </div>
                    <p className="text-[#0F172A] dark:text-[#F8FAFC] font-medium leading-relaxed">{log.text}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] mt-1 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Command Hub & System Status */}
        <div className="space-y-6">
          {/* Quick Hub Actions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider font-mono">
              Tezkor Boshqaruv
            </h3>

            <div className="space-y-2">
              <button
                id="btn-nav-mocks"
                onClick={() => onNavigateTab('mocks')}
                className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] hover:bg-[#F1F5F9] dark:hover:bg-[#1A233A] border border-[#E2E8F0] dark:border-[#1E293B] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#E07A5F]" />
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Mock Testlar & Toifalar</div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Toifalarni sozlash va test yaratish</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>

              <button
                id="btn-nav-questions"
                onClick={() => onNavigateTab('questions')}
                className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] hover:bg-[#F1F5F9] dark:hover:bg-[#1A233A] border border-[#E2E8F0] dark:border-[#1E293B] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Savollar Banki</div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Savollarni tahrirlash va PDF yuklash</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>

              <button
                id="btn-nav-users"
                onClick={() => onNavigateTab('users')}
                className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] hover:bg-[#F1F5F9] dark:hover:bg-[#1A233A] border border-[#E2E8F0] dark:border-[#1E293B] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Foydalanuvchilar Ro'yxati</div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Talabalar va admin huquqlari</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>

              <button
                id="btn-nav-settings"
                onClick={() => onNavigateTab('settings')}
                className="w-full p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] hover:bg-[#F1F5F9] dark:hover:bg-[#1A233A] border border-[#E2E8F0] dark:border-[#1E293B] text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Sozlamalar & Xavfsizlik</div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Admin paroli va brending</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>
            </div>
          </div>

          {/* System Telemetry & Status */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-[#E2E8F0] dark:border-[#1E293B] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
                Tizim Holati
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Platforma Rejimi</span>
                <span className="font-bold text-emerald-500">
                  {globalSettings.isMaintenance ? 'TEXNIK TA\'MIR' : 'FAOL (ONLAYN)'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Adaptiv Mock Dvigateli</span>
                <span className="font-bold text-emerald-500">2-BOSQICHLI MST</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B]">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Desmos Kalkulyator</span>
                <span className="font-bold text-emerald-500">ULANGAN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
