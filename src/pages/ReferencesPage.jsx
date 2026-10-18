import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, Award } from 'lucide-react';

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
          References & Medical Sources
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Standard medical textbooks and trusted health guidelines used across Microbledle.
        </p>
      </div>

      {/* Intro Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        All organism classifications, Gram stains, lab tests, and first-line treatments in Microbledle are curated from standard medical microbiology textbooks and recognized public health organizations.
      </div>

      {/* Reference Sections */}
      <div className="space-y-5">
        
        {/* Section 1: Core Textbooks */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Core Textbooks
          </h2>

          <div className="space-y-2.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                1
              </div>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                  Medical Microbiology (9th Edition)
                </strong>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Patrick R. Murray, Ken S. Rosenthal, Michael A. Pfaller — Elsevier
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Primary source for Gram stains, bacterial shapes, culture media, and key lab test results (catalase, coagulase, oxidase, hemolysis).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 font-bold text-xs">
                2
              </div>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                  Jawetz, Melnick, & Adelberg's Medical Microbiology (28th Edition)
                </strong>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Stefan Riedel, Stephen A. Morse, Steve Miller — McGraw Hill
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Used for bacterial toxins, how organisms cause disease, opportunistic fungi, and common viruses.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs">
                3
              </div>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                  Sherris & Ryan's Medical Microbiology (8th Edition)
                </strong>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Kenneth J. Ryan — McGraw Hill
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Used for clinical infection presentations, how bugs spread, and parasitic diseases.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Clinical Guidelines & Public Health */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Guidelines & Health Organizations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1 shadow-sm">
              <strong className="text-slate-900 dark:text-white block font-bold">
                Infectious Diseases Society of America (IDSA)
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard first-line antibiotic regimens for common infections (pneumonia, urinary tract infections, meningitis, skin infections).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1 shadow-sm">
              <strong className="text-slate-900 dark:text-white block font-bold">
                CDC & World Health Organization (WHO)
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Guidance on global infectious outbreaks, disease transmission, and priority drug-resistant pathogens.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1 shadow-sm sm:col-span-2">
              <strong className="text-slate-900 dark:text-white block font-bold">
                USMLE Step 1 & Medical Board Curricula
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                High-yield microbiology associations and clinical patient vignette patterns designed to help healthcare students prepare for board examinations.
              </p>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
