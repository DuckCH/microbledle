// Gamified Medical Microbiology Leveling & Ranking System for Microbledle

export const RANKS = [
  { level: 1, title: 'Pre-Med Observer', minXp: 0, maxXp: 200, badge: '🩺' },
  { level: 2, title: 'MS1 - Histology Scrub', minXp: 200, maxXp: 500, badge: '🔬' },
  { level: 3, title: 'MS2 - Board Prepper', minXp: 500, maxXp: 900, badge: '📚' },
  { level: 4, title: 'MS3 - Clinical Clerk', minXp: 900, maxXp: 1400, badge: '🥼' },
  { level: 5, title: 'MS4 - Sub-I Diagnostic Star', minXp: 1400, maxXp: 2000, badge: '⭐' },
  { level: 6, title: 'Intern - Culture Collector', minXp: 2000, maxXp: 2800, badge: '🧫' },
  { level: 7, title: 'Resident - Antibiotic Steward', minXp: 2800, maxXp: 3800, badge: '💊' },
  { level: 8, title: 'Chief Resident - Diagnostic Maven', minXp: 3800, maxXp: 5000, badge: '🏅' },
  { level: 9, title: 'Infectious Disease Fellow', minXp: 5000, maxXp: 6500, badge: '🧬' },
  { level: 10, title: 'Attending Microbiologist', minXp: 6500, maxXp: Infinity, badge: '👑' },
];

export const STATUS_OPTIONS = [
  'Medical Student (MS1/MS2)',
  'Clinical Clerk (MS3/MS4)',
  'Internal Medicine Resident',
  'Pediatrics Resident',
  'Emergency Medicine Resident',
  'Infectious Disease Fellow',
  'Attending Physician',
  'Microbiology Lab Tech',
  'Nursing / PA Student',
  'Curious Bio-Nerd'
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

export function calculateUserProgression(wins = 0, unlockedCount = 0) {
  // 100 XP per solved case + 50 XP per unique Bugdex unlocked pathogen
  const totalXp = Math.max(0, (wins * 100) + (unlockedCount * 50));

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
