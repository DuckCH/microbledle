import React from 'react';
import { 
  Play, Shuffle, BookOpen, Trophy, Award, HelpCircle, 
  User, Volume2, VolumeX, Calendar, Clock, 
  Flame, Sparkles, ChevronRight, CheckCircle2,
  AlertCircle, ShieldCheck, Pill, Sun, Moon
} from 'lucide-react';

export default function MainMenu({
  onStartDaily,
  onStartPractice,
  onOpenMicrodex,
  onOpenLeaderboard,
  onOpenStats,
  onOpenProfile,
  onOpenHelp,
  onOpenAuth,
  onOpenInfo,
  user,
  profile,
  progression,
  currentAvatarObj,
  stats,
  unlockedBugIds = [],
  totalBugsCount = 70,
  dailyInfo,
  countdown,
  dailyGameState,
  isMuted,
  onToggleMute,
  cloudSynced,
  theme = 'dark',
  onToggleTheme
}) {
  const isDailyGameOver = dailyGameState?.gameOver;
  const isDailyWon = dailyGameState?.won;
  const dailyGuessesCount = dailyGameState?.guesses?.length || 0;

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const microdexPercentage = Math.round((unlockedBugIds.length / totalBugsCount) * 100);
  const handleOpenMicrodex = onOpenMicrodex;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade pb-4">
      
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/80 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 dark:border-emerald-500/30 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Beta version
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-400/50 transition flex items-center justify-center shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-2xl border transition flex items-center justify-center ${
              isMuted 
                ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300' 
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shadow-sm'
            }`}
            title={isMuted ? 'Sound Muted' : 'Sound Active'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
          </button>



          {/* User Account / Profile Button */}
          {!user ? (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:border-emerald-500/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <User className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-2 transition shadow-sm"
            >
              <span className="text-base sm:text-lg">{currentAvatarObj.emoji}</span>
              <span className="max-w-[120px] truncate">{profile.displayName || 'Player'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col items-center text-center pt-1 sm:pt-2">
        <div className="relative mb-2 sm:mb-3 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-3xl blur-lg group-hover:blur-xl transition duration-500" />
          <div className="relative w-14 h-14 sm:w-20 md:w-24 sm:h-20 md:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/80 bg-slate-950 ring-2 sm:ring-4 ring-emerald-500/20 flex items-center justify-center transform group-hover:scale-105 transition duration-300">
            <img 
              src="./apple-touch-icon.png" 
              alt="Microbledle Logo" 
              className="w-full h-full object-cover rounded-xl sm:rounded-2xl" 
            />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
          MICROBLEDLE
        </h1>
        <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 uppercase tracking-wider">
          Daily Medical Microbiology Game
        </p>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Find the pathogen • Choose the treatment
        </p>
      </div>

      {/* Physician Profile Card (Click to Edit) */}
      <div 
        onClick={onOpenProfile}
        className="w-full bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/70 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-950/90 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/60 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-md dark:shadow-2xl relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-emerald-950/30 text-left"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-100 dark:via-slate-800 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0 group-hover:scale-105 transition">
              {currentAvatarObj.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
                  {profile.displayName || 'Player'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                  {progression.badge} Level {progression.level}
                </span>
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span>{progression.title}</span>
                {profile.status ? (
                  <>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">{profile.status}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-2.5 sm:pt-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{progression.totalXp}</span> XP Total
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 group-hover:underline">
              <span>Edit Profile</span>
              <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 sm:mt-3.5 space-y-1">
          <div className="w-full bg-slate-200 dark:bg-slate-950/80 rounded-full h-2 sm:h-2.5 overflow-hidden border border-slate-300 dark:border-slate-800">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progression.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span>{progression.progressPercent}% to next rank</span>
            {progression.isMaxLevel ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">Max Rank Reached! 👑</span>
            ) : (
              <span>{progression.xpNeeded} XP to Level {progression.level + 1}</span>
            )}
          </div>
        </div>
      </div>

      {/* New Daily Case Available Countdown Bar */}
      <div className="w-full py-2.5 sm:py-3.5 px-3.5 sm:px-4 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1 sm:gap-1.5 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm uppercase tracking-wide">
            New Daily Case Available in
          </span>
        </div>
        <div className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-xl sm:text-3xl tracking-widest bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 sm:px-5 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl shadow-sm">
          {countdown || '--:--:--'}
        </div>
      </div>

      {/* Main Game Mode Cards (Daily vs Practice) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        
        {/* CARD 1: DAILY CASE */}
        <div className="rounded-2xl sm:rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-50/90 via-white to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-emerald-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Daily Case
              </span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                {dailyInfo?.dateStr}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
              Daily Case
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Diagnose today's mystery pathogen in 6 guesses.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onStartDaily}
            className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/60 active:scale-[0.99] transition"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>
              {isDailyGameOver 
                ? 'Review Case' 
                : dailyGuessesCount > 0 
                ? 'Resume Case' 
                : 'Start Daily Case'}
            </span>
          </button>
        </div>

        {/* CARD 2: PRACTICE MODE */}
        <div className="rounded-3xl border border-cyan-400 dark:border-cyan-500/40 bg-gradient-to-br from-cyan-50/90 via-white to-slate-50 dark:from-cyan-950/30 dark:via-slate-900 dark:to-slate-950 p-5 sm:p-6 shadow-md dark:shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
                <Shuffle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Endless Mode
              </span>
              <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                40 Pathogens
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
              Practice Mode
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Unlimited random cases to train anytime without affecting your streak.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onStartPractice}
            className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 dark:shadow-cyan-950/60 active:scale-[0.99] transition"
          >
            <Shuffle className="w-4 h-4" />
            <span>Start Practice</span>
          </button>
        </div>

      </div>

      {/* Feature Hub (Microdex, Leaderboard, Statistics, How to Play) */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* MICRODEX */}
        <button
          onClick={handleOpenMicrodex}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition flex flex-col justify-between text-left group shadow-sm dark:shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition">
              <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              {unlockedBugIds.length}/{totalBugsCount}
            </span>
          </div>
          <div className="w-full">
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
              Microdex
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-800 mt-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(0, microdexPercentage))}%` }}
              />
            </div>
          </div>
        </button>

        {/* LEADERBOARD */}
        <button
          onClick={onOpenLeaderboard}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition flex flex-col justify-between text-left group shadow-sm dark:shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 group-hover:scale-110 transition">
              <Trophy className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Rankings
            </span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
              Leaderboard
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Global rankings
            </p>
          </div>
        </button>

        {/* PERSONAL STATISTICS */}
        <button
          onClick={onOpenStats}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition flex flex-col justify-between text-left group shadow-sm dark:shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition">
              <Award className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800 flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {stats.streak}
            </span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
              Statistics
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Personal stats & streak
            </p>
          </div>
        </button>

        {/* HOW TO PLAY */}
        <button
          onClick={onOpenHelp}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition flex flex-col justify-between text-left group shadow-sm dark:shadow-lg"
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition">
              <HelpCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              Rules
            </span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
              How to Play
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Rules & tutorial
            </p>
          </div>
        </button>

      </div>

    </div>
  );
}
