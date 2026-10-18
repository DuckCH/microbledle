import React from 'react';
import { BookOpen, Sparkles, Clock } from 'lucide-react';

export default function ReferencesPage() {
  return (
    <div className="space-y-6 leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2 shadow-sm">
          <BookOpen className="w-3.5 h-3.5" />
          References
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          References & Sources
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Academic citations, textbooks, and guidelines.
        </p>
      </div>

      {/* Blank Space / Coming Soon State */}
      <div className="min-h-[280px] p-8 sm:p-12 rounded-3xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700/80 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Coming Soon
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          The full scientific bibliography and textbook citations are currently being updated.
        </p>
      </div>

    </div>
  );
}
