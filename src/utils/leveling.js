// Thai Medical System Leveling & Ranking for Microbledle

export const RANKS = [
  { level: 1,  title: 'Pre-Med',                       minXp: 0,    maxXp: 150,      badge: '📖' },
  { level: 2,  title: 'Y1 Medical Student',            minXp: 150,  maxXp: 300,      badge: '🔬' },
  { level: 3,  title: 'Y2 Medical Student',            minXp: 300,  maxXp: 500,      badge: '📚' },
  { level: 4,  title: 'Y3 Medical Student',            minXp: 500,  maxXp: 750,      badge: '🧬' },
  { level: 5,  title: 'Y4 Medical Student',            minXp: 750,  maxXp: 1050,     badge: '🩺' },
  { level: 6,  title: 'Y5 Medical Student',            minXp: 1050, maxXp: 1400,     badge: '🥼' },
  { level: 7,  title: 'Y6 Medical Student (Extern)',   minXp: 1400, maxXp: 1800,     badge: '⭐' },
  { level: 8,  title: 'Intern 1',                      minXp: 1800, maxXp: 2300,     badge: '🧫' },
  { level: 9,  title: 'Intern 2',                      minXp: 2300, maxXp: 2900,     badge: '🏥' },
  { level: 10, title: 'Intern 3',                      minXp: 2900, maxXp: 3600,     badge: '💉' },
  { level: 11, title: 'Resident 1 (R1)',               minXp: 3600, maxXp: 4400,     badge: '💊' },
  { level: 12, title: 'Resident 2 (R2)',               minXp: 4400, maxXp: 5300,     badge: '📋' },
  { level: 13, title: 'Resident 3 (R3 / Chief)',       minXp: 5300, maxXp: 6300,     badge: '🏅' },
  { level: 14, title: 'Fellow 1 (F1)',                 minXp: 6300, maxXp: 7500,     badge: '🎯' },
  { level: 15, title: 'Fellow 2 (F2)',                 minXp: 7500, maxXp: 9000,     badge: '🌟' },
  { level: 16, title: 'Attending (อาจารย์แพทย์)',       minXp: 9000, maxXp: Infinity, badge: '👑' },
];

export const STATUS_OPTIONS = [
  'Pre-Med',
  'Medical Student Y1',
  'Medical Student Y2',
  'Medical Student Y3',
  'Medical Student Y4',
  'Medical Student Y5',
  'Medical Student Y6 (Extern)',
  'Intern 1 (แพทย์เพิ่มพูนทักษะ)',
  'Intern 2 (แพทย์ใช้ทุน)',
  'Intern 3 (แพทย์ใช้ทุน)',
  'Resident 1 (แพทย์ประจำบ้าน R1)',
  'Resident 2 (แพทย์ประจำบ้าน R2)',
  'Resident 3 (แพทย์ประจำบ้าน R3)',
  'Fellow 1 (แพทย์ประจำบ้านต่อยอด F1)',
  'Fellow 2 (แพทย์ประจำบ้านต่อยอด F2)',
  'Attending (อาจารย์แพทย์)'
];

export const AVATAR_OPTIONS = [
  { id: 'microscope', emoji: '🔬', label: 'Microscope' },
  { id: 'petri', emoji: '🧫', label: 'Culture Dish' },
  { id: 'stethoscope', emoji: '🩺', label: 'Stethoscope' },
  { id: 'dna', emoji: '🧬', label: 'DNA Double Helix' },
  { id: 'pill', emoji: '💊', label: 'Antimicrobial' },
  { id: 'labcoat', emoji: '🥼', label: 'Lab Coat' },
  { id: 'scientist', emoji: '👩‍⚕️', label: 'Female Physician' },
  { id: 'doctor', emoji: '👨‍⚕️', label: 'Male Physician' },
  { id: 'flame', emoji: '🔥', label: 'Bacterial Fire' },
  { id: 'bug', emoji: '🦠', label: 'Microbe' }
];

export function calculateUserProgression(wins = 0, unlockedCount = 0, bonusXp = 0) {
  // 100 XP per solved case + 50 XP per unique Bugdex unlocked pathogen + bonus XP
  const totalXp = Math.max(0, (wins * 100) + (unlockedCount * 50) + Number(bonusXp || 0));

  let currentRank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXp >= RANKS[i].minXp) {
      currentRank = RANKS[i];
      break;
    }
  }

  const isMaxLevel = currentRank.level === RANKS.length;
  const xpInCurrentLevel = totalXp - currentRank.minXp;
  const levelSpan = isMaxLevel ? 1 : (currentRank.maxXp - currentRank.minXp);
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((xpInCurrentLevel / levelSpan) * 100));
  const xpNeeded = isMaxLevel ? 0 : (currentRank.maxXp - totalXp);

  return {
    totalXp,
    level: currentRank.level,
    title: currentRank.title,
    badge: currentRank.badge,
    progressPercent,
    xpNeeded,
    isMaxLevel
  };
}
