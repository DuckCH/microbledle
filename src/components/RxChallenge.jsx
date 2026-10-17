import React, { useState, useEffect, useMemo } from 'react';
import { Pill, CheckCircle2, XCircle, Sparkles, Award, ShieldAlert, BookOpen, Stethoscope, ArrowRight } from 'lucide-react';
import { playRxSuccessSound, playRxFailSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import microbes from '../data/microbes.json';

export default function RxChallenge({ target, isDaily, dateStr, isMuted, onAnswer }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [savedOptions, setSavedOptions] = useState(null);

  // Storage key for daily mode persistence
  const dailyStorageKey = `microbledle_daily_rx_${dateStr}`;

  // Check if daily challenge was already answered today
  useEffect(() => {
    if (isDaily && dateStr) {
      try {
        const saved = localStorage.getItem(dailyStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.answered) {
            setAnswered(true);
            setIsCorrect(Boolean(parsed.isCorrect));
            setSelectedChoice(parsed.choice);
            if (Array.isArray(parsed.options) && parsed.options.length === 4) {
              setSavedOptions(parsed.options);
            }
          }
        }
      } catch (e) {
        console.warn("Could not load daily Rx challenge state", e);
      }
    } else {
      // In practice mode, reset state on new target
      setSelectedChoice(null);
      setAnswered(false);
      setIsCorrect(false);
      setSavedOptions(null);
    }
  }, [isDaily, dateStr, target?.id]);

  // Generate 4 randomized options (1 correct + 3 distractors)
  const options = useMemo(() => {
    if (savedOptions && savedOptions.length === 4) {
      return savedOptions;
    }
    if (!target || !target.firstLineRx) return [];

    const correctRx = target.firstLineRx;

    // Filter distinct alternative first-line therapies
    const otherRxSet = new Set();
    microbes.forEach(m => {
      if (m.id !== target.id && m.firstLineRx && m.firstLineRx.trim() !== correctRx.trim()) {
        otherRxSet.add(m.firstLineRx.trim());
      }
    });

    const otherRxArray = Array.from(otherRxSet);
    // Shuffle and pick 3 distinct distractors
    const shuffled = [...otherRxArray].sort(() => 0.5 - Math.random());
    const distractors = shuffled.slice(0, 3);

    // Combine and shuffle the 4 choices
    const allFour = [correctRx, ...distractors].sort(() => 0.5 - Math.random());
    return allFour;
  }, [target?.id, target?.firstLineRx, savedOptions]);

  const handleSelect = (choice) => {
    if (answered || !target) return;

    const correct = (choice.trim() === target.firstLineRx.trim());
    setSelectedChoice(choice);
    setAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      playRxSuccessSound(isMuted);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 }
        });
      } catch (e) {}
    } else {
      playRxFailSound(isMuted);
    }

    // Save in daily mode
    if (isDaily && dateStr) {
      try {
        localStorage.setItem(dailyStorageKey, JSON.stringify({
          answered: true,
          isCorrect: correct,
          choice,
          options
        }));
      } catch (e) {}
    }

    // Notify parent component to update user stats & grant XP
    if (onAnswer) {
      onAnswer(correct);
    }
  };

  if (!target || !target.firstLineRx) return null;

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-950/90 p-4 sm:p-5 shadow-xl relative overflow-hidden mb-6 text-left">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              Attending's Empiric Rx Challenge
            </h4>
            <p className="text-[11px] text-slate-400">Post-Diagnosis Pharmacology Round</p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
          <Sparkles className="w-3 h-3 text-amber-400" />
          +50 XP
        </div>
      </div>

      {/* Case Question */}
      <div className="mb-4">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          A patient is confirmed with <span className="font-bold text-emerald-400 italic">{target.name}</span> infection. 
          Which antimicrobial regimen is the recommended <strong className="text-white">first-line empiric therapy</strong>?
        </p>
      </div>

      {/* 4 Prescription Choices */}
      <div className="space-y-2 mb-4">
        {options.map((opt, idx) => {
          const letter = letters[idx];
          const isTargetCorrect = opt.trim() === target.firstLineRx.trim();
          const isUserPick = selectedChoice === opt;

          let btnClass = "w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all duration-200 ";

          if (!answered) {
            btnClass += "border-slate-800 bg-slate-900/70 hover:border-indigo-400/80 hover:bg-indigo-500/10 text-slate-200 active:scale-[0.99] cursor-pointer";
          } else {
            if (isTargetCorrect) {
              btnClass += "border-emerald-500 bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/40 font-semibold";
            } else if (isUserPick && !isTargetCorrect) {
              btnClass += "border-rose-500 bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/50 line-through opacity-90";
            } else {
              btnClass += "border-slate-800/80 bg-slate-950/40 text-slate-500 opacity-50";
            }
          }

          let badgeClass = "w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ";
          if (!answered) {
            badgeClass += "bg-slate-800 text-slate-300 border border-slate-700";
          } else if (isTargetCorrect) {
            badgeClass += "bg-emerald-500 text-white shadow-sm";
          } else if (isUserPick && !isTargetCorrect) {
            badgeClass += "bg-rose-500 text-white shadow-sm";
          } else {
            badgeClass += "bg-slate-800/50 text-slate-500";
          }

          return (
            <button
              key={`${target.id}-${opt}-${idx}`}
              onClick={() => handleSelect(opt)}
              disabled={answered}
              className={btnClass}
            >
              <div className={badgeClass}>
                {answered && isTargetCorrect ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : answered && isUserPick && !isTargetCorrect ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  letter
                )}
              </div>
              <div className="flex-1 leading-snug pt-0.5">
                {opt}
              </div>
            </button>
          );
        })}
      </div>

      {/* Outcome Banner & Clinical Pharmacology Pearl */}
      {answered && (
        <div className="space-y-3 animate-fade pt-1">
          {isCorrect ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2.5 text-xs sm:text-sm">
              <Award className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">Correct Antimicrobial Selection!</span>
                <p className="text-[11px] text-emerald-200/90 mt-0.5">+50 Bonus XP credited toward your Medical Rank progression.</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2.5 text-xs sm:text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">Sub-optimal Empiric Choice!</span>
                <p className="text-[11px] text-rose-200/90 mt-0.5">The primary guideline therapy is highlighted in green above.</p>
              </div>
            </div>
          )}

          {/* Pharmacology Pearl Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
              <Stethoscope className="w-3.5 h-3.5" /> High-Yield Clinical Pearl
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">{target.name}</strong> ({target.commonName}): {target.buzzwords}
            </p>
            {target.virulence && (
              <p className="text-slate-400 text-[11px] leading-relaxed border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-300 font-semibold">Pathogenesis & Resistance:</span> {target.virulence}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
