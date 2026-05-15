import { prisma } from "./db";

interface UserStats {
  xp: number;
  topicsCompleted: number;
  streak: number;
}

interface StoredAchievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const achievementsList: Array<{
  id: number;
  title: string;
  description: string;
  icon: string;
  check: (stats: UserStats) => boolean;
}> = [
  {
    id: 1,
    title: "Первые шаги",
    description: "Набрано 50 XP",
    icon: "fa-star",
    check: (u) => u.xp >= 50,
  },
  {
    id: 2,
    title: "Ученик",
    description: "Набрано 100 XP",
    icon: "fa-graduation-cap",
    check: (u) => u.xp >= 100,
  },
  {
    id: 3,
    title: "Знаток",
    description: "Набрано 250 XP",
    icon: "fa-brain",
    check: (u) => u.xp >= 250,
  },
  {
    id: 4,
    title: "Эксперт",
    description: "Набрано 500 XP",
    icon: "fa-chart-line",
    check: (u) => u.xp >= 500,
  },
  {
    id: 5,
    title: "Мастер",
    description: "Набрано 1000 XP",
    icon: "fa-crown",
    check: (u) => u.xp >= 1000,
  },
  {
    id: 6,
    title: "Гуру",
    description: "Набрано 1800 XP",
    icon: "fa-mountain",
    check: (u) => u.xp >= 1800,
  },
  {
    id: 7,
    title: "Легенда",
    description: "Набрано 4000 XP",
    icon: "fa-gem",
    check: (u) => u.xp >= 4000,
  },
  {
    id: 8,
    title: "Архитектор",
    description: "Завершено 4 темы",
    icon: "fa-drafting-compass",
    check: (u) => u.topicsCompleted >= 4,
  },
  {
    id: 9,
    title: "Мастер верстки",
    description: "Завершено 6 тем",
    icon: "fa-code",
    check: (u) => u.topicsCompleted >= 6,
  },
  {
    id: 10,
    title: "Серия побед",
    description: "7 дней подряд",
    icon: "fa-fire",
    check: (u) => u.streak >= 7,
  },
];

export async function checkAndUnlockAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      topicsCompleted: true,
      streak: true,
      achievements: true,
    },
  });
  if (!user) return;

  const stats: UserStats = {
    xp: user.xp,
    topicsCompleted: user.topicsCompleted,
    streak: user.streak,
  };

  const achievements: StoredAchievement[] = JSON.parse(user.achievements);
  let updated = false;

  for (const ach of achievementsList) {
    const existing = achievements.find((a) => a.id === ach.id);
    if ((!existing || !existing.unlocked) && ach.check(stats)) {
      if (existing) {
        existing.unlocked = true;
      } else {
        achievements.push({ ...ach, unlocked: true });
      }
      updated = true;
    }
  }

  if (updated) {
    await prisma.user.update({
      where: { id: userId },
      data: { achievements: JSON.stringify(achievements) },
    });
  }
}
