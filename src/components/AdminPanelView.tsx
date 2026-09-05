import React, { useState } from 'react';
import {
  LayoutDashboard,
  Terminal,
  BookOpen,
  Users,
  Settings,
  ShieldCheck,
  Radio,
  Eye,
  FileText,
  Sparkles,
  Calculator,
  MessageSquare,
  Globe,
  Megaphone
} from 'lucide-react';
import { 
  User, 
  PaymentReceipt, 
  PlanTier, 
  Question, 
  MockTest, 
  MockCategory,
  PricingPlanConfig, 
  GlobalPlatformSettings, 
  DesmosSatHack 
} from '../types';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminUsersManager } from './AdminUsersManager';
import { AdminQuestionFixer } from './AdminQuestionFixer';
import { AdminPDFIngestion } from './AdminPDFIngestion';
import { AdminGlobalSettings } from './AdminGlobalSettings';
import { AdminMockManager } from './AdminMockManager';
import { AdminDesmosCMS } from './AdminDesmosCMS';
import { AdminChatManager } from './AdminChatManager';
import { AdminPlatformCMS } from './AdminPlatformCMS';
import { AdminNewsCMS } from './AdminNewsCMS';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import AdminVocabularyPage from '../app/admin/vocabulary/page';

import { INITIAL_SAT_DESMOS_HACKS } from '../data/desmosHacksData';
import { SiteBrandingConfig, AdminCredentials, BlogArticle, UserTestimonial } from '../data/blogAndBrandingData';

interface AdminPanelViewProps {
  currentUser: User;
  onRefreshGlobal?: () => void;
  usersList: User[];
  receipts: PaymentReceipt[];
  questions?: Question[];
  mockTests?: MockTest[];
  mockCategories?: MockCategory[];
  blogArticles?: BlogArticle[];
  testimonials?: UserTestimonial[];
  pricingPlans?: PricingPlanConfig[];
  globalSettings?: GlobalPlatformSettings;
  desmosHacks?: DesmosSatHack[];
  siteBranding?: SiteBrandingConfig;
  adminCredentials?: AdminCredentials;
  onUpdateSiteBranding?: (updated: Partial<SiteBrandingConfig>) => void;
  onUpdateAdminCredentials?: (updated: AdminCredentials) => void;
  onSavePricingPlans?: (plans: PricingPlanConfig[]) => void;
  onSaveGlobalSettings?: (settings: GlobalPlatformSettings) => void;
  onSaveDesmosHacks?: (hacks: DesmosSatHack[]) => void;
  onSaveTestimonials?: (testimonials: UserTestimonial[]) => void;
  onApproveReceipt: (receiptId: string, planTier?: PlanTier) => void;
  onRejectReceipt: (receiptId: string) => void;
  onAddReceipt?: (receipt: PaymentReceipt) => void;
  onDeleteReceipt?: (receiptId: string) => void;
  onUpdateUserPlan: (userId: string, planTier: PlanTier, daysToAdd: number) => void;
  onAddUser?: (user: User) => void;
  onUpdateUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onAddQuestion?: (question: Question) => void;
  onUpdateQuestion?: (question: Question) => void;
  onDeleteQuestion?: (questionId: string) => void;
  onIngestQuestions?: (questions: Question[], mockTitle?: string) => void;
  onAddMockTest?: (test: MockTest) => void;
  onUpdateMockTest?: (test: MockTest) => void;
  onDeleteMockTest?: (testId: string) => void;
  onPreviewMockTest?: (test: MockTest) => void;
  onAddMockCategory?: (newCategory: MockCategory) => void;
  onUpdateMockCategory?: (updatedCategory: MockCategory) => void;
  onDeleteMockCategory?: (categoryId: string) => void;
  onNavigateToStudentView?: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  usersList,
  receipts,
  questions = [],
  mockTests = [],
  mockCategories = [],
  globalSettings = {
    platformName: 'ASRON SAT',
    platformTagline: 'Digital SAT Intelligence Platform',
    contactTelegram: '@rcmnx',
    contactEmail: 'support@asronsat.uz',
    contactInstagram: 'https://instagram.com/asronsat',
    landingHeroTitle: 'The Ivy League Digital SAT Intelligence Platform',
    landingHeroSubtitle: 'Master the 1550+ score threshold with authentic Bluebook MST engine, 20-second Desmos shortcuts, and 3-stage Leitner spaced error eradication.',
    landingHeroCtaText: 'Unlock 1550+ Elite Workspace',
    announcementEnabled: true,
    announcementText: 'Fall 2026 Digital SAT imtihon mavsumi boshlandi.',
    isMaintenance: false,
    arenaEnabled: true,
    liveStreamEnabled: true,
    desmosEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  desmosHacks = INITIAL_SAT_DESMOS_HACKS,
  adminCredentials,
  onUpdateAdminCredentials,
  onSaveGlobalSettings,
  onSaveDesmosHacks,
  onSaveTestimonials,
  onApproveReceipt,
  onUpdateUser,
  onDeleteUser,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onIngestQuestions,
  onAddMockTest,
  onUpdateMockTest,
  onDeleteMockTest,
  onPreviewMockTest,
  onAddMockCategory,
  onUpdateMockCategory,
  onDeleteMockCategory,
  onNavigateToStudentView,
  onRefreshGlobal,
}) => {
  // Main Navigation: Core Admin Sections
  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');

  // Sub-tab state for Question Bank
  const [questionsSubTab, setQuestionsSubTab] = useState<'list' | 'ingestion'>('list');

  // Sub-tab state for Settings & Security
  const [settingsSubTab, setSettingsSubTab] = useState<'governance' | 'desmos' | 'chat'>('governance');

  const adminNavItems = [
    {
      id: 'dashboard',
      label: 'Boshqaruv paneli',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'cms',
      label: 'Platforma CMS & Reklama',
      icon: <Globe className="w-4 h-4 text-[#E07A5F]" />,
    },
    {
      id: 'news',
      label: "Yangiliklar & E'lonlar",
      icon: <Megaphone className="w-4 h-4 text-[#E07A5F]" />,
    },
    {
      id: 'questions',
      label: 'Savollar banki',
      icon: <Terminal className="w-4 h-4" />,
      count: questions.length,
    },
    {
      id: 'mocks',
      label: 'Mock testlar & Kategoriyalar',
      icon: <BookOpen className="w-4 h-4" />,
      count: mockTests.length,
    },
    {
      id: 'users',
      label: 'Foydalanuvchilar',
      icon: <Users className="w-4 h-4" />,
      count: usersList.length,
    },
    {
      id: 'vocabulary',
      label: 'Lug\'at CMS',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Sozlamalar & Xavfsizlik',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const currentTabInfo = adminNavItems.find((t) => t.id === activeAdminTab) || adminNavItems[0];

  return (
    <div
      id="admin-panel-view"
      className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs font-sans"
    >
      {/* LEFT ADMIN SIDEBAR PANEL */}
      <aside className="w-full lg:w-64 bg-white dark:bg-[#121A2F] border-b lg:border-b-0 lg:border-r border-[#E2E8F0] dark:border-[#1E293B] flex flex-col justify-between shrink-0 p-4 space-y-4">
        {/* Admin Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0F172A] text-white shadow-xs">
            <div className="p-1.5 rounded-lg bg-[#E07A5F]/20 border border-[#E07A5F]/40 text-[#E07A5F] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold tracking-wider text-[#E07A5F] uppercase truncate">
                {globalSettings.platformName || 'ASRON SAT'}
              </div>
              <div className="text-[11px] text-slate-300 font-mono truncate">Admin Boshqaruv Markazi</div>
            </div>
          </div>

          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              <span>Jonli Tizim</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">SUPER ADMIN</span>
          </div>
        </div>

        {/* 5 Core Navigation Sections */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          <div className="px-2 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Asosiy Bo'limlar
          </div>
          {adminNavItems.map((tab) => {
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-sidebar-nav-${tab.id}`}
                onClick={() => setActiveAdminTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/10 dark:text-[#0F172A]'
                        : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Action: Return to Student View */}
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
          {onNavigateToStudentView && (
            <button
              id="btn-switch-to-student-view"
              onClick={onNavigateToStudentView}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>O'quvchi Rejimiga O'tish</span>
            </button>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workspace Top Bar */}
        <header className="h-16 px-6 bg-white dark:bg-[#121A2F] border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-[#E07A5F]">
              {currentTabInfo.icon}
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {currentTabInfo.label}
              </h1>
              <p className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                ASRON SAT Boshqaruv Portali
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
              <span>Admin:</span>
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{currentUser.fullName || 'Bahodir'}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* 1. Boshqaruv paneli */}
          {activeAdminTab === 'dashboard' && (
            <AdminDashboardView
              users={usersList}
              questions={questions}
              mockTests={mockTests}
              receipts={receipts}
              globalSettings={globalSettings}
              onNavigateTab={(tab) => setActiveAdminTab(tab)}
              onApproveReceipt={(rId) => onApproveReceipt(rId, 'PRO')}
            />
          )}

          {/* Platforma CMS & Reklama */}
          {activeAdminTab === 'cms' && (
            <AdminErrorBoundary fallbackTitle="Platforma CMS xatoligi">
              <AdminPlatformCMS onRefreshGlobal={onRefreshGlobal} />
            </AdminErrorBoundary>
          )}

          {/* Yangiliklar & E'lonlar (CMS) */}
          {activeAdminTab === 'news' && (
            <AdminErrorBoundary fallbackTitle="Yangiliklar va E'lonlar CMS xatoligi">
              <AdminNewsCMS onRefreshGlobal={onRefreshGlobal} />
            </AdminErrorBoundary>
          )}

          {/* 2. Savollar banki (Unified with Question Fixer and PDF Ingestion) */}
          {activeAdminTab === 'questions' && (
            <AdminErrorBoundary fallbackTitle="Savollar Banki yuklanishida xatolik">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
                  <button
                    onClick={() => setQuestionsSubTab('list')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      questionsSubTab === 'list'
                        ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Savollar Ro'yxati ({questions.length})</span>
                  </button>

                  <button
                    onClick={() => setQuestionsSubTab('ingestion')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      questionsSubTab === 'ingestion'
                        ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>PDF Orqali Yuklash (AI Ingestion)</span>
                  </button>
                </div>

                {questionsSubTab === 'list' ? (
                  <AdminQuestionFixer
                    questions={questions}
                    onUpdateQuestion={(q) => onUpdateQuestion && onUpdateQuestion(q)}
                    onAddQuestion={(q) => onAddQuestion && onAddQuestion(q)}
                  />
                ) : (
                  <AdminPDFIngestion
                    onImportQuestions={(newQs, title) => {
                      if (onIngestQuestions) {
                        onIngestQuestions(newQs, title);
                      } else if (onAddQuestion) {
                        newQs.forEach((q) => onAddQuestion(q));
                      }
                    }}
                  />
                )}
              </div>
            </AdminErrorBoundary>
          )}

          {/* 3. Mock testlar & Kategoriyalar */}
          {activeAdminTab === 'mocks' && (
            <AdminErrorBoundary fallbackTitle="Mock Testlar boshqaruvida xatolik">
              <AdminMockManager
                mockTests={mockTests}
                questions={questions}
                mockCategories={mockCategories}
                onAddMockTest={onAddMockTest || (() => {})}
                onUpdateMockTest={onUpdateMockTest || (() => {})}
                onDeleteMockTest={onDeleteMockTest || (() => {})}
                onPreviewMockTest={onPreviewMockTest || (() => {})}
                onAddMockCategory={onAddMockCategory}
                onUpdateMockCategory={onUpdateMockCategory}
                onDeleteMockCategory={onDeleteMockCategory}
              />
            </AdminErrorBoundary>
          )}

          {/* 4. Foydalanuvchilar */}
          {activeAdminTab === 'users' && (
            <AdminErrorBoundary fallbackTitle="Foydalanuvchilar boshqaruvida xatolik">
              <AdminUsersManager
                users={usersList}
                onUpdateUser={(updated) => onUpdateUser && onUpdateUser(updated)}
                onDeleteUser={(id) => onDeleteUser && onDeleteUser(id)}
                adminTelegram={globalSettings.contactTelegram || '@rcmnx'}
              />
            </AdminErrorBoundary>
          )}

          {/* 5. SAT Lug'at CMS */}
          {activeAdminTab === 'vocabulary' && (
            <AdminErrorBoundary fallbackTitle="Lug'at CMS yuklanishida xatolik">
              <div className="bg-white dark:bg-[#0E1526] rounded-xl p-4 border border-[#E2E8F0] dark:border-[#1E293B]">
                <AdminVocabularyPage />
              </div>
            </AdminErrorBoundary>
          )}

          {/* 6. Sozlamalar & Xavfsizlik (Unified with Settings, Desmos, and Chat Moderation) */}
          {activeAdminTab === 'settings' && (
            <AdminErrorBoundary fallbackTitle="Sozlamalar va Xavfsizlik modulida xatolik">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
                  <button
                    onClick={() => setSettingsSubTab('governance')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      settingsSubTab === 'governance'
                        ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Platforma & Xavfsizlik Sozlamalari</span>
                  </button>

                  <button
                    onClick={() => setSettingsSubTab('desmos')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      settingsSubTab === 'desmos'
                        ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#E07A5F]" />
                    <span>Desmos & SAT Xaklari ({desmosHacks.length})</span>
                  </button>

                  <button
                    onClick={() => setSettingsSubTab('chat')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      settingsSubTab === 'chat'
                        ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                    <span>Chat Moderatsiyasi</span>
                  </button>
                </div>

                {settingsSubTab === 'governance' && (
                  <AdminGlobalSettings
                    globalSettings={globalSettings}
                    onSaveSettings={(settings) => onSaveGlobalSettings && onSaveGlobalSettings(settings)}
                    adminCredentials={adminCredentials}
                    onUpdateAdminCredentials={onUpdateAdminCredentials}
                  />
                )}

                {settingsSubTab === 'desmos' && (
                  <AdminDesmosCMS
                    hacks={desmosHacks}
                    globalSettings={globalSettings}
                    onSaveHacks={(updatedHacks) => onSaveDesmosHacks && onSaveDesmosHacks(updatedHacks)}
                    onSaveSettings={(settings) => onSaveGlobalSettings && onSaveGlobalSettings(settings)}
                  />
                )}

                {settingsSubTab === 'chat' && (
                  <AdminChatManager
                    currentUser={currentUser}
                    usersList={usersList}
                  />
                )}
              </div>
            </AdminErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
};
