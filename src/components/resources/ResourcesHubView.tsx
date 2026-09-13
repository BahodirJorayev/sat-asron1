'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Headphones,
  Video,
  Compass,
  Download,
  Search,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  X,
  Play,
  Pause,
  Clock,
  FileText,
  Layers,
  ChevronRight,
  User as UserIcon,
  Tag,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { User, PlatformResource, ResourceCategory, ExamTag } from '../../types';
import { INITIAL_PLATFORM_RESOURCES } from '../../data/resourcesDatabase';
import { useExamProgram } from '../../context/ExamProgramContext';

interface ResourcesHubViewProps {
  user?: User | null;
  onNavigateTab?: (tab: string) => void;
}

export const ResourcesHubView: React.FC<ResourcesHubViewProps> = ({ user, onNavigateTab }) => {
  const { examType, isSat, isIelts } = useExamProgram();

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedExamTag, setSelectedExamTag] = useState<ExamTag | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active resource reader/player modal
  const [activeResource, setActiveResource] = useState<PlatformResource | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Load resources (initial + custom from Admin)
  const resources = useMemo(() => {
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
  }, []);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Category filter
      if (selectedCategory !== 'ALL' && res.category !== selectedCategory) {
        return false;
      }

      // Exam Program Tag filter
      if (selectedExamTag !== 'ALL') {
        if (res.examTag !== 'ALL' && res.examTag !== selectedExamTag) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = res.title.toLowerCase().includes(query);
        const matchDesc = res.description.toLowerCase().includes(query);
        const matchAuthor = res.author?.toLowerCase().includes(query);
        const matchTags = res.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchAuthor && !matchTags) return false;
      }

      return true;
    });
  }, [resources, selectedCategory, selectedExamTag, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    return {
      ALL: resources.length,
      ARTICLES: resources.filter((r) => r.category === 'ARTICLES').length,
      PODCASTS: resources.filter((r) => r.category === 'PODCASTS').length,
      VIDEOS: resources.filter((r) => r.category === 'VIDEOS').length,
      ROADMAP: resources.filter((r) => r.category === 'ROADMAP').length,
    };
  }, [resources]);

  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case 'ARTICLES':
        return <BookOpen className="w-4 h-4 text-sky-500" />;
      case 'PODCASTS':
        return <Headphones className="w-4 h-4 text-emerald-500" />;
      case 'VIDEOS':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'ROADMAP':
        return <Compass className="w-4 h-4 text-amber-500" />;
    }
  };

  const getCategoryLabel = (category: ResourceCategory) => {
    switch (category) {
      case 'ARTICLES':
        return 'Maqola & Qo‘llanma';
      case 'PODCASTS':
        return 'Audio Podkast';
      case 'VIDEOS':
        return 'Video Dars';
      case 'ROADMAP':
        return 'Tayyorgarlik Yo‘l Xaritasi';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 md:p-10 text-white shadow-xl shadow-indigo-950/20 border border-slate-800">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              ASRON Bilimlar Markazi
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3">
              Resurslar & Tayyorgarlik Yo&apos;l Xaritalari
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              SAT va IELTS bo&apos;yicha eng dolzarb maqolalar, ekspert podkastlar, video tahlillar hamda 1500+ / Band 8.0+ darajaga erishish uchun tuzilgan bosqichma-bosqich qo&apos;llanmalar.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls: Search, Exam Selector, Categories */}
        <div className="space-y-4 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Top Row: Search & Exam Tag */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Exam Program Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
              <button
                onClick={() => setSelectedExamTag('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedExamTag === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setSelectedExamTag('SAT')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedExamTag === 'SAT'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-300" />
                SAT
              </button>
              <button
                onClick={() => setSelectedExamTag('IELTS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedExamTag === 'IELTS'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-300" />
                IELTS
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mavzu, muallif yoki teglarni qidirish..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: 4 Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'Barcha Resurslar', icon: Layers },
              { id: 'ARTICLES', label: 'Maqolalar & Strategiyalar', icon: BookOpen },
              { id: 'PODCASTS', label: 'Audio Podkastlar', icon: Headphones },
              { id: 'VIDEOS', label: 'Video Darslar', icon: Video },
              { id: 'ROADMAP', label: 'Yo‘l Xaritalari (Roadmaps)', icon: Compass },
            ].map((cat) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.id as keyof typeof categoryCounts] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] ${
                      isSelected
                        ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Bento Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => setActiveResource(res)}
              >
                <div>
                  {/* Category & Exam Tag Pills */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {getCategoryIcon(res.category)}
                        {getCategoryLabel(res.category)}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        res.examTag === 'SAT'
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                          : res.examTag === 'IELTS'
                          ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400'
                          : 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {res.examTag === 'ALL' ? 'SAT & IELTS' : res.examTag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {res.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Tags */}
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      {res.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer details & Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    {res.author && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        {res.author}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    {res.category === 'ARTICLES' || res.category === 'ROADMAP' ? (
                      <>
                        <span>O&apos;qish</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    ) : res.category === 'VIDEOS' ? (
                      <>
                        <span>Ko&apos;rish</span>
                        <Play className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Tinglash</span>
                        <Headphones className="w-3.5 h-3.5" />
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Hech qanday resurs topilmadi
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Tanlangan filtrlar bo&apos;yicha ma&apos;lumot mavjud emas. Filtrlarni tozalab ko&apos;ring.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedExamTag('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Filtrlarni Qaytarish
            </button>
          </div>
        )}
      </div>

      {/* Reader & Media Modal */}
      <AnimatePresence>
        {activeResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      {getCategoryIcon(activeResource.category)}
                      {getCategoryLabel(activeResource.category)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      {activeResource.examTag}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    {activeResource.title}
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setActiveResource(null);
                    setIsPlayingAudio(false);
                  }}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {/* Embedded Video Player if Video */}
                {activeResource.category === 'VIDEOS' && activeResource.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-lg">
                    {activeResource.mediaUrl.includes('youtube.com') || activeResource.mediaUrl.includes('youtu.be') ? (
                      <iframe
                        src={activeResource.mediaUrl}
                        title={activeResource.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Video className="w-12 h-12 mb-2" />
                        <span className="text-sm">Video Dars Player</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Embedded Audio Player if Podcast */}
                {activeResource.category === 'PODCASTS' && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Headphones className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{activeResource.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Davomiyligi: {activeResource.durationMinutes || 25} daqiqa</p>
                    </div>
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      {isPlayingAudio ? 'Pauza' : 'Audio Tinglash'}
                    </button>
                  </div>
                )}

                {/* Markdown / Text Content */}
                {activeResource.contentMarkdown ? (
                  <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {activeResource.contentMarkdown}
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeResource.description}
                  </p>
                )}

                {/* PDF Download Button if available */}
                {activeResource.pdfDownloadUrl && (
                  <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          Rasmiy PDF Qo&apos;llanmani Yuklab Oling
                        </h5>
                        <p className="text-xs text-slate-500">
                          Hajmi: {activeResource.pdfSizeBytes || '2.5 MB'} • Offline o&apos;qish uchun
                        </p>
                      </div>
                    </div>
                    <a
                      href={activeResource.pdfDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-2"
                    >
                      Yuklab Olish
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Muallif: {activeResource.author || 'ASRON Platformasi'}</span>
                <button
                  onClick={() => {
                    setActiveResource(null);
                    setIsPlayingAudio(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Yopish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
