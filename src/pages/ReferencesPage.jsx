import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, Microscope, Award, FileText } from 'lucide-react';

export default function ReferencesPage() {
  return (
    <div className="space-y-6 leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2 shadow-sm">
          <BookOpen className="w-3.5 h-3.5" />
          Academic Rigor
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          References & Scientific Sources
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Standardized clinical textbooks, peer-reviewed literature, and guidelines used across Microbledle.
        </p>
      </div>

      {/* Intro Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        To maintain clinical and educational fidelity, every pathogen profile, Gram stain classification, metabolic characteristic, and antimicrobial association in Microbledle is curated from internationally recognized medical microbiology textbooks and public health authorities.
      </div>

      {/* Reference Categories */}
      <div className="space-y-4">
        
        {/* Category 1: Primary Textbooks */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Primary Medical Textbooks
          </h2>

          <div className="space-y-2.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
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
                  Primary reference for bacterial morphology, cellular physiology, Gram stain characteristics, culture agars, and differential biochemical assays (catalase, coagulase, oxidase, hemolysis).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                2
              </div>
              <div>
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                  Jawetz, Melnick, & Adelberg's Medical Microbiology (28th Edition)
                </strong>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Stefan Riedel, Stephen A. Morse, Thomas Mietzner, Steve Miller — McGraw Hill
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Used for bacterial genetics, exotoxins/endotoxins, microbial pathogenesis, opportunistic fungal infections, and viral lifecycle replication mechanisms.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
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
                  Used for clinical infectious disease syndromes, epidemiology, zoonotic vector transmission, and parasitology classifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Category 2: Public Health & Clinical Authorities */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Public Health Guidelines & Surveillance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <strong className="text-slate-900 dark:text-white block">
                Centers for Disease Control and Prevention (CDC)
              </strong>
              <p className="text-slate-600 dark:text-slate-400">
                Surveillance and clinical diagnostic criteria for vector-borne diseases, epidemic respiratory outbreaks, and bioterror pathogens.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <strong className="text-slate-900 dark:text-white block">
                World Health Organization (WHO)
              </strong>
              <p className="text-slate-600 dark:text-slate-400">
                Global burden of disease, antimicrobial resistance (AMR) priority pathogen lists, and tropical parasitic infections.
              </p>
            </div>
          </div>
        </section>

        {/* Category 3: Antimicrobial Chemotherapy & Board Exam Frameworks */}
        <section className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Antimicrobials & Medical Board Exam Frameworks
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <strong className="text-slate-900 dark:text-white block">
                Infectious Diseases Society of America (IDSA)
              </strong>
              <p className="text-slate-600 dark:text-slate-400">
                Clinical practice guidelines for empirical and targeted antimicrobial treatment in common syndromes (pneumonia, UTI, meningitis, endocarditis).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1">
              <strong className="text-slate-900 dark:text-white block">
                USMLE Step 1 Content Specifications & First Aid
              </strong>
              <p className="text-slate-600 dark:text-slate-400">
                High-yield clinical associations, board-exam classic buzzwords, and diagnostic vignette patterns curated for medical learners.
              </p>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
