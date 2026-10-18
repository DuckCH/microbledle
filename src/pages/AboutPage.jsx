import React from 'react';
import { 
  Sparkles, CheckCircle2, Heart, Play, 
  Microscope, Lightbulb, Pill, BookOpen 
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
          Guess the Mystery Microbe Every Day
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          A daily deduction puzzle designed for medical students, healthcare trainees, and science lovers.
        </p>
      </div>

      {/* Intro Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-500/30 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Why Microbledle?
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Learning microbiology often means memorizing hundreds of bacteria, viruses, fungi, and parasites — along with their stains, lab tests, and treatments.
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong>Microbledle</strong> turns study time into a fun daily puzzle game. Instead of passive flashcards, you test your deduction skills by analyzing clues, comparing properties, and solving each case in 6 tries or less.
        </p>
      </div>

      {/* How It Works */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Daily Mystery Pathogen</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              A new organism is chosen every day at midnight UTC. You have 6 guesses. Color-coded tiles guide your next guess: green for exact matches, yellow for close matches, and gray for misses.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Helpful Clues as You Guess</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Stuck on a tricky pathogen? Hints unlock as you play: Gram stain at Guess 2, lab test hint at Guess 3, and a short patient story at Guess 4.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Treatment Bonus Round (Rx)</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Once you solve the pathogen, choose the right first-line antibiotic or medicine to reinforce real-world clinical knowledge and earn bonus XP.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Your Microdex Collection</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Every pathogen you solve unlocks in your Microdex library, complete with high-yield facts, key symptoms, and microscopy pictures for easy review.
            </p>
          </div>
        </div>
      </div>

      {/* Who Plays */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Who Plays Microbledle?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Medical, nursing, and pharmacy students</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Doctors, residents, and healthcare professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Clinical laboratory scientists and microbiologists</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Biology students and word puzzle enthusiasts</span>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>100% free and educational for learners everywhere.</span>
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
