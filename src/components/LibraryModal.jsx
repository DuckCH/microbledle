import React, { useState } from 'react';
import { 
  X, BookOpen, Search, Sparkles, ChevronRight, Bookmark, 
  ExternalLink, Layers, Award, ShieldCheck, Microscope
} from 'lucide-react';
import { TEXTBOOK_COVERS } from '../data/textbookCovers';

export default function LibraryModal({
  isOpen,
  onClose,
  unlockedBugsCount = 0,
  totalBugsCount = 100,
  onOpenMicrodex,
  onSelectTextbook
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const bookList = [
    TEXTBOOK_COVERS.microdex,
    TEXTBOOK_COVERS.murray_10ed,
    TEXTBOOK_COVERS.jawetz_29ed,
    TEXTBOOK_COVERS.garcia_6ed,
    TEXTBOOK_COVERS.manson_24ed,
    TEXTBOOK_COVERS.mandell_10ed,
    TEXTBOOK_COVERS.abbas_11ed,
    TEXTBOOK_COVERS.custom_guidelines
  ];

  const filteredBooks = bookList.filter(b => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return b.title.toLowerCase().includes(term) ||
           (b.authors && b.authors.toLowerCase().includes(term)) ||
           (b.primaryFocus && b.primaryFocus.toLowerCase().includes(term));
  });

  return (
    <div 
      className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fade"
      style={{ zIndex: 90 }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl shadow-2xl relative flex flex-col max-h-[94vh] overflow-hidden text-left">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
                  Microbledle Library
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300">
                  Knowledge Hub
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Microdex Pathogen Compendium & Gold-Standard Medical Reference Bookshelf
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Quick Stats Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference library..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto justify-end">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Microscope className="w-3.5 h-3.5" />
              <span>Microdex: {unlockedBugsCount}/{totalBugsCount} Diagnosed</span>
            </span>
            <span>•</span>
            <span className="text-slate-300 font-semibold">
              7 Reference Textbooks
            </span>
          </div>
        </div>

        {/* Bookshelf Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {filteredBooks.map((book) => {
              const isMicrodexCard = Boolean(book.isMicrodex);

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    if (isMicrodexCard) {
                      if (onOpenMicrodex) onOpenMicrodex();
                    } else {
                      if (onSelectTextbook) onSelectTextbook(book.id);
                    }
                  }}
                  className={`group relative rounded-2xl sm:rounded-3xl border p-3 sm:p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    isMicrodexCard 
                      ? 'border-emerald-500/60 bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-950 hover:border-emerald-400 shadow-emerald-500/10' 
                      : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/90 shadow-slate-950/50'
                  }`}
                >
                  {/* Book Cover Image or Visual Art */}
                  <div className="w-full aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden relative shadow-lg mb-3 flex flex-col justify-between border border-slate-700/60 group-hover:border-slate-500 transition">
                    
                    {/* Spine strip on left */}
                    <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-slate-950/80 border-r border-white/10 z-10" />

                    {book.coverImage ? (
                      <img 
                        src={book.coverImage} 
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      /* Styled Aesthetic Digital Book Cover */
                      <div className={`w-full h-full p-3 sm:p-4 flex flex-col justify-between text-left ${book.colorTheme?.coverBg || 'bg-slate-900'}`}>
                        <div className="pl-2 space-y-1">
                          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">
                            {book.publisher}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-3">
                            {book.title}
                          </h4>
                          <span className="text-[9px] font-bold text-indigo-300 block">
                            {book.edition}
                          </span>
                        </div>

                        <div className="pl-2 pt-2 border-t border-white/10 space-y-0.5">
                          <div className="text-[8px] text-slate-300 font-semibold truncate">
                            {book.authors}
                          </div>
                          <div className="text-[8px] text-slate-400 font-mono">
                            {book.year ? `Year ${book.year}` : ''}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Badge Pill Top-Right */}
                    <div className="absolute top-2 right-2 z-10">
                      {isMicrodexCard ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/90 text-slate-950 shadow">
                          Pathogen Guide
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-slate-950/90 text-indigo-300 border border-indigo-500/40 backdrop-blur-sm">
                          Wiki
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="space-y-1 text-left">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition truncate">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">
                      {isMicrodexCard ? `${unlockedBugsCount} of ${totalBugsCount} Diagnosed` : book.edition}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300">
                      <span>{isMicrodexCard ? 'Open Microdex' : 'Read Chapters'}</span>
                      <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
