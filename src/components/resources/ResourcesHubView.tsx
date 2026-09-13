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
  Calendar,
  Volume2,
  BrainCircuit,
  Filter
} from 'lucide-react';
import { User, PlatformResource, ResourceCategory, ExamTag } from '../../types';
import { INITIAL_PLATFORM_RESOURCES } from '../../data/resourcesDatabase';
import { useExamProgram } from '../../context/ExamProgramContext';
import { RoadmapHub } from './RoadmapHub';

interface ResourcesHubViewProps {
  user?: User | null;
  initialExamTag?: ExamTag | 'ALL';
  onNavigateTab?: (tab: string) => void;
}

export const ResourcesHubView: React.FC<ResourcesHubViewProps> = ({
  user,
  initialExamTag,
  onNavigateTab,
}) => {
  const { examType, isSat, isIelts } = useExamProgram();

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedExamTag, setSelectedExamTag] = useState<ExamTag | 'ALL'>(() => {
    if (initialExamTag) return initialExamTag;
    return isIelts ? 'IELTS' : 'ALL';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Active resource reader/player modal
  const [activeResource, setActiveResource] = useState<PlatformResource | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

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
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'STRATEGIES') {
          if (res.category !== 'ARTICLES' || !res.tags?.some((t) => t.toLowerCase().includes('strateg') || t.toLowerCase().includes('t/f/ng') || t.toLowerCase().includes('band 8'))) {
            return false;
          }
        } else if (res.category !== selectedCategory) {
          return false;
        }
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
      STRATEGIES: resources.filter((r) => r.tags?.some((t) => t.toLowerCase().includes('strateg') || t.toLowerCase().includes('t/f/ng') || t.toLowerCase().includes('band 8'))).length,
      ROADMAP: 3,
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
    <div className="min-h-screen p-4 md:p-8 font-sans select-none text-slate-900 dark:text-slate-100">
      {/* Frosted Glass Hero Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-xl p-6 md:p-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ASRON PREMIUM RESURSLAR &amp; ROADMAP</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Bilimlar &amp; Tayyorgarlik Markazi
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
              IELTS Band 8.5+ va SAT 1550+ natijalarga erishish uchun ekspertlar tomonidan tuzilgan interaktiv yo‘l xaritalari, chuqur tahliliy maqolalar, audio podkastlar hamda video qo‘llanmalar.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls: Search, Exam Filter & Glassmorphism Category Tabs */}
        <div className="space-y-4 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 p-4 md:p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-xl">
          {/* Top Row: Exam Switcher & Search Input */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Exam Program Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setSelectedExamTag('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedExamTag === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Barchasi
              </button>

              <button
                type="button"
                onClick={() => setSelectedExamTag('IELTS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedExamTag === 'IELTS'
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-300" />
                <span>🇬🇧 IELTS</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedExamTag('SAT')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedExamTag === 'SAT'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-300" />
                <span>🏛️ SAT</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mavzu, muallif yoki teglar..."
                className="w-full pl-10 pr-9 py-2 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Tabbed Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'Barchasi', icon: Layers },
              { id: 'ARTICLES', label: '📚 Maqolalar', icon: BookOpen },
              { id: 'PODCASTS', label: '🎙️ Podkastlar', icon: Headphones },
              { id: 'VIDEOS', label: '🎬 Video Darslar', icon: Video },
              { id: 'STRATEGIES', label: '🧠 Strategiyalar', icon: BrainCircuit },
              { id: 'ROADMAP', label: '🗺️ Yo‘l Xaritasi', icon: Compass },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id as keyof typeof categoryCounts] || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected
                        ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic View Mode: Roadmap vs Bento-Grid */}
        {selectedCategory === 'ROADMAP' ? (
          <RoadmapHub
            user={user}
            onNavigateMocks={() => onNavigateTab?.('mocks')}
          />
        ) : (
          /* Dynamic Resources Bento-Grid */
          <div className="space-y-4">
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResources.map((res, index) => {
                  const isFeatured = index === 0 && selectedCategory === 'ALL' && !searchQuery;
                  const isVideo = res.category === 'VIDEOS';
                  const isPodcast = res.category === 'PODCASTS';

                  return (
                    <motion.div
                      key={res.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      onClick={() => setActiveResource(res)}
                      className={`group relative rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-xl hover:shadow-2xl hover:border-orange-500/40 transition-all p-5 flex flex-col justify-between cursor-pointer ${
                        isFeatured ? 'md:col-span-2 bg-gradient-to-br from-white/90 via-white/70 to-orange-500/5 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-orange-500/5' : ''
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Top Meta Tags */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                              res.category === 'ARTICLES'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                : res.category === 'PODCASTS'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {getCategoryIcon(res.category)}
                            <span>{getCategoryLabel(res.category)}</span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                              res.examTag === 'IELTS'
                                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                                : res.examTag === 'SAT'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {res.examTag}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3
                            className={`font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug ${
                              isFeatured ? 'text-lg md:text-xl' : 'text-sm md:text-base'
                            }`}
                          >
                            {res.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {res.description}
                          </p>
                        </div>

                        {/* Interactive Media Pill if Video or Podcast */}
                        {(isVideo || isPodcast) && (
                          <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono">
                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              {isVideo ? <Video size={13} className="text-rose-500" /> : <Volume2 size={13} className="text-emerald-500" />}
                              <span>{isVideo ? 'Video Dars' : 'Audio Podkast'}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {res.durationMinutes ? `${res.durationMinutes} daqiqa` : 'Jonli ko‘rish'}
                            </span>
                          </div>
                        )}

                        {/* Tags list */}
                        {res.tags && res.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {res.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{res.author || 'ASRON Ekspert'}</span>
                        <div className="flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform">
                          <span>Ochish</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 rounded-3xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 mx-auto flex items-center justify-center">
                  <Search size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Hech qanday resurs topilmadi
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Tanlangan filtrlar bo‘yicha natija chiqmadi. Filtrlarni tozalab qayta urinib ko‘ring.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedExamTag('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                >
                  Filtrlarni Tozalash
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rich Preview & Media Modal */}
      <AnimatePresence>
        {activeResource && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveResource(null);
                setIsPlayingAudio(false);
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-4 bg-white/90 dark:bg-slate-900/90">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      {getCategoryIcon(activeResource.category)}
                      {getCategoryLabel(activeResource.category)}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      {activeResource.examTag}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                    {activeResource.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveResource(null);
                    setIsPlayingAudio(false);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
                {/* Embedded Video Player */}
                {activeResource.category === 'VIDEOS' && (
                  <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-lg border border-slate-800">
                    {activeResource.mediaUrl && (activeResource.mediaUrl.includes('youtube.com') || activeResource.mediaUrl.includes('youtu.be')) ? (
                      <iframe
                        src={activeResource.mediaUrl}
                        title={activeResource.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                        <Video className="w-12 h-12 text-rose-500" />
                        <span className="text-sm font-bold text-white">{activeResource.title}</span>
                        <p className="text-xs text-slate-400">Video darslik yuqori sifatda tayyorlangan</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Embedded Audio Stream Player */}
                {activeResource.category === 'PODCASTS' && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
                      <Headphones className="w-8 h-8" />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{activeResource.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        Davomiyligi: {activeResource.durationMinutes || 25} daqiqa • Audio format
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      <span>{isPlayingAudio ? 'Pauza' : 'Audio Tinglash'}</span>
                    </button>
                  </div>
                )}

                {/* Markdown Content */}
                {activeResource.contentMarkdown ? (
                  <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {activeResource.contentMarkdown}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeResource.description}
                  </p>
                )}

                {/* PDF Download Attachment */}
                {activeResource.pdfDownloadUrl && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Rasmiy PDF Qo‘llanma
                        </h5>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Hajmi: {activeResource.pdfSizeBytes || '2.5 MB'} • Offline o‘qish uchun
                        </p>
                      </div>
                    </div>

                    <a
                      href={activeResource.pdfDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-sm shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Yuklab Olish</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Muallif: {activeResource.author || 'ASRON Platformasi'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveResource(null);
                    setIsPlayingAudio(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
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

export default ResourcesHubView;
