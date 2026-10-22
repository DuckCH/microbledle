import React from 'react';
import { BookOpen, Sparkles, Clock, FileText } from 'lucide-react';

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
          Information methodology, clinical citations, and academic roadmap.
        </p>
      </div>

      {/* Current AI-Generated Methodology Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 space-y-2.5">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Current Data Methodology</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          We currently use <strong>AI-generated information</strong> to assist in curating clinical vignettes, pathogen diagnostic properties, and educational deduction clues across Microbledle.
        </p>
      </div>

      {/* Future Roadmap: Textbook Citations */}
      <div className="min-h-[220px] p-6 sm:p-10 rounded-3xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700/80 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Textbook Citations In Progress
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
          Direct textbook citations and peer-reviewed academic bibliographies (including Murray's Medical Microbiology, Jawetz, and CDC/WHO compendia) will be incorporated in future updates.
        </p>
      </div>

    </div>
  );
}
