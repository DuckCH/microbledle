import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, AlertCircle, HelpCircle, Trophy, RotateCcw, 
  Share2, CheckCircle2, X, Sparkles, ChevronRight, Info,
  Microscope, Stethoscope, Dna, FlaskConical, Award, Flame,
  Check, Calendar, Shuffle, Volume2, VolumeX, Clock, TestTube2,
  BookOpen, User, LogOut, Cloud, ShieldCheck, Pill,
  ArrowLeft, Home, Sun, Moon, FileText, BarChart2,
  Mail, AlertTriangle
} from 'lucide-react';
import microbes from './data/microbes.json';
import { playTileSound, playSelectSound, playWinSound, playDefeatSound } from './utils/audio';
import { calculateUserProgression, AVATAR_OPTIONS } from './utils/leveling';
import MicrodexModal from './components/MicrodexModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import LeaderboardModal from './components/LeaderboardModal';
import RxChallenge from './components/RxChallenge';
import MainMenu from './components/MainMenu';
import DischargeCardModal from './components/DischargeCardModal';
import InfoModal from './components/InfoModal';
import StaticPageLayout from './pages/StaticPageLayout';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ReferencesPage from './pages/ReferencesPage';
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
    (guessTax.includes('gram-positive') && targetTax.includes('gram-positive')) ||
    (guessTax.includes('gram-negative') && targetTax.includes('gram-negative')) ||
    (guessTax.includes('virus') && targetTax.includes('virus')) ||
    (guessTax.includes('fungi') && targetTax.includes('fungi')) ||
    (guessTax.includes('parasite') && targetTax.includes('parasite')) ||
    (guessTax.includes('protozoa') && targetTax.includes('protozoa')) ||
    (guessTax.includes('spirochaetota') && targetTax.includes('spirochaetota')) ||
    (guessTax.includes('spirochete') && targetTax.includes('spirochete')) ||
    (guessTax.includes('ascomycota') && targetTax.includes('ascomycota')) ||
    (guessTax.includes('apicomplexa') && targetTax.includes('apicomplexa')) ||
    (guessTax.includes('flaviviridae') && targetTax.includes('flaviviridae')) ||
    (guessTax.includes('retroviridae') && targetTax.includes('retroviridae')) ||
    (guessTax.includes('herpesviridae') && targetTax.includes('herpesviridae')) ||
    (guessTax.includes('orthomyxoviridae') && targetTax.includes('orthomyxoviridae')) ||
    (guessTax.includes('rhabdoviridae') && targetTax.includes('rhabdoviridae')) ||
    (guessTax.includes('pneumoviridae') && targetTax.includes('pneumoviridae'))
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
  const [target, setTarget] = useState(dailyInfo.target);
  const [dateStr, setDateStr] = useState(dailyInfo.dateStr);

  const [guesses, setGuesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCaseResultModal, setShowCaseResultModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showMicrodexModal, setShowMicrodexModal] = useState(false);
  const [microdexInitialBug, setMicrodexInitialBug] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState(null); // 'about' | 'contact' | 'privacy' | 'terms' | 'sources' | null
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
      return saved ? JSON.parse(saved) : {
        displayName: 'Physician',
        status: '',
        avatar: 'microscope'
      };
    } catch {
      return {
        displayName: 'Physician',
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

  const searchInputRef = useRef(null);
  const maxGuesses = 6;

  // Persistent statistics
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    streak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    rxAttempted: 0,
    rxCorrect: 0
  });

  // Progression calculation (including Rx Challenge bonus XP)
  const progression = useMemo(() => {
    return calculateUserProgression(stats.wins, unlockedBugIds.length, (stats.rxCorrect || 0) * 50);
  }, [stats.wins, unlockedBugIds.length, stats.rxCorrect]);

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
    setStats(prev => {
      if (!isPractice && prev.lastDailyRxDate === dateStr) {
        return prev;
      }

      const updated = {
        ...prev,
        ...(!isPractice ? { lastDailyRxDate: dateStr } : {}),
        rxAttempted: (prev.rxAttempted || 0) + 1,
        rxCorrect: (prev.rxCorrect || 0) + (isCorrect ? 1 : 0)
      };
      localStorage.setItem('microbledle_stats_v1', JSON.stringify(updated));
      if (user && isFirebaseConfigured) {
        saveUserProgress(user.uid, { stats: updated });
      }
      return updated;
    });

    if (!isPractice && rxPayload) {
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
          rxCorrect: parsed.rxCorrect || 0
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
        lastDailyDate: cloudData?.stats?.lastDailyDate || localStats.lastDailyDate || (resolvedDailyGame?.gameOver ? todayStr : null),
        lastDailyRxDate: cloudData?.stats?.lastDailyRxDate || localStats.lastDailyRxDate || null
      };

      setStats(mergedStats);
      localStorage.setItem('microbledle_stats_v1', JSON.stringify(mergedStats));

      // 4. MERGE Microdex collection (union of unique IDs)
      const mergedBugs = Array.from(new Set([...localBugs, ...(cloudData?.unlockedBugIds || [])]));
      setUnlockedBugIds(mergedBugs);
      localStorage.setItem('microbledle_unlocked_bugs', JSON.stringify(mergedBugs));

      // 5. MERGE Profile information
      const mergedProfile = {
        ...localProfile,
        ...(cloudData?.profile || {}),
        displayName: cloudData?.profile?.displayName || authUser.displayName || localProfile.displayName || 'Physician'
      };
      setProfile(mergedProfile);
      localStorage.setItem('microbledle_profile', JSON.stringify(mergedProfile));

      // 6. SYNC Daily Game state across devices
      if (resolvedDailyGame) {
        localStorage.setItem(`microbledle_game_${todayStr}`, JSON.stringify(resolvedDailyGame));
        if (!isPractice) {
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
          displayName: mergedProfile.displayName || authUser.displayName || 'Physician',
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
              displayName: mergedProfile.displayName || authUser.displayName || 'Physician'
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
  }, [user]);

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
    if (isPractice) {
      setGuesses([]);
      setGameOver(false);
      setWon(false);
      setShowStatsModal(false);
      setShowCaseResultModal(false);
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
  }, [isPractice, dailyInfo]);

  // Autocomplete suggestions (pathogen name, common name, taxonomy)
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
      } else if (availableMicrobes.length > 0) {
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
          playDefeatSound(isMuted);
        }
      }, 700);

      if (!isPractice) {
        setStats(prev => {
          if (prev.lastDailyDate === dateStr) {
            console.log("Daily stats already recorded for date:", dateStr);
            return prev;
          }

          const newPlayed = prev.played + 1;
          const newWins = isVictory ? prev.wins + 1 : prev.wins;
          const newStreak = isVictory ? prev.streak + 1 : 0;
          const newMaxStreak = Math.max(prev.maxStreak, newStreak);
          const newDist = [...(prev.distribution || [0, 0, 0, 0, 0, 0])];
          if (isVictory && newGuesses.length <= 6) {
            newDist[newGuesses.length - 1] = (newDist[newGuesses.length - 1] || 0) + 1;
          }
          const updated = {
            ...prev,
            lastDailyDate: dateStr,
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

        const dailyGameData = {
          dateStr,
          guesses: newGuesses,
          gameOver: true,
          won: isVictory,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem(`microbledle_game_${dateStr}`, JSON.stringify(dailyGameData));

        if (user && isFirebaseConfigured) {
          saveUserProgress(user.uid, { lastDailyGame: dailyGameData });
        }

        // Submit daily case score to Global Leaderboard
        if (isVictory) {
          const newWins = stats.wins + (stats.lastDailyDate === dateStr ? 0 : 1);
          const currentProg = calculateUserProgression(
            newWins,
            unlockedBugIds.length + (!unlockedBugIds.includes(target.id) ? 1 : 0),
            (stats.rxCorrect || 0) * 50
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
            displayName: profile.displayName || (user?.email ? user.email.split('@')[0] : 'Physician'),
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
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`microbledle_game_${dateStr}`, JSON.stringify(ongoingDaily));
      if (user && isFirebaseConfigured) {
        saveUserProgress(user.uid, { lastDailyGame: ongoingDaily });
      }
    }
  };

  const startNewPractice = () => {
    const randomIndex = Math.floor(Math.random() * microbes.length);
    setTarget(microbes[randomIndex]);
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setShowStatsModal(false);
    setShowCaseResultModal(false);
    setSearchTerm('');
  };

  // Daily game status for Main Menu
  const dailyGameState = useMemo(() => {
    try {
      const saved = localStorage.getItem(`microbledle_game_${dailyInfo.dateStr}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    if (!isPractice) {
      return { gameOver, won, guesses };
    }
    return { gameOver: false, won: false, guesses: [] };
  }, [dailyInfo.dateStr, isPractice, gameOver, won, guesses]);

  const handleStartDaily = () => {
    setIsPractice(false);
    setTarget(dailyInfo.target);
    setDateStr(dailyInfo.dateStr);
    logAnalyticsEvent('game_start', { mode: 'daily', date: dailyInfo.dateStr });

    const savedGame = localStorage.getItem(`microbledle_game_${dailyInfo.dateStr}`);
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        setGuesses(parsed.guesses || []);
        setGameOver(parsed.gameOver || false);
        setWon(parsed.won || false);
        if (parsed.gameOver) {
          setShowCaseResultModal(true);
        }
      } catch (e) {}
    } else {
      setGuesses([]);
      setGameOver(false);
      setWon(false);
    }
    setCurrentScreen('game');
  };

  const handleStartPractice = () => {
    setIsPractice(true);
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

    const header = isPractice ? 'Microbledle (Practice)' : `Microbledle ${dateStr}`;
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
          onOpenStats={() => setShowStatsModal(true)}
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
          {/* Top Navbar */}
          <header className="w-full max-w-4xl border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
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
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-950/50 shrink-0 bg-white dark:bg-slate-900 group-hover:border-emerald-400 transition-all duration-300 group-hover:scale-105 ring-2 ring-emerald-500/20 flex items-center justify-center">
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
                    {isPractice && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                        Practice
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {isPractice ? 'Practice' : dateStr}
                    </span>
                    {!isPractice && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                        <Clock className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                        Next in <span className="font-mono text-emerald-600 dark:text-emerald-300 font-semibold">{countdown}</span>
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
                    {profile.displayName || 'Physician'}
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
              title="Next Random Pathogen"
            >
              <RotateCcw className="w-4 h-4" />
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
      <main className="w-full max-w-4xl flex-1 flex flex-col gap-6">
        
        {/* Search & Deduction Input */}
        {!gameOver ? (
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-emerald-500 dark:text-emerald-400 group-focus-within:text-emerald-400 transition" />
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
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-sm font-medium shadow-lg transition"
              />
            </div>

            {/* Autocomplete Dropdown with Keyboard Selection */}
            {isSearchOpen && availableMicrobes.length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 backdrop-blur-md">
                {availableMicrobes.map((bug, idx) => {
                  const isSelected = idx === searchSelectedIndex;
                  const gramInfo = getGramBadge(bug.morphology.gram);

                  return (
                    <button
                      key={bug.id}
                      onClick={() => handleSelectMicrobe(bug)}
                      onMouseEnter={() => setSearchSelectedIndex(idx)}
                      className={`w-full text-left px-4 py-3 transition flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-emerald-50 dark:bg-slate-800/95 ring-1 ring-emerald-500/50' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400 italic group-hover:text-emerald-500 dark:group-hover:text-emerald-300 flex items-center gap-2 flex-wrap">
                          <span>{bug.name}</span>
                          <span className={`not-italic text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${gramInfo.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${gramInfo.dot}`} />
                            {gramInfo.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{bug.commonName}</span> • {bug.taxonomy}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 shrink-0 transform transition ${isSelected ? 'text-emerald-500 dark:text-emerald-400 translate-x-1' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto w-full p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center shadow-lg">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Diagnosis finalized for this case</div>
            <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400 italic">
              {target.name} ({target.commonName})
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              Next daily case in: <span className="font-mono text-emerald-600 dark:text-emerald-300 font-bold">{countdown}</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
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

          {/* 3. Patient Story Clue (Unlocks at guess >= 4) */}
          <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${
            guesses.length >= 4 
              ? 'bg-slate-900/80 border-amber-500/40 text-slate-200 shadow-md shadow-amber-950/20' 
              : 'bg-slate-900/30 border-slate-800/60 text-slate-500'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                guesses.length >= 4 ? 'text-amber-400' : 'text-slate-500'
              }`}>
                <Stethoscope className="w-3.5 h-3.5" /> Patient Story Clue
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
                  Reveals patient symptoms and case presentation...
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
              <span>Your Guesses ({guesses.length}/{maxGuesses})</span>
            </div>
            {/* Color Legend */}
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block shadow-sm"></span>
                <span className="text-slate-300 font-medium">Exact Match</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-600 inline-block shadow-sm"></span>
                <span className="text-slate-300 font-medium">Partial Match</span>
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
                      {/* Pathogen Name & Badge */}
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
              isDaily={!isPractice}
              dateStr={dateStr}
              isMuted={isMuted}
              onAnswer={handleRxAnswer}
              onOpenMicrodex={() => handleOpenMicrodex(target)}
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
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-2 text-slate-200 transition text-xs sm:text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Next Practice Organism
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

      {/* Career Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowStatsModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-2">
                <BarChart2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Career Statistics</h2>
              <p className="text-xs text-slate-400">Clinical performance & diagnostic accuracy</p>
            </div>

            {/* Overall Statistics */}
            <div className="mb-6">
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

              {/* Antibiotic Challenge Stat Row */}
              <div className="mt-2.5 p-3 bg-slate-800/50 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
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

            {/* Action buttons */}
            <div className="space-y-2">
              {/* View Global Leaderboard Button */}
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setShowLeaderboardModal(true);
                }}
                className="w-full py-3 bg-slate-800/90 hover:bg-slate-750 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition text-xs sm:text-sm"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>View Global Leaderboard</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition text-xs"
              >
                <span>Close</span>
              </button>
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
              <div className="flex items-center gap-2 text-cyan-300">
                <Microscope className="w-4 h-4 shrink-0" />
                <span><strong>Microscope Clue:</strong> Unlocks after Guess 2.</span>
              </div>
              <div className="flex items-center gap-2 text-teal-300">
                <TestTube2 className="w-4 h-4 shrink-0" />
                <span><strong>Culture Clue:</strong> Unlocks after Guess 3.</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <Stethoscope className="w-4 h-4 shrink-0" />
                <span><strong>Patient Story Clue:</strong> Unlocks after Guess 4.</span>
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
    </div>
  );
}
