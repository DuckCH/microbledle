import React from 'react';
import { X, Award, Crown, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RANKS } from '../utils/leveling';

export default function RankInfoModal({ isOpen, onClose, currentLevel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade text-left">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/95">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Rank Information</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                17-Level Medical Training & Hierarchy Scale
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
          
          {/* How to Earn XP Quick Banner */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>How Medical Experience (EXP) is Gained</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Daily Case Solved:</strong> +100 XP per victory</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Daily Antibiotic Quiz:</strong> +50 XP per correct Rx</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>New Pathogen Discovery:</strong> +50 XP (one-time per organism)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Practice Antibiotic Quiz:</strong> +50 XP (one-time per new organism)</span>
              </div>
            </div>
          </div>

          {/* Rank Table */}
          <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                  <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-center w-12 sm:w-14">Level</th>
                  <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center w-10 sm:w-12">Badge</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-4">Rank</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-right">Min XP</th>
                  <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-right">Max XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {RANKS.map((rank) => {
                  const isCurrent = currentLevel === rank.level;
                  const isMaxLevel = rank.maxXp === Infinity;

                  return (
                    <tr
                      key={rank.level}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-amber-500/15 text-white font-bold border-l-4 border-l-amber-400'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      {/* Level */}
                      <td className="py-2 sm:py-2.5 px-2 sm:px-4 text-center font-mono font-bold">
                        <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] ${
                          isCurrent 
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                            : 'bg-slate-800/80 text-slate-400'
                        }`}>
                          {rank.level}
                        </span>
                      </td>

                      {/* Badge */}
                      <td className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-center text-base sm:text-lg">
                        {rank.badge}
                      </td>

                      {/* Rank Title */}
                      <td className="py-2 sm:py-2.5 px-2.5 sm:px-4 font-semibold text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className={isCurrent ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                            {rank.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-300 border border-amber-600 shrink-0">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Min XP */}
                      <td className="py-2 sm:py-2.5 px-2 sm:px-4 text-right font-mono text-[11px] sm:text-xs text-slate-400">
                        {rank.minXp.toLocaleString()}
                      </td>

                      {/* Max XP */}
                      <td className="py-2 sm:py-2.5 px-2 sm:px-4 text-right font-mono font-bold text-[11px] sm:text-xs">
                        {isMaxLevel ? (
                          <span className="text-amber-400 font-black text-sm">∞</span>
                        ) : (
                          <span className="text-slate-300">{rank.maxXp.toLocaleString()}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Progression synced across game modes & cloud accounts.</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition shrink-0 ml-2"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
