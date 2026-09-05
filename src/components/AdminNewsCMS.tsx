import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  Check,
  X,
  Radio,
  Layers,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PlatformAnnouncement } from '../types';
import { savePlatformContent } from '../lib/adminApi';

interface AdminNewsCMSProps {
  onRefreshGlobal?: () => void;
}

const DEFAULT_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    id: 'ann-001',
    title: 'Digital SAT 2026 Yangi Savollar Bazasi',
    content: 'Erica Meltzer va College Board rasmiy bazasidan 1200+ yangi savollar va Desmos video-yechimlari qo\'shildi.',
    category: 'update',
    target_route: 'landing',
    action_link: '/mocks',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ann-002',
    title: 'Haftalik Jonli Efir: Craft and Structure Tahlili',
    content: 'Yakshanba soat 20:00 da 1550+ ball to\'plagan mentorlar bilan jonli tahlil va Q&A bo\'lib o\'tadi.',
    category: 'general',
    target_route: 'dashboard',
    action_link: '/chat',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ann-003',
    title: 'Kuzgi Imtihon Mavsumi Chegirmasi',
    content: 'PRO va VIP obunalarga 25% maxsus chegirma e\'lon qilindi.',
    category: 'discount',
    target_route: 'popup',
    action_link: '/dashboard',
    is_active: false,
    created_at: new Date().toISOString(),
  },
];

export const AdminNewsCMS: React.FC<AdminNewsCMSProps> = ({ onRefreshGlobal }) => {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(DEFAULT_ANNOUNCEMENTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetRouteFilter, setTargetRouteFilter] = useState<'ALL' | 'landing' | 'dashboard' | 'popup'>('ALL');
  const [editingItem, setEditingItem] = useState<PlatformAnnouncement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formState, setFormState] = useState<{
    id?: string;
    title: string;
    content: string;
    category: 'general' | 'update' | 'mock' | 'discount' | 'urgent';
    target_route: 'landing' | 'dashboard' | 'popup';
    action_link: string;
    is_active: boolean;
  }>({
    title: '',
    content: '',
    category: 'general',
    target_route: 'dashboard',
    action_link: '',
    is_active: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch announcements from Supabase public.announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch announcements table, falling back:', error.message);
      } else if (data && data.length > 0) {
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Announcements fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    // Supabase Realtime subscription for instant global sync
    const channel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAnnouncements((prev) => [payload.new as PlatformAnnouncement, ...prev.filter((x) => x.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setAnnouncements((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as PlatformAnnouncement) : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setAnnouncements((prev) => prev.filter((item) => item.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormState({
      title: '',
      content: '',
      category: 'general',
      target_route: 'dashboard',
      action_link: '',
      is_active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: PlatformAnnouncement) => {
    setEditingItem(item);
    setFormState({
      id: item.id,
      title: item.title,
      content: item.content,
      category: (item.category as any) || 'general',
      target_route: item.target_route || 'dashboard',
      action_link: item.action_link || '',
      is_active: item.is_active,
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.content.trim()) {
      showToast('Sarlavha va e\'lon matni to\'ldirilishi shart!');
      return;
    }

    const payload = {
      title: formState.title.trim(),
      content: formState.content.trim(),
      category: formState.category,
      target_route: formState.target_route,
      action_link: formState.action_link.trim() || null,
      is_active: formState.is_active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingItem && editingItem.id) {
        // UPDATE existing
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', editingItem.id);

        if (error) {
          console.warn('Supabase update failed:', error.message);
        }

        // Optimistic update
        setAnnouncements((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? { ...item, ...payload } : item
          )
        );
        showToast('E\'lon muvaffaqiyatli yangilandi!');
      } else {
        // INSERT new
        const newId = `ann-${Date.now()}`;
        const newRecord: PlatformAnnouncement = {
          id: newId,
          ...payload,
          action_link: payload.action_link || undefined,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('announcements')
          .insert([
            {
              title: payload.title,
              content: payload.content,
              category: payload.category,
              target_route: payload.target_route,
              action_link: payload.action_link,
              is_active: payload.is_active,
            }
          ])
          .select()
          .single();

        if (!error && data) {
          setAnnouncements((prev) => [data, ...prev]);
        } else {
          setAnnouncements((prev) => [newRecord, ...prev]);
        }
        showToast('Yangi e\'lon e\'lon qilindi va bazaga saqlandi!');
      }

      // Sync active landing banner to platform_content if applicable
      if (payload.target_route === 'landing' && payload.is_active) {
        await savePlatformContent('announcement_banner', {
          title: payload.title,
          text: payload.content,
          actionLink: payload.action_link || '/mocks',
          isActive: true,
        }).catch(() => {});
      }

      if (onRefreshGlobal) {
        onRefreshGlobal();
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error('Save announcement error:', err);
      showToast('Xatolik yuz berdi!');
    }
  };

  const handleToggleActive = async (item: PlatformAnnouncement) => {
    const nextState = !item.is_active;

    // Optimistic
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, is_active: nextState } : a))
    );

    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: nextState, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) {
        console.warn('Supabase toggle error:', error.message);
      }
      showToast(`E'lon holati o'zgartirildi: ${nextState ? 'Faol' : 'Nofaol'}`);
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatan ham bu e\'lonni o\'chirmoqchimisiz?')) return;

    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) console.warn('Supabase delete error:', error.message);
      showToast('E\'lon o\'chirildi.');
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return announcements.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
      const matchesRoute =
        targetRouteFilter === 'ALL' || item.target_route === targetRouteFilter;
      return matchesSearch && matchesRoute;
    });
  }, [announcements, searchQuery, targetRouteFilter]);

  return (
    <div id="admin-news-cms" className="space-y-6 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">POSTGRESQL SYNCHRONIZED</span>
        </div>
      )}

      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-[#121A2F] border border-[#1E293B] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#0A0F1D] text-[#94A3B8] border border-[#1E293B] text-[11px] font-mono uppercase tracking-wider">
            <Megaphone className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>Real-time Announcements & News Engine</span>
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
            Yangiliklar & Platforma E'lonlari CMS
          </h2>
          <p className="text-xs text-[#64748B] max-w-2xl">
            Asosiy sahifa (Landing), o'quvchi boshqaruv paneli (Dashboard) yoki popup xabarnomalarni real-time boshqarish.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>YANGI E'LON QO'SHISH</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="E'lon sarlavhasi yoki matni bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-hidden focus:border-[#E07A5F]"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 p-1 rounded-xl bg-[#121A2F] border border-[#1E293B]">
          {(['ALL', 'landing', 'dashboard', 'popup'] as const).map((route) => (
            <button
              key={route}
              type="button"
              onClick={() => setTargetRouteFilter(route)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                targetRouteFilter === route
                  ? 'bg-[#1E293B] text-[#F8FAFC] font-bold border border-[#334155]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {route === 'ALL'
                ? 'Barchasi'
                : route === 'landing'
                ? 'Landing'
                : route === 'dashboard'
                ? 'Dashboard'
                : 'Popup'}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnnouncements.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-[#121A2F] border transition-all flex flex-col justify-between space-y-4 ${
                item.is_active ? 'border-[#1E293B]' : 'border-[#1E293B]/40 opacity-70'
              }`}
            >
              <div className="space-y-3">
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      item.target_route === 'landing'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : item.target_route === 'dashboard'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {item.target_route}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0A0F1D] text-[#64748B] text-[10px] font-mono border border-[#1E293B]">
                      {item.category || 'general'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`cursor-pointer transition-colors ${
                      item.is_active ? 'text-emerald-400' : 'text-[#64748B]'
                    }`}
                    title={item.is_active ? "Faol (o'chirish)" : "Nofaol (yoqish)"}
                  >
                    {item.is_active ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Title and Content */}
                <div>
                  <h3 className="text-sm font-bold text-[#F8FAFC] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed line-clamp-3">
                    {item.content}
                  </p>
                </div>

                {/* Action Link preview */}
                {item.action_link && (
                  <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-[#E07A5F]">
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{item.action_link}</span>
                  </div>
                )}
              </div>

              {/* Bottom bar */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#64748B]">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Yaqinda'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-[#0A0F1D] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B] hover:border-[#334155] cursor-pointer transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 cursor-pointer transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl bg-[#121A2F] border border-[#1E293B] text-center text-xs text-[#64748B]">
            E'lonlar topilmadi. Yangi e'lon qo'shish uchun yuqoridagi tugmani bosing.
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#121A2F] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#E07A5F]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">
                  {editingItem ? "E'lonni Tahrirlash" : "Yangi E'lon Yaratish"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94A3B8] uppercase">Sarlavha (Title)</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Fall 2026 Yangi Mock Testlar Chiqdi!"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94A3B8] uppercase">E'lon Matni (Content)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="E'lon tafsilotlarini kiriting..."
                  value={formState.content}
                  onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] leading-relaxed focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#94A3B8] uppercase">Qayerda Ko'rinadi (Target)</label>
                  <select
                    value={formState.target_route}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        target_route: e.target.value as 'landing' | 'dashboard' | 'popup',
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  >
                    <option value="landing">Landing (Bosh Sahifa)</option>
                    <option value="dashboard">Dashboard (O'quvchi Kabineti)</option>
                    <option value="popup">Popup Modal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#94A3B8] uppercase">Kategoriya</label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                  >
                    <option value="general">Umumiy (General)</option>
                    <option value="update">Platforma Yangiligi</option>
                    <option value="mock">Mock Test E'loni</option>
                    <option value="discount">Chegirma / Aksiya</option>
                    <option value="urgent">Muhim / Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#94A3B8] uppercase">Harakat Havolasi (Action Link - ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="Masalan: /mocks yoki https://t.me/asronsat"
                  value={formState.action_link}
                  onChange={(e) => setFormState({ ...formState, action_link: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0F1D] border border-[#1E293B]">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#F8FAFC]">Holati: Faol (Active)</div>
                  <div className="text-[11px] text-[#64748B]">
                    E'lon saqlanishi bilan tashrif buyuruvchilarga ko'rsatiladi
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormState({ ...formState, is_active: !formState.is_active })}
                  className={`cursor-pointer transition-colors ${
                    formState.is_active ? 'text-emerald-400' : 'text-[#64748B]'
                  }`}
                >
                  {formState.is_active ? (
                    <ToggleRight className="w-7 h-7" />
                  ) : (
                    <ToggleLeft className="w-7 h-7" />
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4 stroke-[2]" />
                  <span>{editingItem ? 'O\'zgarishlarni Saqlash' : 'E\'lonni Chop Etish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
