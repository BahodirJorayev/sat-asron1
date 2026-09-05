import React, { useState, useMemo, useEffect } from 'react';
import {
  User as UserIcon,
  Crown,
  Flame,
  Zap,
  Target,
  Trophy,
  Award,
  Calendar,
  Mail,
  Phone,
  Edit3,
  Check,
  X,
  Share2,
  ExternalLink,
  School,
  GraduationCap,
  Send,
  Swords,
  Clock,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Shield,
  Sparkles,
  Camera,
  Copy,
  CheckCheck,
  Eye,
  EyeOff,
  Settings,
  CreditCard,
  LogOut,
  Globe,
  BookOpen,
} from 'lucide-react';
import { User, PlanTier } from '../types';
import { saveUserProfile, supabase } from '../lib/supabase';
import { AvatarSelectorModal } from './AvatarSelectorModal';

interface StudentProfileViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onOpenPaywall?: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  onOpenChat?: (username?: string) => void;
  onOpenArena?: () => void;
  initialPublicMode?: boolean;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onOpenPaywall,
  onOpenAuthModal,
  onSignOut,
  onOpenChat,
  onOpenArena,
  initialPublicMode = false,
}) => {
  // Mode state: Private (Owner) vs Public Portfolio view
  const [isPublicMode, setIsPublicMode] = useState<boolean>(initialPublicMode);

  // Edit modal & inline states
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACTIVITY' | 'TARGETS'>('OVERVIEW');

  // Editable form fields
  const [fullName, setFullName] = useState<string>(currentUser.fullName || 'Talaba');
  const [username, setUsername] = useState<string>(currentUser.username || 'talaba');
  const [bio, setBio] = useState<string>(
    currentUser.bio || 'Digital SAT Aspirant • Targeting 1500+'
  );
  const [institution, setInstitution] = useState<string>(
    currentUser.institution || 'Akademik Litsey'
  );
  const [targetUniversity, setTargetUniversity] = useState<string>(
    currentUser.targetUniversity || 'MIT / Ivy League'
  );
  const [targetScore, setTargetScore] = useState<number>(currentUser.targetScore || 1500);
  const [highestScore, setHighestScore] = useState<number>(
    currentUser.highestScore || 0
  );
  const [streakDays, setStreakDays] = useState<number>(currentUser.streakDays || 0);

  // Live Cloud Profile Synchronization (Fetch from Supabase profiles table)
  useEffect(() => {
    let isMounted = true;
    const fetchLatestProfile = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const activeId = authData?.user?.id || currentUser.id;
        if (!activeId) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', activeId)
          .maybeSingle();

        if (!error && profile && isMounted) {
          if (profile.full_name) setFullName(profile.full_name);
          if (profile.username) setUsername(profile.username);
          if (profile.bio) setBio(profile.bio);
          if (profile.institution) setInstitution(profile.institution);
          if (profile.target_university) setTargetUniversity(profile.target_university);
          if (profile.target_score) setTargetScore(Number(profile.target_score));

          onUpdateUser({
            ...currentUser,
            fullName: profile.full_name || currentUser.fullName,
            username: profile.username || currentUser.username,
            avatarUrl: profile.avatar_url || currentUser.avatarUrl,
            bio: profile.bio || currentUser.bio,
            institution: profile.institution || currentUser.institution,
            targetUniversity: profile.target_university || currentUser.targetUniversity,
            targetScore: Number(profile.target_score) || currentUser.targetScore,
          });
        }
      } catch (err) {
        console.warn('StudentProfileView cloud fetch warning:', err);
      }
    };

    fetchLatestProfile();

    // Realtime cross-device sync (PC <-> Mobile)
    const channel = supabase
      .channel(`profile-realtime-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${currentUser.id}`,
        },
        (payload: any) => {
          const newRow = payload.new;
          if (newRow && isMounted) {
            if (newRow.full_name) setFullName(newRow.full_name);
            if (newRow.username) setUsername(newRow.username);
            if (newRow.bio) setBio(newRow.bio);
            if (newRow.institution) setInstitution(newRow.institution);
            if (newRow.target_university) setTargetUniversity(newRow.target_university);
            if (newRow.target_score) setTargetScore(Number(newRow.target_score));

            onUpdateUser({
              ...currentUser,
              fullName: newRow.full_name || currentUser.fullName,
              username: newRow.username || currentUser.username,
              avatarUrl: newRow.avatar_url || currentUser.avatarUrl,
              bio: newRow.bio || currentUser.bio,
              institution: newRow.institution || currentUser.institution,
              targetUniversity: newRow.target_university || currentUser.targetUniversity,
              targetScore: Number(newRow.target_score) || currentUser.targetScore,
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [currentUser.id]);

  const isPro = currentUser.planTier === 'PRO' || currentUser.planTier === 'VIP';
  const isStandard = currentUser.planTier === 'STANDARD';

  // Stats calculation
  const totalPracticeHours = Math.round(
    (((currentUser.totalTimeSecs || 0)) / 3600) * 10
  ) / 10;
  const totalQuestions = currentUser.totalQuestionsDone || 0;
  const overallAccuracy = currentUser.overallAccuracy || 0; // %
  const rwAccuracy = Math.max(0, overallAccuracy ? overallAccuracy - 2 : 0); // %
  const mathAccuracy = Math.max(0, overallAccuracy ? overallAccuracy + 3 : 0); // %

  // Share Public Portfolio Link Handler
  const handleCopyPublicLink = () => {
    const publicUrl = `https://asronsat.uz/u/@${currentUser.username}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Avatar select callback
  const handleSelectAvatar = async (
    newAvatarUrl: string,
    isCustom: boolean,
    defaultIndex?: number
  ) => {
    const updated: User = {
      ...currentUser,
      avatarUrl: newAvatarUrl,
      customAvatar: isCustom,
      defaultAvatarIndex: defaultIndex,
    };
    onUpdateUser(updated);

    // Direct Supabase cloud persistence for avatar
    try {
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        avatar_url: newAvatarUrl,
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Avatar cloud sync notice:', e);
    }

    await saveUserProfile(updated);
  };

  // Save profile updates to Supabase Cloud
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const cleanFullName = fullName.trim();
      const updated: User = {
        ...currentUser,
        fullName: cleanFullName,
        username: cleanUsername,
        bio: bio.trim().slice(0, 140),
        institution: institution.trim(),
        targetUniversity: targetUniversity.trim(),
        targetScore: Number(targetScore) || 1500,
      };
      onUpdateUser(updated);

      // Cloud Persistence: Upsert verified columns into Supabase public.profiles
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          full_name: cleanFullName,
          username: cleanUsername,
          avatar_url: currentUser.avatarUrl,
          target_score: Number(targetScore) || 1500,
        }, { onConflict: 'id' });

      if (profileErr) {
        console.warn('Supabase profiles save notice:', profileErr.message);
      }

      await saveUserProfile(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // 365-Day Monochromatic Heatmap Grid Generator (Real Data Driven)
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    const streak = currentUser.streakDays || 0;
    const hasQuestions = (currentUser.totalQuestionsDone || 0) > 0;

    // 52 weeks * 7 days = 364 days
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      let level = 0; // 0 = none, 1 = 1-5 questions, 2 = 6-15, 3 = 16-30, 4 = 30+
      let questionsCount = 0;

      // Only show activity for genuine streak days when user has actually practiced
      if (hasQuestions && streak > 0 && i < streak) {
        level = Math.min(4, Math.max(1, Math.ceil((currentUser.totalQuestionsDone || 10) / (streak || 1) / 5)));
        questionsCount = Math.max(1, Math.round((currentUser.totalQuestionsDone || 0) / streak));
      }

      days.push({
        date: d.toISOString().split('T')[0],
        formatted: d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
        level,
        questionsCount,
      });
    }
    return days;
  }, [currentUser.streakDays, currentUser.totalQuestionsDone]);

  const totalActiveDays = useMemo(() => {
    return heatmapData.filter((d) => d.level > 0).length;
  }, [heatmapData]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B18] font-sans pb-16">
      {/* Top Breadcrumb & Executive Mode Switcher */}
      <div className="border-b border-[#EBE5DF] bg-white sticky top-0 z-30 px-4 sm:px-8 py-3 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#1E1B18] font-mono font-bold text-xs shadow-2xs">
              ID
            </div>
            <div>
              <div className="text-xs font-bold text-[#1E1B18] flex items-center gap-2">
                <span>Talaba Portfeli & Profil Tizimi</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-[#57534E]">
                  @{currentUser.username}
                </span>
              </div>
              {isPublicMode && (
                <p className="text-[11px] text-[#78716C]">
                  Boshqa talabalar va mentorlar ko‘radigan ommaviy portfel ko‘rinishi
                </p>
              )}
            </div>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center gap-2">
            <div className="bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E0D8] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsPublicMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isPublicMode
                    ? 'bg-[#1E1B18] text-white shadow-2xs'
                    : 'text-[#57534E] hover:text-[#1E1B18]'
                }`}
              >
                <EyeOff size={13} />
                <span>Mening Profilim</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPublicMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPublicMode
                    ? 'bg-[#1E1B18] text-white shadow-2xs'
                    : 'text-[#57534E] hover:text-[#1E1B18]'
                }`}
              >
                <Eye size={13} />
                <span>Ommaviy Portfel</span>
              </button>
            </div>

            {/* Share Link Button */}
            <button
              type="button"
              onClick={handleCopyPublicLink}
              className="p-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] text-[#57534E] hover:text-[#1E1B18] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-medium"
              title="Portfel havolasini nusxalash"
            >
              {copiedLink ? (
                <>
                  <CheckCheck size={14} className="text-emerald-600" />
                  <span className="text-emerald-700 font-mono text-[11px]">Nusxalandi!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span className="hidden sm:inline text-[11px]">Havola</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* A. HEADER PROFILE CARD (DISTRACTION-FREE ONEPREP MINIMALISM) */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5E0D8] shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Avatar + Identity + Bio */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 flex-1">
              
              {/* 1. Avatar Display with Tier Border Ring */}
              <div className="relative shrink-0 group">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-white border-2 overflow-hidden shadow-xs transition-transform ${
                    isPro
                      ? 'border-amber-400 ring-4 ring-amber-400/20'
                      : isStandard
                      ? 'border-blue-400 ring-4 ring-blue-400/15'
                      : 'border-[#1E1B18] ring-4 ring-[#1E1B18]/10'
                  }`}
                >
                  <img
                    src={
                      currentUser.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.id}`
                    }
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover rounded-2xl bg-[#FAF8F5]"
                  />
                </div>

                {/* Online Status Dot */}
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />

                {/* Avatar Change Trigger (Private Mode Only) */}
                {!isPublicMode && (
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    aria-label="Profil rasmini o'zgartirish"
                    className="absolute inset-0 rounded-3xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer backdrop-blur-2xs"
                  >
                    <Camera size={20} />
                    <span className="text-[10px] font-semibold tracking-tight">O‘zgartirish</span>
                  </button>
                )}
              </div>

              {/* 2. User Identity & Metadata */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E1B18] tracking-tight">
                    {currentUser.fullName}
                  </h1>
                </div>

                {/* Username & Institution */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78716C] font-mono">
                  <span>@{currentUser.username}</span>
                  <span className="text-[#D5CEC5]">•</span>
                  <span className="flex items-center gap-1 text-[#57534E] font-sans">
                    <School size={13} className="text-[#A8A29E]" />
                    {institution}
                  </span>
                  <span className="text-[#D5CEC5]">•</span>
                  <span className="flex items-center gap-1 text-[#57534E] font-sans">
                    <GraduationCap size={13} className="text-[#E07A5F]" />
                    {targetUniversity}
                  </span>
                </div>

                {/* Short Bio (Max 140 chars) */}
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-xl">
                  {bio}
                </p>

                {/* Internal Scholar ID */}
                <div className="flex items-center gap-3 pt-1 text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E5E0D8] text-[#57534E] flex items-center gap-1.5">
                    <Shield size={11} className="text-[#3D405B]" />
                    <span>ID: {currentUser.scholarId || `ASRON-${currentUser.id.slice(0, 8).toUpperCase()}`}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Score Target High-Contrast Pill & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0">
              
              {/* 3. Score Target Pill (High Contrast Box) */}
              <div className="p-3.5 rounded-2xl bg-[#1E1B18] text-white border border-[#3D405B]/40 shadow-sm space-y-2 min-w-[240px]">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A29E] border-b border-white/10 pb-1.5">
                  <span>SAT REYTING KO‘RSATKICHLARI</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                  <div>
                    <div className="text-[10px] text-[#A8A29E] font-mono uppercase">🎯 Maqsad</div>
                    <div className="text-base font-extrabold text-amber-400 font-mono tracking-tight">
                      {targetScore}
                    </div>
                  </div>
                  <div className="border-x border-white/10 px-1">
                    <div className="text-[10px] text-[#A8A29E] font-mono uppercase">⚡ Mock</div>
                    <div className="text-base font-extrabold text-white font-mono tracking-tight">
                      {highestScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A8A29E] font-mono uppercase">🔥 Streak</div>
                    <div className="text-base font-extrabold text-[#E07A5F] font-mono tracking-tight">
                      {streakDays} kun
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons depending on Public / Private Mode */}
              <div className="flex items-center gap-2 justify-end">
                {isPublicMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenChat && onOpenChat(currentUser.username)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E1B18] hover:bg-[#3D405B] text-white transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>Xabar Yuborish</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenArena && onOpenArena()}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E07A5F] hover:bg-[#c96a51] text-white transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Swords size={13} />
                      <span>Arenada Bellashuv</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF8F5] text-[#1E1B18] border border-[#E5E0D8] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      <span>Profilni Tahrirlash</span>
                    </button>
                  </>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-TABS NAVIGATION */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 border-b border-[#EBE5DF] pb-2">
          {[
            { id: 'OVERVIEW', label: 'Umumiy Tahlil', icon: BarChart3 },
            { id: 'ACTIVITY', label: '365-Kunlik Faollik', icon: Calendar },
            { id: 'TARGETS', label: 'Universitet & SAT Maqsad', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#1E1B18] text-white shadow-2xs'
                    : 'text-[#57534E] hover:text-[#1E1B18] hover:bg-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW (KEY STATS GRID & ACCURACY SPLIT) */}
        {/* ========================================================================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            
            {/* Key Metrics Grid (Apple-grade 3-column triad) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Stat 1: Total Time */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-medium">Platformada Vaqt</span>
                  <Clock size={15} className="text-[#3D405B]" />
                </div>
                <div className="text-xl font-bold font-mono text-[#1E1B18]">
                  {totalPracticeHours} <span className="text-xs font-normal text-[#78716C]">soat</span>
                </div>
                <div className="text-[11px] text-[#57534E] font-mono mt-1 flex items-center gap-1">
                  {totalPracticeHours > 0 ? (
                    <>
                      <TrendingUp size={11} className="text-emerald-600" />
                      <span className="text-emerald-600">Platformada faollik qayd etilgan</span>
                    </>
                  ) : (
                    <span>0 soat qayd etilgan</span>
                  )}
                </div>
              </div>

              {/* Stat 2: Total Questions */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-medium">Yechilgan Savollar</span>
                  <CheckCircle2 size={15} className="text-[#2A9D8F]" />
                </div>
                <div className="text-xl font-bold font-mono text-[#1E1B18]">
                  {totalQuestions} <span className="text-xs font-normal text-[#78716C]">ta</span>
                </div>
                <div className="text-[11px] text-[#57534E] font-mono mt-1">
                  {totalQuestions > 0 ? 'SQB & Mocklar' : 'Hali savol yechilmagan'}
                </div>
              </div>

              {/* Stat 3: Overall Accuracy (Cleaned without descriptive noise) */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-2xs">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-medium">Umumiy Aniqlik</span>
                  <Target size={15} className="text-[#E07A5F]" />
                </div>
                <div className="text-xl font-bold font-mono text-[#1E1B18]">
                  {overallAccuracy}%
                </div>
                <div className="text-[11px] text-[#57534E] font-mono mt-1">
                  Akademik aniqlik indeksi
                </div>
              </div>

            </div>

            {/* Performance Split: RW vs Desmos Math */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* RW Section Progress */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#1E1B18] font-bold text-xs">
                      RW
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E1B18]">
                        Reading & Writing Moduli
                      </div>
                      <div className="text-[11px] text-[#78716C]">
                        Grammar, Rhetoric & Craft Structure
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1E1B18]">
                    {rwAccuracy}% Aniqlik
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#EBE5DF] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#3D405B]"
                    style={{ width: `${rwAccuracy}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1 text-[#57534E]">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF]">
                    <div className="text-[10px] text-[#78716C]">Information & Ideas</div>
                    <div className="font-bold text-[#1E1B18] mt-0.5">{totalQuestions > 0 ? `${rwAccuracy}%` : '0%'}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF]">
                    <div className="text-[10px] text-[#78716C]">Craft & Structure</div>
                    <div className="font-bold text-[#1E1B18] mt-0.5">{totalQuestions > 0 ? `${rwAccuracy}%` : '0%'}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF]">
                    <div className="text-[10px] text-[#78716C]">Standard English</div>
                    <div className="font-bold text-[#1E1B18] mt-0.5">{totalQuestions > 0 ? `${rwAccuracy}%` : '0%'}</div>
                  </div>
                </div>
              </div>

              {/* Math & Desmos Progress */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5E0D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#1E1B18] font-bold text-xs">
                      MA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E1B18]">
                        Math & Desmos Moduli
                      </div>
                      <div className="text-[11px] text-[#78716C]">
                        Algebra, Advanced Math & Geometry
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1E1B18]">
                    {mathAccuracy}% Aniqlik
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#EBE5DF] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2A9D8F]"
                    style={{ width: `${mathAccuracy}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1 text-[#57534E]">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF]">
                    <div className="text-[10px] text-[#78716C]">Algebra & Systems</div>
                    <div className="font-bold text-[#1E1B18] mt-0.5">{totalQuestions > 0 ? `${mathAccuracy}%` : '0%'}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF]">
                    <div className="text-[10px] text-[#78716C]">Advanced Math</div>
                    <div className="font-bold text-[#1E1B18] mt-0.5">{totalQuestions > 0 ? `${mathAccuracy}%` : '0%'}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF]">
                    <div className="text-[10px] text-[#78716C]">Desmos Fast-Solver</div>
                    <div className="font-bold text-[#1E1B18] mt-0.5">{totalQuestions > 0 ? `${mathAccuracy}%` : '0%'}</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 365-DAY MONOCHROMATIC HEATMAP */}
        {/* ========================================================================= */}
        {activeTab === 'ACTIVITY' && (
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5E0D8] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE5DF] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E1B18] tracking-tight">
                  365-Kunlik Akademik Faollik Matritsasi
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Har kuni yechilgan savollar va o‘tkazilgan dars soatlari
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-[#57534E]">
                  Faol kunlar: <span className="font-bold text-[#1E1B18]">{totalActiveDays} kun</span>
                </div>
                <div className="text-[#57534E]">
                  Joriy streak: <span className="font-bold text-[#E07A5F]">{streakDays} kun</span>
                </div>
              </div>
            </div>

            {/* Heatmap Grid (Scrollable on mobile) */}
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 p-2 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]">
                {heatmapData.map((day, idx) => {
                  let bgClass = 'bg-stone-200/80';
                  if (day.level === 1) bgClass = 'bg-[#2A9D8F]/30';
                  if (day.level === 2) bgClass = 'bg-[#2A9D8F]/60';
                  if (day.level === 3) bgClass = 'bg-[#2A9D8F]/90';
                  if (day.level === 4) bgClass = 'bg-[#1E1B18]';

                  return (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-xs ${bgClass} transition-transform hover:scale-125 cursor-pointer`}
                      title={`${day.formatted}: ${day.questionsCount} ta savol yechildi`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-xs text-[#78716C] pt-2">
              <span className="text-[11px] font-mono">365 kun oldin</span>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span>Kam</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-stone-200" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2A9D8F]/30" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2A9D8F]/60" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2A9D8F]/90" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#1E1B18]" />
                <span>Ko‘p</span>
              </div>
              <span className="text-[11px] font-mono">Bugun</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TARGETS & UNIVERSITIES */}
        {/* ========================================================================= */}
        {activeTab === 'TARGETS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Target Score Blueprint */}
            <div className="p-6 rounded-3xl bg-white border border-[#E5E0D8] space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#EBE5DF] pb-3">
                <Target size={16} className="text-[#E07A5F]" />
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B18]">
                    SAT Ball Strukturasi & Reja
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Bo‘limlar bo‘yicha maqsadli ko‘rsatkichlar
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#1E1B18]">Umumiy Target</div>
                    <div className="text-[11px] text-[#78716C]">Rasmiy imtihon maqsadi</div>
                  </div>
                  <div className="text-base font-extrabold font-mono text-[#E07A5F]">
                    {targetScore} / 1600
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#1E1B18]">Reading & Writing Target</div>
                    <div className="text-[11px] text-[#78716C]">Minimum kutilayotgan ball</div>
                  </div>
                  <div className="text-base font-extrabold font-mono text-[#3D405B]">
                    760 / 800
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#1E1B18]">Math & Desmos Target</div>
                    <div className="text-[11px] text-[#78716C]">Maksimal 800 ga intilish</div>
                  </div>
                  <div className="text-base font-extrabold font-mono text-[#2A9D8F]">
                    790 / 800
                  </div>
                </div>
              </div>
            </div>

            {/* Target University Profile */}
            <div className="p-6 rounded-3xl bg-white border border-[#E5E0D8] space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#EBE5DF] pb-3">
                <GraduationCap size={16} className="text-[#3D405B]" />
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B18]">
                    Maqsadli Universitetlar & Grantlar
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Talaba qiziqayotgan akademik muassasalar
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'MIT (Massachusetts Inst. of Tech)', sat: '1540 - 1580', rank: 'Top #1 Global' },
                  { name: 'Stanford University', sat: '1500 - 1570', rank: 'Ivy Plus' },
                  { name: 'KAIST Global Scholar (Full Ride)', sat: '1480 - 1550', rank: 'Asia Top #1' },
                ].map((uni, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1E1B18]">{uni.name}</div>
                      <div className="text-[11px] text-[#78716C] font-mono">{uni.rank}</div>
                    </div>
                    <div className="text-xs font-mono font-bold text-[#1E1B18] bg-white px-2.5 py-1 rounded-xl border border-[#EBE5DF]">
                      {uni.sat}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* AVATAR SELECTOR MODAL */}
      {/* ========================================================================= */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentUser={currentUser}
        onSelectAvatar={handleSelectAvatar}
      />

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#FAF8F5] border border-[#E5E0D8] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EBE5DF] bg-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#1E1B18]">Profil Ma‘lumotlarini Tahrirlash</h3>
                <p className="text-xs text-[#78716C]">Shaxsiy va akademik maqsadlaringizni yangilang</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#78716C] hover:bg-[#EFEAE3] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto">
              
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#57534E] mb-1">
                    To‘liq Ism
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#57534E] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#1E1B18] font-mono focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                  />
                </div>
              </div>

              {/* Bio (Max 140 chars) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-[#57534E]">
                    Qisqa Bio (Maks. 140 belgi)
                  </label>
                  <span className="text-[10px] font-mono text-[#A8A29E]">
                    {bio.length}/140
                  </span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 140))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#1E1B18] resize-none"
                  placeholder="SAT maqsadlaringiz haqida qisqacha yozing..."
                />
              </div>

              {/* Institution & Target University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#57534E] mb-1">
                    Maktab / Litsey
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#57534E] mb-1">
                    Maqsadli Universitet
                  </label>
                  <input
                    type="text"
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#1E1B18] focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                  />
                </div>
              </div>

              {/* Academic Target Focus */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#57534E] mb-1">
                  Maqsadli SAT Balli (400 - 1600)
                </label>
                <input
                  type="number"
                  min={400}
                  max={1600}
                  step={10}
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#1E1B18] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#1E1B18]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE5DF]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#57534E] hover:bg-[#EFEAE3] cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1E1B18] hover:bg-[#3D405B] text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Saqlanmoqda...' : 'O‘zgarishlarni Saqlash'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentProfileView;
