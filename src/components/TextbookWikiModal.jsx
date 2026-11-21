import React, { useState, useMemo } from 'react';
import { 
  X, ArrowLeft, Search, BookOpen, CheckCircle2, ChevronRight, 
  Sparkles, Award, ShieldAlert, Tag, ExternalLink, Filter
} from 'lucide-react';
import { getChaptersForTextbook } from '../data/textbookIndex';
import { getCoverMeta } from '../data/textbookCovers';

export default function TextbookWikiModal({
  isOpen,
  onClose,
  textbookId,
  allSummaries = {},
  onSelectChapter,
  onBackToLibrary
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');

  const textbookMeta = useMemo(() => getCoverMeta(textbookId), [textbookId]);
  const chapters = useMemo(() => getChaptersForTextbook(textbookId), [textbookId]);

  // Extract distinct sections for filtering
  const sections = useMemo(() => {
    const set = new Set();
    chapters.forEach(c => {
      if (c.section) set.add(c.section);
    });
    return ['All', ...Array.from(set)];
  }, [chapters]);

  // Filtered chapters list
  const filteredChapters = useMemo(() => {
    return chapters.filter(c => {
      // Section filter
      if (selectedSection !== 'All' && c.section !== selectedSection) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const numMatch = String(c.chapterNumber).includes(term);
        const titleMatch = c.title.toLowerCase().includes(term);
        const bugMatch = (c.linkedBugs || []).some(b => b.toLowerCase().includes(term));
        return numMatch || titleMatch || bugMatch;
      }
      return true;
    });
  }, [chapters, selectedSection, searchTerm]);

  // Summary statistics
  const summarizedCount = useMemo(() => {
    let count = 0;
    chapters.forEach(c => {
      const key = `${textbookId}_ch${c.chapterNumber}`;
      if (allSummaries[key]?.summary && allSummaries[key].summary.trim().length > 0) {
        count++;
      }
    });
    return count;
  }, [chapters, allSummaries, textbookId]);

  const percentage = chapters.length > 0 ? Math.round((summarizedCount / chapters.length) * 100) : 0;

  if (!isOpen || !textbookId) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fade"
      style={{ zIndex: 100 }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl shadow-2xl relative flex flex-col max-h-[94vh] overflow-hidden text-left">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBackToLibrary && (
              <button
                onClick={onBackToLibrary}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
                title="Back to Library Bookshelf"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Textbook Reference Wiki
              </span>
              <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight truncate">
                {textbookMeta.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Content: Left Sidebar Cover & Info | Right Chapter Catalog */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          
          {/* LEFT COLUMN: Book Cover & Citation */}
          <div className="md:col-span-4 p-4 sm:p-6 bg-slate-950/50 space-y-4 flex flex-col items-center md:items-start text-left">
            
            {/* Visual Book Cover */}
            <div className="w-40 sm:w-48 aspect-[3/4] rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-700 transform hover:scale-[1.02] transition-transform duration-300 mx-auto md:mx-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950">
              {/* Spine Accent */}
              <div className="absolute top-0 left-0 bottom-0 w-3 bg-indigo-600/80 border-r border-indigo-400/30" />
              <div className="pl-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-1">
                  {textbookMeta.publisher}
                </span>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                  {textbookMeta.title}
                </h3>
                <span className="text-[10px] text-slate-300 font-bold block mt-1">
                  {textbookMeta.edition}
                </span>
              </div>

              <div className="pl-2 text-[9px] text-slate-400 space-y-0.5 border-t border-slate-800 pt-2">
                <div className="truncate font-semibold text-slate-300">{textbookMeta.authors}</div>
                <div>{textbookMeta.year ? `Published ${textbookMeta.year}` : ''}</div>
              </div>
            </div>

            {/* Citation Card */}
            <div className="w-full p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Peer-Reviewed Citation
              </div>
              <div className="text-white font-bold leading-snug">
                {textbookMeta.title} ({textbookMeta.edition})
              </div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                {textbookMeta.authors} • {textbookMeta.publisher} ({textbookMeta.year || '2026'})
              </div>
              {textbookMeta.primaryFocus && (
                <div className="text-[11px] text-indigo-300/90 pt-1 border-t border-slate-800 leading-relaxed">
                  <span className="font-semibold text-slate-400">Core Scope: </span>
                  {textbookMeta.primaryFocus}
                </div>
              )}
            </div>

            {/* Study Progress Indicator */}
            <div className="w-full p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Study Progress:
                </span>
                <span className="text-indigo-400 font-mono">{summarizedCount} / {chapters.length} Ch.</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block text-right font-semibold">
                {percentage}% Summarized
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: Chapter Catalog & Search */}
          <div className="md:col-span-8 p-4 sm:p-6 space-y-4 flex flex-col min-h-0 bg-slate-900/60">
            
            {/* Search and Section Filters */}
            <div className="space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${chapters.length} chapters by title, number, or organism...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Section Tabs */}
              {sections.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {sections.map(sec => (
                    <button
                      key={sec}
                      onClick={() => setSelectedSection(sec)}
                      className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium transition ${
                        selectedSection === sec
                          ? 'bg-indigo-600 text-white font-bold shadow'
                          : 'bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable Chapter List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
              {filteredChapters.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No chapters found matching "{searchTerm}"
                </div>
              ) : (
                filteredChapters.map(ch => {
                  const summaryKey = `${textbookId}_ch${ch.chapterNumber}`;
                  const hasSummary = allSummaries[summaryKey]?.summary && allSummaries[summaryKey].summary.trim().length > 0;
                  const pearls = allSummaries[summaryKey]?.highYieldPearls || '';

                  return (
                    <button
                      key={ch.chapterNumber}
                      onClick={() => onSelectChapter(ch)}
                      className="w-full p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition flex items-center justify-between gap-3 group shadow-sm"
                    >
                      <div className="min-w-0 space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-indigo-400">
                            Ch. {ch.chapterNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                            {ch.section}
                          </span>
                          {hasSummary ? (
                            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Summarized
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">
                              Pending Notes
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition truncate">
                          {allSummaries[summaryKey]?.title || ch.title}
                        </div>

                        {pearls && (
                          <div className="text-[11px] text-amber-300/90 italic truncate pt-0.5">
                            "{pearls}"
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
