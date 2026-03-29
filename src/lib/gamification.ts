/** XP needed per level (linear). Level 1 = 0–99 XP, level 2 = 100–199, … */
export const XP_PER_LEVEL = 100;

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpInCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function getLevelProgressPercent(xp: number): number {
  return (getXpInCurrentLevel(xp) / XP_PER_LEVEL) * 100;
}

export function updateDailyStreak(
  lastStreakDate: string | undefined,
  currentStreak: number,
): { streak: number; lastStreakDate: string } {
  const today = new Date().toDateString();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toDateString();

  if (lastStreakDate === today) {
    return { streak: currentStreak, lastStreakDate: today };
  }
  if (lastStreakDate === yesterday) {
    return { streak: currentStreak + 1, lastStreakDate: today };
  }
  return { streak: 1, lastStreakDate: today };
}
