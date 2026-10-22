import microbes from '../data/microbes.json';

/**
 * Historical epoch cutover date (UTC).
 * - Dates strictly prior to 2026-10-23 UTC preserve the original 70-pathogen schedule.
 *   This guarantees that historical games and 2026-10-22 (Legionella pneumophila) remain intact.
 * - Dates on or after 2026-10-23 UTC smoothly rotate across the full 100-pathogen library.
 * Constants are fixed numbers (not dynamic microbes.length) so adding more pathogens in the future
 * will NEVER shift any past, present, or scheduled daily target.
 */
export const DAILY_CUTOVER_DATE = '2026-10-23';
export const POOL_SIZE_V1 = 70;
export const POOL_SIZE_V2 = 100;

/**
 * Deterministic daily target pathogen for any date in UTC.
 * @param {string|Date} [specificDate] Optional date string (YYYY-MM-DD) or Date object. Defaults to current UTC date.
 * @param {object} [historyMap] Optional map of historical plays to respect finalized pathogen IDs.
 * @returns {{ target: object, dateStr: string }}
 */
export function getDailyTarget(specificDate, historyMap = null) {
  let dateStr;
  if (typeof specificDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(specificDate)) {
    dateStr = specificDate;
  } else {
    const now = specificDate instanceof Date ? specificDate : new Date();
    dateStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  }

  // 1. If player has already played and recorded this date in history, lock to that exact pathogen
  if (historyMap && historyMap[dateStr]?.bugId) {
    const recordedBug = microbes.find(m => m.id === historyMap[dateStr].bugId);
    if (recordedBug) {
      return { target: recordedBug, dateStr };
    }
  }

  // 2. Deterministic schedule calculation
  const poolSize = dateStr < DAILY_CUTOVER_DATE ? POOL_SIZE_V1 : POOL_SIZE_V2;

  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % poolSize;
  const target = microbes[index] || microbes[0];
  return { target, dateStr };
}

/**
 * Get current UTC date string (YYYY-MM-DD).
 * @returns {string}
 */
export function getTodayDateStr() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}
