import React from 'react';
import { 
  Sparkles, Microscope, TestTube2, Stethoscope, Trophy, 
  BookOpen, Heart, Award, CheckCircle2, ShieldCheck, Play 
} from 'lucide-react';

export default function AboutPage({ onStartDaily, onStartPractice }) {
  return (
    <div className="space-y-6 leading-relaxed">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          About Microbledle
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Gamified Medical Microbiology Deduction
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Designed by and for medical students, healthcare trainees, and clinical microbiology enthusiasts.
        </p>
      </div>

      {/* Hero Banner / Mission */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-500/30 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Our Mission</span>
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Medical microbiology is notoriously heavy on memorization — hundreds of bacteria, viruses, fungi, and parasites each with specific Gram stains, culture media, biochemical reactions, and first-line antibiotic regimens.
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong>Microbledle</strong> transforms this challenge into an engaging daily detective game. Instead of passive rote repetition, players analyze clinical clues, compare morphological properties, and refine their differential diagnoses step by step just like a clinical infectious disease team.
        </p>
      </div>

      {/* Core Game Features */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide text-xs">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Daily Mystery Pathogen</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Every day at 00:00 UTC, a new target pathogen is selected. You have 6 guesses to deduce the organism using color-coded feedback across Morphology & Gram Stain, Respiration, Taxonomy, and Organ Tropism.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Unlocking Progressive Clues</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Stuck on a case? Real diagnostic clues unlock as you make guesses:
              Microscope staining at Guess 2, Culture characteristics at Guess 3, and a real-world patient clinical vignette at Guess 4.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Rx Challenge (Antimicrobial Practice)</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Upon correctly identifying the bug, you unlock the Rx Challenge — pick the standard first-line antimicrobial therapy to solidify clinical pharmacological decision-making and earn bonus XP.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Bugdex Compendium</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Every solved pathogen permanently unlocks in your Bugdex library. View high-yield USMLE buzzwords, virulence factors, transmission vectors, and clinical pictures.
            </p>
          </div>
        </div>
      </div>

      {/* Who is it for? */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Who Plays Microbledle?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Medical students studying for USMLE, COMLEX & Board Exams</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Infectious disease fellows and clinical residents</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Clinical microbiology and laboratory scientists</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Pharmacy students, nurses, and life science enthusiasts</span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Free, academic, non-commercial education for the global community.</span>
        </div>

        <div className="flex items-center gap-2">
          {onStartDaily && (
            <button
              onClick={onStartDaily}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Play Today's Case
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
