// Thai Medical System Leveling & Ranking for Microbledle

export const RANKS = [
  { level: 1,  title: 'Pre-Med',                       minXp: 0,     maxXp: 250,      badge: '📖' },
  { level: 2,  title: 'Y1 Medical Student',            minXp: 250,   maxXp: 600,      badge: '🔬' },
  { level: 3,  title: 'Y2 Medical Student',            minXp: 600,   maxXp: 1100,     badge: '📚' },
  { level: 4,  title: 'Y3 Medical Student',            minXp: 1100,  maxXp: 1800,     badge: '🧬' },
  { level: 5,  title: 'Y4 Medical Student',            minXp: 1800,  maxXp: 2700,     badge: '🩺' },
  { level: 6,  title: 'Y5 Medical Student',            minXp: 2700,  maxXp: 3800,     badge: '🥼' },
  { level: 7,  title: 'Y6 Medical Student (Extern)',   minXp: 3800,  maxXp: 5100,     badge: '⭐' },
  { level: 8,  title: 'Intern 1',                      minXp: 5100,  maxXp: 6700,     badge: '🧫' },
  { level: 9,  title: 'Intern 2',                      minXp: 6700,  maxXp: 8600,     badge: '🏥' },
  { level: 10, title: 'Intern 3',                      minXp: 8600,  maxXp: 10800,    badge: '💉' },
  { level: 11, title: 'Resident 1 (R1)',               minXp: 10800, maxXp: 13400,    badge: '💊' },
  { level: 12, title: 'Resident 2 (R2)',               minXp: 13400, maxXp: 16500,    badge: '📋' },
  { level: 13, title: 'Resident 3 (R3 / Chief)',       minXp: 16500, maxXp: 20200,    badge: '🏅' },
  { level: 14, title: 'Fellow 1 (F1)',                 minXp: 20200, maxXp: 24600,    badge: '🎯' },
  { level: 15, title: 'Fellow 2 (F2)',                 minXp: 24600, maxXp: 30000,    badge: '🌟' },
  { level: 16, title: 'Attending (อาจารย์แพทย์)',       minXp: 30000, maxXp: Infinity, badge: '👑' },
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

export function calculateRxXp(stats = {}, practiceRxBugIds = []) {
  const dailyRx = stats.dailyRxWins !== undefined 
    ? (stats.dailyRxWins || 0) 
    : Math.min(stats.rxCorrect || 0, stats.wins || 0);
  const practiceCount = Array.isArray(practiceRxBugIds) ? practiceRxBugIds.length : 0;
  return (dailyRx + practiceCount) * 50;
}

export function calculateUserProgression(wins = 0, unlockedCount = 0, bonusXp = 0) {
  // 100 XP per solved daily case + 50 XP per unique Microdex unlocked pathogen (one-time only) + Rx bonus XP
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

export const RANDOM_NAME_PREFIXES = [
  'Octopus', 'Falcon', 'Dolphin', 'Tiger', 'Eagle', 'Badger',
  'Penguin', 'Panther', 'Otter', 'Fox', 'Koala', 'Owl',
  'Jaguar', 'Cheetah', 'Wolf', 'Hawk', 'Raven', 'Panda',
  'Bear', 'Lynx', 'Bison', 'Seal', 'Beaver', 'Moose',
  'Crane', 'Hedgehog', 'Viper', 'Chameleon', 'Gecko', 'Mantis'
];

export function generateRandomPlayerName() {
  const prefix = RANDOM_NAME_PREFIXES[Math.floor(Math.random() * RANDOM_NAME_PREFIXES.length)];
  const num = Math.floor(100 + Math.random() * 900); // 100 - 999
  return `${prefix}_${num}`;
}
