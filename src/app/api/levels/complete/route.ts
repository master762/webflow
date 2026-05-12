import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { levelId } = await req.json();
  if (typeof levelId !== "number") {
    return NextResponse.json({ error: "Invalid levelId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 1. Получаем уровень с темой
  const level = await prisma.level.findUnique({
    where: { id: levelId },
    include: { topic: true },
  });
  if (!level) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  const topic = level.topic;
  const totalLessons = topic.lessons;

  // 2. Получаем текущий прогресс пользователя по этой теме
  const progressRecord = await prisma.userTopicProgress.findUnique({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId: topic.id,
      },
    },
  });

  // Сколько уроков уже пройдено? (вычисляем из процента)
  let completedLessons = 0;
  if (progressRecord) {
    completedLessons = Math.round(
      (progressRecord.progress / 100) * totalLessons,
    );
  }

  // Рассчитаем новый прогресс: добавляем 1 урок
  const newCompletedLessons = completedLessons + 1;
  const newProgress = Math.min(
    100,
    Math.round((newCompletedLessons / totalLessons) * 100),
  );
  const completed = newProgress >= 100;

  // Обновляем или создаём запись прогресса
  await prisma.userTopicProgress.upsert({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId: topic.id,
      },
    },
    update: {
      progress: newProgress,
      completed,
    },
    create: {
      userId: user.id,
      topicId: topic.id,
      progress: newProgress,
      completed,
    },
  });

  // 3. Начисляем XP за уровень (если уровень ещё не был пройден)
  let xpAwarded = 0;
  if (newCompletedLessons > completedLessons) {
    xpAwarded = level.xp;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: level.xp },
      },
    });
  }

  // 4. Если тема завершена только что (completed стала true, а раньше была false)
  if (completed && (!progressRecord || !progressRecord.completed)) {
    // Дополнительный бонус за тему (50 XP)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        topicsCompleted: { increment: 1 },
        xp: { increment: 50 },
      },
    });
  }

  return NextResponse.json({
    success: true,
    xpAwarded,
    completed,
    newProgress,
  });
}
