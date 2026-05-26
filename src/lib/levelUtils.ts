import { prisma } from "./db";

export const RANK_DATA = [
  { minXp: 0, title: "Новичок" },
  { minXp: 100, title: "Ученик" },
  { minXp: 250, title: "Знаток" },
  { minXp: 500, title: "Эксперт" },
  { minXp: 1000, title: "Мастер" },
  { minXp: 1800, title: "Гуру" },
  { minXp: 2800, title: "Архитектор" },
  { minXp: 4000, title: "Легенда" },
  { minXp: 5500, title: "Искатель истины" },
  { minXp: 7500, title: "Грандмастер" },
] as const;

const levelData = RANK_DATA;

export function getLevelAndTitle(xp: number) {
  let level = 1;
  let title = "Новичок";
  for (let i = levelData.length - 1; i >= 0; i--) {
    if (xp >= levelData[i].minXp) {
      level = i + 1;
      title = levelData[i].title;
      break;
    }
  }
  return { level, title };
}

export type RankProgress = {
  rankLevel: number;
  rankTitle: string;
  totalXp: number;
  nextRankTitle: string | null;
  nextRankXp: number | null;
  progressPercent: number;
  xpToNext: number;
};

export function getRankProgress(xp: number): RankProgress {
  const { level: rankLevel, title: rankTitle } = getLevelAndTitle(xp);
  const idx = rankLevel - 1;
  const next = RANK_DATA[idx + 1];

  if (!next) {
    return {
      rankLevel,
      rankTitle,
      totalXp: xp,
      nextRankTitle: null,
      nextRankXp: null,
      progressPercent: 100,
      xpToNext: 0,
    };
  }

  const currentMin = RANK_DATA[idx].minXp;
  const span = next.minXp - currentMin;
  const progressPercent = Math.min(
    100,
    Math.round(((xp - currentMin) / span) * 100),
  );

  return {
    rankLevel,
    rankTitle,
    totalXp: xp,
    nextRankTitle: next.title,
    nextRankXp: next.minXp,
    progressPercent,
    xpToNext: Math.max(0, next.minXp - xp),
  };
}

export async function updateUserLevel(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });
  if (!user) return;
  const { level, title } = getLevelAndTitle(user.xp);
  await prisma.user.update({
    where: { id: userId },
    data: { level, title },
  });
}
