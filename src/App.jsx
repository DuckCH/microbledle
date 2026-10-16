import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, AlertCircle, HelpCircle, Trophy, RotateCcw, 
  Share2, CheckCircle2, X, Sparkles, ChevronRight, Info,
  Microscope, Stethoscope, Dna, FlaskConical, Award, Flame,
  Check, Calendar, Shuffle, Volume2, VolumeX, Clock, TestTube2,
  BookOpen
} from 'lucide-react';
import microbes from './data/microbes.json';
import { playTileSound, playSelectSound, playWinSound, playDefeatSound } from './utils/audio';
import BugdexModal from './components/BugdexModal';

// Deterministic daily target pathogen using UTC date
function getDailyTarget() {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % microbes.length;
  return { target: microbes[index], dateStr };
}

// Live Countdown hook to 00:00:00 UTC
function useUtcCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const nextUtc = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0
      ));
      const diff = Math.max(0, nextUtc.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

// Gram stain badge helper
function getGramBadge(gram) {
  const g = gram.toLowerCase();
  if (g.includes('positive')) {
    return { bg: 'bg-purple-950/70 border-purple-700/60 text-purple-300', dot: 'bg-purple-400', label: 'Gram +' };
  }
  if (g.includes('negative')) {
    return { bg: 'bg-rose-950/70 border-rose-700/60 text-rose-300', dot: 'bg-rose-400', label: 'Gram −' };
  }
  if (g.includes('acid-fast')) {
    return { bg: 'bg-red-950/70 border-red-700/60 text-red-300', dot: 'bg-red-400', label: 'Acid-Fast' };
  }
  if (g.includes('spirochete')) {
    return { bg: 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300', dot: 'bg-cyan-400', label: 'Spirochete' };
  }
  return { bg: 'bg-amber-950/70 border-amber-700/60 text-amber-300', dot: 'bg-amber-400', label: 'Fungi' };
}

// Comparison evaluator logic for the 5 diagnostic columns
function evaluateGuess(guess, target) {
  // 1. Taxonomy
  const guessTax = guess.taxonomy.toLowerCase();
  const targetTax = target.taxonomy.toLowerCase();
  let taxStatus = 'incorrect';
  if (guessTax === targetTax) {
    taxStatus = 'exact';
  } else if (
    (guessTax.includes('firmicutes') && targetTax.includes('firmicutes')) ||
    (guessTax.includes('pseudomonadota') && targetTax.includes('pseudomonadota')) ||
    (guessTax.includes('gram-positive') && targetTax.includes('gram-positive')) ||
    (guessTax.includes('gram-negative') && targetTax.includes('gram-negative'))
  ) {
    taxStatus = 'partial';
  }

  // 2. Morphology: Gram status & Shape
  const gramMatch = guess.morphology.gram.toLowerCase() === target.morphology.gram.toLowerCase();
  const shapeMatch = guess.morphology.shape.toLowerCase() === target.morphology.shape.toLowerCase();
  let morphStatus = 'incorrect';
  if (gramMatch && shapeMatch) {
    morphStatus = 'exact';
  } else if (gramMatch || shapeMatch) {
    morphStatus = 'partial';
  }

  // 3. Respiration
  let respStatus = 'incorrect';
  if (guess.respiration.toLowerCase() === target.respiration.toLowerCase()) {
    respStatus = 'exact';
  } else if (
    (guess.respiration.includes('Anaerobe') && target.respiration.includes('Anaerobe')) ||
    (guess.respiration.includes('Aerobe') && target.respiration.includes('Aerobe'))
  ) {
    respStatus = 'partial';
  }

  // 4. Key Test (Biochemical markers)
  let testStatus = 'incorrect';
  if (guess.keyTest.toLowerCase() === target.keyTest.toLowerCase()) {
    testStatus = 'exact';
  } else {
    const normalizeTests = (str) => {
      return str.toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3);
    };
    const guessWords = normalizeTests(guess.keyTest);
    const targetWords = normalizeTests(target.keyTest);
    const overlap = guessWords.some(w => targetWords.includes(w));
    if (overlap) {
      testStatus = 'partial';
    }
  }

  // 5. Tropism (Organ Systems)
  let tropStatus = 'incorrect';
  if (guess.tropism.toLowerCase() === target.tropism.toLowerCase()) {
    tropStatus = 'exact';
  } else {
    const parseSites = (str) => str.toLowerCase().split(/[,&/()]+/).map(s => s.trim()).filter(Boolean);
    const guessSites = parseSites(guess.tropism);
    const targetSites = parseSites(target.tropism);
    const overlap = guessSites.some(gs => 
      targetSites.some(ts => ts.includes(gs) || gs.includes(ts))
    );
    if (overlap) {
      tropStatus = 'partial';
    }
  }

  const isWin = guess.id === target.id;

  return {
    guess,
    isWin,
    results: {
      taxonomy: { status: taxStatus, value: guess.taxonomy },
      morphology: { 
        status: morphStatus, 
        value: `${guess.morphology.gram} • ${guess.morphology.shape}`,
        gram: guess.morphology.gram,
        shape: guess.morphology.shape,
        gramMatch,
        shapeMatch
      },
      respiration: { status: respStatus, value: guess.respiration },
      keyTest: { status: testStatus, value: guess.keyTest },
      tropism: { status: tropStatus, value: guess.tropism }
    }
  };
}

export default function App() {
  const dailyInfo = useMemo(() => getDailyTarget(), []);
  const countdown = useUtcCountdown();

  const [isPractice, setIsPractice] = useState(false);
  const [target, setTarget] = useState(dailyInfo.target);
  const [dateStr, setDateStr] = useState(dailyInfo.dateStr);

  const [guesses, setGuesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showBugdexModal, setShowBugdexModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('microbledle_muted') === 'true';
  });

  // Bugdex unlocked organisms
  const [unlockedBugIds, setUnlockedBugIds] = useState(() => {
    try {
      const saved = localStorage.getItem('microbledle_unlocked_bugs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const searchInputRef = useRef(null);
  const maxGuesses = 6;

  // Persistent statistics
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    streak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0]
  });

  // Sound mute toggle
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('microbledle_muted', String(next));
      return next;
    });
  };

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('microbledle_stats_v1');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Failed to parse stats', e);
      }
    }
  }, []);

  // Load or sync game state
  useEffect(() => {
    if (isPractice) {
      setGuesses([]);
      setGameOver(false);
      setWon(false);
      setShowStatsModal(false);
    } else {
      setTarget(dailyInfo.target);
      setDateStr(dailyInfo.dateStr);
      const savedGame = localStorage.getItem(`microbledle_game_${dailyInfo.dateStr}`);
      if (savedGame) {
        try {
          const parsed = JSON.parse(savedGame);
          setGuesses(parsed.guesses || []);
          setGameOver(parsed.gameOver || false);
          setWon(parsed.won || false);
          if (parsed.gameOver) {
            setShowStatsModal(true);
          }
        } catch (e) {
          console.error('Failed to parse saved game', e);
        }
      } else {
        setGuesses([]);
        setGameOver(false);
        setWon(false);
      }
    }
  }, [isPractice, dailyInfo]);

  // Autocomplete suggestions
  const availableMicrobes = useMemo(() => {
    const guessedIds = new Set(guesses.map(g => g.guess.id));
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return microbes
      .filter(m => !guessedIds.has(m.id))
      .filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.commonName.toLowerCase().includes(term) ||
        m.taxonomy.toLowerCase().includes(term)
      )
      .slice(0, 6);
  }, [searchTerm, guesses]);

  const handleSelectMicrobe = (organism) => {
    if (gameOver || guesses.length >= maxGuesses) return;

    playSelectSound(isMuted);

    const evalResult = evaluateGuess(organism, target);
    const newGuesses = [...guesses, evalResult];
    setGuesses(newGuesses);
    setSearchTerm('');
    setIsSearchOpen(false);

    // Staggered audio chime for the revealed row
    [0, 1, 2, 3, 4].forEach((idx) => {
      setTimeout(() => {
        playTileSound(idx, isMuted);
      }, (idx + 1) * 90);
    });

    const isVictory = evalResult.isWin;
    const isLoss = !isVictory && newGuesses.length >= maxGuesses;

    if (isVictory || isLoss) {
      setTimeout(() => {
        setGameOver(true);
        setWon(isVictory);
        setShowStatsModal(true);

        if (isVictory) {
          playWinSound(isMuted);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });

          // Unlock bug in Bugdex
          setUnlockedBugIds(prev => {
            if (!prev.includes(target.id)) {
              const updated = [...prev, target.id];
              localStorage.setItem('microbledle_unlocked_bugs', JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        } else {
          playDefeatSound(isMuted);
        }
      }, 700);

      if (!isPractice) {
        setStats(prev => {
          const newPlayed = prev.played + 1;
          const newWins = isVictory ? prev.wins + 1 : prev.wins;
          const newStreak = isVictory ? prev.streak + 1 : 0;
          const newMaxStreak = Math.max(prev.maxStreak, newStreak);
          const newDist = [...prev.distribution];
          if (isVictory && newGuesses.length <= 6) {
            newDist[newGuesses.length - 1] += 1;
          }
          const updated = {
            played: newPlayed,
            wins: newWins,
            streak: newStreak,
            maxStreak: newMaxStreak,
            distribution: newDist
          };
          localStorage.setItem('microbledle_stats_v1', JSON.stringify(updated));
          return updated;
        });

        localStorage.setItem(`microbledle_game_${dateStr}`, JSON.stringify({
          guesses: newGuesses,
          gameOver: true,
          won: isVictory
        }));
      }
    } else if (!isPractice) {
      localStorage.setItem(`microbledle_game_${dateStr}`, JSON.stringify({
        guesses: newGuesses,
        gameOver: false,
        won: false
      }));
    }
  };

  const startNewPractice = () => {
    const randomIndex = Math.floor(Math.random() * microbes.length);
    setTarget(microbes[randomIndex]);
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setShowStatsModal(false);
    setSearchTerm('');
  };

  const copyEmojiGrid = () => {
    const statusMap = { exact: '🟩', partial: '🟨', incorrect: '⬛' };
    const gridRows = guesses.map(g => {
      const { taxonomy, morphology, respiration, keyTest, tropism } = g.results;
      return `${statusMap[taxonomy.status]}${statusMap[morphology.status]}${statusMap[respiration.status]}${statusMap[keyTest.status]}${statusMap[tropism.status]}`;
    }).join('\n');

    const header = isPractice ? 'Microbledle (Practice)' : `Microbledle ${dateStr}`;
    const score = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
    const playUrl = window.location.origin.includes('localhost') ? window.location.href : 'https://duckch.github.io/microbledle/';
    const text = `${header} ${score}\n\n${gridRows}\n\nPlay at: ${playUrl}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const getTileStyles = (status) => {
    switch (status) {
      case 'exact':
        return 'bg-emerald-600/90 border-emerald-500 text-white shadow-emerald-950/40 shadow-sm';
      case 'partial':
        return 'bg-amber-600/90 border-amber-500 text-white shadow-amber-950/40 shadow-sm';
      default:
        return 'bg-slate-800/90 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 md:p-6 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="w-full max-w-4xl border-b border-slate-800 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-950/30">
            <Microscope className="w-7 h-7 animate-pulse text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                MICROBLEDLE
              </h1>
              {isPractice && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Practice
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {isPractice ? 'Free Practice' : dateStr}
              </span>
              {!isPractice && (
                <span className="flex items-center gap-1 text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Next in <span className="font-mono text-emerald-300 font-semibold">{countdown}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bugdex Compendium Button */}
          <button
            onClick={() => setShowBugdexModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Bugdex USMLE Compendium"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Bugdex</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              {unlockedBugIds.length}/{microbes.length}
            </span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition ${
              isMuted 
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300' 
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Practice Mode Toggle */}
          <button
            onClick={() => {
              if (isPractice) {
                setIsPractice(false);
              } else {
                setIsPractice(true);
                startNewPractice();
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              isPractice 
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/80' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle between Daily UTC and Free Practice"
          >
            <Shuffle className="w-3.5 h-3.5" />
            {isPractice ? 'Daily Mode' : 'Practice'}
          </button>

          {isPractice && (
            <button
              onClick={startNewPractice}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition"
              title="Next Random Bug"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition"
            title="How to play"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowStatsModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
            title="Your Statistics"
          >
            <Trophy className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex-1 flex flex-col gap-6">
        
        {/* Search & Deduction Input */}
        {!gameOver ? (
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search medical pathogen (e.g., S. aureus, E. coli, TB)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 text-white placeholder-slate-500 shadow-xl transition"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && availableMicrobes.length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-2 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800 backdrop-blur-md">
                {availableMicrobes.map((bug) => {
                  const gramInfo = getGramBadge(bug.morphology.gram);
                  return (
                    <button
                      key={bug.id}
                      onClick={() => handleSelectMicrobe(bug)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-800/80 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-emerald-400 italic group-hover:text-emerald-300 flex items-center gap-2">
                          {bug.name}
                          <span className={`not-italic text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${gramInfo.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${gramInfo.dot}`} />
                            {gramInfo.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          <span className="text-slate-300 font-medium">{bug.commonName}</span> • {bug.taxonomy}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
            <div className="text-xs text-slate-400 mb-1">Diagnosis finalized for this case</div>
            <div className="font-bold text-lg text-emerald-400 italic">
              {target.name} ({target.commonName})
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Next daily case in: <span className="font-mono text-emerald-300 font-bold">{countdown}</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowStatsModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow transition inline-flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" /> View Summary & Share
              </button>
              <button
                onClick={() => setShowBugdexModal(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-emerald-400 shadow transition inline-flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Open in Bugdex
              </button>
            </div>
          </div>
        )}

        {/* Progressive Clues Section (Smear at 2, Culture at 3, Vignette at 4) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* 1. Microscopic Smear Clue (Unlocks at guess >= 2) */}
          <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${
            guesses.length >= 2
              ? 'bg-slate-900/80 border-cyan-500/40 text-slate-200 shadow-md shadow-cyan-950/20' 
              : 'bg-slate-900/30 border-slate-800/60 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                guesses.length >= 2 ? 'text-cyan-400' : 'text-slate-500'
              }`}>
                <Microscope className="w-3.5 h-3.5" /> Smear Clue
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                guesses.length >= 2 
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {guesses.length >= 2 ? 'UNLOCKED' : `Guess 2 (${guesses.length}/2)`}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {guesses.length >= 2 ? (
                <span className="italic text-cyan-100 font-serif">"{target.smear}"</span>
              ) : (
                <span className="italic text-slate-500">
                  Reveals microscopic morphology and cellular arrangement...
                </span>
              )}
            </p>
          </div>

          {/* 2. Diagnostic Culture Clue (Unlocks at guess >= 3) */}
          <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${
            guesses.length >= 3
              ? 'bg-slate-900/80 border-teal-500/40 text-slate-200 shadow-md shadow-teal-950/20' 
              : 'bg-slate-900/30 border-slate-800/60 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                guesses.length >= 3 ? 'text-teal-400' : 'text-slate-500'
              }`}>
                <TestTube2 className="w-3.5 h-3.5" /> Culture Clue
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                guesses.length >= 3 
                  ? 'bg-teal-950 text-teal-300 border border-teal-800' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {guesses.length >= 3 ? 'UNLOCKED' : `Guess 3 (${guesses.length}/3)`}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {guesses.length >= 3 ? (
                <span className="italic text-teal-100 font-serif">"{target.culture}"</span>
              ) : (
                <span className="italic text-slate-500">
                  Reveals growth media, colony appearance, and pigment...
                </span>
              )}
            </p>
          </div>

          {/* 3. Clinical Vignette Clue (Unlocks at guess >= 4) */}
          <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${
            guesses.length >= 4 
              ? 'bg-slate-900/80 border-amber-500/40 text-slate-200 shadow-md shadow-amber-950/20' 
              : 'bg-slate-900/30 border-slate-800/60 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                guesses.length >= 4 ? 'text-amber-400' : 'text-slate-500'
              }`}>
                <Stethoscope className="w-3.5 h-3.5" /> Vignette Clue
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                guesses.length >= 4 
                  ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {guesses.length >= 4 ? 'UNLOCKED' : `Guess 4 (${guesses.length}/4)`}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {guesses.length >= 4 ? (
                <span className="italic text-amber-100 font-serif">"{target.vignette}"</span>
              ) : (
                <span className="italic text-slate-500">
                  Reveals the complete USMLE patient scenario...
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Comparative Diagnostic Grid */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Diagnostic Deduction Table ({guesses.length}/{maxGuesses})</span>
            </div>
            {/* Color Legend */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block shadow-sm"></span>
                <span className="text-slate-300 font-medium">Exact Match</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-600 inline-block shadow-sm"></span>
                <span className="text-slate-300 font-medium">Partial</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700 inline-block"></span>
                <span className="text-slate-400">Incorrect</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3 w-[180px]">Organism</th>
                  <th className="py-2.5 px-2 text-center">Taxonomy</th>
                  <th className="py-2.5 px-2 text-center">Morphology</th>
                  <th className="py-2.5 px-2 text-center">Respiration</th>
                  <th className="py-2.5 px-2 text-center">Key Test</th>
                  <th className="py-2.5 px-2 text-center">Tropism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {guesses.map((item, rowIndex) => {
                  const { taxonomy, morphology, respiration, keyTest, tropism } = item.results;
                  const gramBadge = getGramBadge(morphology.gram);

                  return (
                    <tr key={rowIndex} className="tile-reveal">
                      {/* Bug Name & Badge */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-emerald-300 italic text-sm">
                          {item.guess.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${gramBadge.bg}`}>
                            {gramBadge.label}
                          </span>
                          <span className="text-[11px] text-slate-400 not-italic">
                            {item.guess.commonName}
                          </span>
                        </div>
                      </td>

                      {/* 1. Taxonomy */}
                      <td className="py-3 px-1.5 align-middle">
                        <div className={`p-2.5 rounded-xl border text-xs font-semibold leading-snug text-center ${getTileStyles(taxonomy.status)}`}>
                          {taxonomy.value}
                        </div>
                      </td>

                      {/* 2. Morphology */}
                      <td className="py-3 px-1.5 align-middle">
                        <div className={`p-2.5 rounded-xl border text-xs font-semibold leading-snug text-center ${getTileStyles(morphology.status)}`}>
                          <div>{morphology.value}</div>
                        </div>
                      </td>

                      {/* 3. Respiration */}
                      <td className="py-3 px-1.5 align-middle">
                        <div className={`p-2.5 rounded-xl border text-xs font-semibold leading-snug text-center ${getTileStyles(respiration.status)}`}>
                          {respiration.value}
                        </div>
                      </td>

                      {/* 4. Key Test */}
                      <td className="py-3 px-1.5 align-middle">
                        <div className={`p-2.5 rounded-xl border text-xs font-semibold leading-snug text-center ${getTileStyles(keyTest.status)}`}>
                          {keyTest.value}
                        </div>
                      </td>

                      {/* 5. Tropism */}
                      <td className="py-3 px-1.5 align-middle">
                        <div className={`p-2.5 rounded-xl border text-xs font-semibold leading-snug text-center ${getTileStyles(tropism.status)}`}>
                          {tropism.value}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty remaining placeholder rows */}
                {Array.from({ length: Math.max(0, maxGuesses - guesses.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="opacity-25 select-none">
                    <td className="py-3 px-3 text-slate-500 font-mono text-xs">
                      Attempt {guesses.length + i + 1}
                    </td>
                    <td className="py-3 px-1.5"><div className="h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                    <td className="py-3 px-1.5"><div className="h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                    <td className="py-3 px-1.5"><div className="h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                    <td className="py-3 px-1.5"><div className="h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                    <td className="py-3 px-1.5"><div className="h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Outcome & Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowStatsModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Verdict */}
            <div className="text-center mb-6">
              {gameOver ? (
                won ? (
                  <div className="space-y-1">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                      <Award className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-emerald-400">Diagnosis Confirmed!</h2>
                    <p className="text-xs text-slate-300">You identified the pathogen in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-2">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-rose-400">Diagnostic Failure!</h2>
                    <p className="text-xs text-slate-300">Patient needed immediate antimicrobial therapy.</p>
                  </div>
                )
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-slate-200">Microbledle Performance</h2>
                  <p className="text-xs text-slate-400">Continuous microbiology learning metrics</p>
                </div>
              )}
            </div>

            {/* Clinical Reveal Card (if Game Over) */}
            {gameOver && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    Target Organism Identified
                  </span>
                  <button
                    onClick={() => {
                      setShowStatsModal(false);
                      setShowBugdexModal(true);
                    }}
                    className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" /> View in Bugdex
                  </button>
                </div>
                <div className="text-xl font-black text-white italic">
                  {target.name}
                </div>
                <div className="text-xs text-slate-400 mb-3">{target.commonName} • {target.taxonomy}</div>
                
                <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-semibold text-emerald-400">💊 First-Line Empiric Therapy:</span>
                    <p className="text-slate-200 mt-0.5">{target.firstLineRx}</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-semibold text-cyan-400">🧫 Diagnostic Culture:</span>
                    <p className="text-slate-200 mt-0.5">{target.culture}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Statistics */}
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                Career Statistics
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-800">
                  <div className="text-2xl font-black text-white">{stats.played}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Played</div>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-800">
                  <div className="text-2xl font-black text-emerald-400">
                    {stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Win %</div>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-800">
                  <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {stats.streak}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Streak</div>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-800">
                  <div className="text-2xl font-black text-cyan-400">{stats.maxStreak}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Max</div>
                </div>
              </div>
            </div>

            {/* Guess Distribution Bars */}
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                Guess Distribution
              </div>
              <div className="space-y-1.5 text-xs">
                {stats.distribution.map((count, idx) => {
                  const maxCount = Math.max(1, ...stats.distribution);
                  const pct = Math.max(8, Math.round((count / maxCount) * 100));
                  const isCurrentRow = gameOver && won && guesses.length === idx + 1;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-3 text-right text-slate-400 font-mono text-xs">{idx + 1}</span>
                      <div className="flex-1 bg-slate-800 rounded-md overflow-hidden h-5">
                        <div 
                          style={{ width: `${pct}%` }} 
                          className={`h-full flex items-center justify-end pr-2 font-bold text-[10px] transition-all duration-500 ${
                            isCurrentRow ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Countdown to next case */}
            {!isPractice && (
              <div className="mb-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" /> Next Daily Case:
                </span>
                <span className="font-mono text-emerald-300 font-bold text-sm">{countdown}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {gameOver && (
                <button
                  onClick={copyEmojiGrid}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-2xl flex items-center justify-center gap-2 text-white shadow-lg shadow-emerald-900/40 transition active:scale-[0.99]"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      Copied Spoiler-Free Grid!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      Share Diagnostic Grid
                    </>
                  )}
                </button>
              )}

              {isPractice && gameOver && (
                <button
                  onClick={startNewPractice}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-2 text-slate-200 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Next Practice Organism
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rules & Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-emerald-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" /> How to Play Microbledle
            </h3>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Deduce the unknown target medical pathogen in <strong>6 guesses or fewer</strong>. Each guess analyzes 5 core diagnostic criteria:
            </p>

            <div className="space-y-2.5 text-xs mb-5">
              <div className="flex items-start gap-2.5 bg-slate-800/40 p-2 rounded-xl">
                <span className="w-4 h-4 rounded-md bg-emerald-600 shrink-0 mt-0.5"></span>
                <span><strong>Emerald Green:</strong> Exact match for that diagnostic property.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/40 p-2 rounded-xl">
                <span className="w-4 h-4 rounded-md bg-amber-600 shrink-0 mt-0.5"></span>
                <span><strong>Amber Yellow:</strong> Partial match (e.g. matching Gram stain, shared shape, overlapping organ tropism).</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/40 p-2 rounded-xl">
                <span className="w-4 h-4 rounded-md bg-slate-800 border border-slate-700 shrink-0 mt-0.5"></span>
                <span><strong>Slate Gray:</strong> Incorrect category or no clinical overlap.</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <Microscope className="w-4 h-4 shrink-0" />
                <span><strong>Microscopic Smear Clue:</strong> Unlocks after Guess 2.</span>
              </div>
              <div className="flex items-center gap-2 text-teal-300">
                <TestTube2 className="w-4 h-4 shrink-0" />
                <span><strong>Diagnostic Culture Clue:</strong> Unlocks after Guess 3.</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <Stethoscope className="w-4 h-4 shrink-0" />
                <span><strong>Clinical Case Vignette:</strong> Unlocks after Guess 4.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Deterministic daily pathogen updates every day at 00:00 UTC.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bugdex USMLE Compendium Modal */}
      <BugdexModal 
        isOpen={showBugdexModal}
        onClose={() => setShowBugdexModal(false)}
        unlockedBugIds={unlockedBugIds}
      />
    </div>
  );
}
