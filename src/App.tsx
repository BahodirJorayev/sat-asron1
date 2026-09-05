import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MistakeVaultView } from './components/MistakeVaultView';
import { QuestionBankView } from './components/QuestionBankView';
import { CommunityView } from './components/CommunityView';
import { RoadmapView } from './components/RoadmapView';
import { AdminPanelView } from './components/AdminPanelView';
import { OnePrepLandingView } from './components/OnePrepLandingView';
import { BlogView } from './components/BlogView';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DailyWorkoutModal } from './components/DailyWorkoutModal';
import { DiagnosticModal } from './components/DiagnosticModal';
import { PaywallModal } from './components/PaywallModal';
import { TelegramNotificationSimulator } from './components/TelegramNotificationSimulator';
import { SocraticTutorDrawer } from './components/SocraticTutorDrawer';
import { BluebookTestEngine } from './components/BluebookTestEngine';
import { UserProfileModal } from './components/UserProfileModal';
import { StudentProfileView } from './components/StudentProfileView';
import { ProfileView } from './components/ProfileView';
import { MilestoneCelebrationModal } from './components/MilestoneCelebrationModal';
import { FloatingDesmosWidget } from './components/FloatingDesmosWidget';
import { VocabTrainerModal } from './components/VocabTrainerModal';
import { VocabFlashcards } from './components/VocabFlashcards';
import { VocabularyHub } from './components/vocabulary/VocabularyHub';
import { COLLEGE_PANDA_400_WORDS } from './data/collegePandaVocab';
import { MultiplayerArenaModal } from './components/MultiplayerArenaModal';
import { MultiplayerArenaView } from './components/MultiplayerArenaView';
import { DailyWorkoutView } from './components/DailyWorkoutView';
import { MockTestsCatalogView } from './components/MockTestsCatalogView';
import { TierUnlockCelebration } from './components/TierUnlockCelebration';
import { SocraticRepetitorHubView } from './components/SocraticRepetitorHubView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { INITIAL_DEFAULT_PLANS } from './components/AdminPlansEditor';
import { INITIAL_SAT_DESMOS_HACKS } from './data/desmosHacksData';
import {
  INITIAL_USERS,
  INITIAL_MISTAKES,
  INITIAL_MOCK_TESTS,
  INITIAL_RECEIPTS,
  INITIAL_TELEGRAM_NOTIFICATIONS,
  INITIAL_QUESTIONS,
} from './data/mockDatabase';
import {
  INITIAL_SITE_CONFIG,
  INITIAL_BLOG_ARTICLES,
  INITIAL_ADMIN_CREDENTIALS,
  INITIAL_TESTIMONIALS,
  SiteBrandingConfig,
  BlogArticle,
  AdminCredentials,
  UserTestimonial,
} from './data/blogAndBrandingData';
import {
  User,
  MistakeVaultItem,
  MockTest,
  MockCategory,
  PaymentReceipt,
  TelegramNotification,
  Question,
  PlanTier,
  TestAttempt,
  PricingPlanConfig,
  GlobalPlatformSettings,
  DesmosSatHack
} from './types';
import { getSupabaseClient, mapSupabaseUserToAppUser, signOutUser, saveUserProfile } from './lib/supabase';
import {
  fetchGlobalPlatformSettings,
  saveGlobalPlatformSettings,
  DEFAULT_GLOBAL_SETTINGS,
  INITIAL_MOCK_CATEGORIES,
  fetchMockCategories,
  saveMockCategoryRemote,
  deleteMockCategoryRemote,
  PlatformContentItem,
  DEFAULT_PLATFORM_CONTENT,
  fetchPlatformContentMap,
  savePlatformContent,
  subscribeToPlatformContent,
  fetchMockTestsRemote,
  saveMockTestRemote,
  deleteMockTestRemote,
  subscribeToMockTests,
} from './lib/adminApi';

export default function App() {
  // State management with Supabase and localStorage persistence
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const savedActive = localStorage.getItem('aurasat_user_profile');
      const savedRegistered = localStorage.getItem('aurasat_registered_users');
      let combined: User[] = [...INITIAL_USERS];

      if (savedRegistered) {
        try {
          const registeredList: User[] = JSON.parse(savedRegistered);
          if (Array.isArray(registeredList)) {
            const existingIds = new Set(combined.map((u) => u.id));
            const fresh = registeredList.filter((u) => !existingIds.has(u.id));
            combined = [...fresh, ...combined];
          }
        } catch (e) {
          // ignore
        }
      }

      if (savedActive) {
        try {
          const activeUser: User = JSON.parse(savedActive);
          const idx = combined.findIndex(
            (u) => u.id === activeUser.id || u.email.toLowerCase() === activeUser.email.toLowerCase()
          );
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...activeUser };
            // Move active user to front
            const [active] = combined.splice(idx, 1);
            combined.unshift(active);
          } else {
            combined.unshift(activeUser);
          }
        } catch (e) {
          // ignore
        }
      }

      return combined;
    } catch (e) {
      return INITIAL_USERS;
    }
  });
  const [currentUserIndex, setCurrentUserIndex] = useState<number>(0);
  const currentUser = usersList[currentUserIndex] || usersList[0];

  // Helper to check if current user is actively logged in
  const isUserAuthenticated = () => {
    if (typeof localStorage === 'undefined') return false;
    const hasSavedProfile = !!localStorage.getItem('aurasat_user_profile');
    return hasSavedProfile;
  };

  // Derive initial tab from URL hash, pathname or persistent session to prevent redirect loops
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hasSavedUser = !!localStorage.getItem('aurasat_user_profile');

      // Direct URL / Deep link handling for Community & Chat
      if (
        pathname.startsWith('/chat') ||
        pathname.startsWith('/community') ||
        search.includes('c=') ||
        search.includes('join=') ||
        hash === 'chat' ||
        hash.startsWith('chat?') ||
        hash === 'community' ||
        hash.startsWith('community?')
      ) {
        return 'community';
      }

      if (['dashboard', 'daily-workout', 'vault', 'bluebook', 'qbank', 'community', 'arena', 'roadmap', 'profile', 'admin', 'blog', 'vocab'].includes(hash)) {
        return hash;
      }
      if (hash === 'vocabulary') return 'vocab';
      if (hash === 'landing') return 'landing';
      // Auto-route authenticated user to dashboard
      if (hasSavedUser) {
        return 'dashboard';
      }
    }
    const hasSavedUser = typeof localStorage !== 'undefined' && !!localStorage.getItem('aurasat_user_profile');
    return hasSavedUser ? 'dashboard' : 'landing';
  });
  const [mistakes, setMistakes] = useState<MistakeVaultItem[]>(INITIAL_MISTAKES);
  const [mockTests, setMockTests] = useState<MockTest[]>(() => {
    try {
      const saved = localStorage.getItem('aurasat_mock_tests');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_MOCK_TESTS;
    } catch {
      return INITIAL_MOCK_TESTS;
    }
  });
  const [mockCategories, setMockCategories] = useState<MockCategory[]>(() => {
    try {
      const saved = localStorage.getItem('asron_mock_categories');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_MOCK_CATEGORIES;
    } catch {
      return INITIAL_MOCK_CATEGORIES;
    }
  });

  // Load and synchronize dynamic mock categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const remote = await fetchMockCategories();
        if (remote && remote.length > 0) {
          setMockCategories(remote);
          localStorage.setItem('asron_mock_categories', JSON.stringify(remote));
        }
      } catch (err) {
        console.warn('Failed to load remote mock categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Dynamic Platform Content CMS State (persisted to Supabase public.platform_content)
  const [platformContentMap, setPlatformContentMap] = useState<Record<string, PlatformContentItem>>(() => {
    try {
      const saved = localStorage.getItem('asron_platform_content');
      if (saved) return { ...DEFAULT_PLATFORM_CONTENT, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_PLATFORM_CONTENT;
  });

  // Supabase Realtime synchronization for Platform Content & Mock Tests
  useEffect(() => {
    fetchPlatformContentMap().then((map) => {
      if (map && Object.keys(map).length > 0) {
        setPlatformContentMap(map);
      }
    });

    const unsubPlatform = subscribeToPlatformContent((newMap) => {
      setPlatformContentMap(newMap);
    });

    fetchMockTestsRemote().then((remoteTests) => {
      if (remoteTests && remoteTests.length > 0) {
        setMockTests((prev) => {
          const remoteIds = new Set(remoteTests.map((t) => t.id));
          const localOnly = prev.filter((t) => !remoteIds.has(t.id));
          return [...remoteTests, ...localOnly];
        });
      }
    });

    const unsubMocks = subscribeToMockTests((remoteTests) => {
      if (remoteTests && remoteTests.length > 0) {
        setMockTests((prev) => {
          const remoteIds = new Set(remoteTests.map((t) => t.id));
          const localOnly = prev.filter((t) => !remoteIds.has(t.id));
          return [...remoteTests, ...localOnly];
        });
      }
    });

    return () => {
      unsubPlatform();
      unsubMocks();
    };
  }, []);

  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_RECEIPTS);
  const [notifications, setNotifications] = useState<TelegramNotification[]>(INITIAL_TELEGRAM_NOTIFICATIONS);

  // Admin Credentials state with localStorage persistence
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    const saved = localStorage.getItem('aurasat_admin_credentials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ADMIN_CREDENTIALS;
      }
    }
    return INITIAL_ADMIN_CREDENTIALS;
  });

  const handleUpdateAdminCredentials = (updated: AdminCredentials) => {
    setAdminCredentials(updated);
    localStorage.setItem('aurasat_admin_credentials', JSON.stringify(updated));
  };

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Site Branding & Blog CMS state (managed via Admin Panel)
  const [siteBranding, setSiteBranding] = useState<SiteBrandingConfig>(() => {
    const saved = localStorage.getItem('aurasat_site_config');
    if (saved) {
      try {
        return { ...INITIAL_SITE_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        return INITIAL_SITE_CONFIG;
      }
    }
    return INITIAL_SITE_CONFIG;
  });

  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>(() => {
    const saved = localStorage.getItem('aurasat_blog_articles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_BLOG_ARTICLES;
      }
    }
    return INITIAL_BLOG_ARTICLES;
  });

  const [testimonials, setTestimonials] = useState<UserTestimonial[]>(() => {
    const saved = localStorage.getItem('aurasat_testimonials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TESTIMONIALS;
      }
    }
    return INITIAL_TESTIMONIALS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('aurasat_questions_bank');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_QUESTIONS;
      }
    }
    return INITIAL_QUESTIONS;
  });

  const [qbankInitialFilter, setQbankInitialFilter] = useState<string>('');

  // Dynamic Pricing CMS State
  const [pricingPlans, setPricingPlans] = useState<PricingPlanConfig[]>(() => {
    try {
      const saved = localStorage.getItem('asron_pricing_plans');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_DEFAULT_PLANS;
    } catch {
      return INITIAL_DEFAULT_PLANS;
    }
  });

  const handleSavePricingPlans = (plans: PricingPlanConfig[]) => {
    setPricingPlans(plans);
    localStorage.setItem('asron_pricing_plans', JSON.stringify(plans));
  };

  // Dynamic Global Platform Settings State
  const [globalSettings, setGlobalSettings] = useState<GlobalPlatformSettings>(() => {
    try {
      const saved = localStorage.getItem('asron_global_settings');
      if (saved) {
        return { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(saved) };
      }
      return DEFAULT_GLOBAL_SETTINGS;
    } catch {
      return DEFAULT_GLOBAL_SETTINGS;
    }
  });

  // Fetch initial global settings from Supabase / Backend API
  useEffect(() => {
    fetchGlobalPlatformSettings().then((remoteSettings) => {
      if (remoteSettings) {
        setGlobalSettings(remoteSettings);
        if (remoteSettings.platformName) {
          setSiteBranding((prev) => ({
            ...prev,
            brandName: remoteSettings.platformName,
            brandTagline: remoteSettings.platformTagline || prev.brandTagline,
            logoIcon: remoteSettings.logoUrl || prev.logoIcon,
          }));
        }
      }
    });

    const handleSettingsBroadcast = (e: any) => {
      if (e.detail) {
        setGlobalSettings(e.detail);
      }
    };
    window.addEventListener('asron_settings_updated', handleSettingsBroadcast);
    return () => window.removeEventListener('asron_settings_updated', handleSettingsBroadcast);
  }, []);

  const handleSaveGlobalSettings = (settings: GlobalPlatformSettings) => {
    setGlobalSettings(settings);
    saveGlobalPlatformSettings(settings);
    if (settings.platformName) {
      setSiteBranding((prev) => ({
        ...prev,
        brandName: settings.platformName,
        brandTagline: settings.platformTagline || prev.brandTagline,
        logoIcon: settings.logoUrl || prev.logoIcon,
      }));
    }
  };

  // SAT Desmos Hacks CMS State
  const [desmosHacks, setDesmosHacks] = useState<DesmosSatHack[]>(() => {
    try {
      const saved = localStorage.getItem('asron_desmos_hacks');
      if (saved) {
        return JSON.parse(saved);
      }
      return INITIAL_SAT_DESMOS_HACKS;
    } catch {
      return INITIAL_SAT_DESMOS_HACKS;
    }
  });

  const handleSaveDesmosHacks = (hacks: DesmosSatHack[]) => {
    setDesmosHacks(hacks);
    localStorage.setItem('asron_desmos_hacks', JSON.stringify(hacks));
  };

  // Celebration state for Tier upgrades
  const [celebrationUser, setCelebrationUser] = useState<User | null>(null);

  const handleUpdateSiteBranding = (updated: Partial<SiteBrandingConfig>) => {
    setSiteBranding((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('aurasat_site_config', JSON.stringify(next));
      return next;
    });
  };

  // User CRUD Handlers
  const handleAddUser = (newUser: User) => {
    setUsersList((prev) => {
      const next = [newUser, ...prev];
      localStorage.setItem('aurasat_registered_users', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsersList((prev) => {
      const next = prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
      localStorage.setItem('aurasat_registered_users', JSON.stringify(next));
      return next;
    });
    if (currentUser?.id === updatedUser.id) {
      localStorage.setItem('aurasat_user_profile', JSON.stringify(updatedUser));
      saveUserProfile(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsersList((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      localStorage.setItem('aurasat_registered_users', JSON.stringify(next));
      return next;
    });
  };

  // Question CRUD Handlers
  const handleAddQuestion = (newQ: Question) => {
    setQuestions((prev) => {
      const next = [newQ, ...prev];
      localStorage.setItem('aurasat_questions_bank', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    setQuestions((prev) => {
      const next = prev.map((q) => (q.id === updatedQ.id ? updatedQ : q));
      localStorage.setItem('aurasat_questions_bank', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => {
      const next = prev.filter((q) => q.id !== questionId);
      localStorage.setItem('aurasat_questions_bank', JSON.stringify(next));
      return next;
    });
  };

  const handleIngestQuestions = (incoming: Question[]) => {
    setQuestions((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const filteredIncoming = incoming.filter((q) => !existingIds.has(q.id));
      const next = [...filteredIncoming, ...prev];
      localStorage.setItem('aurasat_questions_bank', JSON.stringify(next));
      return next;
    });
  };

  // Blog Article CRUD Handlers
  const handleAddBlogArticle = (article: BlogArticle) => {
    setBlogArticles((prev) => {
      const next = [article, ...prev];
      localStorage.setItem('aurasat_blog_articles', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateBlogArticle = (article: BlogArticle) => {
    setBlogArticles((prev) => {
      const next = prev.map((a) => (a.id === article.id ? article : a));
      localStorage.setItem('aurasat_blog_articles', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteBlogArticle = (articleId: string) => {
    setBlogArticles((prev) => {
      const next = prev.filter((a) => a.id !== articleId);
      localStorage.setItem('aurasat_blog_articles', JSON.stringify(next));
      return next;
    });
  };

  // Testimonial CRUD Handlers
  const handleAddTestimonial = (testimonial: UserTestimonial) => {
    setTestimonials((prev) => {
      const next = [testimonial, ...prev];
      localStorage.setItem('aurasat_testimonials', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateTestimonial = (testimonial: UserTestimonial) => {
    setTestimonials((prev) => {
      const next = prev.map((t) => (t.id === testimonial.id ? testimonial : t));
      localStorage.setItem('aurasat_testimonials', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    setTestimonials((prev) => {
      const next = prev.filter((t) => t.id !== testimonialId);
      localStorage.setItem('aurasat_testimonials', JSON.stringify(next));
      return next;
    });
  };

  // Receipt CRUD Handlers
  const handleAddReceipt = (newReceipt: PaymentReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
  };

  // Mock Tests CRUD Handlers (with Supabase PostgreSQL Persistence)
  const handleAddMockTest = async (newTest: MockTest) => {
    setMockTests((prev) => {
      const next = [newTest, ...prev];
      localStorage.setItem('aurasat_mock_tests', JSON.stringify(next));
      return next;
    });
    try {
      await saveMockTestRemote(newTest);
    } catch (e) {
      console.error('Failed to save mock test to Supabase:', e);
    }
  };

  const handleUpdateMockTest = async (updatedTest: MockTest) => {
    setMockTests((prev) => {
      const next = prev.map((t) => (t.id === updatedTest.id ? updatedTest : t));
      localStorage.setItem('aurasat_mock_tests', JSON.stringify(next));
      return next;
    });
    try {
      await saveMockTestRemote(updatedTest);
    } catch (e) {
      console.error('Failed to update mock test in Supabase:', e);
    }
  };

  const handleDeleteMockTest = async (testId: string) => {
    setMockTests((prev) => {
      const next = prev.filter((t) => t.id !== testId);
      localStorage.setItem('aurasat_mock_tests', JSON.stringify(next));
      return next;
    });
    try {
      await deleteMockTestRemote(testId);
    } catch (e) {
      console.error('Failed to delete mock test from Supabase:', e);
    }
  };

  // Mock Categories CMS CRUD Handlers
  const handleAddMockCategory = async (newCategory: MockCategory) => {
    setMockCategories((prev) => {
      const next = [...prev, newCategory];
      localStorage.setItem('asron_mock_categories', JSON.stringify(next));
      return next;
    });
    try {
      await saveMockCategoryRemote(newCategory);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMockCategory = async (updatedCategory: MockCategory) => {
    setMockCategories((prev) => {
      const next = prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c));
      localStorage.setItem('asron_mock_categories', JSON.stringify(next));
      return next;
    });
    try {
      await saveMockCategoryRemote(updatedCategory);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMockCategory = async (categoryId: string) => {
    setMockCategories((prev) => {
      const next = prev.filter((c) => c.id !== categoryId);
      localStorage.setItem('asron_mock_categories', JSON.stringify(next));
      return next;
    });
    try {
      await deleteMockCategoryRemote(categoryId);
    } catch (e) {
      console.error(e);
    }
  };

  // Modals & Drawers
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aurasat_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [isDailyWorkoutOpen, setIsDailyWorkoutOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);
  const [isTelegramLogsOpen, setIsTelegramLogsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);
  const [socraticQuestion, setSocraticQuestion] = useState<Question | null>(null);
  const [socraticWrongAnswer, setSocraticWrongAnswer] = useState<string | undefined>(undefined);
  const [isSocraticDrawerOpen, setIsSocraticDrawerOpen] = useState(false);
  const [activeBluebookTest, setActiveBluebookTest] = useState<MockTest | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [celebrationMilestoneDay, setCelebrationMilestoneDay] = useState<number>(7);

  const handleOpenMilestoneModal = (days?: number) => {
    if (days) {
      setCelebrationMilestoneDay(days);
    } else if (currentUser.streakDays >= 100) {
      setCelebrationMilestoneDay(100);
    } else if (currentUser.streakDays >= 30) {
      setCelebrationMilestoneDay(30);
    } else {
      setCelebrationMilestoneDay(7);
    }
    setIsMilestoneModalOpen(true);
  };

  const handleClaimMilestoneReward = (milestoneDays: number, bonusXP: number) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const existing = u.claimedMilestones || [];
          const claimed = existing.includes(milestoneDays) ? existing : [...existing, milestoneDays];
          const updated = {
            ...u,
            xpPoints: u.xpPoints + bonusXP,
            claimedMilestones: claimed,
          };
          localStorage.setItem('aurasat_user_profile', JSON.stringify(updated));
          return updated;
        }
        return u;
      })
    );

    // Add automated Telegram notification
    const newNotif: TelegramNotification = {
      id: `notif-milestone-${Date.now()}`,
      userId: currentUser.id,
      type: 'DAILY_WORKOUT_READY',
      message: `🎉 Milestone Celebrated! You claimed +${bonusXP} XP for reaching a ${milestoneDays}-day study streak on ASRON SAT! Keep your momentum burning 🔥`,
      sentAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Check Supabase session on mount, handle OAuth redirect, and listen to auth changes
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (supabase) {
      // 1. Initial session check
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const appUser = mapSupabaseUserToAppUser(session.user);
          setUsersList((prev) => {
            const idx = prev.findIndex((u) => u.email.toLowerCase() === appUser.email.toLowerCase() || u.id === appUser.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...appUser };
              return updated;
            }
            return [appUser, ...prev];
          });
          setCurrentUserIndex(0);
          localStorage.setItem('aurasat_user_profile', JSON.stringify(appUser));
          
          // Auto-route to dashboard on login if currently on landing/login
          if (activeTab === 'landing') {
            setActiveTab('dashboard');
            window.location.hash = '#/dashboard';
          }
        }
      });

      // 2. Realtime auth change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const appUser = mapSupabaseUserToAppUser(session.user);
          setUsersList((prev) => {
            const idx = prev.findIndex((u) => u.email.toLowerCase() === appUser.email.toLowerCase() || u.id === appUser.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...appUser };
              return updated;
            }
            return [appUser, ...prev];
          });
          setCurrentUserIndex(0);
          localStorage.setItem('aurasat_user_profile', JSON.stringify(appUser));

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            setActiveTab('dashboard');
            window.location.hash = '#/dashboard';
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Sync activeTab state to URL Hash & Handle browser history navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${activeTab}`;
    }
  }, [activeTab]);

  // Listen to hash changes (back/forward navigation, direct deep links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      const authenticated = isUserAuthenticated();

      if (hash === 'login' || hash === 'signin') {
        if (authenticated) {
          setActiveTab('dashboard');
          window.location.hash = '#/dashboard';
        } else {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }
        return;
      }

      if (hash === 'register' || hash === 'signup') {
        if (authenticated) {
          setActiveTab('dashboard');
          window.location.hash = '#/dashboard';
        } else {
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
        }
        return;
      }

      if (hash === 'chat' || hash.startsWith('chat?') || hash === 'community' || hash.startsWith('community?')) {
        setActiveTab('community');
        return;
      }

      const validTabs = ['landing', 'blog', 'dashboard', 'daily-workout', 'vault', 'bluebook', 'qbank', 'community', 'arena', 'ai-tutor', 'roadmap', 'profile', 'admin'];
      if (validTabs.includes(hash)) {
        // Protected tabs guard
        if (['dashboard', 'vault', 'bluebook', 'qbank', 'daily-workout', 'arena', 'ai-tutor', 'profile', 'admin'].includes(hash) && !authenticated) {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        } else {
          setActiveTab(hash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle successful login or signup from AuthModal
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUsersList((prev) => {
      const idx = prev.findIndex((u) => u.email.toLowerCase() === authenticatedUser.email.toLowerCase() || u.id === authenticatedUser.id);
      let updated: User[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...authenticatedUser };
        const [target] = updated.splice(idx, 1);
        updated.unshift(target);
      } else {
        updated = [authenticatedUser, ...prev];
      }

      // Persist to all registered accounts in localStorage
      localStorage.setItem('aurasat_registered_users', JSON.stringify(updated));
      return updated;
    });
    setCurrentUserIndex(0);
    localStorage.setItem('aurasat_user_profile', JSON.stringify(authenticatedUser));
    setActiveTab('dashboard');
    window.location.hash = '#/dashboard';
    setIsAuthModalOpen(false);
  };

  // Update current user profile (synced with Supabase & localStorage)
  const handleUpdateCurrentUser = (updatedUser: User) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    localStorage.setItem('aurasat_user_profile', JSON.stringify(updatedUser));
  };

  // Handle User Sign Out
  const handleSignOut = async () => {
    await signOutUser();
    localStorage.removeItem('aurasat_user_profile');
    // Switch to first initial demo student
    setCurrentUserIndex(0);
    setActiveTab('landing');
    if (typeof window !== 'undefined') {
      window.location.hash = '#/landing';
    }
  };

  // Open Auth Modal
  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Switch role between Student (Alex Chen) and Admin (Dr. Marcus Vance)
  const handleSwitchUserRole = () => {
    setCurrentUserIndex((prev) => (prev === 0 ? 1 : 0));
  };

  // Deposit a missed question into the Mistake Vault (Leitner SRS Stage 1)
  const handleDepositMistake = (question: Question, userWrongAnswer: string) => {
    const exists = mistakes.find((m) => m.question.id === question.id);
    if (exists) return;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3); // Stage 1 review in 3 days

    const newMistake: MistakeVaultItem = {
      id: `mv-${Date.now()}-${Math.random()}`,
      userId: currentUser.id,
      question,
      userWrongAnswer,
      stage: 1,
      nextReviewAt: nextDate.toISOString(),
      isMastered: false,
      createdAt: new Date().toISOString(),
    };

    setMistakes((prev) => [newMistake, ...prev]);
  };

  // Workout completion handler
  const handleWorkoutComplete = (score: number, missedQuestions: Question[], userAnswers: Record<string, string>) => {
    // Deposit missed questions
    missedQuestions.forEach((q) => {
      handleDepositMistake(q, userAnswers[q.id] || 'N/A');
    });

    const newStreak = currentUser.streakDays + 1;

    // Update user streak & XP
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              streakDays: newStreak,
              xpPoints: u.xpPoints + 50,
            }
          : u
      )
    );

    // If student hits a milestone (7, 30, or 100-day streak), trigger milestone celebration modal
    if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
      setCelebrationMilestoneDay(newStreak);
      setIsMilestoneModalOpen(true);
    }
  };

  // Diagnostic completion
  const handleSaveDiagnosticResult = (baseline: number, potential: number, weakSkills: any[]) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              baselineScore: baseline,
              potentialScore: potential,
              weakestSubSkills: weakSkills.map((w) => w.skill),
            }
          : u
      )
    );
  };

  // Bluebook MST mock test complete
  const handleCompleteBluebookTest = (attempt: TestAttempt, missedQuestions: Question[]) => {
    missedQuestions.forEach((q) => {
      handleDepositMistake(q, attempt.answers[q.id] || 'N/A');
    });

    // Award XP
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              xpPoints: u.xpPoints + 200,
            }
          : u
      )
    );
  };

  // Socratic AI opener
  const handleOpenSocraticTutor = (question: Question, userWrongAnswer?: string) => {
    setSocraticQuestion(question);
    setSocraticWrongAnswer(userWrongAnswer);
    setIsSocraticDrawerOpen(true);
  };

  // Direct upgrade (instant demo activation)
  const handleDirectUpgrade = (tier: PlanTier) => {
    const nextExpires = new Date();
    nextExpires.setDate(nextExpires.getDate() + 30);

    const updatedUser = {
      ...currentUser,
      planTier: tier,
      planExpiresAt: nextExpires.toISOString(),
      unseenTierUpgrade: true,
    };

    setUsersList((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
    localStorage.setItem('aurasat_user_profile', JSON.stringify(updatedUser));
    setCelebrationUser(updatedUser);
  };

  // Payment receipt upload
  const handleUploadReceipt = (data: { plan: PlanTier; amount: number; imageUrl: string }) => {
    const newReceipt: PaymentReceipt = {
      id: `rcpt-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      planRequested: data.plan,
      amount: data.amount,
      receiptImageUrl: data.imageUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setReceipts((prev) => [newReceipt, ...prev]);
  };

  // Admin approves receipt
  const handleApproveReceipt = (receiptId: string, planTier: PlanTier = 'PRO') => {
    const rcpt = receipts.find((r) => r.id === receiptId);
    if (!rcpt) return;

    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'APPROVED' } : r))
    );

    const nextExpires = new Date();
    nextExpires.setDate(nextExpires.getDate() + 30);

    // Update target user
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === rcpt.userId) {
          const up = {
            ...u,
            planTier,
            planExpiresAt: nextExpires.toISOString(),
            unseenTierUpgrade: true,
          };
          if (u.id === currentUser.id) {
            setCelebrationUser(up);
          }
          return up;
        }
        return u;
      })
    );

    // Add automated Telegram notification
    const newNotif: TelegramNotification = {
      id: `notif-${Date.now()}`,
      userId: rcpt.userId,
      type: 'RECEIPT_APPROVED',
      message: `🎉 Great news ${rcpt.userName}! Your receipt for ${planTier} PASS ($${rcpt.amount}) has been approved by Dr. Marcus Vance. All Pro features are now unlocked!`,
      sentAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Admin rejects receipt
  const handleRejectReceipt = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'REJECTED' } : r))
    );
  };

  // Admin assigns plan directly
  const handleUpdateUserPlan = (userId: string, planTier: PlanTier, daysToAdd: number) => {
    let nextExpires: string | undefined;
    if (daysToAdd > 0) {
      const d = new Date();
      d.setDate(d.getDate() + daysToAdd);
      nextExpires = d.toISOString();
    }

    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const up = {
            ...u,
            planTier,
            planExpiresAt: nextExpires,
            unseenTierUpgrade: planTier !== 'FREE',
          };
          if (u.id === currentUser.id && planTier !== 'FREE') {
            setCelebrationUser(up);
          }
          return up;
        }
        return u;
      })
    );
  };

  // Trigger simulated Telegram notification
  const handleTriggerSimulatedNotification = (type: 'DAILY_WORKOUT_READY' | 'STREAK_DANGER' | 'RECEIPT_APPROVED') => {
    let message = '';
    if (type === 'DAILY_WORKOUT_READY') {
      message = '⚡ 09:00 UTC Workout Ready: Your daily 5 questions on Expression of Ideas & Nonlinear Equations are waiting. Keep your streak burning! 🔥';
    } else if (type === 'STREAK_DANGER') {
      message = `🔥 STREAK DANGER ALERT! Only 4 hours remaining to complete today's workout and preserve your ${currentUser.streakDays}-day streak.`;
    } else {
      message = '✅ Your Pro Adaptive Pass has been activated with unlimited Socratic AI and MST Mocks.';
    }

    const newNotif: TelegramNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      type,
      message,
      sentAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Update Mistake Item
  const handleUpdateMistakeItem = (updatedItem: MistakeVaultItem) => {
    setMistakes((prev) => prev.map((m) => (m.id === updatedItem.id ? updatedItem : m)));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] flex font-sans selection:bg-[#E07A5F] selection:text-white transition-colors duration-150">
      {/* 1. Left Fixed Sidebar (Visible in Dashboard & Study Views) */}
      {activeTab !== 'landing' && activeTab !== 'blog' && (
        <Sidebar
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          siteBranding={siteBranding}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() =>
            setIsSidebarCollapsed((prev) => {
              const next = !prev;
              try {
                localStorage.setItem('aurasat_sidebar_collapsed', String(next));
              } catch {}
              return next;
            })
          }
          onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
          onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          onOpenVocabTrainer={() => setIsVocabModalOpen(true)}
          onOpenMultiplayerArena={() => setActiveTab('arena')}
          onOpenSocraticTutor={() => {
            if (questions.length > 0) {
              setSocraticQuestion(questions[0]);
              setIsSocraticDrawerOpen(true);
            } else {
              setIsDiagnosticOpen(true);
            }
          }}
          onOpenSettings={() => setActiveTab('profile')}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenTelegramLogs={() => setIsTelegramLogsOpen(true)}
          onSwitchUserRole={handleSwitchUserRole}
          onOpenAuthModal={(mode) => handleOpenAuth(mode || 'signup')}
          onLogout={handleSignOut}
          unreadAlertCount={notifications.filter((n) => !n.read).length}
        />
      )}

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Maintenance Mode Alert if enabled and student is logged in */}
        {globalSettings.isMaintenance && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN' && (
          <div className="w-full bg-rose-950/80 border-b border-rose-800/60 px-4 py-2 text-xs font-mono text-rose-200 flex items-center justify-between z-50">
            <span>⚠️ Platform Maintenance Mode Active. Some features are temporarily offline.</span>
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="underline text-xs text-rose-300 hover:text-white cursor-pointer"
            >
              Staff Bypass Login
            </button>
          </div>
        )}

        {/* Dynamic Top Announcement Banner (Supabase platform_content.announcement_banner) */}
        {platformContentMap.announcement_banner?.is_active && (
          <div className="w-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white border-b border-white/10 px-4 py-2 text-xs flex items-center justify-between z-40 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 truncate max-w-4xl mx-auto">
              <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse shrink-0" />
              <span className="font-bold truncate">
                {platformContentMap.announcement_banner.title || 'Yangi Digital SAT 2026 Mock Testlari yuklandi!'}
              </span>
              {platformContentMap.announcement_banner.subtitle && (
                <span className="text-slate-300 hidden md:inline truncate">
                  — {platformContentMap.announcement_banner.subtitle}
                </span>
              )}
            </div>
            {platformContentMap.announcement_banner.content?.linkText && (
              <button
                onClick={() => {
                  const target = platformContentMap.announcement_banner.content?.linkUrl || 'mocks';
                  setActiveTab(target);
                }}
                className="px-3 py-1 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-[11px] font-mono font-bold shrink-0 transition-colors cursor-pointer"
              >
                {platformContentMap.announcement_banner.content.linkText} →
              </button>
            )}
          </div>
        )}

        {/* Top Header with Promo Announcement & Quick Actions */}
        <Header
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          siteBranding={siteBranding}
          onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
          onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          onOpenTelegramLogs={() => setIsTelegramLogsOpen(true)}
          onSwitchUserRole={handleSwitchUserRole}
          onOpenAuthModal={handleOpenAuth}
          onOpenMilestoneModal={handleOpenMilestoneModal}
          onOpenProfileSearch={() => {
            setInspectedUser(currentUser);
            setIsProfileModalOpen(true);
          }}
          onOpenCurrentUserProfile={() => {
            setActiveTab('profile');
          }}
          unreadAlertCount={notifications.filter((n) => !n.read).length}
        />

        {/* Main Routed Views */}
        <main className="flex-1 pb-16">
          {activeTab === 'landing' && (
            <OnePrepLandingView
              user={currentUser}
              siteBranding={siteBranding}
              platformContent={platformContentMap}
              blogArticles={blogArticles}
              testimonials={testimonials}
              onOpenAuthModal={(mode) => handleOpenAuth(mode || 'signup')}
              onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
              onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onNavigateToBlog={() => setActiveTab('blog')}
            />
          )}

          {activeTab === 'blog' && (
            <BlogView
              articles={blogArticles}
              siteBranding={siteBranding}
              onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
              onOpenAuthModal={(mode) => handleOpenAuth(mode || 'signup')}
              onBackToOverview={() => setActiveTab('landing')}
            />
          )}

          {activeTab === 'profile' && (
            <StudentProfileView
              currentUser={currentUser}
              onUpdateUser={handleUpdateCurrentUser}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenAuthModal={() => handleOpenAuth('signin')}
              onSignOut={handleSignOut}
              onOpenChat={() => setActiveTab('community')}
              onOpenArena={() => setActiveTab('arena')}
            />
          )}

          {activeTab === 'settings' && (
            <ProfileView
              currentUser={currentUser}
              onUpdateUser={handleUpdateCurrentUser}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenAuthModal={() => handleOpenAuth('signin')}
              onSignOut={handleSignOut}
            />
          )}

          {activeTab === 'vocab' && (
            <VocabularyHub
              user={currentUser}
              onOpenPaywall={() => setIsPaywallOpen(true)}
            />
          )}

          {activeTab === 'daily-workout' && (
            <div className="animate-in fade-in duration-200">
              <DailyWorkoutView
                user={currentUser}
                onWorkoutComplete={handleWorkoutComplete}
                onReturnToDashboard={() => setActiveTab('dashboard')}
                onOpenMistakeVault={() => setActiveTab('vault')}
                onOpenPaywall={() => setIsPaywallOpen(true)}
                onOpenSocraticTutor={handleOpenSocraticTutor}
                onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              user={currentUser}
              mistakes={mistakes}
              mockTests={mockTests}
              platformContent={platformContentMap}
              onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
              onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
              onOpenMistakeVault={() => setActiveTab('vault')}
              onStartBluebookTest={(test) => setActiveBluebookTest(test)}
              onOpenQuestionBank={(subSkill) => {
                setQbankInitialFilter(subSkill || '');
                setActiveTab('qbank');
              }}
              onOpenCommunity={() => setActiveTab('community')}
              onOpenRoadmap={() => setActiveTab('roadmap')}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenSocraticTutor={handleOpenSocraticTutor}
              onOpenMilestoneModal={handleOpenMilestoneModal}
            />
          )}

          {activeTab === 'vault' && (
            <MistakeVaultView
              mistakes={mistakes}
              user={currentUser}
              onOpenSocraticTutor={handleOpenSocraticTutor}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onUpdateMistakeItem={handleUpdateMistakeItem}
            />
          )}

          {activeTab === 'bluebook' && (
            <MockTestsCatalogView
              user={currentUser}
              mockTests={mockTests}
              categories={mockCategories}
              onLaunchTest={(test) => setActiveBluebookTest(test)}
              onStartBluebookTest={(test) => setActiveBluebookTest(test)}
              onOpenPaywall={() => setIsPaywallOpen(true)}
            />
          )}

          {activeTab === 'qbank' && (
            <QuestionBankView
              user={currentUser}
              questions={questions}
              initialFilter={qbankInitialFilter}
              onOpenSocraticTutor={handleOpenSocraticTutor}
              onDepositMistake={handleDepositMistake}
              onOpenPaywall={() => setIsPaywallOpen(true)}
            />
          )}

          {activeTab === 'community' && (
            <CommunityView
              user={currentUser}
              usersList={usersList}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenQuestionInBank={(questionId) => {
                setActiveTab('qbank');
              }}
              onSelectUserProfile={(u) => {
                setInspectedUser(u);
                setIsProfileModalOpen(true);
              }}
            />
          )}

          {activeTab === 'arena' && (
            <MultiplayerArenaView
              user={currentUser}
              usersList={usersList}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onDepositMistake={handleDepositMistake}
              onOpenSocraticTutor={handleOpenSocraticTutor}
              onSelectUserProfile={(u) => {
                setInspectedUser(u);
                setIsProfileModalOpen(true);
              }}
            />
          )}

          {activeTab === 'ai-tutor' && (
            <SocraticRepetitorHubView
              user={currentUser}
              questions={questions}
              mistakes={mistakes}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenQuestionBank={(skill) => {
                setQbankInitialFilter(skill || '');
                setActiveTab('qbank');
              }}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapView
              user={currentUser}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
              onOpenQuestionBank={() => setActiveTab('qbank')}
              onOpenVocabTrainer={() => setActiveTab('vocab')}
              onOpenMockTests={() => setActiveTab('bluebook')}
              onOpenSocraticTutor={handleOpenSocraticTutor}
              onOpenMistakeVault={() => setActiveTab('vault')}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanelView
              currentUser={currentUser}
              onRefreshGlobal={() => fetchPlatformContentMap().then(setPlatformContentMap)}
              usersList={usersList}
              receipts={receipts}
              questions={questions}
              mockTests={mockTests}
              mockCategories={mockCategories}
              onAddMockCategory={handleAddMockCategory}
              onUpdateMockCategory={handleUpdateMockCategory}
              onDeleteMockCategory={handleDeleteMockCategory}
              blogArticles={blogArticles}
              testimonials={testimonials}
              pricingPlans={pricingPlans}
              globalSettings={globalSettings}
              desmosHacks={desmosHacks}
              siteBranding={siteBranding}
              adminCredentials={adminCredentials}
              onUpdateSiteBranding={handleUpdateSiteBranding}
              onUpdateAdminCredentials={handleUpdateAdminCredentials}
              onSavePricingPlans={handleSavePricingPlans}
              onSaveGlobalSettings={handleSaveGlobalSettings}
              onSaveDesmosHacks={handleSaveDesmosHacks}
              onSaveTestimonials={(tests) => {
                setTestimonials(tests);
                localStorage.setItem('aurasat_testimonials', JSON.stringify(tests));
              }}
              onApproveReceipt={handleApproveReceipt}
              onRejectReceipt={handleRejectReceipt}
              onAddReceipt={handleAddReceipt}
              onDeleteReceipt={handleDeleteReceipt}
              onUpdateUserPlan={handleUpdateUserPlan}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onIngestQuestions={handleIngestQuestions}
              onAddMockTest={handleAddMockTest}
              onUpdateMockTest={handleUpdateMockTest}
              onDeleteMockTest={handleDeleteMockTest}
              onPreviewMockTest={(test) => setActiveBluebookTest(test)}
              onAddBlogArticle={handleAddBlogArticle}
              onUpdateBlogArticle={handleUpdateBlogArticle}
              onDeleteBlogArticle={handleDeleteBlogArticle}
              onAddTestimonial={handleAddTestimonial}
              onUpdateTestimonial={handleUpdateTestimonial}
              onDeleteTestimonial={handleDeleteTestimonial}
              onNavigateToStudentView={() => setActiveTab('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on < 768px in student/dashboard views) */}
      {activeTab !== 'landing' && activeTab !== 'blog' && !activeBluebookTest && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          unreadCount={notifications.filter((n) => !n.read).length}
        />
      )}

      {/* Admin Login Modal with configurable passwords */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        adminCredentials={adminCredentials}
        onAdminLoginSuccess={() => {
          // Switch to admin role/user and open admin tab
          const adminUser = usersList.find((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') || usersList[0];
          const idx = usersList.findIndex((u) => u.id === adminUser.id);
          if (idx >= 0) setCurrentUserIndex(idx);
          setActiveTab('admin');
        }}
        onSuccess={() => {
          // Switch to admin role/user and open admin tab
          const adminUser = usersList.find((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') || usersList[0];
          const idx = usersList.findIndex((u) => u.id === adminUser.id);
          if (idx >= 0) setCurrentUserIndex(idx);
          setActiveTab('admin');
        }}
      />

      {/* Student Profile Explorer Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        selectedUser={inspectedUser || currentUser}
        usersList={usersList}
        onSelectUser={(u) => setInspectedUser(u)}
        isAdmin={currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN'}
        onUpdatePlan={handleUpdateUserPlan}
      />

      {/* Supabase Google Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handleAuthSuccess}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Bluebook Full-Screen Simulation Modal */}
      {activeBluebookTest && (
        <BluebookTestEngine
          test={activeBluebookTest}
          user={currentUser}
          onExit={() => setActiveBluebookTest(null)}
          onCompleteTest={(attempt, missed) => {
            handleCompleteBluebookTest(attempt, missed);
          }}
        />
      )}

      {/* Daily 10-Minute Workout Modal */}
      <DailyWorkoutModal
        isOpen={isDailyWorkoutOpen}
        onClose={() => setIsDailyWorkoutOpen(false)}
        user={currentUser}
        onWorkoutComplete={handleWorkoutComplete}
        onOpenSocraticTutor={handleOpenSocraticTutor}
        onOpenMistakeVault={() => setActiveTab('vault')}
        onOpenPaywall={() => setIsPaywallOpen(true)}
      />

      {/* 7-Minute Diagnostic Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        user={currentUser}
        onUnlockPro={() => {}}
        onSaveDiagnosticResult={handleSaveDiagnosticResult}
      />

      {/* Telegram Notification Simulator Drawer */}
      <TelegramNotificationSimulator
        isOpen={isTelegramLogsOpen}
        onClose={() => setIsTelegramLogsOpen(false)}
        user={currentUser}
        notifications={notifications}
        onTriggerSimulatedNotification={handleTriggerSimulatedNotification}
      />

      {/* Socratic AI Coach Drawer */}
      <SocraticTutorDrawer
        isOpen={isSocraticDrawerOpen}
        onClose={() => {
          setIsSocraticDrawerOpen(false);
          setSocraticQuestion(null);
          setSocraticWrongAnswer(undefined);
        }}
        question={socraticQuestion}
        userWrongAnswer={socraticWrongAnswer}
      />

      {/* Streak Milestone Celebration Modal */}
      <MilestoneCelebrationModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestoneDays={celebrationMilestoneDay}
        user={currentUser}
        onClaimReward={handleClaimMilestoneReward}
      />

      {/* Vocab Flashcards Modal */}
      <VocabTrainerModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
      />

      {/* Multiplayer Arena Modal */}
      <MultiplayerArenaModal
        isOpen={isArenaModalOpen}
        onClose={() => setIsArenaModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Persistent Floating Draggable Official Desmos Widget & Hacks Hub (Visible everywhere) */}
      {!activeBluebookTest && (
        <FloatingDesmosWidget
          hacks={desmosHacks}
          globalSettings={globalSettings}
        />
      )}
    </div>
  );
}
