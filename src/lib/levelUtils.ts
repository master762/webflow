import { prisma } from "./db";

const levelData = [
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
];

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
