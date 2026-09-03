import React, { useState, useMemo } from 'react';
import { 
  Users, Search, ShieldCheck, 
  Calendar, Check, X, AlertTriangle, RefreshCw, 
  Send, Ban, Unlock, UserCheck, ShieldAlert,
  ExternalLink, RotateCcw, Clock, Lock, Sparkles, Filter
} from 'lucide-react';
import { User, PlanTier } from '../types';

interface AdminUsersManagerProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  adminTelegram?: string;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  users,
  onUpdateUser,
  onDeleteUser,
  adminTelegram = '@rcmnx',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | PlanTier | 'BANNED'>('ALL');
  const [selectedUserForGrant, setSelectedUserForGrant] = useState<User | null>(null);
  const [selectedUserForRescue, setSelectedUserForRescue] = useState<User | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Grant Subscription Modal State
  const [selectedTier, setSelectedTier] = useState<PlanTier>('PRO');
  const [durationOption, setDurationOption] = useState<'1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR' | 'LIFETIME'>('3_MONTHS');

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch = 
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.scholarId || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (tierFilter === 'ALL') return true;
      if (tierFilter === 'BANNED') return !!u.isBanned;
      return u.planTier === tierFilter && !u.isBanned;
    });
  }, [users, searchQuery, tierFilter]);

  const handleOpenGrantModal = (user: User) => {
    setSelectedUserForGrant(user);
    setSelectedTier(user.planTier === 'FREE' ? 'PRO' : user.planTier);
    setDurationOption('3_MONTHS');
  };

  const handleSaveTierGrant = () => {
    if (!selectedUserForGrant) return;

    let expiresAt: string | undefined = undefined;
    const now = new Date();

    if (durationOption === '1_MONTH') {
      now.setDate(now.getDate() + 30);
      expiresAt = now.toISOString();
    } else if (durationOption === '3_MONTHS') {
      now.setDate(now.getDate() + 90);
      expiresAt = now.toISOString();
    } else if (durationOption === '6_MONTHS') {
      now.setDate(now.getDate() + 180);
      expiresAt = now.toISOString();
    } else if (durationOption === '1_YEAR') {
      now.setDate(now.getDate() + 365);
      expiresAt = now.toISOString();
    } else {
      expiresAt = undefined; // Cheksiz / Lifetime
    }

    const updated: User = {
      ...selectedUserForGrant,
      planTier: selectedTier,
      tierExpiresAt: expiresAt,
      planExpiresAt: expiresAt,
      unseenTierUpgrade: true, // Auto-arm 3D Gold celebration modal!
      scholarId: selectedUserForGrant.scholarId || `ASRON-2026-${selectedUserForGrant.id.slice(-4).toUpperCase()}`,
      permissions: {
        desmosAccess: true,
        whiteboardStreamHosting: selectedTier === 'VIP' || selectedTier === 'PRO',
        aiSocraticTutor: selectedTier !== 'FREE',
        fullQuestionBank: true,
        unlimitedMocks: selectedTier !== 'FREE',
      },
    };

    onUpdateUser(updated);
    setSelectedUserForGrant(null);
    showNotification(`Subscription upgraded to ${selectedTier} for @${updated.username}. 3D Gold Pass armed.`);
  };

  const handleToggleBan = (user: User) => {
    const isBanned = !user.isBanned;
    const updated: User = {
      ...user,
      isBanned,
    };
    onUpdateUser(updated);
    showNotification(isBanned ? `User @${user.username} has been suspended.` : `User @${user.username} access restored.`);
  };

  const handleResetStuckAttempts = (user: User) => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(`aurasat_active_attempt_${user.id}`);
        localStorage.removeItem(`bluebook_attempt_${user.id}`);
        localStorage.removeItem(`active_session_${user.id}`);
      } catch (e) {
        // ignore
      }
    }
    showNotification(`Test session state cleared for @${user.username}.`);
    setSelectedUserForRescue(null);
  };

  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return 'Cheksiz / Lifetime';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatRegDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="admin-users-manager" className="space-y-6 font-sans">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400/60 hover:text-emerald-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Telegram Billing Context Box */}
      <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#0A0F1D] text-[#94A3B8] border border-[#1E293B] text-[11px] font-mono uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Scholar Directory & Manual Billing CMS</span>
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
            User Directory & Subscription Control
          </h2>
          <p className="text-xs text-[#64748B] max-w-2xl">
            Verify manual payments received via Telegram desk (<span className="font-mono font-bold text-[#E07A5F]">{adminTelegram}</span>), grant custom tier passes, and reset stuck sessions.
          </p>
        </div>

        <a
          href={`https://t.me/${adminTelegram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-[#0A0F1D] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono font-bold text-[#F8FAFC] flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-[#E07A5F]" />
          <span>Telegram Desk ({adminTelegram})</span>
          <ExternalLink className="w-3 h-3 text-[#64748B]" />
        </a>
      </div>

      {/* Instant Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            id="input-search-scholars"
            type="text"
            placeholder="Search @username, full name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-hidden focus:border-[#E07A5F]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 rounded-xl bg-[#121A2F] border border-[#1E293B]">
          {(['ALL', 'STANDARD', 'PRO', 'VIP', 'BANNED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTierFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                tierFilter === filter
                  ? 'bg-[#1E293B] text-[#F8FAFC] font-bold border border-[#334155]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {filter === 'ALL' ? `All (${users.length})` : filter}
            </button>
          ))}
        </div>
      </div>

      {/* User Data Table */}
      <div className="rounded-2xl bg-[#121A2F] border border-[#1E293B] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0A0F1D] text-[#64748B] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Scholar</th>
                <th className="py-3 px-4">Tier Badge</th>
                <th className="py-3 px-4">Expiration</th>
                <th className="py-3 px-4">Streak / Solved</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-mono text-[#64748B]">
                    No scholars found matching current query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isUserBanned = !!u.isBanned;
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#0A0F1D]/50 transition-colors ${
                        isUserBanned ? 'opacity-50 bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Scholar Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`}
                            alt={u.fullName}
                            className="w-8 h-8 rounded-full bg-[#0A0F1D] border border-[#1E293B] object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-[#F8FAFC] truncate">{u.fullName}</div>
                            <div className="text-[11px] font-mono text-[#64748B] truncate">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            u.planTier === 'VIP'
                              ? 'bg-[#E07A5F]/15 text-[#E07A5F] border-[#E07A5F]/30'
                              : u.planTier === 'PRO'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
                          }`}
                        >
                          {u.planTier || 'STANDARD'}
                        </span>
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4 font-mono text-[#94A3B8] text-[11px]">
                        {formatExpiry(u.tierExpiresAt || u.planExpiresAt)}
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="text-[#F8FAFC]">{u.streakDays || 0}d streak</span>
                        <span className="text-[#64748B]"> • {u.totalQuestionsDone || 0} solved</span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 font-mono text-[#64748B] text-[11px]">
                        {formatRegDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenGrantModal(u)}
                            className="px-2.5 py-1 rounded-md bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-[#F8FAFC] transition-colors cursor-pointer"
                          >
                            Obunani Boshqarish
                          </button>

                          <button
                            onClick={() => handleResetStuckAttempts(u)}
                            title="Reset Stuck Attempt"
                            className="p-1 rounded-md text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleBan(u)}
                            title={isUserBanned ? 'Unban Scholar' : 'Suspend Scholar'}
                            className={`p-1 rounded-md cursor-pointer transition-colors ${
                              isUserBanned
                                ? 'text-rose-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-[#64748B] hover:text-rose-400 hover:bg-rose-500/10'
                            }`}
                          >
                            {isUserBanned ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRANT / MODIFY SUBSCRIPTION MODAL */}
      {selectedUserForGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#121A2F] border border-[#1E293B] shadow-2xl p-6 space-y-6 font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="space-y-0.5">
                <div className="text-xs font-mono text-[#E07A5F] uppercase tracking-wider">Manual Billing Desk</div>
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  Grant Subscription • @{selectedUserForGrant.username}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForGrant(null)}
                className="p-1 rounded-md text-[#64748B] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Scholar Readout */}
            <div className="p-3.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] flex items-center gap-3">
              <img
                src={selectedUserForGrant.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUserForGrant.id}`}
                alt={selectedUserForGrant.fullName}
                className="w-10 h-10 rounded-full border border-[#1E293B] object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#F8FAFC] truncate">{selectedUserForGrant.fullName}</div>
                <div className="text-[11px] font-mono text-[#64748B] truncate">{selectedUserForGrant.email}</div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#1E293B] text-[10px] font-mono text-[#94A3B8] border border-[#334155]">
                Current: {selectedUserForGrant.planTier || 'STANDARD'}
              </span>
            </div>

            {/* Select Tier Radio Group */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">1. Select Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { tier: 'STANDARD', label: 'STANDARD', desc: 'Core Q-Bank & Drills' },
                  { tier: 'PRO', label: 'PRO PASS', desc: 'Full Mocks & Desmos' },
                  { tier: 'VIP', label: 'VIP CIRCLE', desc: 'Live Stream & Mentorship' },
                ].map((item) => (
                  <button
                    key={item.tier}
                    type="button"
                    onClick={() => setSelectedTier(item.tier as PlanTier)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedTier === item.tier
                        ? 'bg-[#1E293B] border-[#E07A5F] text-[#F8FAFC]'
                        : 'bg-[#0A0F1D] border-[#1E293B] text-[#64748B] hover:border-[#334155]'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold text-[#F8FAFC]">{item.label}</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Duration */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-[#64748B] uppercase">2. Select Duration</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: '1_MONTH', label: '1 Oy', sub: '+30 days' },
                  { id: '3_MONTHS', label: '3 Oy', sub: '+90 days' },
                  { id: '6_MONTHS', label: '6 Oy', sub: '+180 days' },
                  { id: '1_YEAR', label: '1 Yil', sub: '+365 days' },
                  { id: 'LIFETIME', label: 'Cheksiz', sub: 'Lifetime' },
                ].map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setDurationOption(dur.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      durationOption === dur.id
                        ? 'bg-[#1E293B] border-[#E07A5F] text-[#F8FAFC]'
                        : 'bg-[#0A0F1D] border-[#1E293B] text-[#64748B] hover:border-[#334155]'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold text-[#F8FAFC]">{dur.label}</div>
                    <div className="text-[9px] font-mono text-[#64748B]">{dur.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Trigger Celebration Notice */}
            <div className="p-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B] text-[11px] font-mono text-[#94A3B8] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E07A5F] shrink-0" />
              <span>Sets <code className="text-[#F8FAFC]">unseen_tier_upgrade = true</code>. Student will see 3D Gold Pass animation upon next login.</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setSelectedUserForGrant(null)}
                className="px-4 py-2 rounded-lg bg-[#0A0F1D] hover:bg-[#1E293B] text-xs font-mono text-[#64748B] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTierGrant}
                className="px-4 py-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
              >
                Confirm & Grant Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
