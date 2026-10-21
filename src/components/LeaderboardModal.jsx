import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Trophy, Medal, Crown, Calendar, Sparkles, RefreshCw, 
  Flame, Award, Search, User, Clock, ArrowRight, ShieldCheck, BookOpen
} from 'lucide-react';
import { getDailyLeaderboard, getAllTimeLeaderboard } from '../firebase';
import { calculateUserProgression, calculateRxXp, AVATAR_OPTIONS, RANKS } from '../utils/leveling';
import RankInfoModal from './RankInfoModal';

export default function LeaderboardModal({ 
  isOpen, 
  onClose, 
  currentDateStr, 
  user,
  userStats,
  userProfile,
  practiceRxBugIds = [],
  onOpenAuth 
}) {
  const [tab, setTab] = useState('daily'); // 'daily' | 'exp' | 'wins' | 'discovered'
  const [dailyScores, setDailyScores] = useState([]);
  const [allTimeScores, setAllTimeScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRankInfoModal, setShowRankInfoModal] = useState(false);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      let daily = await getDailyLeaderboard(currentDateStr);
      
      // Merge current player's daily score if already recorded locally today
      const savedDaily = localStorage.getItem(`microbledle_daily_score_${currentDateStr}`);
      if (savedDaily) {
        try {
          const parsed = JSON.parse(savedDaily);
          if (userProfile) {
            if (userProfile.displayName) parsed.displayName = userProfile.displayName;
            if (userProfile.avatar) parsed.avatar = userProfile.avatar;
            if (userProfile.status !== undefined) parsed.status = userProfile.status;
          }
          const currentId = user ? user.uid : localStorage.getItem('microbledle_guest_id');
          const exists = daily.some(d => (user && d.uid === user.uid) || (currentId && d.uid === currentId));
          if (!exists) {
            daily = [parsed, ...daily];
            daily.sort((a, b) => {
              const gA = Number(a.guessesCount) || 6;
              const gB = Number(b.guessesCount) || 6;
              if (gA !== gB) return gA - gB;
              const tA = a.submittedAt ? new Date(a.submittedAt).getTime() : Infinity;
              const tB = b.submittedAt ? new Date(b.submittedAt).getTime() : Infinity;
              return tA - tB;
            });
          }
        } catch (e) {
          console.warn("Could not parse local daily score", e);
        }
      }
      setDailyScores(daily);

      let allTime = await getAllTimeLeaderboard();

      // If user has activity and is not in allTime, include their local profile
      const curId = user ? user.uid : (localStorage.getItem('microbledle_guest_id') || 'local_player');
      const inAllTime = allTime.some(a => (user && a.id === user.uid) || a.id === curId);
      if (!inAllTime && ((userStats && (userStats.wins > 0 || userStats.played > 0)) || userProfile)) {
        allTime.push({
          id: curId,
          profile: userProfile || {},
          displayName: userProfile?.displayName || 'Player',
          stats: userStats || { wins: 0, streak: 0, played: 0, rxCorrect: 0 },
          unlockedBugIds: JSON.parse(localStorage.getItem('microbledle_unlocked_bugs') || '[]')
        });
      }

      setAllTimeScores(allTime);
    } catch (err) {
      console.warn("Failed to load leaderboards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboards();
    }
  }, [isOpen, currentDateStr]);

  const currentUid = user ? user.uid : (typeof window !== 'undefined' ? localStorage.getItem('microbledle_guest_id') : null);

  // Pre-process all-time records with updated user progression
  const processedAllTime = useMemo(() => {
    return allTimeScores.map(entry => {
      const isCurrent = (user && entry.id === user.uid) || (currentUid && entry.id === currentUid);
      const prof = isCurrent && userProfile ? { ...entry.profile, ...userProfile } : (entry.profile || {});
      const st = isCurrent && userStats ? { ...entry.stats, ...userStats } : (entry.stats || {});
      const unlocked = isCurrent ? JSON.parse(localStorage.getItem('microbledle_unlocked_bugs') || '[]') : (entry.unlockedBugIds || []);
      const practiceRx = isCurrent 
        ? (practiceRxBugIds?.length ? practiceRxBugIds : JSON.parse(localStorage.getItem('microbledle_practice_rx_bugs') || '[]')) 
        : (entry.practiceRxBugIds || []);
      const prog = calculateUserProgression(
        st.wins || 0,
        unlocked.length,
        calculateRxXp(st, practiceRx)
      );
      return {
        ...entry,
        profile: prof,
        displayName: prof.displayName || entry.displayName || 'Player',
        stats: st,
        unlockedBugIds: unlocked,
        prog
      };
    });
  }, [allTimeScores, user, userProfile, userStats, currentUid, practiceRxBugIds]);

  const currentUserEntry = processedAllTime.find(e => (user && e.id === user.uid) || (currentUid && e.id === currentUid));
  const currentUserLevel = currentUserEntry?.prog?.level;

  // Highest Rank List (Sorted by Total XP desc, then level desc, then wins desc)
  const allTimeExpList = useMemo(() => {
    return [...processedAllTime].sort((a, b) => {
      const xpDiff = (b.prog?.totalXp || 0) - (a.prog?.totalXp || 0);
      if (xpDiff !== 0) return xpDiff;
      const lvlDiff = (b.prog?.level || 0) - (a.prog?.level || 0);
      if (lvlDiff !== 0) return lvlDiff;
      return (b.stats?.wins || 0) - (a.stats?.wins || 0);
    });
  }, [processedAllTime]);

  // All-Time Daily Wins List (Sorted by wins desc, then streak desc, then XP desc)
  const allTimeWinsList = useMemo(() => {
    return [...processedAllTime].sort((a, b) => {
      const winsDiff = (b.stats?.wins || 0) - (a.stats?.wins || 0);
      if (winsDiff !== 0) return winsDiff;
      const streakDiff = (b.stats?.streak || 0) - (a.stats?.streak || 0);
      if (streakDiff !== 0) return streakDiff;
      return (b.prog?.totalXp || 0) - (a.prog?.totalXp || 0);
    });
  }, [processedAllTime]);

  // Highest Discovered Pathogens List (Sorted by unlocked count desc, then total XP desc, then wins desc)
  const allTimeDiscoveredList = useMemo(() => {
    return [...processedAllTime].sort((a, b) => {
      const bugsA = (a.unlockedBugIds || []).length;
      const bugsB = (b.unlockedBugIds || []).length;
      if (bugsB !== bugsA) return bugsB - bugsA;
      const xpDiff = (b.prog?.totalXp || 0) - (a.prog?.totalXp || 0);
      if (xpDiff !== 0) return xpDiff;
      return (b.stats?.wins || 0) - (a.stats?.wins || 0);
    });
  }, [processedAllTime]);

  // Filtered views based on search term
  const filteredDaily = useMemo(() => {
    return dailyScores.filter(item => 
      !searchTerm || item.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dailyScores, searchTerm]);

  const filteredExp = useMemo(() => {
    return allTimeExpList.filter(item => {
      const name = item.profile?.displayName || item.displayName || item.id;
      return !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allTimeExpList, searchTerm]);

  const filteredWins = useMemo(() => {
    return allTimeWinsList.filter(item => {
      const name = item.profile?.displayName || item.displayName || item.id;
      return !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allTimeWinsList, searchTerm]);

  const filteredDiscovered = useMemo(() => {
    return allTimeDiscoveredList.filter(item => {
      const name = item.profile?.displayName || item.displayName || item.id;
      return !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allTimeDiscoveredList, searchTerm]);

  if (!isOpen) return null;

  const getRankBadge = (index) => {
    if (index === 0) return <span className="text-xl" title="1st Place">🥇</span>;
    if (index === 1) return <span className="text-xl" title="2nd Place">🥈</span>;
    if (index === 2) return <span className="text-xl" title="3rd Place">🥉</span>;
    return <span className="font-mono font-bold text-xs text-slate-400">#{index + 1}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Header Bar */}
        <div className="p-3 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight truncate">
                Global Leaderboard
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden xs:block">
                Top Diagnosticians Worldwide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Bar (Left of Rank Info) */}
            <div className="relative w-24 xs:w-32 sm:w-44 md:w-56">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-emerald-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Find Player..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 sm:pl-8 pr-6 sm:pr-7 py-1.5 bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-inner"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Rank Info Button */}
            <button
              onClick={() => setShowRankInfoModal(true)}
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
              title="View Medical Rank Information Table"
            >
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Rank Info</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchLeaderboards}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-emerald-400 transition shrink-0"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-2.5 sm:p-4 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar scrollbar-none w-full">
            {/* Tab 1: Today's Case */}
            <button
              onClick={() => setTab('daily')}
              className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition shrink-0 ${
                tab === 'daily'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Today's Case</span>
              <span className="sm:hidden">Today</span>
            </button>

            {/* Tab 2: Highest Rank */}
            <button
              onClick={() => setTab('exp')}
              className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition shrink-0 ${
                tab === 'exp'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span className="hidden sm:inline">Highest Rank</span>
              <span className="sm:hidden">Rank</span>
            </button>

            {/* Tab 3: All-Time Daily Wins */}
            <button
              onClick={() => setTab('wins')}
              className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition shrink-0 ${
                tab === 'wins'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span className="hidden sm:inline">All-Time Daily Wins</span>
              <span className="sm:hidden">Wins</span>
            </button>

            {/* Tab 4: Highest Discovered Pathogens */}
            <button
              onClick={() => setTab('discovered')}
              className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition shrink-0 ${
                tab === 'discovered'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-cyan-200" />
              <span className="hidden sm:inline">Highest Discovered</span>
              <span className="sm:hidden">Discovered</span>
            </button>
          </div>
        </div>

        {/* Leaderboard Rows Container */}
        <div className="p-2.5 sm:p-4 overflow-y-auto flex-1 space-y-2">
          
          {loading && (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading global scores...
            </div>
          )}

          {/* TAB 1: Daily Case Leaderboard */}
          {tab === 'daily' && !loading && (
            <>
              {filteredDaily.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <p className="text-sm font-semibold text-slate-300">No diagnoses recorded yet for today!</p>
                  <p>Be the #1 player in the world to solve today's case.</p>
                </div>
              ) : (
                filteredDaily.map((entry, idx) => {
                  const isCurrentUser = user && user.uid === entry.uid;
                  const currentAvatar = isCurrentUser && userProfile?.avatar ? userProfile.avatar : entry.avatar;
                  const avatarObj = AVATAR_OPTIONS.find(a => a.id === currentAvatar) || AVATAR_OPTIONS[0];
                  const currentStatus = isCurrentUser && userProfile?.status !== undefined ? userProfile.status : entry.status;
                  const currentName = isCurrentUser && userProfile?.displayName ? userProfile.displayName : (entry.displayName || 'Anonymous Player');
                  const entryTitle = entry.rankTitle || 'Pre-Med';
                  const entryLevel = entry.level || RANKS.find(r => r.title === entryTitle)?.level;
                  const entryBadge = entry.badge || RANKS.find(r => r.title === entryTitle)?.badge || '🩺';
                  const hasNonDuplicateStatus = currentStatus && currentStatus.trim().toLowerCase() !== entryTitle.trim().toLowerCase();

                  return (
                    <div
                      key={entry.id || idx}
                      className={`p-2.5 sm:p-3 rounded-2xl border transition flex items-center justify-between gap-2 sm:gap-3 ${
                        isCurrentUser 
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30' 
                          : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Left: Rank & Avatar & Info */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-6 sm:w-7 text-center shrink-0">
                          {getRankBadge(idx)}
                        </div>

                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base sm:text-lg shrink-0">
                          {avatarObj.emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white truncate">
                              {currentName}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 border border-emerald-700 shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1 sm:gap-1.5">
                            <span>{entryBadge}</span>
                            <span>{entryTitle}</span>
                            {entryLevel && (
                              <span className="text-emerald-500/90 font-semibold">(Lvl {entryLevel})</span>
                            )}
                            {hasNonDuplicateStatus && (
                              <span className="text-slate-400 dark:text-slate-500 font-normal truncate">
                                • {currentStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Guesses count & Grid Preview */}
                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-xs sm:text-sm text-emerald-400">
                          <span className="sm:hidden">{entry.guessesCount}/6</span>
                          <span className="hidden sm:inline">{entry.guessesCount}/6 Guesses</span>
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
                          <span>
                            {entry.submittedAt 
                              ? new Date(entry.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Today'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: Highest Rank (by Total EXP) */}
          {tab === 'exp' && !loading && (
            <>
              {filteredExp.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                  <p className="font-semibold text-slate-300">No players recorded yet.</p>
                  <p>Play Daily cases, discover pathogens, and complete Rx challenges to earn EXP and level up!</p>
                </div>
              ) : (
                filteredExp.map((entry, idx) => {
                  const prof = entry.profile || {};
                  const avatarObj = AVATAR_OPTIONS.find(a => a.id === prof.avatar) || AVATAR_OPTIONS[0];
                  const prog = entry.prog;
                  const isCurrentUser = (user && user.uid === entry.id) || (currentUid && entry.id === currentUid);
                  const hasNonDuplicateStatus = prof.status && prof.status.trim() && prof.status.trim().toLowerCase() !== prog.title.trim().toLowerCase();

                  return (
                    <div
                      key={entry.id || idx}
                      className={`p-2.5 sm:p-3.5 rounded-2xl border transition flex items-center justify-between gap-2 sm:gap-3 ${
                        isCurrentUser 
                          ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/30' 
                          : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Left: Rank & Avatar & Info */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-6 sm:w-7 text-center shrink-0">
                          {getRankBadge(idx)}
                        </div>

                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base sm:text-lg shrink-0">
                          {avatarObj.emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white truncate">
                              {prof.displayName || entry.displayName || 'Player'}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-900 text-amber-300 border border-amber-700 shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          {/* If player has custom status, show it; otherwise leave blank */}
                          {hasNonDuplicateStatus && (
                            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              {prof.status}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Rank Title (ex. Resident 2) & Level / EXP */}
                      <div className="text-right shrink-0 space-y-0.5 max-w-[125px] sm:max-w-none">
                        <div className="text-xs sm:text-sm font-black text-amber-400 flex items-center justify-end gap-1 sm:gap-1.5">
                          <span className="text-xs sm:text-sm shrink-0">{prog.badge}</span>
                          <span className="truncate">{prog.title}</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-end gap-1 sm:gap-1.5 font-medium font-mono">
                          <span>Lvl {prog.level}</span>
                          <span className="text-slate-600">•</span>
                          <span>{prog.totalXp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 3: All-Time Daily Wins Ranking */}
          {tab === 'wins' && !loading && (
            <>
              {filteredWins.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                  <p className="font-semibold text-slate-300">No daily wins recorded yet.</p>
                  <p>Solve daily cases to claim your spot on the wins leaderboard!</p>
                </div>
              ) : (
                filteredWins.map((entry, idx) => {
                  const prof = entry.profile || {};
                  const rowStats = entry.stats || {};
                  const avatarObj = AVATAR_OPTIONS.find(a => a.id === prof.avatar) || AVATAR_OPTIONS[0];
                  const prog = entry.prog;
                  const isCurrentUser = (user && user.uid === entry.id) || (currentUid && entry.id === currentUid);
                  const hasNonDuplicateStatus = prof.status && prof.status.trim().toLowerCase() !== prog.title.trim().toLowerCase();

                  return (
                    <div
                      key={entry.id || idx}
                      className={`p-2.5 sm:p-3.5 rounded-2xl border transition flex items-center justify-between gap-2 sm:gap-3 ${
                        isCurrentUser 
                          ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-950/30' 
                          : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Left: Rank & Avatar & Info */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-6 sm:w-7 text-center shrink-0">
                          {getRankBadge(idx)}
                        </div>

                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base sm:text-lg shrink-0">
                          {avatarObj.emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white truncate">
                              {prof.displayName || entry.displayName || 'Player'}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-900 text-blue-300 border border-blue-700 shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-blue-400 font-medium truncate flex items-center gap-1 sm:gap-1.5">
                            <span>{prog.badge}</span>
                            <span>{prog.title}</span>
                            <span className="text-blue-500/90 font-semibold">(Lvl {prog.level})</span>
                            {hasNonDuplicateStatus && (
                              <span className="text-slate-400 dark:text-slate-500 font-normal truncate">
                                • {prof.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Daily Wins Metric */}
                      <div className="text-right shrink-0 space-y-0.5">
                        <div className="text-xs sm:text-sm font-black text-white">
                          <span className="text-emerald-400 text-xs sm:text-sm sm:text-base font-mono">{rowStats.wins || 0}</span> Wins
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-300 dark:text-slate-400 flex items-center justify-end gap-1 sm:gap-1.5 font-medium">
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 shrink-0" /> {rowStats.streak || 0}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="font-mono text-slate-400">{prog.totalXp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 4: Highest Discovered Pathogens Ranking */}
          {tab === 'discovered' && !loading && (
            <>
              {filteredDiscovered.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                  <p className="font-semibold text-slate-300">No discovered pathogens recorded yet.</p>
                  <p>Play Daily cases and Practice mode to unlock organisms in your Microdex!</p>
                </div>
              ) : (
                filteredDiscovered.map((entry, idx) => {
                  const prof = entry.profile || {};
                  const avatarObj = AVATAR_OPTIONS.find(a => a.id === prof.avatar) || AVATAR_OPTIONS[0];
                  const prog = entry.prog;
                  const isCurrentUser = (user && user.uid === entry.id) || (currentUid && entry.id === currentUid);
                  const hasNonDuplicateStatus = prof.status && prof.status.trim() && prof.status.trim().toLowerCase() !== prog.title.trim().toLowerCase();
                  const discoveredCount = (entry.unlockedBugIds || []).length;

                  return (
                    <div
                      key={entry.id || idx}
                      className={`p-2.5 sm:p-3.5 rounded-2xl border transition flex items-center justify-between gap-2 sm:gap-3 ${
                        isCurrentUser 
                          ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/30' 
                          : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Left: Rank & Avatar & Info */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-6 sm:w-7 text-center shrink-0">
                          {getRankBadge(idx)}
                        </div>

                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base sm:text-lg shrink-0">
                          {avatarObj.emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white truncate">
                              {prof.displayName || entry.displayName || 'Player'}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-900 text-cyan-300 border border-cyan-700 shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-cyan-400 font-medium truncate flex items-center gap-1 sm:gap-1.5 mt-0.5">
                            <span>{prog.badge}</span>
                            <span>{prog.title}</span>
                            {hasNonDuplicateStatus && (
                              <span className="text-slate-400 font-normal truncate">
                                • {prof.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Discovered Metric */}
                      <div className="text-right shrink-0 space-y-0.5">
                        <div className="text-xs sm:text-sm font-black text-white">
                          <span className="text-cyan-400 text-xs sm:text-sm sm:text-base font-mono">{discoveredCount}</span> <span className="text-[10px] sm:text-xs text-slate-300 font-sans font-semibold">Found</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-end gap-1 sm:gap-1.5 font-medium font-mono">
                          <span>{Math.round((discoveredCount / 70) * 100)}%</span>
                          <span className="text-slate-600">•</span>
                          <span>{prog.totalXp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

        </div>

        {/* Footer Prompt if Not Logged In */}
        {!user && (
          <div className="p-2.5 sm:p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Sign in to submit your rank & diagnoses!</span>
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Medical Rank Information Scale Modal */}
      <RankInfoModal
        isOpen={showRankInfoModal}
        onClose={() => setShowRankInfoModal(false)}
        currentLevel={currentUserLevel}
      />
    </div>
  );
}
