import React, { useState, useEffect } from 'react';
import { 
  X, User, ShieldCheck, Award, Flame, Trophy, Check, 
  Sparkles, Stethoscope, ArrowRight, Save, LogOut, Pill, BarChart2
} from 'lucide-react';
import { 
  calculateUserProgression, 
  calculateRxXp,
  AVATAR_OPTIONS,
  generateRandomPlayerName
} from '../utils/leveling';

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  onOpenStats,
  user, 
  stats, 
  unlockedCount, 
  profile, 
  progression: propProgression,
  practiceRxBugIds = [],
  onSaveProfile,
  onLogout 
}) {
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || generateRandomPlayerName());
  const [status, setStatus] = useState(profile?.status || '');
  const [avatar, setAvatar] = useState(profile?.avatar || 'microscope');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when profile changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || generateRandomPlayerName());
      setStatus(profile.status || '');
      setAvatar(profile.avatar || 'microscope');
    }
  }, [profile, user]);

  if (!isOpen) return null;

  const progression = propProgression || calculateUserProgression(
    stats.wins, 
    unlockedCount, 
    calculateRxXp(stats, practiceRxBugIds)
  );
  const selectedAvatarObj = AVATAR_OPTIONS.find(a => a.id === avatar) || AVATAR_OPTIONS[0];

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      displayName: displayName.trim() || profile?.displayName || generateRandomPlayerName(),
      status: status.trim() || '',
      avatar: avatar,
      level: progression.level,
      title: progression.title,
      badge: progression.badge,
      updatedAt: new Date().toISOString()
    };
    onSaveProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[92vh] overflow-y-auto text-left p-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {selectedAvatarObj.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white truncate">
                {displayName}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                Lvl {progression.level}
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <span>{progression.badge}</span>
              <span className="truncate">{progression.title}</span>
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {user?.email || 'Local Player'}
            </p>
          </div>
        </div>

        {/* Level & XP Progress Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" /> Medical Experience (XP)
            </span>
            <span className="font-mono text-emerald-400 font-bold">{progression.totalXp} XP</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              style={{ width: `${progression.progressPercent}%` }} 
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Level {progression.level}</span>
            {progression.isMaxLevel ? (
              <span className="text-amber-400 font-bold">Max Rank Reached! 👑</span>
            ) : (
              <span>{progression.xpNeeded} XP to Level {progression.level + 1}</span>
            )}
          </div>
        </div>

        {/* View Personal Statistics Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenStats) onOpenStats();
          }}
          className="w-full mb-6 p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-semibold flex items-center justify-between transition text-xs group shadow-sm active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-100 text-sm">Personal Statistics</div>
              <div className="text-[11px] text-slate-400">View games, win %, streaks & antibiotic record</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Edit Profile Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Profile Icon
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setAvatar(item.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition border ${
                    avatar === item.id 
                      ? 'bg-emerald-600/30 border-emerald-500 scale-105 shadow-md' 
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-750'
                  }`}
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Username"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Status
            </label>
            <div className="relative">
              <Stethoscope className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="Type your status"
                maxLength={60}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-2xl flex items-center justify-center gap-2 text-white text-xs shadow-lg shadow-emerald-900/40 transition active:scale-[0.99]"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile & Sync
                </>
              )}
            </button>

            {user && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-rose-400 font-semibold rounded-2xl text-xs flex items-center gap-1.5 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
