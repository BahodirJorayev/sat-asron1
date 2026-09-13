'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Headphones,
  Video,
  Compass,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  ExternalLink,
  Download,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import { PlatformResource, ResourceCategory, ExamTag } from '../../types';
import { INITIAL_PLATFORM_RESOURCES } from '../../data/resourcesDatabase';

interface AdminResourcesManagerProps {
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const AdminResourcesManager: React.FC<AdminResourcesManagerProps> = ({ onNotify }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedExamTag, setSelectedExamTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Resources State (Initial + Custom from localStorage)
  const [resources, setResources] = useState<PlatformResource[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const custom = localStorage.getItem('asron_custom_resources');
        if (custom) {
          const parsed = JSON.parse(custom);
          return [...parsed, ...INITIAL_PLATFORM_RESOURCES];
        }
      } catch (err) {
        console.error('Error loading custom resources:', err);
      }
    }
    return INITIAL_PLATFORM_RESOURCES;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<PlatformResource | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'ARTICLES' as ResourceCategory,
    examTag: 'ALL' as ExamTag,
    description: '',
    contentMarkdown: '',
    mediaUrl: '',
    pdfDownloadUrl: '',
    pdfSizeBytes: '2.5 MB',
    author: 'ASRON Ekspert Jamoasi',
    tags: 'Strategiya, Qo\'llanma',
    isPublished: true,
  });

  const persistResources = (updated: PlatformResource[]) => {
    setResources(updated);
    if (typeof window !== 'undefined') {
      const customOnly = updated.filter(
        (r) => !INITIAL_PLATFORM_RESOURCES.some((init) => init.id === r.id)
      );
      localStorage.setItem('asron_custom_resources', JSON.stringify(customOnly));
    }
  };

  const handleOpenCreateModal = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      category: 'ARTICLES',
      examTag: 'ALL',
      description: '',
      contentMarkdown: `# Mavzu Sarlavhasi\n\nQo'llanma va strategiya matnini bu yerga yozing...\n\n### Muhim Qoidalar:\n1. 1-qoida\n2. 2-qoida`,
      mediaUrl: '',
      pdfDownloadUrl: '',
      pdfSizeBytes: '2.0 MB',
      author: 'ASRON Akademik Bo\'limi',
      tags: 'SAT, IELTS, Qo\'llanma',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (res: PlatformResource) => {
    setEditingResource(res);
    setFormData({
      title: res.title,
      category: res.category,
      examTag: res.examTag,
      description: res.description,
      contentMarkdown: res.contentMarkdown || '',
      mediaUrl: res.mediaUrl || '',
      pdfDownloadUrl: res.pdfDownloadUrl || '',
      pdfSizeBytes: res.pdfSizeBytes || '2.0 MB',
      author: res.author || 'ASRON Akademik Bo\'limi',
      tags: res.tags ? res.tags.join(', ') : '',
      isPublished: res.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Iltimos, resurs nomini kiriting');
      return;
    }

    const tagList = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingResource) {
      const updated = resources.map((r) => {
        if (r.id === editingResource.id) {
          return {
            ...r,
            title: formData.title,
            category: formData.category,
            examTag: formData.examTag,
            description: formData.description,
            contentMarkdown: formData.contentMarkdown,
            mediaUrl: formData.mediaUrl || undefined,
            pdfDownloadUrl: formData.pdfDownloadUrl || undefined,
            pdfSizeBytes: formData.pdfSizeBytes,
            author: formData.author,
            tags: tagList,
            isPublished: formData.isPublished,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      });
      persistResources(updated);
      onNotify?.('Resurs muvaffaqiyatli yangilandi', 'success');
    } else {
      const newRes: PlatformResource = {
        id: 'res-custom-' + Date.now(),
        title: formData.title,
        category: formData.category,
        examTag: formData.examTag,
        description: formData.description,
        contentMarkdown: formData.contentMarkdown,
        mediaUrl: formData.mediaUrl || undefined,
        pdfDownloadUrl: formData.pdfDownloadUrl || undefined,
        pdfSizeBytes: formData.pdfSizeBytes,
        author: formData.author,
        orderIndex: 99,
        isPublished: formData.isPublished,
        tags: tagList,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      persistResources([newRes, ...resources]);
      onNotify?.('Yangi resurs muvaffaqiyatli qo‘shildi!', 'success');
    }

    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleDeleteResource = (id: string) => {
    if (confirm('Ushbu resursni o‘chirmoqchimisiz?')) {
      const updated = resources.filter((r) => r.id !== id);
      persistResources(updated);
      onNotify?.('Resurs o‘chirildi', 'success');
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
      if (selectedExamTag !== 'ALL' && r.examTag !== 'ALL' && r.examTag !== selectedExamTag) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchAuthor = r.author?.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor) return false;
      }
      return true;
    });
  }, [resources, selectedCategory, selectedExamTag, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
              Resurslar CMS
            </span>
            <span className="text-xs text-slate-400">• Bilimlar Bazasi</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            Maqolalar, Podkastlar & Roadmaps Boshqaruvi
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Talabalarga ko&apos;rinadigan qo&apos;llanmalar, video darslar va yo&apos;l xaritalarini joylashtirish.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Yangi Resurs Qo&apos;shish
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'ARTICLES', 'PODCASTS', 'VIDEOS', 'ROADMAP'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat === 'ALL' && 'Barcha Turlar'}
              {cat === 'ARTICLES' && 'Maqolalar'}
              {cat === 'PODCASTS' && 'Podkastlar'}
              {cat === 'VIDEOS' && 'Videolar'}
              {cat === 'ROADMAP' && 'Roadmaplar'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Resurs nomi yoki muallif..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Sarlavha</th>
                <th className="py-3.5 px-4">Kategoriya</th>
                <th className="py-3.5 px-4">Dastur (Tag)</th>
                <th className="py-3.5 px-4">Muallif</th>
                <th className="py-3.5 px-4">PDF Yuklash</th>
                <th className="py-3.5 px-4">Holati</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredResources.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-sm truncate">
                    {res.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                      {res.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.examTag === 'SAT'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                          : res.examTag === 'IELTS'
                          ? 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
                          : 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
                      }`}
                    >
                      {res.examTag}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                    {res.author || 'ASRON'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {res.pdfDownloadUrl ? (
                      <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                        <Download className="w-3 h-3" /> Mavjud ({res.pdfSizeBytes || '2MB'})
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {res.isPublished ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        Faol
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px]">
                        Qoralama
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(res)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(res.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create / Edit Resource */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingResource ? 'Resursni Tahrirlash' : 'Yangi Resurs / Qo‘llanma Yaratish'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Maqola, podkast, video yoki bosqichma-bosqich yo&apos;l xaritasi qo&apos;shing.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveResource} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resurs Sarlavhasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masalan: IELTS Writing Task 2 Band 8.0 Shabloni"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kategoriya
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ResourceCategory })}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    >
                      <option value="ARTICLES">Maqola & Qo‘llanma</option>
                      <option value="PODCASTS">Audio Podkast</option>
                      <option value="VIDEOS">Video Dars</option>
                      <option value="ROADMAP">Yo‘l Xaritasi (Roadmap)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Dastur (Exam Tag)
                    </label>
                    <select
                      value={formData.examTag}
                      onChange={(e) => setFormData({ ...formData, examTag: e.target.value as ExamTag })}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    >
                      <option value="ALL">Barchasi (SAT & IELTS)</option>
                      <option value="SAT">Faqat SAT</option>
                      <option value="IELTS">Faqat IELTS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Qisqacha Tavsif
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Talabalar kartada ko'radigan qisqacha tavsif..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    To‘liq Matn (Markdown Formatida)
                  </label>
                  <textarea
                    rows={8}
                    value={formData.contentMarkdown}
                    onChange={(e) => setFormData({ ...formData, contentMarkdown: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono outline-none focus:border-blue-500 text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Media URL (YouTube / Audio Link)
                    </label>
                    <input
                      type="text"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      PDF Yuklab Olish Havolasi
                    </label>
                    <input
                      type="text"
                      value={formData.pdfDownloadUrl}
                      onChange={(e) => setFormData({ ...formData, pdfDownloadUrl: e.target.value })}
                      placeholder="https://cdn.../file.pdf"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Muallif / Manba
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Teglar (Vergul bilan ajrating)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Reading, Band 8+, Strategiya"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
                  >
                    {editingResource ? 'O‘zgarishlarni Saqlash' : 'Resursni Saqlash & E’lon Qilish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
