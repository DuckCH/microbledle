import React, { useState, useMemo } from 'react';
import { 
  X, Calendar, Flame, Trophy, Award, BarChart2, Pill, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Lock, Play, ArrowRight, Sparkles, BookOpen, Clock, ShieldCheck, RotateCcw 
} from 'lucide-react';
import { 
  getStreakHealth, 
  getLast7DaysStreak, 
  getMonthCalendarData, 
  formatFriendlyDate 
} from '../utils/streak';
import { getTodayDateStr } from '../utils/dailyTarget';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DailyCalendarModal({
  isOpen,
  onClose,
  stats = {},
  historyMap = {},
  todayDateStr = getTodayDateStr(),
  onSelectDateToPlay,
  onResetAndPlayArchive,
  onOpenLeaderboard,
  onOpenMicrodex,
  initialTab = 'calendar' // 'calendar' | 'stats'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Calendar year and month state (defaults to today's UTC month)
  const todayParts = useMemo(() => todayDateStr.split('-').map(Number), [todayDateStr]);
  const [viewYear, setViewYear] = useState(todayParts[0]);
  const [viewMonth, setViewMonth] = useState(todayParts[1] - 1); // 0-indexed

  // Selected date cell for inspection (defaults to today)
  const [selectedDateStr, setSelectedDateStr] = useState(todayDateStr);

  // Calculate streak health
  const streakHealth = useMemo(() => {
    return getStreakHealth(stats, todayDateStr);
  }, [stats, todayDateStr]);

  // Last 7 days flame tracking
  const last7Days = useMemo(() => {
    return getLast7DaysStreak(historyMap, todayDateStr);
  }, [historyMap, todayDateStr]);

  // Calendar grid data
  const calendarData = useMemo(() => {
    return getMonthCalendarData(viewYear, viewMonth, historyMap, todayDateStr);
  }, [viewYear, viewMonth, historyMap, todayDateStr]);

  // Selected cell data
  const selectedCell = useMemo(() => {
    if (!selectedDateStr) return null;
    return calendarData.cells.find(c => c.dateStr === selectedDateStr) || null;
  }, [calendarData, selectedDateStr]);

  if (!isOpen) return null;

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(todayParts[0]);
    setViewMonth(todayParts[1] - 1);
    setSelectedDateStr(todayDateStr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden text-left">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              {activeTab === 'calendar' ? (
                <Calendar className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-emerald-400" />
              ) : (
                <BarChart2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-cyan-400" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                {activeTab === 'calendar' ? 'Daily Case Calendar' : 'Personal Statistics'}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {activeTab === 'calendar' ? 'Track your daily streak & case archive' : 'Win rate, guesses & antibiotic performance'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 sm:p-3 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl w-full">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'calendar'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Calendar & Streak</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'stats'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 shrink-0" />
              <span>Statistics</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-4">

          {/* TAB 1: DAILY CALENDAR & STREAK */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              
              {/* STREAK HEALTH & PROGRESS BANNER */}
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/30 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                          {streakHealth.currentStreak}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Day Streak
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400">
                        {streakHealth.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Record</div>
                    <div className="text-base sm:text-lg font-black text-white font-mono flex items-center justify-end gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{streakHealth.maxStreak}</span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Flame Track */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Recent 7 Days</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {last7Days.filter(d => d.isSolved).length}/7 Solved
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
                    {last7Days.map(day => (
                      <div
                        key={day.dateStr}
                        onClick={() => setSelectedDateStr(day.dateStr)}
                        className={`p-1 sm:p-1.5 rounded-xl border transition cursor-pointer flex flex-col items-center gap-0.5 ${
                          day.dateStr === selectedDateStr 
                            ? 'ring-2 ring-emerald-400 border-emerald-400' 
                            : ''
                        } ${
                          day.isSolved 
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                            : day.isFailed 
                            ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                            : day.isToday
                            ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-[9px] font-semibold text-slate-400">{day.dayLabel}</span>
                        <div className="w-5 h-5 flex items-center justify-center">
                          {day.isSolved ? (
                            <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                          ) : day.isFailed ? (
                            <X className="w-3.5 h-3.5 text-rose-400" />
                          ) : day.isToday ? (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                          )}
                        </div>
                        <span className="text-[9px] font-mono font-bold">
                          {day.guessesCount ? `${day.guessesCount}/6` : day.dayNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MONTHLY CALENDAR GRID */}
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
                {/* Month Navigator */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 sm:p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition border border-slate-700"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </h3>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 sm:p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition border border-slate-700"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Jump to Today Button */}
                  {(viewYear !== todayParts[0] || viewMonth !== todayParts[1] - 1) && (
                    <button
                      onClick={handleJumpToToday}
                      className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold hover:bg-emerald-900/60 transition"
                    >
                      Today
                    </button>
                  )}
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800/80">
                  {WEEKDAY_NAMES.map(d => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {calendarData.cells.map(cell => {
                    if (cell.isPadding) {
                      return <div key={cell.key} className="h-10 sm:h-12" />;
                    }

                    const isSelected = cell.dateStr === selectedDateStr;

                    return (
                      <button
                        key={cell.key}
                        onClick={() => setSelectedDateStr(cell.dateStr)}
                        disabled={cell.isFuture}
                        className={`h-10 sm:h-12 rounded-xl p-1 flex flex-col items-center justify-between text-left transition relative border ${
                          isSelected
                            ? 'ring-2 ring-emerald-400 z-10'
                            : ''
                        } ${
                          cell.isFuture
                            ? 'bg-slate-900/30 border-slate-800/40 text-slate-700 cursor-not-allowed opacity-40'
                            : cell.isSolved
                            ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900/50'
                            : cell.isFailed
                            ? 'bg-rose-950/50 border-rose-500/60 text-rose-200 hover:bg-rose-900/50'
                            : cell.isToday
                            ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 shadow-md shadow-amber-950/50'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className={`text-[10px] sm:text-xs font-bold ${cell.isToday ? 'text-amber-400' : ''}`}>
                            {cell.dayNumber}
                          </span>
                          {cell.isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Today" />
                          )}
                          {cell.isFuture && (
                            <Lock className="w-2.5 h-2.5 text-slate-600" />
                          )}
                        </div>

                        {/* Status Marker */}
                        <div className="w-full flex items-center justify-center">
                          {cell.isSolved && (
                            <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/60">
                              {cell.guessesCount ? `${cell.guessesCount}` : '✓'}
                            </span>
                          )}
                          {cell.isFailed && (
                            <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-rose-900/80 text-rose-300 border border-rose-700/60">
                              ✕
                            </span>
                          )}
                          {!cell.isSolved && !cell.isFailed && !cell.isFuture && (
                            <span className={`text-[9px] font-mono ${cell.isToday ? 'text-amber-300 font-bold' : 'text-slate-600'}`}>
                              {cell.isToday ? 'Play' : '•'}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED DAY INSPECTION / ACTION CARD */}
              {selectedCell && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-lg space-y-3 animate-fade">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2.5">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{formatFriendlyDate(selectedCell.dateStr)}</span>
                        {selectedCell.isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-900 text-amber-300 border border-amber-700">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {selectedCell.isSolved
                          ? `Solved in ${selectedCell.guessesCount || 1} guesses`
                          : selectedCell.isFailed
                          ? 'Case not solved (6/6 guesses used)'
                          : selectedCell.isToday
                          ? 'Case available to solve now'
                          : selectedCell.isFuture
                          ? 'Case locked until this date'
                          : 'Unplayed past case (Study in Archive Mode • No EXP/Stats)'}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0">
                      {selectedCell.isSolved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-950 border border-emerald-500 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                        </span>
                      ) : selectedCell.isFailed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-950 border border-rose-500 text-rose-300">
                          <XCircle className="w-3.5 h-3.5" /> Missed
                        </span>
                      ) : selectedCell.isToday ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-950 border border-amber-500 text-amber-300">
                          <Clock className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : selectedCell.isFuture ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-500">
                          <Lock className="w-3.5 h-3.5" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-400">
                          Archive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pathogen / Clue details */}
                  <div className="space-y-1.5 text-xs">
                    {selectedCell.isSolved || selectedCell.isFailed ? (
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Diagnosed Pathogen</span>
                          <span className="text-white font-bold">{selectedCell.targetBug.name}</span>
                          <span className="text-slate-400 text-[11px] block">{selectedCell.targetBug.commonName}</span>
                        </div>
                        {onOpenMicrodex && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenMicrodex(selectedCell.targetBug);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Microdex</span>
                          </button>
                        )}
                      </div>
                    ) : !selectedCell.isFuture ? (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 italic">
                        "{selectedCell.targetBug.chiefComplaint}"
                      </div>
                    ) : null}
                  </div>

                  {/* Action Button */}
                  {!selectedCell.isFuture && onSelectDateToPlay && (
                    selectedCell.isToday && !selectedCell.isSolved ? (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectDateToPlay(selectedCell.dateStr);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-md bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>Start Today's Case</span>
                      </button>
                    ) : selectedCell.isSolved ? (
                      <div className="space-y-1.5 w-full">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectDateToPlay(selectedCell.dateStr);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200"
                        >
                          <ArrowRight className="w-4 h-4 text-emerald-400" />
                          <span>Review Case Resolution</span>
                        </button>
                        {!selectedCell.isToday && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (onResetAndPlayArchive) {
                                onResetAndPlayArchive(selectedCell.dateStr);
                              } else {
                                onSelectDateToPlay(selectedCell.dateStr);
                              }
                            }}
                            className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-purple-500/40 text-purple-300 hover:bg-purple-950/50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Replay Case (Study Fresh)</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 w-full text-center">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectDateToPlay(selectedCell.dateStr);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md bg-purple-600 hover:bg-purple-500 text-white"
                        >
                          <Play className="w-4 h-4" />
                          <span>Study Past Case ({formatFriendlyDate(selectedCell.dateStr)})</span>
                        </button>
                        <p className="text-[10px] text-slate-400">
                          Archive Mode: Study only (no XP, rank, streaks, or stats recorded).
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: NUMERIC STATISTICS & DISTRIBUTION */}
          {activeTab === 'stats' && (
            <div className="space-y-5 animate-fade">
              
              {/* Overall Statistics 4-Box Grid */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                <div className="p-2 sm:p-3 bg-slate-800/60 rounded-xl sm:rounded-2xl border border-slate-800">
                  <div className="text-lg sm:text-2xl font-black text-white">{stats.played || 0}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Played</div>
                </div>
                <div className="p-2 sm:p-3 bg-slate-800/60 rounded-xl sm:rounded-2xl border border-slate-800">
                  <div className="text-lg sm:text-2xl font-black text-emerald-400">
                    {(stats.played || 0) > 0 ? Math.round(((stats.wins || 0) / stats.played) * 100) : 0}%
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Win %</div>
                </div>
                <div className="p-2 sm:p-3 bg-slate-800/60 rounded-xl sm:rounded-2xl border border-slate-800">
                  <div className="text-lg sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-0.5 sm:gap-1">
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 shrink-0" />
                    <span>{streakHealth.currentStreak}</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Streak</div>
                </div>
                <div className="p-2 sm:p-3 bg-slate-800/60 rounded-xl sm:rounded-2xl border border-slate-800">
                  <div className="text-lg sm:text-2xl font-black text-cyan-400">{streakHealth.maxStreak}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Max</div>
                </div>
              </div>

              {/* Antibiotic Challenge Stat Row */}
              <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">Antibiotic Challenge</span>
                    <p className="text-[11px] text-slate-400">
                      {stats.rxCorrect || 0} / {stats.rxAttempted || 0} Solved
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-indigo-400">
                    {stats.rxAttempted ? Math.round(((stats.rxCorrect || 0) / stats.rxAttempted) * 100) : 0}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Win %</div>
                </div>
              </div>

              {/* Guess Distribution Bars */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Guess Distribution
                </div>
                <div className="space-y-1.5 text-xs">
                  {(stats.distribution || [0, 0, 0, 0, 0, 0]).map((count, idx) => {
                    const maxCount = Math.max(1, ...(stats.distribution || [0, 0, 0, 0, 0, 0]));
                    const pct = Math.max(8, Math.round((count / maxCount) * 100));
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-3 text-right text-slate-400 font-mono text-xs">{idx + 1}</span>
                        <div className="flex-1 bg-slate-800 rounded-md overflow-hidden h-5">
                          <div 
                            style={{ width: `${pct}%` }} 
                            className="h-full flex items-center justify-end pr-2 font-bold text-[10px] transition-all duration-500 bg-emerald-500/80 text-slate-950"
                          >
                            {count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View Global Leaderboard Button */}
              {onOpenLeaderboard && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLeaderboard();
                  }}
                  className="w-full py-3 bg-slate-800/90 hover:bg-slate-750 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition text-xs sm:text-sm"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>View Global Leaderboard</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Streaks reset at 00:00:00 UTC daily</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
