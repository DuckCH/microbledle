import { getDailyTarget, getTodayDateStr } from './dailyTarget';

/**
 * Get yesterday's UTC date string given a YYYY-MM-DD date string.
 */
export function getYesterdayDateStr(dateStr) {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] - 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Format date string into human-friendly format (e.g. "October 23, 2026")
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Evaluate streak health and dynamic message.
 */
export function getStreakHealth(stats = {}, todayDateStr = getTodayDateStr()) {
  const lastDailyDate = stats.lastDailyDate;
  const yesterdayDateStr = getYesterdayDateStr(todayDateStr);
  const maxStreak = Math.max(stats.maxStreak || 0, stats.streak || 0);

  if (!lastDailyDate) {
    return {
      currentStreak: 0,
      maxStreak,
      status: 'NEVER_PLAYED',
      isTodayCompleted: false,
      message: "Start your streak with today's case!"
    };
  }

  if (lastDailyDate === todayDateStr) {
    return {
      currentStreak: stats.streak || 1,
      maxStreak,
      status: 'COMPLETED_TODAY',
      isTodayCompleted: true,
      message: "Streak secured! You've diagnosed today's pathogen."
    };
  }

  if (lastDailyDate === yesterdayDateStr) {
    return {
      currentStreak: stats.streak || 0,
      maxStreak,
      status: 'PENDING_TODAY',
      isTodayCompleted: false,
      message: `Streak active (${stats.streak || 0}d)! Solve today's case to extend your streak.`
    };
  }

  // Played 2 or more days ago - streak broken
  return {
    currentStreak: 0,
    maxStreak,
    status: 'BROKEN',
    isTodayCompleted: false,
    message: "Streak lapsed. Ignite a new streak with today's case!"
  };
}

/**
 * Load and compile daily history from localStorage.
 * Scans both dedicated history store and any historical `microbledle_game_*` entries.
 */
export function loadDailyHistory() {
  if (typeof window === 'undefined') return {};
  
  let history = {};
  try {
    const raw = localStorage.getItem('microbledle_daily_history');
    if (raw) {
      history = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not parse microbledle_daily_history", e);
  }

  // Scan localStorage for any legacy/individual game entries
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('microbledle_game_')) {
        const dateStr = key.replace('microbledle_game_', '');
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !history[dateStr]) {
          try {
            const gameData = JSON.parse(localStorage.getItem(key));
            if (gameData && gameData.gameOver) {
              const info = getDailyTarget(dateStr);
              history[dateStr] = {
                dateStr,
                won: Boolean(gameData.won),
                gameOver: true,
                guessesCount: Array.isArray(gameData.guesses) ? gameData.guesses.length : 6,
                bugId: info.target.id,
                bugName: info.target.name,
                completedAt: gameData.updatedAt || new Date().toISOString()
              };
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.warn("Error scanning daily game entries", e);
  }

  return history;
}

/**
 * Record a completed daily game in the history map and persist to localStorage.
 */
export function saveDailyHistoryEntry(dateStr, gameData, targetBug) {
  if (typeof window === 'undefined') return;
  try {
    const history = loadDailyHistory();
    history[dateStr] = {
      dateStr,
      won: Boolean(gameData.won),
      gameOver: Boolean(gameData.gameOver),
      guessesCount: Array.isArray(gameData.guesses) ? gameData.guesses.length : 6,
      bugId: targetBug?.id,
      bugName: targetBug?.name,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('microbledle_daily_history', JSON.stringify(history));
    return history;
  } catch (e) {
    console.warn("Could not save daily history entry", e);
  }
}

/**
 * Get data for the last 7 calendar days ending with today.
 */
export function getLast7DaysStreak(historyMap = {}, todayDateStr = getTodayDateStr()) {
  const days = [];
  const parts = todayDateStr.split('-').map(Number);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] - offset));
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    const isToday = dateStr === todayDateStr;
    const record = historyMap[dateStr] || null;
    const isSolved = Boolean(record && record.won);
    const isFailed = Boolean(record && record.gameOver && !record.won);

    days.push({
      dateStr,
      dayNumber: d.getUTCDate(),
      dayLabel: dayNames[d.getUTCDay()],
      isToday,
      isSolved,
      isFailed,
      guessesCount: record?.guessesCount || null
    });
  }

  return days;
}

/**
 * Generate full calendar grid for a given year and month (0-11).
 */
export function getMonthCalendarData(year, monthIndex, historyMap = {}, todayDateStr = getTodayDateStr()) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const startingDayOfWeek = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const cells = [];

  // Padding cells before the 1st
  for (let i = 0; i < startingDayOfWeek; i++) {
    cells.push({
      key: `pad-prev-${i}`,
      isPadding: true
    });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayDateStr;
    const isFuture = dateStr > todayDateStr;
    const isPast = dateStr < todayDateStr;

    const record = historyMap[dateStr] || null;
    const isSolved = Boolean(record && record.won);
    const isFailed = Boolean(record && record.gameOver && !record.won);
    const guessesCount = record?.guessesCount || (record?.guesses?.length) || null;
    const dailyTargetInfo = getDailyTarget(dateStr, historyMap);

    cells.push({
      key: dateStr,
      dayNumber: day,
      dateStr,
      isToday,
      isFuture,
      isPast,
      isPadding: false,
      isSolved,
      isFailed,
      guessesCount,
      targetBug: dailyTargetInfo.target,
      record
    });
  }

  return {
    year,
    monthIndex,
    startingDayOfWeek,
    daysInMonth,
    cells
  };
}
