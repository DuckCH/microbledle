import microbes from '../data/microbes.json';

/**
 * Deterministic daily target pathogen for any date in UTC.
 * @param {string|Date} [specificDate] Optional date string (YYYY-MM-DD) or Date object. Defaults to current UTC date.
 * @returns {{ target: object, dateStr: string }}
 */
export function getDailyTarget(specificDate) {
  let dateStr;
  if (typeof specificDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(specificDate)) {
    dateStr = specificDate;
  } else {
    const now = specificDate instanceof Date ? specificDate : new Date();
    dateStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  }

  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % microbes.length;
  return { target: microbes[index], dateStr };
}

/**
 * Get current UTC date string (YYYY-MM-DD).
 * @returns {string}
 */
export function getTodayDateStr() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}
