import React, { useState, useEffect } from 'react';
import { 
  X, Trophy, Medal, Crown, Calendar, Sparkles, RefreshCw, 
  Flame, Award, Search, User, Clock, ArrowRight, ShieldCheck
} from 'lucide-react';
import { getDailyLeaderboard, getAllTimeLeaderboard } from '../firebase';
import { calculateUserProgression, AVATAR_OPTIONS, RANKS } from '../utils/leveling';

export default function LeaderboardModal({ 
  isOpen, 
  onClose, 
  currentDateStr, 
  user,
  userStats,
  userProfile,
  onOpenAuth 
}) {
  const [tab, setTab] = useState('daily'); // 'daily' | 'alltime'
  const [dailyScores, setDailyScores] = useState([]);
  const [allTimeScores, setAllTimeScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      let daily = await getDailyLeaderboard(currentDateStr);
      
      // Merge current player's daily score if already recorded locally today
      const savedDaily = localStorage.getItem(`microbledle_daily_score_${currentDateStr}`);
      if (savedDaily) {
        try {
          const parsed = JSON.parse(savedDaily);
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

      // If allTime is empty or user is not yet indexed, include current user's profile
      if (userStats && userStats.wins > 0) {
        const currentUid = user ? user.uid : 'local_player';
        const inAllTime = allTime.some(a => a.id === currentUid || (user && a.id === user.uid));
        if (!inAllTime) {
          allTime.push({
            id: currentUid,
            profile: userProfile,
            displayName: userProfile?.displayName || 'Player',
            stats: userStats,
            unlockedBugIds: JSON.parse(localStorage.getItem('microbledle_unlocked_bugs') || '[]')
          });
          allTime.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0));
        }
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

  if (!isOpen) return null;

  // Filtered lists
  const filteredDaily = dailyScores.filter(item => 
    !searchTerm || item.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllTime = allTimeScores.filter(item => {
    const name = item.profile?.displayName || item.displayName || item.id;
    return !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRankBadge = (index) => {
    if (index === 0) return <span className="text-xl" title="1st Place">🥇</span>;
    if (index === 1) return <span className="text-xl" title="2nd Place">🥈</span>;
    if (index === 2) return <span className="text-xl" title="3rd Place">🥉</span>;
    return <span className="font-mono font-bold text-xs text-slate-400">#{index + 1}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Global Leaderboard
              </h2>
              <p className="text-xs text-slate-400">
                Top Player Worldwide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboards}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-emerald-400 transition"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                onClick={() => setTab('daily')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  tab === 'daily'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Today's Case ({currentDateStr})</span>
              </button>

              <button
                onClick={() => setTab('alltime')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  tab === 'alltime'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>All-Time Ranking</span>
              </button>
            </div>

            <div className="relative flex-1 max-w-[200px] hidden sm:block">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Find Player..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Leaderboard Rows Container */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          
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
                  const avatarObj = AVATAR_OPTIONS.find(a => a.id === entry.avatar) || AVATAR_OPTIONS[0];
                  const isCurrentUser = user && user.uid === entry.uid;
                  const entryTitle = entry.rankTitle || 'Pre-Med';
                  const entryLevel = entry.level || RANKS.find(r => r.title === entryTitle)?.level;
                  const entryBadge = entry.badge || RANKS.find(r => r.title === entryTitle)?.badge || '🩺';
                  const hasNonDuplicateStatus = entry.status && entry.status.trim().toLowerCase() !== entryTitle.trim().toLowerCase();

                  return (
                    <div
                      key={entry.id || idx}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isCurrentUser 
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30' 
                          : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Left: Rank & Avatar & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 text-center shrink-0">
                          {getRankBadge(idx)}
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                          {avatarObj.emoji}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white truncate">
                              {entry.displayName || 'Anonymous Player'}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1.5">
                            <span>{entryBadge}</span>
                            <span>{entryTitle}</span>
                            {entryLevel && (
                              <span className="text-emerald-500/90 font-semibold">(Lvl {entryLevel})</span>
                            )}
                            {hasNonDuplicateStatus && (
                              <span className="text-slate-400 dark:text-slate-500 font-normal truncate">
                                • {entry.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Guesses count & Grid Preview */}
                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-sm text-emerald-400">
                          {entry.guessesCount}/6 Guesses
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
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

          {/* TAB 2: All-Time Ranking */}
          {tab === 'alltime' && !loading && (
            <>
              {filteredAllTime.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No all-time players recorded yet.
                </div>
              ) : (
                filteredAllTime.map((entry, idx) => {
                  const prof = entry.profile || {};
                  const rowStats = entry.stats || {};
                  const avatarObj = AVATAR_OPTIONS.find(a => a.id === prof.avatar) || AVATAR_OPTIONS[0];
                  const prog = calculateUserProgression(
                    rowStats.wins || 0, 
                    (entry.unlockedBugIds || []).length, 
                    (rowStats.rxCorrect || 0) * 50
                  );
                  const isCurrentUser = user && user.uid === entry.id;
                  const hasNonDuplicateStatus = prof.status && prof.status.trim().toLowerCase() !== prog.title.trim().toLowerCase();

                  return (
                    <div
                      key={entry.id || idx}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isCurrentUser 
                          ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/30' 
                          : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Left: Rank & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 text-center shrink-0">
                          {getRankBadge(idx)}
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                          {avatarObj.emoji}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white truncate">
                              {prof.displayName || entry.displayName || 'Player'}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-900 text-amber-300 border border-amber-700">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-amber-400 font-medium truncate flex items-center gap-1.5">
                            <span>{prog.badge}</span>
                            <span>{prog.title}</span>
                            <span className="text-amber-500/90 font-semibold">(Lvl {prog.level})</span>
                            {hasNonDuplicateStatus && (
                              <span className="text-slate-400 dark:text-slate-500 font-normal truncate">
                                • {prof.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Career Metrics */}
                      <div className="text-right shrink-0 space-y-0.5">
                        <div className="text-sm font-black text-white">
                          <span className="text-emerald-400 text-sm sm:text-base font-mono">{rowStats.wins || 0}</span> Wins
                        </div>
                        <div className="text-xs text-slate-300 dark:text-slate-400 flex items-center justify-end gap-2 font-mono font-semibold">
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Flame className="w-3.5 h-3.5 fill-amber-400" /> {rowStats.streak || 0}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span>{prog.totalXp} XP</span>
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
          <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sign in with Google to submit your diagnoses to the global leaderboard!
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
