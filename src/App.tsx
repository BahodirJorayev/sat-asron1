import React, { useState, useEffect } from 'react';
import { ActiveView, resolveRoute } from './RootRouter';
export { resolveRoute };
export type { ActiveView };
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MistakeVaultView } from './components/MistakeVaultView';
import { QuestionBankView } from './components/QuestionBankView';
import { CommunityView } from './components/CommunityView';
import { RoadmapView } from './components/RoadmapView';
import { AdminPanelView } from './components/AdminPanelView';
import { OnePrepLandingView } from './components/OnePrepLandingView';
import { LandingView } from './components/LandingView';
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
import { GlobalSearchModal } from './components/chat/GlobalSearchModal';
import { StudentProfileView } from './components/StudentProfileView';
import { ProfileView } from './components/ProfileView';
import { MilestoneCelebrationModal } from './components/MilestoneCelebrationModal';
import { FloatingDesmosWidget } from './components/FloatingDesmosWidget';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';
import { PwaSplashScreen } from './components/pwa/PwaSplashScreen';
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
import { getSupabaseClient, mapSupabaseUserToAppUser, signOutUser, saveUserProfile, supabase } from './lib/supabase';
import { useUserProgress, syncUserProgressRemote } from './hooks/useUserProgress';
import { ViewSkeletonLoader } from './components/common/ViewSkeletonLoader';
import { ViewErrorBoundary } from './components/common/ViewErrorBoundary';
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
  fetchQuestionsRemote,
  saveQuestionRemote,
  deleteQuestionRemote,
  bulkImportQuestionsRemote,
  subscribeToQuestions,
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

  // Single-source route state: resolveRoute(hashOrPath)
  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const raw = window.location.hash || window.location.pathname || '';
      return resolveRoute(raw);
    }
    return 'dashboard';
  });

  // Map currentView to activeTab for Sidebar/Header/MobileBottomNav active states
  const activeTab = currentView === 'mocks' ? 'bluebook'
    : currentView === 'questions' ? 'qbank'
    : currentView === 'vocabulary' ? 'vocab'
    : currentView === 'mistakes' ? 'vault'
    : (currentView as string);

  const setActiveTab = (tabOrHash: string) => {
    const resolved = resolveRoute(tabOrHash);
    setCurrentView(resolved);
    if (typeof window !== 'undefined') {
      const cleanTab = tabOrHash.replace(/^[#/]+/, '');
      const targetHash = `#/${cleanTab || resolved}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  };
  const [mistakes, setMistakes] = useState<MistakeVaultItem[]>(INITIAL_MISTAKES);

  // Real-time cross-device user progress sync
  const { progress } = useUserProgress(currentUser);

  useEffect(() => {
    if (progress?.mistakes_log && progress.mistakes_log.length > 0) {
      setMistakes(progress.mistakes_log);
    }
  }, [progress?.mistakes_log]);
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

    fetchQuestionsRemote().then((remoteQuestions) => {
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestions((prev) => {
          const remoteIds = new Set(remoteQuestions.map((q) => q.id));
          const localOnly = prev.filter((q) => !remoteIds.has(q.id));
          return [...remoteQuestions, ...localOnly];
        });
      }
    });

    const unsubQuestions = subscribeToQuestions((remoteQuestions) => {
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestions((prev) => {
          const remoteIds = new Set(remoteQuestions.map((q) => q.id));
          const localOnly = prev.filter((q) => !remoteIds.has(q.id));
          return [...remoteQuestions, ...localOnly];
        });
      }
    });

    return () => {
      unsubPlatform();
      unsubMocks();
      unsubQuestions();
    };
  }, []);



  // Live Supabase public.profiles fetch and Realtime sync across PC & Mobile devices
  useEffect(() => {
    let isMounted = true;

    const syncLiveUserProfile = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const activeUserId = authData?.user?.id;
        if (!activeUserId) return;

        // Fetch directly from public.profiles using auth.uid()
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', activeUserId)
          .maybeSingle();

        if (profile && isMounted) {
          const freshUser: User = {
            id: activeUserId,
            email: authData.user.email || '',
            fullName: profile.full_name || authData.user.user_metadata?.full_name || 'Talaba',
            username: profile.username || authData.user.user_metadata?.username || 'talaba',
            avatarUrl: profile.avatar_url || authData.user.user_metadata?.avatar_url,
            targetScore: profile.target_score || 1550,
            phoneNumber: authData.user.user_metadata?.phone || '',
            planTier: 'STANDARD',
            role: (authData.user.user_metadata?.role as any) || 'STUDENT',
            streakDays: 0,
            streakFreezes: 1,
            xpPoints: 100,
            totalQuestionsDone: 0,
            overallAccuracy: 0,
            targetExamDate: profile.target_exam_date || '2026-10-03',
            createdAt: profile.created_at || new Date().toISOString(),
          };

          setUsersList((prev) => {
            const idx = prev.findIndex((u) => u.id === activeUserId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...freshUser };
              return updated;
            }
            return [freshUser, ...prev];
          });
          setCurrentUserIndex(0);
        }
      } catch (err) {
        console.warn('Live profile sync notice:', err);
      }
    };

    syncLiveUserProfile();

    // Supabase Realtime channel for instant cross-device updates
    const profileChannel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload: any) => {
          if (payload.new) {
            const newP = payload.new;
            setUsersList((prev) =>
              prev.map((u) => {
                if (u.id === newP.id) {
                  return {
                    ...u,
                    fullName: newP.full_name || u.fullName,
                    username: newP.username || u.username,
                    avatarUrl: newP.avatar_url || u.avatarUrl,
                    targetScore: newP.target_score || u.targetScore,
                  };
                }
                return u;
              })
            );
          }
        }
      )
      .subscribe();

    const handleProfileUpdateEvent = (e: any) => {
      if (e.detail) {
        const payload = e.detail;
        setUsersList((prev) => {
          const activeId = payload.id || prev[0]?.id;
          return prev.map((u, i) => {
            if (u.id === activeId || (i === 0 && !u.id)) {
              return {
                ...u,
                fullName: payload.fullName || payload.full_name || u.fullName,
                username: payload.username || u.username,
                avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : (payload.avatar_url !== undefined ? payload.avatar_url : u.avatarUrl),
                targetScore: payload.targetScore || payload.target_score || u.targetScore,
              };
            }
            return u;
          });
        });
      }
    };
    window.addEventListener('asron_profile_updated', handleProfileUpdateEvent);
    window.addEventListener('profile_updated', handleProfileUpdateEvent);

    return () => {
      isMounted = false;
      supabase.removeChannel(profileChannel);
      window.removeEventListener('asron_profile_updated', handleProfileUpdateEvent);
      window.removeEventListener('profile_updated', handleProfileUpdateEvent);
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

  // Fetch initial global settings from Supabase / Backend API and listen to live cloud updates
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

    // 1. Local window broadcast listener
    const handleSettingsBroadcast = (e: any) => {
      if (e.detail) {
        setGlobalSettings(e.detail);
      }
    };
    window.addEventListener('asron_settings_updated', handleSettingsBroadcast);

    // 2. Supabase Realtime Broadcast Channel (instant cross-device & visitor synchronization)
    const broadcastChannel = supabase
      .channel('global-platform-events')
      .on('broadcast', { event: 'settings_updated' }, (payload: any) => {
        if (payload.payload) {
          const newSettings = payload.payload;
          setGlobalSettings(newSettings);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('asron_global_settings', JSON.stringify(newSettings));
          }
          if (newSettings.platformName) {
            setSiteBranding((prev) => ({
              ...prev,
              brandName: newSettings.platformName,
              brandTagline: newSettings.platformTagline || prev.brandTagline,
              logoIcon: newSettings.logoUrl || prev.logoIcon,
            }));
          }
        }
      })
      .subscribe();

    // 3. Supabase Postgres Changes listener on global_platform_settings table
    const dbSettingsChannel = supabase
      .channel('global-platform-db-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platform_settings' },
        (payload: any) => {
          if (payload.new) {
            const data = payload.new;
            setGlobalSettings((prev) => {
              const updated: GlobalPlatformSettings = {
                ...prev,
                id: data.id || 'global_config',
                platformName: data.platform_name || prev.platformName,
                logoUrl: data.logo_url || prev.logoUrl,
                adminTelegram: data.admin_telegram || prev.adminTelegram,
                contactTelegram: data.admin_telegram || prev.contactTelegram,
                landingHeadline: data.landing_headline || prev.landingHeadline,
                landingHeroTitle: data.landing_headline || prev.landingHeroTitle,
                announcementText: data.announcement_text ?? prev.announcementText,
                announcementEnabled: data.announcement_enabled ?? prev.announcementEnabled,
                announcementActive: data.announcement_enabled ?? prev.announcementActive,
                freeDailyLimit: data.free_daily_limit ?? prev.freeDailyLimit,
                isMaintenance: data.is_maintenance ?? prev.isMaintenance,
                arenaEnabled: data.arena_enabled ?? prev.arenaEnabled,
                liveStreamEnabled: data.live_stream_enabled ?? prev.liveStreamEnabled,
                voiceNotesEnabled: data.voice_notes_enabled ?? prev.voiceNotesEnabled,
                faqs: data.faqs || prev.faqs,
                testimonials: data.testimonials || prev.testimonials,
                updatedAt: data.updated_at || new Date().toISOString(),
              };
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('asron_global_settings', JSON.stringify(updated));
              }
              if (updated.platformName) {
                setSiteBranding((bPrev) => ({
                  ...bPrev,
                  brandName: updated.platformName,
                  brandTagline: updated.platformTagline || bPrev.brandTagline,
                  logoIcon: updated.logoUrl || bPrev.logoIcon,
                }));
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('asron_settings_updated', handleSettingsBroadcast);
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(dbSettingsChannel);
    };
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('aurasat_site_config', JSON.stringify(next));
      }
      return next;
    });

    // Cloud synchronization: push branding updates to remote Supabase database and broadcast to external visitors
    setGlobalSettings((prev) => {
      const newSettings: GlobalPlatformSettings = {
        ...prev,
        platformName: updated.brandName || prev.platformName,
        platformTagline: updated.brandTagline || prev.platformTagline,
        logoUrl: updated.logoIcon || prev.logoUrl,
        adminTelegram: (updated as any).adminTelegram || prev.adminTelegram,
        contactTelegram: (updated as any).adminTelegram || prev.contactTelegram,
        supportEmail: updated.supportEmail || prev.supportEmail,
        updatedAt: new Date().toISOString(),
      };
      saveGlobalPlatformSettings(newSettings);
      return newSettings;
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

  // Question CRUD Handlers (Direct Supabase Cloud DB Persistence)
  const handleAddQuestion = async (newQ: Question) => {
    try {
      const saved = await saveQuestionRemote(newQ);
      setQuestions((prev) => [saved, ...prev.filter((q) => q.id !== saved.id)]);
    } catch (e) {
      console.error('Failed to save question to Supabase:', e);
      setQuestions((prev) => [newQ, ...prev]);
    }
  };

  const handleUpdateQuestion = async (updatedQ: Question) => {
    try {
      const saved = await saveQuestionRemote(updatedQ);
      setQuestions((prev) => prev.map((q) => (q.id === saved.id || q.id === updatedQ.id ? saved : q)));
    } catch (e) {
      console.error('Failed to update question in Supabase:', e);
      setQuestions((prev) => prev.map((q) => (q.id === updatedQ.id ? updatedQ : q)));
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestionRemote(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (e) {
      console.error('Failed to delete question from Supabase:', e);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    }
  };

  const handleIngestQuestions = async (incoming: Question[]) => {
    try {
      const saved = await bulkImportQuestionsRemote(incoming);
      setQuestions((prev) => {
        const existingIds = new Set(saved.map((q) => q.id));
        return [...saved, ...prev.filter((q) => !existingIds.has(q.id))];
      });
    } catch (e) {
      console.error('Failed to bulk ingest questions to Supabase:', e);
    }
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

  // Mock Tests CRUD Handlers (with Direct Supabase PostgreSQL Cloud Persistence)
  const handleAddMockTest = async (newTest: MockTest) => {
    setMockTests((prev) => [newTest, ...prev]);
    try {
      await saveMockTestRemote(newTest);
    } catch (e) {
      console.error('Failed to save mock test to Supabase:', e);
    }
  };

  const handleUpdateMockTest = async (updatedTest: MockTest) => {
    setMockTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
    try {
      await saveMockTestRemote(updatedTest);
    } catch (e) {
      console.error('Failed to update mock test in Supabase:', e);
    }
  };

  const handleDeleteMockTest = async (testId: string) => {
    setMockTests((prev) => prev.filter((t) => t.id !== testId));
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
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

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
    if (!supabase) return;

    let isMounted = true;

    const handleAuthenticatedUser = async (user: any) => {
      try {
        const authIntent = typeof window !== 'undefined' ? localStorage.getItem('asron_auth_intent') : null;

        // Fetch existing profile by ID
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, target_score, email')
          .eq('id', user.id)
          .maybeSingle();

        let profile = existingProfile;
        if (!profile && user.email) {
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, target_score, email')
            .eq('email', user.email)
            .maybeSingle();
          if (profileByEmail) {
            profile = profileByEmail;
          }
        }

        // STRICT GOOGLE OAUTH GUARD 1:
        // Initiated from Sign Up, but account ALREADY EXISTS in profiles:
        if (authIntent === 'signup' && profile) {
          localStorage.removeItem('asron_auth_intent');
          await supabase.auth.signOut();
          const notice = {
            type: 'warning' as const,
            message: "Sizda allaqachon akkaunt mavjud. Iltimos, Kirish (Log In) orqali kiring.",
            targetTab: 'signin' as const,
          };
          localStorage.setItem('asron_auth_notice', JSON.stringify(notice));
          window.dispatchEvent(new CustomEvent('asron_auth_notice', { detail: notice }));
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
          return;
        }

        // STRICT GOOGLE OAUTH GUARD 2:
        // Initiated from Log In, but NO account exists in profiles:
        if (authIntent === 'signin' && !profile) {
          localStorage.removeItem('asron_auth_intent');
          await supabase.auth.signOut();
          const notice = {
            type: 'error' as const,
            message: "Bunday akkaunt topilmadi. Iltimos, avval ro'yxatdan o'ting.",
            targetTab: 'signup' as const,
          };
          localStorage.setItem('asron_auth_notice', JSON.stringify(notice));
          window.dispatchEvent(new CustomEvent('asron_auth_notice', { detail: notice }));
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
          return;
        }

        // Genuine new registration via Google OAuth:
        if (authIntent === 'signup' && !profile) {
          localStorage.removeItem('asron_auth_intent');
          localStorage.removeItem('asron_auth_notice');
          await supabase.from('profiles').upsert(
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Talaba',
              username: user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
              target_score: 1500,
              created_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
          try {
            await supabase.from('user_progress').upsert(
              {
                user_id: user.id,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
          } catch {}
        } else if (authIntent === 'signin') {
          localStorage.removeItem('asron_auth_intent');
          localStorage.removeItem('asron_auth_notice');
        } else if (!profile) {
          // Fallback auto-provision if neither intent was stored
          await supabase.from('profiles').upsert(
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Talaba',
              username: user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
              target_score: 1500,
              created_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
          try {
            await supabase.from('user_progress').upsert(
              {
                user_id: user.id,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
          } catch {}
        }

        if (!isMounted) return;

        // Hydrate the application user with full profile data
        const appUser = mapSupabaseUserToAppUser(user, {
          fullName: profile?.full_name,
          username: profile?.username,
          avatarUrl: profile?.avatar_url,
          targetScore: profile?.target_score,
        });

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
        localStorage.setItem('aura_sat_auth_user', JSON.stringify(appUser));

        // Auto-route to dashboard on successful login if currently on landing/login/register
        if (typeof window !== 'undefined') {
          const currentPath = window.location.hash || window.location.pathname;
          if (
            currentPath === '' ||
            currentPath === '/' ||
            currentPath.includes('landing') ||
            currentPath.includes('login') ||
            currentPath.includes('register')
          ) {
            setActiveTab('dashboard');
            window.location.hash = '#/dashboard';
          }
        }
      } catch (err) {
        console.error('handleAuthenticatedUser error:', err);
      }
    };

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && isMounted) {
        await handleAuthenticatedUser(session.user);
      }
    });

    // 2. Realtime auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('aurasat_user_profile');
        localStorage.removeItem('aura_sat_auth_user');
        setCurrentUserIndex(0);
        return;
      }
      if (session?.user && isMounted) {
        await handleAuthenticatedUser(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Realtime Presence: Track active connected user/visitor across platform
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clientPresenceKey = currentUser?.id || `visitor-${Math.random().toString(36).substring(2, 9)}`;
    const presenceChannel = supabase.channel('online-presence', {
      config: { presence: { key: clientPresenceKey } },
    });

    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          user_id: currentUser?.id,
          username: currentUser?.username,
          full_name: currentUser?.fullName,
          role: currentUser?.role || 'STUDENT',
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [currentUser?.id, currentUser?.fullName, currentUser?.username]);

  // Fetch and synchronize live registered profiles from Supabase public.profiles
  useEffect(() => {
    let isMounted = true;

    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const mappedUsers: User[] = data.map((p: any) => ({
            id: p.id,
            email: p.email || `${p.username || 'user'}@asron.sat`,
            username: p.username || 'user',
            fullName: p.full_name || p.username || 'Talaba',
            role: (p.role === 'ADMIN' ? 'ADMIN' : 'STUDENT') as any,
            planTier: (p.plan_tier || 'FREE') as any,
            avatarUrl: p.avatar_url,
            streakDays: p.streak_days || 0,
            targetScore: p.target_score || 1550,
            streakFreezes: p.streak_freezes || 0,
            xpPoints: p.xp_points || 0,
            createdAt: p.created_at || new Date().toISOString(),
            isBanned: !!p.is_banned,
            phoneNumber: p.phone_number,
            institution: p.institution,
            targetUniversity: p.target_university,
          }));

          setUsersList((prev) => {
            const existingIds = new Set(mappedUsers.map((u) => u.id));
            const localOnly = prev.filter((u) => !existingIds.has(u.id));
            return [...mappedUsers, ...localOnly];
          });
        }
      } catch (err) {
        console.error('Failed to sync live profiles in App:', err);
      }
    };

    fetchProfiles();

    const profilesSubscription = supabase
      .channel('app_live_profiles_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          if (isMounted) fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(profilesSubscription);
    };
  }, []);

  // Catch Pathname Routes & Normalize to Hash/Views on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const raw = `${pathname} ${hash}`;

    if (raw.includes('qbank') || raw.includes('question') || raw.includes('sqb')) {
      if (!hash.includes('qbank') && !hash.includes('question')) {
        window.location.hash = '#/qbank';
      }
    } else if (raw.includes('mock') || raw.includes('test') || raw.includes('bluebook')) {
      if (!hash.includes('mocks') && !hash.includes('bluebook')) {
        window.location.hash = '#/mocks';
      }
    } else if (raw.includes('vocab') || raw.includes('word') || raw.includes('lug')) {
      if (!hash.includes('vocab') && !hash.includes('vocabulary')) {
        window.location.hash = '#/vocabulary';
      }
    } else if (raw.includes('mistake') || raw.includes('error') || raw.includes('xato') || raw.includes('vault')) {
      if (!hash.includes('mistakes') && !hash.includes('vault')) {
        window.location.hash = '#/mistakes';
      }
    } else if (raw.includes('community') || raw.includes('chat') || raw.includes('hamjamiyat')) {
      if (!hash.includes('community') && !hash.includes('chat')) {
        window.location.hash = '#/community';
      }
    } else if (raw.includes('profile') || raw.includes('setting')) {
      if (!hash.includes('profile') && !hash.includes('setting')) {
        window.location.hash = '#/profile';
      }
    } else if (raw.includes('admin')) {
      if (!hash.includes('admin')) {
        window.location.hash = '#/admin';
      }
    } else if (raw.includes('dashboard') && !hash.includes('dashboard')) {
      window.location.hash = '#/dashboard';
    }
  }, []);

  // Sync activeTab state to URL Hash & Handle browser history navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (!currentHash.includes(activeTab)) {
        window.location.hash = `#/${activeTab}`;
      }
    }
  }, [activeTab]);

  // Listen to hash and pushState route changes (back/forward navigation, direct deep links)
  useEffect(() => {
    const handleRouteSync = (e?: any) => {
      if (typeof window === 'undefined') return;
      const customPath = e?.detail?.path;
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const pathname = customPath || window.location.pathname;
      const raw = `${hash} ${pathname}`.toLowerCase();
      const authenticated = isUserAuthenticated();

      if (
        raw.includes('access_token') ||
        raw.includes('token_type') ||
        raw.includes('code=') ||
        pathname.includes('callback') ||
        window.location.search.includes('code=')
      ) {
        setActiveTab('dashboard');
        return;
      }

      if (hash === 'login' || hash === 'signin') {
        if (authenticated) {
          setActiveTab('dashboard');
        } else {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }
        return;
      }

      if (hash === 'register' || hash === 'signup') {
        if (authenticated) {
          setActiveTab('dashboard');
        } else {
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
        }
        return;
      }

      // Exhaustive alias matching for route sync:
      if (raw.includes('qbank') || raw.includes('question') || raw.includes('sqb') || raw.includes('practice')) {
        setActiveTab('qbank');
        return;
      }
      if (raw.includes('mock') || raw.includes('test') || raw.includes('bluebook')) {
        setActiveTab('bluebook');
        return;
      }
      if (raw.includes('vocab') || raw.includes('word') || raw.includes('lug')) {
        setActiveTab('vocab');
        return;
      }
      if (raw.includes('mistake') || raw.includes('error') || raw.includes('xato') || raw.includes('vault')) {
        setActiveTab('vault');
        if (!authenticated) {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }
        return;
      }
      if (raw.includes('community') || raw.includes('chat') || raw.includes('hamjamiyat')) {
        setActiveTab('community');
        return;
      }
      if (raw.includes('admin')) {
        setActiveTab('admin');
        if (!authenticated && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }
        return;
      }
      if (raw.includes('profile') || raw.includes('setting')) {
        setActiveTab('profile');
        if (!authenticated) {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }
        return;
      }
      if (raw.includes('arena')) {
        setActiveTab('arena');
        return;
      }
      if (raw.includes('ai-tutor') || raw.includes('tutor')) {
        setActiveTab('ai-tutor');
        return;
      }
      if (raw.includes('roadmap')) {
        setActiveTab('roadmap');
        return;
      }
      if (raw.includes('daily-workout') || raw.includes('workout')) {
        setActiveTab('daily-workout');
        return;
      }
      if (raw.includes('blog')) {
        setActiveTab('blog');
        return;
      }
      if (raw.includes('dashboard')) {
        setActiveTab('dashboard');
        return;
      }
      if (raw.includes('landing')) {
        setActiveTab('landing');
        return;
      }
    };

    // Run on initial mount to sync active URL state immediately
    handleRouteSync();

    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('asron_navigate', handleRouteSync);
    return () => {
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('asron_navigate', handleRouteSync);
    };
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

    setMistakes((prev) => {
      const updated = [newMistake, ...prev];
      try {
        localStorage.setItem('aurasat_mistakes', JSON.stringify(updated));
        if (currentUser?.id && currentUser.id !== 'guest-user') {
          syncUserProgressRemote(currentUser.id, {
            mistakes_log: updated,
          });
        }
      } catch (e) {
        console.error('Failed to sync mistake:', e);
      }
      return updated;
    });
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

    // Save attempt to localStorage and Supabase user_progress
    try {
      const savedAttempts = localStorage.getItem('aurasat_mock_attempts');
      const parsed = savedAttempts ? JSON.parse(savedAttempts) : {};
      const testKey = attempt.mockTestId || attempt.testId || `mock-${Date.now()}`;
      const updated = { ...parsed, [testKey]: attempt };
      localStorage.setItem('aurasat_mock_attempts', JSON.stringify(updated));
      if (currentUser?.id && currentUser.id !== 'guest-user') {
        syncUserProgressRemote(currentUser.id, {
          mock_results: { [testKey]: attempt },
        });
      }
    } catch (e) {
      console.error('Failed to sync mock attempt:', e);
    }
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
    setMistakes((prev) => {
      const updated = prev.map((m) => (m.id === updatedItem.id ? updatedItem : m));
      try {
        localStorage.setItem('aurasat_mistakes', JSON.stringify(updated));
        if (currentUser?.id && currentUser.id !== 'guest-user') {
          syncUserProgressRemote(currentUser.id, {
            mistakes_log: updated,
          });
        }
      } catch (e) {
        console.error('Failed to sync updated mistake:', e);
      }
      return updated;
    });
  };

  // Backward-compatible getActiveView referencing resolveRoute
  const getActiveView = (hashOrPath: string): string => {
    return resolveRoute(hashOrPath);
  };

  // Single-source syncRoute from window hash / popstate
  useEffect(() => {
    const syncRoute = () => {
      if (typeof window === 'undefined') return;
      const raw = window.location.hash || window.location.pathname || '#/dashboard';
      const resolved = resolveRoute(raw);
      setCurrentView(resolved);
    };

    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    syncRoute();

    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  const renderViewContent = (view: ActiveView) => {
    // Graceful fallback during navigation state resolution
    if (!view) {
      if (!currentUser) return <ViewSkeletonLoader title="Dashboard yuklanmoqda..." />;
      return (
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
      );
    }

    switch (view) {
      case 'landing':
        return (
          <LandingView
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
        );

      case 'dashboard':
        if (!currentUser) {
          return (
            <div className="p-4 sm:p-6">
              <ViewSkeletonLoader title="Dashboard yuklanmoqda..." />
            </div>
          );
        }
        return (
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
        );

      case 'questions':
        return (
          <QuestionBankView
            user={currentUser}
            questions={questions}
            initialFilter={qbankInitialFilter}
            onOpenSocraticTutor={handleOpenSocraticTutor}
            onDepositMistake={handleDepositMistake}
            onOpenPaywall={() => setIsPaywallOpen(true)}
          />
        );

      case 'mocks':
        return (
          <MockTestsCatalogView
            user={currentUser}
            mockTests={mockTests}
            categories={mockCategories}
            onLaunchTest={(test) => setActiveBluebookTest(test)}
            onStartBluebookTest={(test) => setActiveBluebookTest(test)}
            onOpenPaywall={() => setIsPaywallOpen(true)}
          />
        );

      case 'vocabulary':
        return (
          <VocabularyHub
            user={currentUser}
            onOpenPaywall={() => setIsPaywallOpen(true)}
          />
        );

      case 'mistakes':
        return (
          <MistakeVaultView
            mistakes={mistakes}
            user={currentUser}
            onOpenSocraticTutor={handleOpenSocraticTutor}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onUpdateMistakeItem={handleUpdateMistakeItem}
          />
        );

      case 'community':
        return (
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
        );

      case 'admin':
        return (
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
        );

      case 'profile':
        return (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={handleUpdateCurrentUser}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenAuthModal={() => handleOpenAuth('signin')}
            onSignOut={handleSignOut}
            onOpenChat={() => setActiveTab('community')}
            onOpenArena={() => setActiveTab('arena')}
          />
        );

      case 'arena':
        return (
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
        );

      case 'ai-tutor':
        return (
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
        );

      case 'roadmap':
        return (
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
        );

      case 'daily-workout':
        return (
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
        );

      case 'blog':
        return (
          <BlogView
            articles={blogArticles}
            siteBranding={siteBranding}
            onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
            onOpenAuthModal={(mode) => handleOpenAuth(mode || 'signup')}
            onBackToOverview={() => setActiveTab('landing')}
          />
        );

      default:
        return (
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
        );
    }
  };

  const renderView = (view: ActiveView) => {
    return (
      <ViewErrorBoundary moduleName={view} onReset={() => setActiveTab('dashboard')}>
        {renderViewContent(view)}
      </ViewErrorBoundary>
    );
  };

  const renderCurrentView = () => {
    return renderView(currentView);
  };

  return (
    <div className={`min-h-screen ${activeTab === 'community' ? 'h-[100dvh] overflow-hidden overflow-x-hidden overflow-y-hidden' : ''} bg-[#F8FAFC] dark:bg-[#0A0F1D] text-[#0F172A] dark:text-[#F8FAFC] flex font-sans selection:bg-[#E07A5F] selection:text-white`}>
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
      <div className={`flex-1 flex flex-col min-w-0 ${activeTab === 'community' || activeTab === 'chat' ? 'h-[100dvh] md:h-screen overflow-hidden overflow-x-hidden overflow-y-hidden' : 'overflow-x-hidden'}`}>
        {/* Maintenance Mode Alert if enabled and student is logged in */}
        {globalSettings.isMaintenance && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN' && (
          <div className="w-full bg-rose-950/80 border-b border-rose-800/60 px-4 py-2 text-xs font-mono text-rose-200 flex items-center justify-between z-50 shrink-0">
            <span>⚠️ Platform Maintenance Mode Active. Some features are temporarily offline.</span>
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="underline text-xs text-rose-300 hover:text-white cursor-pointer"
            >
              Staff Bypass Login
            </button>
          </div>
        )}

        {/* Top Header with Quick Actions (Hidden on Landing page to prevent duplicate headers) */}
        {activeTab !== 'landing' && (
          <div className={activeTab === 'community' || activeTab === 'chat' ? 'hidden md:block shrink-0' : 'shrink-0'}>
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
                setIsGlobalSearchOpen(true);
              }}
              onOpenCurrentUserProfile={() => {
                setActiveTab('profile');
              }}
              unreadAlertCount={notifications.filter((n) => !n.read).length}
            />
          </div>
        )}

        {/* Main Routed Views */}
        <main className={`flex-1 ${activeTab === 'community' || activeTab === 'chat' ? 'h-[100dvh] md:h-[calc(100dvh-64px)] overflow-hidden overflow-x-hidden overflow-y-hidden pb-0' : activeTab === 'landing' ? 'pb-0' : 'pb-16'}`}>
          {renderView(currentView)}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on < 768px in student/dashboard views) */}
      {activeTab !== 'landing' && activeTab !== 'blog' && activeTab !== 'community' && activeTab !== 'chat' && !activeBluebookTest && (
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

      {/* Global Search Modal for Profiles & Channels */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      {/* Persistent Floating Draggable Official Desmos Widget & Hacks Hub (Visible everywhere) */}
      {!activeBluebookTest && (
        <FloatingDesmosWidget
          hacks={desmosHacks}
          globalSettings={globalSettings}
        />
      )}

      {/* PWA Standalone Launch Splash Screen */}
      <PwaSplashScreen />

      {/* PWA Automatic Install Prompt */}
      <PwaInstallPrompt />
    </div>
  );
}
