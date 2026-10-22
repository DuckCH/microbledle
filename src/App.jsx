import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, AlertCircle, HelpCircle, Trophy, 
  Share2, CheckCircle2, X, Sparkles, ChevronRight, Info,
  Microscope, Stethoscope, Dna, FlaskConical, Award, Flame,
  Check, Calendar, Shuffle, Volume2, VolumeX, Clock, TestTube2,
  BookOpen, User, LogOut, Cloud, ShieldCheck, Pill,
  ArrowLeft, ArrowRight, Home, Sun, Moon, FileText, BarChart2,
  Mail, AlertTriangle, Menu, RotateCcw
} from 'lucide-react';
import microbes from './data/microbes.json';
import { playTileSound, playSelectSound, playWinSound, playDefeatSound } from './utils/audio';
import { calculateUserProgression, calculateRxXp, AVATAR_OPTIONS, generateRandomPlayerName } from './utils/leveling';
import MicrodexModal from './components/MicrodexModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import LeaderboardModal from './components/LeaderboardModal';
import RxChallenge from './components/RxChallenge';
import MainMenu from './components/MainMenu';
import DischargeCardModal from './components/DischargeCardModal';
import InfoModal from './components/InfoModal';
import DailyCalendarModal from './components/DailyCalendarModal';
import StaticPageLayout from './pages/StaticPageLayout';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ReferencesPage from './pages/ReferencesPage';
import { getDailyTarget, getTodayDateStr } from './utils/dailyTarget';
import { loadDailyHistory, saveDailyHistoryEntry, getYesterdayDateStr } from './utils/streak';
import { 
  auth, 
  logoutUser, 
  saveUserProgress, 
  loadUserProgress, 
  isFirebaseConfigured,
  submitDailyScore,
  updateDailyScoreProfile,
  logAnalyticsEvent
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

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

// Diagnostic category / Gram stain badge helper
function getGramBadge(gram) {
  const g = gram.toLowerCase();
  if (g.includes('virus') || g.includes('viral') || g.includes('rna') || g.includes('dna')) {
    return { bg: 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300', dot: 'bg-emerald-400', label: 'Virus' };
  }
  if (g.includes('parasite') || g.includes('protozo') || g.includes('flagellate') || g.includes('amoeba')) {
    return { bg: 'bg-teal-950/70 border-teal-700/60 text-teal-300', dot: 'bg-teal-400', label: 'Parasite' };
  }
  if (g.includes('fungal') || g.includes('fungi') || g.includes('yeast') || g.includes('mold')) {
    return { bg: 'bg-amber-950/70 border-amber-700/60 text-amber-300', dot: 'bg-amber-400', label: 'Fungi' };
  }
  if (g.includes('acid-fast')) {
    return { bg: 'bg-red-950/70 border-red-700/60 text-red-300', dot: 'bg-red-400', label: 'Acid-Fast' };
  }
  if (g.includes('spirochete')) {
    return { bg: 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300', dot: 'bg-cyan-400', label: 'Spirochete' };
  }
  if (g.includes('no cell wall') || g.includes('atypical') || g.includes('intracellular')) {
    return { bg: 'bg-indigo-950/70 border-indigo-700/60 text-indigo-300', dot: 'bg-indigo-400', label: 'Atypical' };
  }
  if (g.includes('positive')) {
    return { bg: 'bg-purple-950/70 border-purple-700/60 text-purple-300', dot: 'bg-purple-400', label: 'Gram +' };
  }
  if (g.includes('negative')) {
    return { bg: 'bg-rose-950/70 border-rose-700/60 text-rose-300', dot: 'bg-rose-400', label: 'Gram −' };
  }
  return { bg: 'bg-slate-800/70 border-slate-700/60 text-slate-300', dot: 'bg-slate-400', label: 'Microbe' };
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
    (guessTax.includes('actinomycetota') && targetTax.includes('actinomycetota')) ||
    (guessTax.includes('campylobacterota') && targetTax.includes('campylobacterota')) ||
    (guessTax.includes('spirochaetota') && targetTax.includes('spirochaetota')) ||
    (guessTax.includes('spirochete') && targetTax.includes('spirochete')) ||
    (guessTax.includes('chlamydiaceae') && targetTax.includes('chlamydiaceae')) ||
    (guessTax.includes('mollicutes') && targetTax.includes('mollicutes')) ||
    (guessTax.includes('ascomycota') && targetTax.includes('ascomycota')) ||
    (guessTax.includes('basidiomycota') && targetTax.includes('basidiomycota')) ||
    (guessTax.includes('apicomplexa') && targetTax.includes('apicomplexa')) ||
    (guessTax.includes('amoebozoa') && targetTax.includes('amoebozoa')) ||
    (guessTax.includes('metamonada') && targetTax.includes('metamonada')) ||
    (guessTax.includes('flaviviridae') && targetTax.includes('flaviviridae')) ||
    (guessTax.includes('retroviridae') && targetTax.includes('retroviridae')) ||
    (guessTax.includes('herpesviridae') && targetTax.includes('herpesviridae')) ||
    (guessTax.includes('orthomyxoviridae') && targetTax.includes('orthomyxoviridae')) ||
    (guessTax.includes('rhabdoviridae') && targetTax.includes('rhabdoviridae')) ||
    (guessTax.includes('pneumoviridae') && targetTax.includes('pneumoviridae')) ||
    (guessTax.includes('paramyxoviridae') && targetTax.includes('paramyxoviridae')) ||
    (guessTax.includes('caliciviridae') && targetTax.includes('caliciviridae')) ||
    (guessTax.includes('hepadnaviridae') && targetTax.includes('hepadnaviridae')) ||
    (guessTax.includes('gram-positive') && targetTax.includes('gram-positive')) ||
    (guessTax.includes('gram-negative') && targetTax.includes('gram-negative')) ||
    (guessTax.includes('virus') && targetTax.includes('virus')) ||
    ((guessTax.includes('fungi') || guessTax.includes('fungus')) && (targetTax.includes('fungi') || targetTax.includes('fungus'))) ||
    (guessTax.includes('parasite') && targetTax.includes('parasite')) ||
    (guessTax.includes('protozoa') && targetTax.includes('protozoa')) ||
    (guessTax.includes('acid-fast') && targetTax.includes('acid-fast'))
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
    (guess.respiration.includes('Aerobe') && target.respiration.includes('Aerobe')) ||
    (guess.respiration.toLowerCase().includes('intracellular') && target.respiration.toLowerCase().includes('intracellular'))
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

  const [currentScreen, setCurrentScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['about', 'contact', 'privacy', 'terms', 'references'].includes(hash)) {
        return hash;
      }
    }
    return 'menu';
  });
  const [returnScreen, setReturnScreen] = useState('menu');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['about', 'contact', 'privacy', 'terms', 'references'].includes(hash)) {
        setCurrentScreen(hash);
      } else if (!hash && ['about', 'contact', 'privacy', 'terms', 'references'].includes(currentScreen)) {
        setCurrentScreen('menu');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentScreen]);

  const navigateToPage = (pageId) => {
    if (['menu', 'game'].includes(currentScreen)) {
      setReturnScreen(currentScreen);
    }
    if (typeof window !== 'undefined') {
      window.location.hash = pageId;
    }
    setCurrentScreen(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromPage = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
    setCurrentScreen(returnScreen || 'menu');
  };

  const [isPractice, setIsPractice] = useState(false);
  const isPracticeRef = useRef(isPractice);
  useEffect(() => {
    isPracticeRef.current = isPractice;
  }, [isPractice]);

  const [isArchive, setIsArchive] = useState(false);
  const isArchiveRef = useRef(isArchive);
  useEffect(() => {
    isArchiveRef.current = isArchive;
  }, [isArchive]);
  const [target, setTarget] = useState(dailyInfo.target);
  const [dateStr, setDateStr] = useState(dailyInfo.dateStr);
  const dateStrRef = useRef(dateStr);
  useEffect(() => {
    dateStrRef.current = dateStr;
  }, [dateStr]);

  const [guesses, setGuesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [calendarInitialTab, setCalendarInitialTab] = useState('calendar');
  const [dailyHistory, setDailyHistory] = useState(() => loadDailyHistory());
  const [showCaseResultModal, setShowCaseResultModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showMicrodexModal, setShowMicrodexModal] = useState(false);
  const [microdexInitialBug, setMicrodexInitialBug] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState(null); // 'about' | 'contact' | 'privacy' | 'terms' | 'sources' | null
  const [mobileClueTab, setMobileClueTab] = useState('clinical'); // 'clinical' | 'smear' | 'culture' | 'vignette'
  const [showMobileToolsModal, setShowMobileToolsModal] = useState(false);

  // Auto-switch mobile clue tab to newest unlocked clue
  useEffect(() => {
    if (guesses.length === 0) setMobileClueTab('clinical');
    else if (guesses.length === 2) setMobileClueTab('smear');
    else if (guesses.length === 3) setMobileClueTab('culture');
    else if (guesses.length >= 4) setMobileClueTab('vignette');
  }, [guesses.length]);
  // Theme Management (Light / Dark mode, strictly defaults to dark theme on first visit)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('microbledle_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('microbledle_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      logAnalyticsEvent('theme_toggled', { theme: nextTheme });
      return nextTheme;
    });
  };

  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('microbledle_muted') === 'true';
  });

  // Current authenticated user (Firebase user or demo user)
  const [user, setUser] = useState(null);
  const [cloudSynced, setCloudSynced] = useState(false);

  // User Profile
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('microbledle_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.displayName && parsed.displayName !== 'Physician') {
          return parsed;
        }
        const upgraded = {
          displayName: generateRandomPlayerName(),
          status: parsed?.status || '',
          avatar: parsed?.avatar || 'microscope'
        };
        localStorage.setItem('microbledle_profile', JSON.stringify(upgraded));
        return upgraded;
      }
      const initial = {
        displayName: generateRandomPlayerName(),
        status: '',
        avatar: 'microscope'
      };
      localStorage.setItem('microbledle_profile', JSON.stringify(initial));
      return initial;
    } catch {
      return {
        displayName: generateRandomPlayerName(),
        status: '',
        avatar: 'microscope'
      };
    }
  });

  // Microdex unlocked organisms
  const [unlockedBugIds, setUnlockedBugIds] = useState(() => {
    try {
      const saved = localStorage.getItem('microbledle_unlocked_bugs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Practice Rx Challenge solved organisms (prevents infinite practice EXP farming)
  const [practiceRxBugIds, setPracticeRxBugIds] = useState(() => {
    try {
      const saved = localStorage.getItem('microbledle_practice_rx_bugs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track if current solved target is a new discovery (to give EXP only once per pathogen in practice)
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const maxGuesses = 6;

  // Persistent statistics
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    streak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    rxAttempted: 0,
    rxCorrect: 0,
    dailyRxWins: 0
  });

  // Progression calculation (including Rx Challenge bonus XP)
  const progression = useMemo(() => {
    const rxBonusXp = calculateRxXp(stats, practiceRxBugIds);
    return calculateUserProgression(stats.wins, unlockedBugIds.length, rxBonusXp);
  }, [stats.wins, stats.dailyRxWins, stats.rxCorrect, unlockedBugIds.length, practiceRxBugIds]);

  const currentAvatarObj = useMemo(() => {
    return AVATAR_OPTIONS.find(a => a.id === profile?.avatar) || AVATAR_OPTIONS[0];
  }, [profile?.avatar]);

  // Sound mute toggle
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('microbledle_muted', String(next));
      return next;
    });
  };

  // Handle post-game Empiric Rx Challenge answer
  const handleRxAnswer = (isCorrect, rxPayload) => {
    // In Archive mode: User will NOT gain any XP/Level/Win rate or record progression (study only)
    if (isArchiveRef.current) {
      if (rxPayload) {
        const rxSaveData = {
          dateStr,
          ...rxPayload,
          isArchive: true,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(`microbledle_daily_rx_${dateStr}`, JSON.stringify(rxSaveData));
      }
      return;
    }

    if (!isPractice) {
      // Daily case: always eligible if correct and not already answered today
      setStats(prev => {
        if (prev.lastDailyRxDate === dateStr) {
          return prev;
        }

        const updated = {
          ...prev,
          lastDailyRxDate: dateStr,
          dailyRxWins: (prev.dailyRxWins || 0) + (isCorrect ? 1 : 0),
          rxAttempted: (prev.rxAttempted || 0) + 1,
          rxCorrect: (prev.rxCorrect || 0) + (isCorrect ? 1 : 0)
        };
        localStorage.setItem('microbledle_stats_v1', JSON.stringify(updated));
        if (user && isFirebaseConfigured) {
          saveUserProgress(user.uid, { stats: updated });
        }
        return updated;
      });

      if (rxPayload) {
        const rxSaveData = {
          dateStr,
          ...rxPayload,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(`microbledle_daily_rx_${dateStr}`, JSON.stringify(rxSaveData));
        if (user && isFirebaseConfigured) {
          saveUserProgress(user.uid, { lastDailyRx: rxSaveData });
        }
      }
    } else {
      // Practice mode:
      // EXP is gained ONLY ONCE per pathogen, and ONLY if diagnosed for the first time
      // ("If you diagnosed the pathogen that you already discovered/diagnose, you will not gain any EXP from Diagnose or the Antibiotics Challenge.")
      const isEligibleForExp = isNewDiscovery && !practiceRxBugIds.includes(target.id);

      if (isEligibleForExp && isCorrect) {
        setPracticeRxBugIds(prev => {
          if (!prev.includes(target.id)) {
            const updated = [...prev, target.id];
            localStorage.setItem('microbledle_practice_rx_bugs', JSON.stringify(updated));
            if (user && isFirebaseConfigured) {
              saveUserProgress(user.uid, { practiceRxBugIds: updated });
            }
            return updated;
          }
          return prev;
        });
      }

      setStats(prev => {
        const updated = {
          ...prev,
          rxAttempted: (prev.rxAttempted || 0) + 1,
          rxCorrect: (prev.rxCorrect || 0) + (isCorrect ? 1 : 0)
        };
        localStorage.setItem('microbledle_stats_v1', JSON.stringify(updated));
        if (user && isFirebaseConfigured) {
          saveUserProgress(user.uid, { stats: updated });
        }
        return updated;
      });
    }
  };

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('microbledle_stats_v1');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setStats(prev => ({
          ...prev,
          ...parsed,
          rxAttempted: parsed.rxAttempted || 0,
          rxCorrect: parsed.rxCorrect || 0,
          dailyRxWins: parsed.dailyRxWins !== undefined ? parsed.dailyRxWins : Math.min(parsed.rxCorrect || 0, parsed.wins || 0)
        }));
      } catch (e) {
        console.error('Failed to parse stats', e);
      }
    }
  }, []);

  // Centralized Bi-Directional Cloud Sync across devices
  const syncWithCloud = async (authUser) => {
    if (!authUser || !isFirebaseConfigured) return;
    try {
      const todayStr = dailyInfo.dateStr;
      const cloudData = await loadUserProgress(authUser.uid);

      // 1. Read local storage snapshots directly
      const localStats = JSON.parse(localStorage.getItem('microbledle_stats_v1') || '{}');
      const localBugs = JSON.parse(localStorage.getItem('microbledle_unlocked_bugs') || '[]');
      const localProfile = JSON.parse(localStorage.getItem('microbledle_profile') || '{}');
      const localDaily = JSON.parse(localStorage.getItem(`microbledle_game_${todayStr}`) || 'null');
      const localRx = JSON.parse(localStorage.getItem(`microbledle_daily_rx_${todayStr}`) || 'null');

      const cloudDaily = cloudData?.lastDailyGame;
      const cloudRx = cloudData?.lastDailyRx;

      const isCloudToday = cloudDaily?.dateStr === todayStr;
      const isLocalToday = localDaily?.dateStr === todayStr;

      // 2. Duplicate Replay & Overwrite Auto-Healing
      // If local device has an authentic multi-guess solve (e.g. 4/6) for today,
      // but cloud has an accidental single-guess replay (1/6) from another device:
      const localHasMultiGuessSolve = isLocalToday && localDaily?.gameOver && localDaily?.won && (localDaily?.guesses?.length || 0) > 1;
      const cloudHasSingleGuessSolve = isCloudToday && cloudDaily?.gameOver && cloudDaily?.won && (cloudDaily?.guesses?.length || 0) === 1;

      let resolvedDailyGame = null;
      let shouldFixLeaderboard = false;
      let shouldDeductDuplicate = false;

      if (localHasMultiGuessSolve && cloudHasSingleGuessSolve) {
        resolvedDailyGame = localDaily;
        shouldFixLeaderboard = true;
        shouldDeductDuplicate = true;
      } else if (isLocalToday && localDaily?.gameOver) {
        resolvedDailyGame = localDaily;
      } else if (isCloudToday && cloudDaily?.gameOver) {
        resolvedDailyGame = cloudDaily;
      } else if (isLocalToday && isCloudToday) {
        resolvedDailyGame = (localDaily?.guesses?.length || 0) >= (cloudDaily?.guesses?.length || 0) ? localDaily : cloudDaily;
      } else if (isCloudToday) {
        resolvedDailyGame = cloudDaily;
      } else if (isLocalToday) {
        resolvedDailyGame = localDaily;
      }

      // 3. MERGE stats
      let currentPlayed = Math.max(localStats.played || 0, cloudData?.stats?.played || 0);
      let currentWins = Math.max(localStats.wins || 0, cloudData?.stats?.wins || 0);
      let currentStreak = Math.max(localStats.streak || 0, cloudData?.stats?.streak || 0);
      let currentMaxStreak = Math.max(localStats.maxStreak || 0, cloudData?.stats?.maxStreak || 0);
      let currentRxAttempted = Math.max(localStats.rxAttempted || 0, cloudData?.stats?.rxAttempted || 0);
      let currentRxCorrect = Math.max(localStats.rxCorrect || 0, cloudData?.stats?.rxCorrect || 0);
      let currentDailyRxWins = Math.max(localStats.dailyRxWins || 0, cloudData?.stats?.dailyRxWins || 0);
      if (currentDailyRxWins === 0 && (currentRxCorrect > 0 || currentWins > 0)) {
        currentDailyRxWins = Math.min(currentRxCorrect, currentWins);
      }

      const baseDist = localStats.distribution || [0, 0, 0, 0, 0, 0];
      const cloudDist = cloudData?.stats?.distribution || [0, 0, 0, 0, 0, 0];
      let currentDist = baseDist.map((val, idx) => Math.max(val, cloudDist[idx] || 0));

      if (shouldDeductDuplicate) {
        if (currentDist[0] > 0) {
          currentDist[0] = Math.max(0, currentDist[0] - 1);
        }
        currentPlayed = Math.max(0, currentPlayed - 1);
        currentWins = Math.max(0, currentWins - 1);
      }

      const mergedStats = {
        played: currentPlayed,
        wins: currentWins,
        streak: currentStreak,
        maxStreak: currentMaxStreak,
        distribution: currentDist,
        rxAttempted: currentRxAttempted,
        rxCorrect: currentRxCorrect,
        dailyRxWins: currentDailyRxWins,
        lastDailyDate: cloudData?.stats?.lastDailyDate || localStats.lastDailyDate || (resolvedDailyGame?.gameOver ? todayStr : null),
        lastDailyRxDate: cloudData?.stats?.lastDailyRxDate || localStats.lastDailyRxDate || null
      };

      setStats(mergedStats);
      localStorage.setItem('microbledle_stats_v1', JSON.stringify(mergedStats));

      // 4. MERGE Microdex collection (union of unique IDs)
      const mergedBugs = Array.from(new Set([...localBugs, ...(cloudData?.unlockedBugIds || [])]));
      setUnlockedBugIds(mergedBugs);
      localStorage.setItem('microbledle_unlocked_bugs', JSON.stringify(mergedBugs));

      // 4b. MERGE Practice Rx solved list
      const localPracticeRx = JSON.parse(localStorage.getItem('microbledle_practice_rx_bugs') || '[]');
      const mergedPracticeRx = Array.from(new Set([...localPracticeRx, ...(cloudData?.practiceRxBugIds || [])]));
      setPracticeRxBugIds(mergedPracticeRx);
      localStorage.setItem('microbledle_practice_rx_bugs', JSON.stringify(mergedPracticeRx));

      // 5. MERGE Profile information
      const mergedProfile = {
        ...localProfile,
        ...(cloudData?.profile || {}),
        displayName: cloudData?.profile?.displayName || authUser.displayName || localProfile.displayName || generateRandomPlayerName()
      };
      setProfile(mergedProfile);
      localStorage.setItem('microbledle_profile', JSON.stringify(mergedProfile));

      // 6. SYNC Daily Game state across devices:
      // Cache resolvedDailyGame to localStorage, but ONLY overwrite active in-game state
      // if player is currently on TODAY'S live daily case.
      // NEVER overwrite active state if user is in Archive Mode, Practice Mode, or playing a different date.
      if (resolvedDailyGame) {
        localStorage.setItem(`microbledle_game_${todayStr}`, JSON.stringify(resolvedDailyGame));
        const isCurrentActiveLiveDaily = !isPracticeRef.current && !isArchiveRef.current && dateStrRef.current === todayStr;
        if (isCurrentActiveLiveDaily) {
          setGuesses(resolvedDailyGame.guesses || []);
          setGameOver(Boolean(resolvedDailyGame.gameOver));
          setWon(Boolean(resolvedDailyGame.won));
        }
      }

      // 7. SYNC Daily Rx Challenge state
      let resolvedRx = null;
      if (cloudRx?.dateStr === todayStr && cloudRx?.answered) {
        resolvedRx = cloudRx;
      } else if (localRx?.dateStr === todayStr && localRx?.answered) {
        resolvedRx = localRx;
      }
      if (resolvedRx) {
        localStorage.setItem(`microbledle_daily_rx_${todayStr}`, JSON.stringify(resolvedRx));
      }

      // 8. RESTORE authentic leaderboard score if previously overwritten
      if (shouldFixLeaderboard && localDaily?.guesses?.length) {
        const prog = calculateUserProgression(mergedStats.wins, mergedBugs.length, (mergedStats.rxCorrect || 0) * 50);
        const restoredScore = {
          uid: authUser.uid,
          displayName: mergedProfile.displayName || authUser.displayName || generateRandomPlayerName(),
          avatar: mergedProfile.avatar || 'microscope',
          status: mergedProfile.status || '',
          level: prog.level,
          rankTitle: prog.title,
          badge: prog.badge,
          guessesCount: localDaily.guesses.length,
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem(`microbledle_daily_score_${todayStr}`, JSON.stringify(restoredScore));
        await submitDailyScore(todayStr, authUser.uid, restoredScore, true);
      } else {
        const savedDailyScore = localStorage.getItem(`microbledle_daily_score_${todayStr}`);
        if (savedDailyScore) {
          try {
            const parsed = JSON.parse(savedDailyScore);
            await submitDailyScore(todayStr, authUser.uid, {
              ...parsed,
              uid: authUser.uid,
              displayName: mergedProfile.displayName || authUser.displayName || generateRandomPlayerName()
            });
          } catch (e) {}
        }
      }

      // 9. PUSH merged unified progress to Firestore
      await saveUserProgress(authUser.uid, {
        stats: mergedStats,
        unlockedBugIds: mergedBugs,
        profile: mergedProfile,
        email: authUser.email,
        displayName: mergedProfile.displayName,
        ...(resolvedDailyGame ? { lastDailyGame: resolvedDailyGame } : {}),
        ...(resolvedRx ? { lastDailyRx: resolvedRx } : {})
      });

      setCloudSynced(true);
    } catch (err) {
      console.warn("Error during cloud sync:", err);
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      const savedDemo = localStorage.getItem('microbledle_demo_user');
      if (savedDemo) {
        try {
          setUser(JSON.parse(savedDemo));
          setCloudSynced(true);
        } catch (e) {}
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await syncWithCloud(authUser);
      } else {
        setUser(null);
        setCloudSynced(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Cloud Sync on tab focus or visibility change
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;

    let isSyncing = false;
    const handleSync = async () => {
      if (document.visibilityState === 'visible' && !isSyncing) {
        isSyncing = true;
        try {
          await syncWithCloud(user);
        } catch (err) {
          console.warn("Auto-sync on focus failed:", err);
        } finally {
          isSyncing = false;
        }
      }
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    return () => {
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, [user, isPractice]);

  // Click / touch outside listener to dismiss pathogen search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Save profile changes to BOTH Local Storage and Cloud Firestore
  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('microbledle_profile', JSON.stringify(updatedProfile));

    if (user && isFirebaseConfigured) {
      await saveUserProgress(user.uid, {
        profile: updatedProfile,
        displayName: updatedProfile.displayName
      });
      await updateDailyScoreProfile(dateStr, user.uid, updatedProfile);
    }

    // Also update local cached daily score for today
    try {
      const savedDaily = localStorage.getItem(`microbledle_daily_score_${dateStr}`);
      if (savedDaily) {
        const parsed = JSON.parse(savedDaily);
        parsed.displayName = updatedProfile.displayName;
        parsed.avatar = updatedProfile.avatar;
        parsed.status = updatedProfile.status || '';
        localStorage.setItem(`microbledle_daily_score_${dateStr}`, JSON.stringify(parsed));
      }
    } catch (e) {}
  };

  // Handle Demo Login
  const handleDemoLogin = (demoUser) => {
    setUser(demoUser);
    setCloudSynced(true);
    localStorage.setItem('microbledle_demo_user', JSON.stringify(demoUser));
    if (demoUser.displayName) {
      const updated = { ...profile, displayName: demoUser.displayName };
      setProfile(updated);
      localStorage.setItem('microbledle_profile', JSON.stringify(updated));
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await logoutUser();
    }
    setUser(null);
    setCloudSynced(false);
    localStorage.removeItem('microbledle_demo_user');
  };

  // Load or sync game state
  useEffect(() => {
    // CRITICAL: If in Archive mode or currently viewing a past date, do NOT overwrite with dailyInfo
    if (isArchiveRef.current || isArchive || dateStrRef.current !== dailyInfo.dateStr) {
      return;
    }

    if (isPractice) {
      setGuesses([]);
      setGameOver(false);
      setWon(false);
      setShowStatsModal(false);
      setShowCaseResultModal(false);
    } else {
      setTarget(dailyInfo.target);
      setDateStr(dailyInfo.dateStr);
      dateStrRef.current = dailyInfo.dateStr;
      const savedGame = localStorage.getItem(`microbledle_game_${dailyInfo.dateStr}`);
      if (savedGame) {
        try {
          const parsed = JSON.parse(savedGame);
          setGuesses(parsed.guesses || []);
          setGameOver(parsed.gameOver || false);
          setWon(parsed.won || false);
          if (parsed.gameOver && currentScreen === 'game') {
            setShowCaseResultModal(true);
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
  }, [isPractice, isArchive, dailyInfo]);

  // Autocomplete suggestions (pathogen name)
  // When search box is clicked/focused, shows ALL available pathogens from A to Z, scrollable
  // Typing filters the A to Z list by their 1st letter / prefix
  const availableMicrobes = useMemo(() => {
    const guessedIds = new Set(guesses.map(g => g.guess.id));
    const unguesseds = microbes.filter(m => !guessedIds.has(m.id));
    
    // Sort all remaining pathogens from A to Z by scientific name
    const sorted = [...unguesseds].sort((a, b) => a.name.localeCompare(b.name));

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      // Return complete A to Z list when search box is empty
      return sorted;
    }

    return sorted.filter(m => {
      const nameLower = m.name.toLowerCase();

      // Filter by 1st letter / prefix: e.g. typing 'a' -> only A pathogens, 'b' -> B pathogens, 'st' -> Staph/Strep
      if (nameLower.startsWith(term)) {
        return true;
      }

      // Also support standard medical abbreviation with genus initial: e.g. "s. aureus" or "e. coli"
      if (term.includes('.') || term.includes(' ')) {
        const cleaned = term.replace('.', '').trim().split(/\s+/);
        if (cleaned.length >= 2) {
          const genusInitial = cleaned[0];
          const speciesPrefix = cleaned[1];
          const nameWords = nameLower.split(' ');
          if (nameWords.length >= 2 && nameWords[0].startsWith(genusInitial) && nameWords[1].startsWith(speciesPrefix)) {
            return true;
          }
        }
      }

      return false;
    });
  }, [searchTerm, guesses]);

  const handleKeyDown = (e) => {
    if (!isSearchOpen || availableMicrobes.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev + 1) % availableMicrobes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchSelectedIndex(prev => (prev - 1 + availableMicrobes.length) % availableMicrobes.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchSelectedIndex >= 0 && searchSelectedIndex < availableMicrobes.length) {
        handleSelectMicrobe(availableMicrobes[searchSelectedIndex]);
      } else if (searchTerm.trim() && availableMicrobes.length > 0) {
        handleSelectMicrobe(availableMicrobes[0]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchSelectedIndex(-1);
    }
  };

  const handleSelectMicrobe = (organism) => {
    if (gameOver || guesses.length >= maxGuesses) return;

    playSelectSound(isMuted);

    const evalResult = evaluateGuess(organism, target);
    const newGuesses = [...guesses, evalResult];
    setGuesses(newGuesses);
    setSearchTerm('');
    setIsSearchOpen(false);
    setSearchSelectedIndex(-1);

    // Staggered audio chime for the revealed row
    [0, 1, 2, 3, 4].forEach((idx) => {
      setTimeout(() => {
        playTileSound(idx, isMuted);
      }, (idx + 1) * 90);
    });

    const isVictory = evalResult.isWin;
    const isLoss = !isVictory && newGuesses.length >= maxGuesses;

    // Track guess submitted
    logAnalyticsEvent('guess_submitted', {
      guess_number: newGuesses.length,
      pathogen: organism.name,
      is_correct: isVictory,
      mode: isPractice ? 'practice' : 'daily'
    });

    if (isVictory || isLoss) {
      logAnalyticsEvent('game_complete', {
        outcome: isVictory ? 'victory' : 'defeat',
        guesses_count: newGuesses.length,
        mode: isPractice ? 'practice' : 'daily',
        pathogen: target.name
      });

      setTimeout(() => {
        setGameOver(true);
        setWon(isVictory);
        setShowCaseResultModal(true);

        if (isVictory) {
          playWinSound(isMuted);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });

          // In Archive mode, user will NOT gain any XP/Level or Microdex unlock progression (study only)
          if (!isArchiveRef.current) {
            // Check if pathogen was already discovered before unlocking
            const wasAlreadyDiscovered = unlockedBugIds.includes(target.id);
            setIsNewDiscovery(!wasAlreadyDiscovered);

            // Unlock pathogen in Microdex & Save to BOTH Local and Cloud
            setUnlockedBugIds(prev => {
              if (!prev.includes(target.id)) {
                const updated = [...prev, target.id];
                localStorage.setItem('microbledle_unlocked_bugs', JSON.stringify(updated));
                if (user && isFirebaseConfigured) {
                  saveUserProgress(user.uid, { unlockedBugIds: updated });
                }
                return updated;
              }
              return prev;
            });
          } else {
            setIsNewDiscovery(false);
          }
        } else {
          playDefeatSound(isMuted);
        }
      }, 700);

      // In Archive mode: Do not update user stats, streaks, or win rate
      if (!isPractice && !isArchiveRef.current) {
        setStats(prev => {
          if (prev.lastDailyDate === dateStr) {
            console.log("Daily stats already recorded for date:", dateStr);
            return prev;
          }

          const isTodayCase = dateStr === dailyInfo.dateStr;
          const yesterdayStr = getYesterdayDateStr(dailyInfo.dateStr);

          const newPlayed = prev.played + 1;
          const newWins = isVictory ? prev.wins + 1 : prev.wins;
          
          let newStreak = prev.streak || 0;
          if (isTodayCase) {
            if (isVictory) {
              if (prev.lastDailyDate === yesterdayStr) {
                newStreak = (prev.streak || 0) + 1;
              } else {
                newStreak = 1;
              }
            } else {
              newStreak = 0;
            }
          }

          const newMaxStreak = Math.max(prev.maxStreak || 0, newStreak);
          const newDist = [...(prev.distribution || [0, 0, 0, 0, 0, 0])];
          if (isVictory && newGuesses.length <= 6) {
            newDist[newGuesses.length - 1] = (newDist[newGuesses.length - 1] || 0) + 1;
          }
          const updated = {
            ...prev,
            lastDailyDate: isTodayCase ? dateStr : (prev.lastDailyDate || dateStr),
            played: newPlayed,
            wins: newWins,
            streak: newStreak,
            maxStreak: newMaxStreak,
            distribution: newDist
          };
          
          // Save to BOTH Local Storage and Cloud Firestore
          localStorage.setItem('microbledle_stats_v1', JSON.stringify(updated));

          if (user && isFirebaseConfigured) {
            saveUserProgress(user.uid, { stats: updated });
          }

          return updated;
        });
      }

      if (!isPractice) {
        const dailyGameData = {
          dateStr,
          guesses: newGuesses,
          gameOver: true,
          won: isVictory,
          isArchive: Boolean(isArchiveRef.current),
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem(`microbledle_game_${dateStr}`, JSON.stringify(dailyGameData));

        const updatedHistory = saveDailyHistoryEntry(dateStr, dailyGameData, target);
        if (updatedHistory) {
          setDailyHistory(updatedHistory);
        }

        if (user && isFirebaseConfigured) {
          const cloudPayload = {
            [`dailyHistory.${dateStr}`]: {
              dateStr,
              won: isVictory,
              guessesCount: newGuesses.length,
              bugId: target.id,
              bugName: target.name,
              isArchive: Boolean(isArchiveRef.current),
              completedAt: new Date().toISOString()
            }
          };
          if (!isArchiveRef.current) {
            cloudPayload.lastDailyGame = dailyGameData;
          }
          saveUserProgress(user.uid, cloudPayload);
        }

        // Submit daily case score to Global Leaderboard ONLY if it is live Daily (never in archive mode!)
        if (isVictory && !isArchiveRef.current) {
          const newWins = stats.wins + (stats.lastDailyDate === dateStr ? 0 : 1);
          const wasAlreadyDiscovered = unlockedBugIds.includes(target.id);
          const rxXp = calculateRxXp(stats, practiceRxBugIds);
          const currentProg = calculateUserProgression(
            newWins,
            unlockedBugIds.length + (!wasAlreadyDiscovered ? 1 : 0),
            rxXp
          );

          let guestId = localStorage.getItem('microbledle_guest_id');
          if (!guestId) {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
              guestId = 'guest_' + crypto.randomUUID();
            } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
              const buf = new Uint8Array(8);
              crypto.getRandomValues(buf);
              guestId = 'guest_' + Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
            } else {
              guestId = 'guest_' + Date.now().toString(36);
            }
            localStorage.setItem('microbledle_guest_id', guestId);
          }
          const activeUid = user ? user.uid : guestId;

          const dailyScorePayload = {
            uid: activeUid,
            displayName: profile.displayName || (user?.email ? user.email.split('@')[0] : generateRandomPlayerName()),
            avatar: profile.avatar || 'microscope',
            status: profile.status || '',
            level: currentProg.level,
            rankTitle: currentProg.title,
            badge: currentProg.badge,
            guessesCount: newGuesses.length,
            submittedAt: new Date().toISOString()
          };

          localStorage.setItem(`microbledle_daily_score_${dateStr}`, JSON.stringify(dailyScorePayload));

          if (isFirebaseConfigured) {
            submitDailyScore(dateStr, activeUid, dailyScorePayload);
          }
        }
      }
    } else if (!isPractice) {
      const ongoingDaily = {
        dateStr,
        guesses: newGuesses,
        gameOver: false,
        won: false,
        isArchive: Boolean(isArchiveRef.current),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`microbledle_game_${dateStr}`, JSON.stringify(ongoingDaily));
      if (user && isFirebaseConfigured && !isArchiveRef.current) {
        saveUserProgress(user.uid, { lastDailyGame: ongoingDaily });
      }
    }
  };

  const startNewPractice = () => {
    isPracticeRef.current = true;
    setIsPractice(true);
    isArchiveRef.current = false;
    setIsArchive(false);
    dateStrRef.current = 'practice';
    const randomIndex = Math.floor(Math.random() * microbes.length);
    setTarget(microbes[randomIndex]);
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setIsNewDiscovery(false);
    setShowStatsModal(false);
    setShowCaseResultModal(false);
    setSearchTerm('');
    setMobileClueTab('clinical');
  };

  // Daily game status for Main Menu
  const dailyGameState = useMemo(() => {
    try {
      const saved = localStorage.getItem(`microbledle_game_${dailyInfo.dateStr}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    if (!isPractice && !isArchive) {
      return { gameOver, won, guesses };
    }
    return { gameOver: false, won: false, guesses: [] };
  }, [dailyInfo.dateStr, isPractice, isArchive, gameOver, won, guesses]);

  const handleStartDaily = (targetDateStr) => {
    isPracticeRef.current = false;
    setIsPractice(false);
    
    // Check if target date is in the past (Archive Mode)
    const isPastArchive = Boolean(targetDateStr && targetDateStr !== dailyInfo.dateStr);
    setIsArchive(isPastArchive);
    isArchiveRef.current = isPastArchive;

    // Resolve info for targetDateStr (if archive date clicked from calendar) or today
    const resolvedInfo = targetDateStr ? getDailyTarget(targetDateStr) : dailyInfo;
    setTarget(resolvedInfo.target);
    setDateStr(resolvedInfo.dateStr);
    dateStrRef.current = resolvedInfo.dateStr;
    logAnalyticsEvent('game_start', { 
      mode: isPastArchive ? 'archive' : 'daily', 
      date: resolvedInfo.dateStr 
    });

    const savedGame = localStorage.getItem(`microbledle_game_${resolvedInfo.dateStr}`);
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        // Cross-contamination auto-healing:
        // If a game is marked 'won', the last guess must match target.id.
        // If it doesn't match or dateStr mismatch, it was contaminated by another date's sync.
        const lastGuess = parsed.guesses && parsed.guesses[parsed.guesses.length - 1];
        const isCorrupted = (parsed.won && lastGuess?.guess?.id !== resolvedInfo.target.id) ||
                            (parsed.dateStr && parsed.dateStr !== resolvedInfo.dateStr);

        if (isCorrupted) {
          console.warn("Auto-healing contaminated game cache for date:", resolvedInfo.dateStr);
          localStorage.removeItem(`microbledle_game_${resolvedInfo.dateStr}`);
          setGuesses([]);
          setGameOver(false);
          setWon(false);
        } else {
          setGuesses(parsed.guesses || []);
          setGameOver(parsed.gameOver || false);
          setWon(parsed.won || false);
          if (parsed.gameOver) {
            setShowCaseResultModal(true);
          }
        }
      } catch (e) {
        setGuesses([]);
        setGameOver(false);
        setWon(false);
      }
    } else {
      setGuesses([]);
      setGameOver(false);
      setWon(false);
    }
    setCurrentScreen('game');
  };

  const handleResetArchiveCase = (targetDate) => {
    if (!targetDate) return;
    localStorage.removeItem(`microbledle_game_${targetDate}`);
    localStorage.removeItem(`microbledle_daily_rx_${targetDate}`);
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setShowCaseResultModal(false);
  };

  const handleStartPractice = () => {
    setIsPractice(true);
    isPracticeRef.current = true;
    setIsArchive(false);
    isArchiveRef.current = false;
    startNewPractice();
    logAnalyticsEvent('game_start', { mode: 'practice' });
    setCurrentScreen('game');
  };

  const handleOpenMicrodex = (bug = null) => {
    setMicrodexInitialBug(bug || target);
    setShowCaseResultModal(false);
    setShowMicrodexModal(true);
  };

  const copyEmojiGrid = () => {
    logAnalyticsEvent('share_clicked', { type: 'emoji_grid', mode: isPractice ? 'practice' : 'daily' });
    const statusMap = { exact: '🟩', partial: '🟨', incorrect: '⬛' };
    const gridRows = guesses.map(g => {
      const { taxonomy, morphology, respiration, keyTest, tropism } = g.results;
      return `${statusMap[taxonomy.status]}${statusMap[morphology.status]}${statusMap[respiration.status]}${statusMap[keyTest.status]}${statusMap[tropism.status]}`;
    }).join('\n');

    const header = isPractice 
      ? 'Microbledle (Practice)' 
      : (isArchive ? `Microbledle (Archive ${dateStr})` : `Microbledle ${dateStr}`);
    const score = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
    const playUrl = window.location.origin.includes('localhost') ? window.location.href : 'https://microbledle.com/';
    const text = `${header} ${score}\n\n${gridRows}\n\nPlay at: ${playUrl}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const getTileStyles = (status) => {
    switch (status) {
      case 'exact':
        return 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-950/40 shadow-sm';
      case 'partial':
        return 'bg-amber-600 border-amber-500 text-white shadow-amber-950/40 shadow-sm';
      default:
        return 'bg-slate-200 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center p-3 md:p-6 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {['about', 'contact', 'privacy', 'terms', 'references'].includes(currentScreen) ? (
        <StaticPageLayout
          currentPage={currentScreen}
          onNavigate={navigateToPage}
          onBack={handleBackFromPage}
          backLabel={returnScreen === 'game' ? 'Back to Case' : 'Back to Menu'}
          theme={theme}
          onToggleTheme={toggleTheme}
        >
          {currentScreen === 'about' && (
            <AboutPage 
              onStartDaily={handleStartDaily} 
              onStartPractice={handleStartPractice} 
            />
          )}
          {currentScreen === 'contact' && <ContactPage />}
          {currentScreen === 'privacy' && <PrivacyPage />}
          {currentScreen === 'terms' && <TermsPage />}
          {currentScreen === 'references' && <ReferencesPage />}
        </StaticPageLayout>
      ) : currentScreen === 'menu' ? (
        <MainMenu
          onStartDaily={handleStartDaily}
          onStartPractice={handleStartPractice}
          onOpenMicrodex={() => setShowMicrodexModal(true)}
          onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          onOpenStats={() => {
            setCalendarInitialTab('stats');
            setShowStatsModal(true);
          }}
          onOpenCalendar={() => {
            setCalendarInitialTab('calendar');
            setShowStatsModal(true);
          }}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenInfo={navigateToPage}
          user={user}
          profile={profile}
          progression={progression}
          currentAvatarObj={currentAvatarObj}
          stats={stats}
          unlockedBugIds={unlockedBugIds}
          totalBugsCount={microbes.length}
          dailyInfo={dailyInfo}
          countdown={countdown}
          dailyGameState={dailyGameState}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          cloudSynced={cloudSynced}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <>
          {/* Mobile Top Navbar (< md screens) */}
          <header className="flex md:hidden w-full items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              {/* Back to Menu Button */}
              <button
                onClick={() => setCurrentScreen('menu')}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition shadow-sm shrink-0"
                title="Return to Main Menu"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              </button>

              <div 
                onClick={() => setCurrentScreen('menu')}
                className="flex items-center gap-2 cursor-pointer"
                title="Return to Main Menu"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-emerald-500/40 shadow-sm shrink-0 bg-slate-950 flex items-center justify-center">
                  <img 
                    src="./apple-touch-icon.png" 
                    alt="Microbledle" 
                    className="w-full h-full object-cover rounded-xl" 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                      MICROBLEDLE
                    </span>
                    {isArchive ? (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                        ARCHIVE
                      </span>
                    ) : isPractice ? (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                        PRAC
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {countdown}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick actions on mobile */}
            <div className="flex items-center gap-1.5">
              {/* Microdex Compendium Pill */}
              <button
                onClick={() => setShowMicrodexModal(true)}
                className="px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition flex items-center gap-1 text-[11px] font-semibold shadow-sm"
                title="Microdex Compendium"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span className="text-[10px] px-1 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono font-bold">
                  {unlockedBugIds.length}/{microbes.length}
                </span>
              </button>

              {/* Audio Mute/Unmute */}
              <button
                onClick={toggleMute}
                className={`p-1.5 rounded-xl border transition shadow-sm ${
                  isMuted 
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500' 
                    : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                }`}
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Practice restart quick button if in practice */}
              {isPractice && (
                <button
                  onClick={startNewPractice}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition shadow-sm"
                  title="Next Practice Organism"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Archive return to today button if in archive */}
              {isArchive && (
                <button
                  onClick={() => handleStartDaily(dailyInfo.dateStr)}
                  className="px-2 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 transition flex items-center gap-1 text-[11px] font-semibold shadow-sm"
                  title="Return to Today's Daily Case"
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span>Today</span>
                </button>
              )}

              {/* Mobile More / Tools Button */}
              <button
                onClick={() => setShowMobileToolsModal(true)}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition shadow-sm flex items-center justify-center"
                title="Game Menu & Tools"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Desktop & Tablet Top Navbar (>= md screens) */}
          <header className="hidden md:flex w-full max-w-4xl border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Back to Menu Button */}
              <button
                onClick={() => setCurrentScreen('menu')}
                className="p-2 md:px-3 md:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shadow-sm shrink-0"
                title="Return to Main Menu"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span className="hidden sm:inline">Menu</span>
              </button>

              <div 
                onClick={() => setCurrentScreen('menu')}
                className="flex items-center gap-3 cursor-pointer group"
                title="Return to Main Menu"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-950/50 shrink-0 bg-slate-950 group-hover:border-emerald-400 transition-all duration-300 group-hover:scale-105 ring-2 ring-emerald-500/20 flex items-center justify-center">
                  <img 
                    src="./apple-touch-icon.png" 
                    alt="Microbledle Logo" 
                    className="w-full h-full object-cover rounded-2xl" 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition">
                      MICROBLEDLE
                    </h1>
                    {isArchive ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Archive Case (Study Only)
                      </span>
                    ) : isPractice ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                        Practice
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {isPractice ? 'Practice' : (isArchive ? `Archive: ${dateStr}` : dateStr)}
                    </span>
                    {!isPractice && !isArchive && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                        <Clock className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                        Next in <span className="font-mono text-emerald-600 dark:text-emerald-300 font-semibold">{countdown}</span>
                      </span>
                    )}
                    {isArchive && (
                      <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                        (No XP / Stats recorded)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* User Profile Pill */}
          {user ? (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-xs transition group"
              title="Click to view & edit your Medical Profile & Rank"
            >
              <span className="text-lg shrink-0">{currentAvatarObj.emoji}</span>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-200 font-bold max-w-[110px] truncate leading-tight group-hover:text-emerald-400 transition">
                    {profile.displayName || user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 shrink-0">
                    Lvl {progression.level}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold leading-none flex items-center gap-1 mt-1">
                  <span>{progression.badge}</span>
                  <span className="truncate max-w-[120px]">{progression.title}</span>
                </div>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-xs transition group"
                title="View Local Profile & Rank"
              >
                <span className="text-base">{currentAvatarObj.emoji}</span>
                <div className="text-left">
                  <div className="text-slate-200 font-bold text-xs truncate max-w-[90px] group-hover:text-emerald-400 transition">
                    {profile.displayName || 'Player'}
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold leading-none flex items-center gap-1 mt-0.5">
                    <span>{progression.badge}</span>
                    <span className="truncate max-w-[100px]">{progression.title}</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition flex items-center gap-1 text-xs font-semibold"
                title="Sign in with Google / Email to save progression"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            </div>
          )}

          {/* Microdex Compendium Button */}
          <button
            onClick={() => setShowMicrodexModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Microdex USMLE Compendium"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Microdex</span>
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

          {/* If in Archive Mode, button to switch back to Today's Case */}
          {isArchive && (
            <button
              onClick={() => handleStartDaily(dailyInfo.dateStr)}
              className="px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/60 text-purple-300 transition flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="Return to Today's Live Daily Case"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Today's Case</span>
            </button>
          )}

          {/* Practice Mode Toggle */}
          <button
            onClick={() => {
              if (isPractice) {
                setIsPractice(false);
                setIsArchive(false);
                handleStartDaily(dailyInfo.dateStr);
              } else {
                handleStartPractice();
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
              title="Next Practice Organism"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400/60 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-sm"
            title="How to play"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Global Leaderboard Button */}
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Global Leaderboard & Rankings"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Rankings</span>
          </button>

          {/* Statistics Button */}
          <button
            onClick={() => setShowStatsModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
            title="Statistics"
          >
            <Award className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex-1 flex flex-col gap-3 sm:gap-6">
        
        {/* Search & Deduction Input */}
        {!gameOver ? (
          <div ref={searchContainerRef} className="relative w-full max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-3.5 sm:left-4 top-3 sm:top-3.5 h-4 sm:h-5 w-4 sm:w-5 text-emerald-500 dark:text-emerald-400 group-focus-within:text-emerald-400 transition" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pathogen (e.g., S. aureus, E. coli, TB)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                  setSearchSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsSearchOpen(true);
                  setSearchSelectedIndex(-1);
                }}
                onClick={() => {
                  setIsSearchOpen(true);
                }}
                className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs sm:text-sm font-medium shadow-lg transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchOpen(true);
                    setSearchSelectedIndex(-1);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown with A-Z Full Scrollable List */}
            {isSearchOpen && (
              <div className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md max-h-64 sm:max-h-80 flex flex-col">
                {/* Sticky Header with Counter */}
                <div className="px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <span>{!searchTerm.trim() ? "All Pathogens (A to Z)" : "Search Results"}</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {availableMicrobes.length} {availableMicrobes.length === 1 ? 'organism' : 'organisms'}
                  </span>
                </div>

                {availableMicrobes.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No pathogens found matching "{searchTerm}"
                  </div>
                ) : (
                  <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {availableMicrobes.map((bug, idx) => {
                      const isSelected = idx === searchSelectedIndex;
                      const gramInfo = getGramBadge(bug.morphology.gram);

                      return (
                        <button
                          ref={el => {
                            if (isSelected && el) {
                              el.scrollIntoView({ block: 'nearest' });
                            }
                          }}
                          key={bug.id}
                          onClick={() => handleSelectMicrobe(bug)}
                          onMouseEnter={() => setSearchSelectedIndex(idx)}
                          className={`w-full text-left px-4 py-2.5 sm:py-3 transition flex items-center justify-between group ${
                            isSelected 
                              ? 'bg-emerald-50 dark:bg-slate-800/95 ring-1 ring-emerald-500/50' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 italic group-hover:text-emerald-500 dark:group-hover:text-emerald-300 flex items-center gap-2 flex-wrap">
                              <span>{bug.name}</span>
                              <span className={`not-italic text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${gramInfo.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${gramInfo.dot}`} />
                                {gramInfo.label}
                              </span>
                            </div>
                            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{bug.commonName}</span> • {bug.taxonomy}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transform transition ${isSelected ? 'text-emerald-500 dark:text-emerald-400 translate-x-1' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto w-full p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center shadow-lg">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Diagnosis finalized for this case</div>
            <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400 italic">
              {target.name} ({target.commonName})
            </div>
            {!isArchive ? (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Next daily case in: <span className="font-mono text-emerald-600 dark:text-emerald-300 font-bold">{countdown}</span>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Archive Study Case ({dateStr}) • Study Mode (+0 XP)
              </div>
            )}
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setShowCaseResultModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow transition inline-flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" /> View Summary & Share
              </button>
              <button
                onClick={() => setShowMicrodexModal(true)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow transition inline-flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Open in Microdex
              </button>
              {isArchive && (
                <button
                  onClick={() => handleResetArchiveCase(dateStr)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-semibold text-white shadow transition inline-flex items-center gap-1.5"
                  title="Replay this archive case from scratch"
                >
                  <RotateCcw className="w-4 h-4" /> Replay Case
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Progressive Clues (< md screens): Interactive 4-Tab Clue Selector */}
        <div className="block md:hidden space-y-2">
          {/* 4 Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl text-[11px] font-semibold">
            {/* Tab 1: Clinical */}
            <button
              onClick={() => setMobileClueTab('clinical')}
              className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
                mobileClueTab === 'clinical'
                  ? 'bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">Clinical</span>
              </div>
              <span className="text-[9px] text-indigo-300 font-mono">0/0</span>
            </button>

            {/* Tab 2: Smear */}
            <button
              onClick={() => setMobileClueTab('smear')}
              className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
                mobileClueTab === 'smear'
                  ? 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-sm'
                  : guesses.length >= 2 ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1">
                <Microscope className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">Smear</span>
              </div>
              <span className={`text-[9px] font-mono ${guesses.length >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                {guesses.length >= 2 ? 'READY' : `${Math.min(guesses.length, 2)}/2`}
              </span>
            </button>

            {/* Tab 3: Culture */}
            <button
              onClick={() => setMobileClueTab('culture')}
              className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
                mobileClueTab === 'culture'
                  ? 'bg-teal-950/80 border border-teal-500/50 text-teal-300 shadow-sm'
                  : guesses.length >= 3 ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1">
                <TestTube2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="truncate">Culture</span>
              </div>
              <span className={`text-[9px] font-mono ${guesses.length >= 3 ? 'text-teal-400 font-bold' : 'text-slate-500'}`}>
                {guesses.length >= 3 ? 'READY' : `${Math.min(guesses.length, 3)}/3`}
              </span>
            </button>

            {/* Tab 4: Full Case */}
            <button
              onClick={() => setMobileClueTab('vignette')}
              className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
                mobileClueTab === 'vignette'
                  ? 'bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-sm'
                  : guesses.length >= 4 ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">Case</span>
              </div>
              <span className={`text-[9px] font-mono ${guesses.length >= 4 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                {guesses.length >= 4 ? 'READY' : `${Math.min(guesses.length, 4)}/4`}
              </span>
            </button>
          </div>

          {/* Active Tab Clue Body */}
          <div className="p-3 rounded-2xl border transition-all duration-300 bg-slate-900/90 border-slate-800 shadow-md">
            {mobileClueTab === 'clinical' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Initial Clinical Clue
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-medium">
                    START
                  </span>
                </div>
                <p className="text-xs text-indigo-100 font-serif italic leading-relaxed">
                  "{target.chiefComplaint || target.vignette}"
                </p>
              </div>
            )}

            {mobileClueTab === 'smear' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                    <Microscope className="w-3.5 h-3.5" /> Microscopic Smear Clue
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                    guesses.length >= 2 
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {guesses.length >= 2 ? 'UNLOCKED' : `Guess 2 (${Math.min(guesses.length, 2)}/2)`}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  {guesses.length >= 2 ? (
                    <span className="text-cyan-100 font-serif italic">"{target.smear}"</span>
                  ) : (
                    <span className="text-slate-500 italic">Reveals microscopic morphology and cellular arrangement at Guess 2...</span>
                  )}
                </p>
              </div>
            )}

            {mobileClueTab === 'culture' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1">
                    <TestTube2 className="w-3.5 h-3.5" /> Diagnostic Culture Clue
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                    guesses.length >= 3 
                      ? 'bg-teal-950 text-teal-300 border border-teal-800' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {guesses.length >= 3 ? 'UNLOCKED' : `Guess 3 (${Math.min(guesses.length, 3)}/3)`}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  {guesses.length >= 3 ? (
                    <span className="text-teal-100 font-serif italic">"{target.culture}"</span>
                  ) : (
                    <span className="text-slate-500 italic">Reveals growth media, colony appearance, and pigment at Guess 3...</span>
                  )}
                </p>
              </div>
            )}

            {mobileClueTab === 'vignette' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> Full Case Presentation
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                    guesses.length >= 4 
                      ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {guesses.length >= 4 ? 'UNLOCKED' : `Guess 4 (${Math.min(guesses.length, 4)}/4)`}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  {guesses.length >= 4 ? (
                    <span className="text-amber-100 font-serif italic">"{target.vignette}"</span>
                  ) : (
                    <span className="text-slate-500 italic">Reveals full clinical vignette and case presentation at Guess 4...</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop & Tablet Progressive Clues (>= md screens): Full 4-Card Grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-3">
          
          {/* 1. Initial Clinical Clue (Unlocked from start at guess >= 0) */}
          <div className="p-3.5 rounded-2xl border transition-all duration-300 bg-slate-900/80 border-indigo-500/40 text-slate-200 shadow-md shadow-indigo-950/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 text-indigo-400">
                <FileText className="w-3.5 h-3.5" /> Clinical Clue
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
                START
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              <span className="italic text-indigo-100 font-serif">"{target.chiefComplaint || target.vignette}"</span>
            </p>
          </div>

          {/* 2. Microscopic Smear Clue (Unlocks at guess >= 2) */}
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
                {guesses.length >= 2 ? 'UNLOCKED' : `Guess 2 (${Math.min(guesses.length, 2)}/2)`}
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

          {/* 3. Diagnostic Culture Clue (Unlocks at guess >= 3) */}
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
                {guesses.length >= 3 ? 'UNLOCKED' : `Guess 3 (${Math.min(guesses.length, 3)}/3)`}
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

          {/* 4. Patient Story Clue (Unlocks at guess >= 4) */}
          <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${
            guesses.length >= 4 
              ? 'bg-slate-900/80 border-amber-500/40 text-slate-200 shadow-md shadow-amber-950/20' 
              : 'bg-slate-900/30 border-slate-800/60 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                guesses.length >= 4 ? 'text-amber-400' : 'text-slate-500'
              }`}>
                <Stethoscope className="w-3.5 h-3.5" /> Full Case Clue
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                guesses.length >= 4 
                  ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {guesses.length >= 4 ? 'UNLOCKED' : `Guess 4 (${Math.min(guesses.length, 4)}/4)`}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {guesses.length >= 4 ? (
                <span className="italic text-amber-100 font-serif">"{target.vignette}"</span>
              ) : (
                <span className="italic text-slate-500">
                  Reveals full clinical vignette and case presentation...
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Comparative Diagnostic Grid */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2.5 sm:pb-3 mb-2.5 sm:mb-3 border-b border-slate-800/80 gap-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Your Guesses ({guesses.length}/{maxGuesses})</span>
            </div>
            {/* Color Legend */}
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-emerald-600 inline-block shadow-sm"></span>
                <span className="text-slate-300 font-medium">Exact Match</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-amber-600 inline-block shadow-sm"></span>
                <span className="text-slate-300 font-medium">Partial Match</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-slate-800 border border-slate-700 inline-block"></span>
                <span className="text-slate-400">Incorrect</span>
              </span>
            </div>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="md:hidden flex items-center justify-between text-[10px] text-slate-400 pb-2 px-1">
            <span className="font-semibold text-emerald-400">📌 Pinned Organism</span>
            <span className="text-slate-500">Swipe for lab tests →</span>
          </div>

          <div className="overflow-x-auto relative">
            <table className="w-full border-collapse min-w-[720px] sm:min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3 w-[150px] sm:w-[180px] sticky left-0 bg-slate-900 z-20 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.5)]">Organism</th>
                  <th className="py-2.5 px-2 text-center">Group</th>
                  <th className="py-2.5 px-2 text-center">Gram & Shape</th>
                  <th className="py-2.5 px-2 text-center">Oxygen</th>
                  <th className="py-2.5 px-2 text-center">Key Test</th>
                  <th className="py-2.5 px-2 text-center">Infection Site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {guesses.map((item, rowIndex) => {
                  const { taxonomy, morphology, respiration, keyTest, tropism } = item.results;
                  const gramBadge = getGramBadge(morphology.gram);

                  return (
                    <tr key={rowIndex} className="tile-reveal">
                      {/* Pathogen Name & Badge (Sticky on mobile) */}
                      <td className="py-2 sm:py-3 px-2 sm:px-3 sticky left-0 bg-slate-900 z-10 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.5)]">
                        <div className="font-semibold text-emerald-300 italic text-xs sm:text-sm truncate max-w-[130px] sm:max-w-none">
                          {item.guess.name}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                          <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${gramBadge.bg}`}>
                            {gramBadge.label}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 not-italic truncate max-w-[90px] sm:max-w-none">
                            {item.guess.commonName}
                          </span>
                        </div>
                      </td>

                      {/* 1. Taxonomy */}
                      <td className="py-2 sm:py-3 px-1 sm:px-1.5 align-middle">
                        <div className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold leading-snug text-center ${getTileStyles(taxonomy.status)}`}>
                          {taxonomy.value}
                        </div>
                      </td>

                      {/* 2. Morphology */}
                      <td className="py-2 sm:py-3 px-1 sm:px-1.5 align-middle">
                        <div className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold leading-snug text-center ${getTileStyles(morphology.status)}`}>
                          <div>{morphology.value}</div>
                        </div>
                      </td>

                      {/* 3. Respiration */}
                      <td className="py-2 sm:py-3 px-1 sm:px-1.5 align-middle">
                        <div className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold leading-snug text-center ${getTileStyles(respiration.status)}`}>
                          {respiration.value}
                        </div>
                      </td>

                      {/* 4. Key Test */}
                      <td className="py-2 sm:py-3 px-1 sm:px-1.5 align-middle">
                        <div className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold leading-snug text-center ${getTileStyles(keyTest.status)}`}>
                          {keyTest.value}
                        </div>
                      </td>

                      {/* 5. Tropism */}
                      <td className="py-2 sm:py-3 px-1 sm:px-1.5 align-middle">
                        <div className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold leading-snug text-center ${getTileStyles(tropism.status)}`}>
                          {tropism.value}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty remaining placeholder rows */}
                {Array.from({ length: Math.max(0, maxGuesses - guesses.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="opacity-25 select-none">
                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-500 font-mono text-[10px] sm:text-xs sticky left-0 bg-slate-900 z-10 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.5)]">
                      Attempt {guesses.length + i + 1}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-1.5"><div className="h-9 sm:h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                    <td className="py-2 sm:py-3 px-1 sm:px-1.5"><div className="h-9 sm:h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                    <td className="py-2 sm:py-3 px-1 sm:px-1.5"><div className="h-9 sm:h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                    <td className="py-2 sm:py-3 px-1 sm:px-1.5"><div className="h-9 sm:h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                    <td className="py-2 sm:py-3 px-1 sm:px-1.5"><div className="h-9 sm:h-12 rounded-xl bg-slate-900 border border-slate-800/80"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      </>
      )}

      {/* Footer */}
      <footer className="w-full max-w-4xl mt-auto pt-8 pb-10 sm:pb-12 text-center border-t border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center gap-2.5 px-4">
        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-3.5 sm:gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <button 
            onClick={() => navigateToPage('about')} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition inline-flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>About</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button 
            onClick={() => navigateToPage('contact')} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition inline-flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Contact Us</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button 
            onClick={() => navigateToPage('privacy')} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Privacy Policy</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button 
            onClick={() => navigateToPage('terms')} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition inline-flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Terms & Disclaimer</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button 
            onClick={() => navigateToPage('references')} 
            className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>References</span>
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Microbledle. All rights reserved.
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-500 max-w-lg leading-relaxed">
          For educational and entertainment purposes only. Not intended for clinical diagnostic or treatment decisions.
        </p>
      </footer>

      {/* Case Outcome / Results Modal */}
      {showCaseResultModal && target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowCaseResultModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Verdict */}
            <div className="text-center mb-6">
              {won ? (
                <div className="space-y-1">
                  <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                    <Award className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-emerald-400">Diagnosis Confirmed!</h2>
                  <p className="text-xs text-slate-300">You identified the pathogen in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</p>

                  {/* EXP Feedback Pill */}
                  <div className="pt-2">
                    {isArchive ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>Archive Study Mode: No XP or stats recorded (+0 XP)</span>
                      </div>
                    ) : !isPractice ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>+100 XP (Daily Case)</span>
                        {isNewDiscovery && (
                          <>
                            <span className="text-emerald-500">•</span>
                            <span>+50 XP (Microdex Unlock)</span>
                          </>
                        )}
                      </div>
                    ) : isNewDiscovery ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>New Discovery Unlocked! (+50 XP)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold shadow-sm">
                        <span>Practice Mode: Already in Microdex (+0 XP)</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-2">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-rose-400">Diagnostic Failure!</h2>
                  <p className="text-xs text-slate-300">Patient needed immediate antimicrobial therapy.</p>
                </div>
              )}
            </div>

            {/* Target Organism Identified (Concise & Zero Spoilers) */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5 text-left flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                  Target Organism Identified
                </span>
                <div className="text-lg sm:text-xl font-black text-white italic">
                  {target.name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{target.commonName} • {target.taxonomy}</div>
              </div>

              <button
                onClick={() => handleOpenMicrodex(target)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm"
                title="View full facts, images, and vignette in Microdex"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View in Microdex</span>
              </button>
            </div>

            {/* Empiric Rx Challenge (Post-game Treatment Quiz) */}
            <RxChallenge
              target={target}
              isDaily={!isPractice && !isArchive}
              dateStr={dateStr}
              isMuted={isMuted}
              onAnswer={handleRxAnswer}
              onOpenMicrodex={() => handleOpenMicrodex(target)}
              canEarnExp={!isArchive && (!isPractice || (isNewDiscovery && !practiceRxBugIds.includes(target.id)))}
              expReason={
                isArchive
                  ? 'Archive Study Mode: No XP recorded (+0 XP)'
                  : (!isPractice 
                      ? '' 
                      : (!isNewDiscovery ? 'Already Discovered (+0 XP)' : (practiceRxBugIds.includes(target.id) ? 'Rx Solved (+0 XP)' : '')))
              }
            />

            {/* Action buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Export Visual Graphic Discharge Card Button */}
                <button
                  onClick={() => setShowDischargeModal(true)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 font-bold rounded-2xl flex items-center justify-center gap-2 text-white shadow-lg shadow-emerald-950/40 transition active:scale-[0.99] text-xs sm:text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export Summary Card</span>
                </button>

                {/* Copy Text Grid Button */}
                <button
                  onClick={copyEmojiGrid}
                  className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 text-slate-100 transition active:scale-[0.99] text-xs sm:text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied Text Grid!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share Emoji Grid</span>
                    </>
                  )}
                </button>
              </div>

              {/* View Global Leaderboard Button */}
              <button
                onClick={() => {
                  setShowCaseResultModal(false);
                  setShowLeaderboardModal(true);
                }}
                className="w-full py-3 bg-slate-800/90 hover:bg-slate-750 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition text-xs sm:text-sm"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>View Global Leaderboard</span>
              </button>

              {isPractice && (
                <button
                  onClick={startNewPractice}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-750 font-semibold rounded-2xl flex items-center justify-center gap-2 text-slate-200 transition text-xs sm:text-sm"
                >
                  <ArrowRight className="w-4 h-4" /> Next Practice Organism
                </button>
              )}

              {isArchive && (
                <button
                  onClick={() => {
                    handleResetArchiveCase(dateStr);
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-semibold rounded-2xl flex items-center justify-center gap-2 text-white transition text-xs sm:text-sm shadow-md"
                >
                  <RotateCcw className="w-4 h-4" /> Replay Case (Study Fresh)
                </button>
              )}

              {/* Return to Main Menu button */}
              <button
                onClick={() => {
                  setShowCaseResultModal(false);
                  setCurrentScreen('menu');
                }}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition text-xs"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                <span>Return to Main Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Case Calendar & Personal Statistics Modal */}
      <DailyCalendarModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={stats}
        historyMap={dailyHistory}
        todayDateStr={dailyInfo.dateStr}
        initialTab={calendarInitialTab}
        onSelectDateToPlay={(selectedDate) => {
          setShowStatsModal(false);
          handleStartDaily(selectedDate);
        }}
        onResetAndPlayArchive={(selectedDate) => {
          setShowStatsModal(false);
          handleResetArchiveCase(selectedDate);
          handleStartDaily(selectedDate);
        }}
        onOpenLeaderboard={() => {
          setShowStatsModal(false);
          setShowLeaderboardModal(true);
        }}
        onOpenMicrodex={(bug) => {
          setShowStatsModal(false);
          handleOpenMicrodex(bug);
        }}
      />

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
              Find the mystery pathogen in <strong>6 guesses or fewer</strong>. Each guess compares 5 properties:
            </p>

            <div className="space-y-2.5 text-xs mb-5">
              <div className="flex items-start gap-2.5 bg-slate-800/40 p-2.5 rounded-xl">
                <span className="w-4 h-4 rounded-md bg-emerald-600 shrink-0 mt-0.5"></span>
                <span className="text-slate-200">Exact match for that property.</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/40 p-2.5 rounded-xl">
                <span className="w-4 h-4 rounded-md bg-amber-600 shrink-0 mt-0.5"></span>
                <span className="text-slate-200">Partial match (e.g. matching Gram stain, shared shape, overlapping infection site).</span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-800/40 p-2.5 rounded-xl">
                <span className="w-4 h-4 rounded-md bg-slate-800 border border-slate-700 shrink-0 mt-0.5"></span>
                <span className="text-slate-200">Incorrect category or no overlap.</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300">
                <FileText className="w-4 h-4 shrink-0" />
                <span><strong>Clinical Clue:</strong> Available from the start (age, sex & chief complaint).</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300">
                <Microscope className="w-4 h-4 shrink-0" />
                <span><strong>Smear Clue:</strong> Unlocks after Guess 2.</span>
              </div>
              <div className="flex items-center gap-2 text-teal-300">
                <TestTube2 className="w-4 h-4 shrink-0" />
                <span><strong>Culture Clue:</strong> Unlocks after Guess 3.</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <Stethoscope className="w-4 h-4 shrink-0" />
                <span><strong>Full Case Presentation:</strong> Unlocks after Guess 4.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
                <span>New daily case arrives every day at 00:00 UTC.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Microdex USMLE Compendium Modal */}
      <MicrodexModal 
        isOpen={showMicrodexModal}
        onClose={() => {
          setShowMicrodexModal(false);
          setMicrodexInitialBug(null);
        }}
        unlockedBugIds={unlockedBugIds}
        initialBug={microdexInitialBug}
      />

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onDemoLogin={handleDemoLogin}
      />

      {/* Profile & Level Customization Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onOpenStats={() => setShowStatsModal(true)}
        user={user}
        stats={stats}
        unlockedCount={unlockedBugIds.length}
        profile={profile}
        progression={progression}
        practiceRxBugIds={practiceRxBugIds}
        onSaveProfile={handleSaveProfile}
        onLogout={handleLogout}
      />

      {/* Global Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        currentDateStr={dateStr}
        user={user}
        userStats={stats}
        userProfile={profile}
        practiceRxBugIds={practiceRxBugIds}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Visual Clinical Discharge Summary Report Modal (Canvas Graphic) */}
      <DischargeCardModal
        isOpen={showDischargeModal}
        onClose={() => setShowDischargeModal(false)}
        target={target}
        guesses={guesses}
        won={won}
        isPractice={isPractice}
        isArchive={isArchive}
        dateStr={dateStr}
        profile={profile}
        progression={progression}
        stats={stats}
        theme={theme}
      />

      {/* Information & Legal Modal (About, Contact, Privacy, Terms, References) */}
      <InfoModal
        isOpen={Boolean(infoModalTab)}
        onClose={() => setInfoModalTab(null)}
        initialTab={infoModalTab || 'about'}
      />

      {/* Mobile Tools & Options Bottom Sheet / Modal */}
      {showMobileToolsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-white">Game Options</span>
              </div>
              <button
                onClick={() => setShowMobileToolsModal(false)}
                className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Row */}
            <div 
              onClick={() => {
                setShowMobileToolsModal(false);
                setShowProfileModal(true);
              }}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentAvatarObj.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{profile.displayName || 'Player'}</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{progression.badge} Level {progression.level} • {progression.title}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Daily / Practice / Archive Switch */}
              <button
                onClick={() => {
                  setShowMobileToolsModal(false);
                  if (isArchive) {
                    handleStartDaily(dailyInfo.dateStr);
                  } else if (isPractice) {
                    setIsPractice(false);
                    handleStartDaily(dailyInfo.dateStr);
                  } else {
                    handleStartPractice();
                  }
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center gap-1.5 text-center text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 transition shadow-sm"
              >
                <Shuffle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>{isArchive ? "Return to Today" : (isPractice ? 'Switch to Daily' : 'Switch to Practice')}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center gap-1.5 text-center text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-amber-500/40 transition shadow-sm"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
                <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
              </button>

              {/* Leaderboard */}
              <button
                onClick={() => {
                  setShowMobileToolsModal(false);
                  setShowLeaderboardModal(true);
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center gap-1.5 text-center text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-amber-500/40 transition shadow-sm"
              >
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Leaderboard</span>
              </button>

              {/* Personal Statistics */}
              <button
                onClick={() => {
                  setShowMobileToolsModal(false);
                  setShowStatsModal(true);
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center gap-1.5 text-center text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500/40 transition shadow-sm"
              >
                <Award className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Personal Stats</span>
              </button>

              {/* How to Play */}
              <button
                onClick={() => {
                  setShowMobileToolsModal(false);
                  setShowHelpModal(true);
                }}
                className="col-span-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 transition shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>How to Play & Clue Rules</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
