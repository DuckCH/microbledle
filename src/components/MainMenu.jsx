import React from 'react';
import { 
  Play, Shuffle, BookOpen, Trophy, Award, HelpCircle, 
  User, Volume2, VolumeX, Smartphone, Calendar, Clock, 
  Flame, Sparkles, ChevronRight, Stethoscope, Dna, CheckCircle2,
  AlertCircle, ShieldCheck, Pill, ArrowRight, ExternalLink
} from 'lucide-react';

export default function MainMenu({
  onStartDaily,
  onStartPractice,
  onOpenBugdex,
  onOpenLeaderboard,
  onOpenStats,
  onOpenProfile,
  onOpenHelp,
  onOpenAuth,
  onOpenInstall,
  isStandalone,
  user,
  profile,
  progression,
  currentAvatarObj,
  stats,
  unlockedBugIds = [],
  totalBugsCount = 40,
  dailyInfo,
  countdown,
  dailyGameState,
  isMuted,
  onToggleMute,
  cloudSynced
}) {
  const isDailyGameOver = dailyGameState?.gameOver;
  const isDailyWon = dailyGameState?.won;
  const dailyGuessesCount = dailyGameState?.guesses?.length || 0;

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const bugdexPercentage = Math.round((unlockedBugIds.length / totalBugsCount) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade pb-10">
      
      {/* Top Utility Bar */}
      <div className="w-full flex items-center justify-between py-2 border-b border-slate-800/80 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hospital Duty Ready
          </span>
          {cloudSynced ? (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Cloud Synced
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
              Local Offline Profile
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border text-xs transition flex items-center gap-1.5 ${
              isMuted 
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300' 
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 shadow-sm'
            }`}
            title={isMuted ? 'Sound Muted' : 'Sound Active'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Install App Button if not standalone */}
          {!isStandalone && onOpenInstall && (
            <button
              onClick={onOpenInstall}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Install Microbledle as App"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* User Sign In / Account Button */}
          {!user ? (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 text-slate-200 hover:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={onOpenProfile}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <span>{currentAvatarObj.emoji}</span>
              <span className="max-w-[100px] truncate">{profile.displayName || 'Physician'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Brand Title & Logo */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="relative mb-3 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-3xl blur-lg group-hover:blur-xl transition duration-500" />
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/80 bg-slate-900 ring-4 ring-emerald-500/20 flex items-center justify-center transform group-hover:scale-105 transition duration-300">
            <img 
              src="./apple-touch-icon.png" 
              alt="Microbledle Official Brand Logo" 
              className="w-full h-full object-cover rounded-2xl" 
            />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
          MICROBLEDLE
        </h1>
        <p className="text-sm md:text-base font-medium text-slate-300 mt-1 max-w-md">
          Daily Clinical Microbiology Deduction Game
        </p>
        <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
          Deduce pathogens, prescribe first-line antimicrobials, and advance through 16 Thai medical ranks.
        </p>
      </div>

      {/* Physician Clinical ID Badge Card (Clickable to Edit Profile) */}
      <div 
        onClick={onOpenProfile}
        className="w-full bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-700/80 hover:border-emerald-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-emerald-950/30 text-left"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition">
              {currentAvatarObj.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition">
                  {profile.displayName || 'Physician'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                  {progression.badge} Level {progression.level}
                </span>
              </div>
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span>{progression.title}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-normal">{profile.status || 'Medical Student'}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
            <div className="text-xs text-slate-400 sm:text-right">
              <span className="font-bold text-white text-sm">{progression.totalXp}</span> XP Total
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 group-hover:underline">
              <span>View & Edit Profile</span>
              <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5 space-y-1">
          <div className="w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progression.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>{progression.progressPercent}% to next rank</span>
            {progression.isMaxLevel ? (
              <span className="text-amber-400 font-bold">Max Rank Reached! 👑</span>
            ) : (
              <span>{progression.xpNeeded} XP needed for Level {progression.level + 1}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Mode Action Cards (2 Columns: Daily vs Practice) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD 1: DAILY CLINICAL CASE */}
        <div className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Daily Case
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
                {dailyInfo?.dateStr}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-300 transition">
              Daily Case Deduction
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Diagnose today's mystery pathogen in 6 guesses or fewer. Compete on the daily Global Leaderboard!
            </p>

            {/* Current Daily Status Indicator */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isDailyGameOver ? (
                  isDailyWon ? (
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )
                ) : dailyGuessesCount > 0 ? (
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Calendar className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-200">
                    {isDailyGameOver
                      ? (isDailyWon ? `Confirmed in ${dailyGuessesCount} Guesses` : 'Diagnostic Failure')
                      : dailyGuessesCount > 0
                      ? `In Progress (${dailyGuessesCount}/6 Guesses)`
                      : "Today's Patient Ready"}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {isDailyGameOver ? 'Case completed for today' : 'Deterministic case for all physicians'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Next Case
                </div>
                <div className="font-mono text-emerald-300 font-bold text-xs">{countdown}</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onStartDaily}
            className="mt-5 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 active:scale-[0.99] transition"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>
              {isDailyGameOver 
                ? 'Review Case & Rx Challenge' 
                : dailyGuessesCount > 0 
                ? 'Resume Daily Case' 
                : 'Start Daily Case'}
            </span>
          </button>
        </div>

        {/* CARD 2: FREE PRACTICE WARD */}
        <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-950 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-cyan-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header info */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
                <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                Endless Mode
              </span>
              <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800">
                40 Bugs
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition">
              Free Practice Ward
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Continuous rounds on random high-yield organisms from our full USMLE library without affecting daily streaks.
            </p>

            {/* Feature highlights */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Unlimited cases with full progressive clues</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Includes post-game Empiric Rx pharmacology rounds</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Unlocks Bugdex entries & earns rank XP on wins</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onStartPractice}
            className="mt-5 w-full py-3.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60 active:scale-[0.99] transition"
          >
            <Shuffle className="w-4 h-4" />
            <span>Enter Practice Ward</span>
          </button>
        </div>

      </div>

      {/* Operations Hub (Bugdex, Leaderboard, Career Stats, Help) */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* BUGDEX COMPENDIUM BUTTON */}
        <button
          onClick={onOpenBugdex}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition flex flex-col justify-between text-left group shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
              {unlockedBugIds.length}/{totalBugsCount}
            </span>
          </div>
          <div>
            <div className="text-sm font-black text-white group-hover:text-emerald-300 transition">
              Bugdex
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Microbiology compendium ({bugdexPercentage}%)
            </p>
          </div>
        </button>

        {/* GLOBAL LEADERBOARD BUTTON */}
        <button
          onClick={onOpenLeaderboard}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition flex flex-col justify-between text-left group shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
              Rankings
            </span>
          </div>
          <div>
            <div className="text-sm font-black text-white group-hover:text-amber-300 transition">
              Leaderboard
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Daily solvers & Hall of Fame
            </p>
          </div>
        </button>

        {/* CAREER STATISTICS BUTTON */}
        <button
          onClick={onOpenStats}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition flex flex-col justify-between text-left group shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> {stats.streak}
            </span>
          </div>
          <div>
            <div className="text-sm font-black text-white group-hover:text-cyan-300 transition">
              Performance
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              {stats.played} played • {winRate}% win rate
            </p>
          </div>
        </button>

        {/* CLINICAL RULES / HOW TO PLAY BUTTON */}
        <button
          onClick={onOpenHelp}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition flex flex-col justify-between text-left group shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">
              Rules
            </span>
          </div>
          <div>
            <div className="text-sm font-black text-white group-hover:text-indigo-300 transition">
              How to Play
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              5 clinical deduction columns
            </p>
          </div>
        </button>

      </div>

      {/* Quick Summary Pill Bar */}
      <div className="w-full p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-around gap-4 text-center text-xs">
        <div>
          <div className="text-lg font-black text-white">{stats.played}</div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Cases Played</div>
        </div>
        <div className="w-px h-8 bg-slate-800 hidden sm:block" />
        <div>
          <div className="text-lg font-black text-emerald-400">{stats.wins}</div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Diagnoses Confirmed</div>
        </div>
        <div className="w-px h-8 bg-slate-800 hidden sm:block" />
        <div>
          <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 fill-amber-400" /> {stats.streak}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Daily Streak</div>
        </div>
        <div className="w-px h-8 bg-slate-800 hidden sm:block" />
        <div>
          <div className="text-lg font-black text-indigo-400 flex items-center justify-center gap-1">
            <Pill className="w-4 h-4" /> {stats.rxCorrect || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Rx Prescriptions Solved</div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-500 pt-2 space-y-1">
        <p>Microbledle v1.3.0 • Built with High-Yield USMLE & Thai Medical Curriculum</p>
        <p>40 Clinical Pathogens across Bacteria, Viruses, Fungi, Parasites & Atypicals</p>
      </div>

    </div>
  );
}
