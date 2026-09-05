import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Flame,
  Shield,
  Zap,
  Target,
  Award,
  BookOpen,
  Calendar,
  Mail,
  Send,
  CheckCircle2,
  TrendingUp,
  Search,
  Check,
  ChevronRight,
  Sparkles,
  Crown
} from 'lucide-react';
import { User, PlanTier } from '../types';
import { BadgeCollection } from './BadgeCollection';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  usersList: User[];
  onSelectUser: (user: User) => void;
  isAdmin?: boolean;
  onUpdatePlan?: (userId: string, planTier: PlanTier, daysToAdd: number) => void;
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedUser,
  usersList,
  onSelectUser,
  isAdmin = false,
  onUpdatePlan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !selectedUser) return null;

  const cleanQuery = searchQuery.trim().toLowerCase().replace(/^@/, '');
  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(cleanQuery) ||
      u.email.toLowerCase().includes(cleanQuery) ||
      (u.username || '').toLowerCase().includes(cleanQuery) ||
      (u.phoneNumber || '').replace(/\s+/g, '').includes(cleanQuery.replace(/\s+/g, '')) ||
      (u.telegramId && u.telegramId.toLowerCase().includes(cleanQuery)) ||
      u.id.toLowerCase().includes(cleanQuery)
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200 font-sans overflow-y-auto overscroll-contain"
    >
      <div className="bg-[#F8FAFC] dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[86vh] my-auto text-slate-900 dark:text-slate-100 relative">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#121A2F] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#E07A5F]">
              Profil
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Yopish (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Strip inside modal */}
        <div className="p-3 bg-[#F8FAFC] dark:bg-[#0A0F1D] border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidiruv..."
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#E07A5F]"
            />
          </div>

          {searchQuery.trim() && (
            <div className="mt-2 max-h-32 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#121A2F] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    setSearchQuery('');
                  }}
                  className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={u.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{u.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">@{u.username}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F8FAFC] dark:bg-[#0A0F1D]">
          {/* Main User Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={selectedUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedUser.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#121A2F] ${
                    selectedUser.isOnline !== false ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                  title={selectedUser.isOnline !== false ? 'Online Now' : 'Offline'}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedUser.fullName}</h3>
                </div>

                <div className="text-xs text-[#78716C] mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[#2563EB]">@{selectedUser.username || 'user'}</span>
                  <span>•</span>
                  <span>{selectedUser.email}</span>
                  {selectedUser.phoneNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-emerald-700">{selectedUser.phoneNumber}</span>
                    </>
                  )}
                  {selectedUser.telegramId && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[#2563EB]">{selectedUser.telegramId}</span>
                    </>
                  )}
                </div>

                {selectedUser.bio && (
                  <p className="text-xs text-[#57534E] mt-2 italic max-w-md">"{selectedUser.bio}"</p>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E8E2D5]">
              <div className="text-[11px] text-[#78716C]">
                Status:{' '}
                <strong className={selectedUser.isOnline !== false ? 'text-emerald-600' : 'text-slate-500'}>
                  {selectedUser.isOnline !== false ? 'Active Now' : 'Offline (Recent)'}
                </strong>
              </div>
              <div className="text-[11px] text-[#78716C]">
                Role: <strong className="text-[#1C1917]">{selectedUser.role}</strong>
              </div>
            </div>
          </div>

          {/* Academic & Test Performance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Score</div>
              <div className="text-2xl font-black text-[#E07A5F] font-mono mt-1">
                {selectedUser.targetScore || 1550}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Goal</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Predicted Score</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {selectedUser.predictedScore || 1420}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">MST Curve</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daily Streak</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span>{selectedUser.streakDays}d</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{selectedUser.streakFreezes} Freezes</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Experience XP</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 flex items-center justify-center gap-1">
                <Zap className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                <span>{selectedUser.xpPoints}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{selectedUser.testsCompletedCount || 5} Mocks</div>
            </div>
          </div>

          {/* Weakest Sub-Skills Focus */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Skill Focus Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {(selectedUser.weakestSubSkills || ['Nonlinear Equations', 'Transitions', 'Boundaries']).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Automated SAT Badges Matrix */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121A2F] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Talaba SAT Yutuqlari & Nishonlari
            </h4>
            <BadgeCollection user={selectedUser} isPublicView={true} />
          </div>

          {/* Admin Quick Membership Manager (If Admin) */}
          {isAdmin && onUpdatePlan && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Staff Subscription Controller</span>
                <span className="text-[10px] text-slate-500">Direct Membership Override</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdatePlan(selectedUser.id, 'PRO', 30)}
                  className="flex-1 py-2 rounded-xl bg-[#E07A5F] hover:bg-[#c9674e] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  +30 Days PRO
                </button>
                <button
                  onClick={() => onUpdatePlan(selectedUser.id, 'STANDARD', 30)}
                  className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  +30 Days STANDARD
                </button>
                <button
                  onClick={() => onUpdatePlan(selectedUser.id, 'FREE', 0)}
                  className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Reset Free
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-[#121A2F] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Target Exam Date: <strong className="text-slate-900 dark:text-white">{selectedUser.targetExamDate || 'October 2026'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
