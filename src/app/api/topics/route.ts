import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { updateUserLevel } from "@/lib/levelUtils";
import { checkAndUnlockAchievements } from "@/lib/achievements";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Получаем темы вместе с уровнями
  const topics = await prisma.topic.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      difficulty: true,
      iconKey: true,
      lessons: true,
      xpPerLesson: true,
      requirements: true,
      accessLevel: true,
      levels: {
        orderBy: { order: "asc" },
      },
    },
  });
  // Прогресс пользователя по темам
  const progressRows = await prisma.userTopicProgress.findMany({
    where: { userId: user.id },
  });

  const progressMap = progressRows.map((p) => ({
    topicId: p.topicId,
    progress: p.progress,
    completed: p.completed,
  }));

  return NextResponse.json({
    topics,
    progress: progressMap,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { topicId, progress } = body;

  if (typeof topicId !== "number" || typeof progress !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Получаем старую запись прогресса, чтобы понять, была ли тема уже завершена
  const oldProgress = await prisma.userTopicProgress.findUnique({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId,
      },
    },
  });

  const wasCompleted = oldProgress?.completed === true;
  const isNowCompleted = progress >= 100;

  // Обновляем прогресс темы
  const updated = await prisma.userTopicProgress.upsert({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId,
      },
    },
    update: {
      progress,
      completed: isNowCompleted,
    },
    create: {
      userId: user.id,
      topicId,
      progress,
      completed: isNowCompleted,
    },
  });

  // Если тема только что завершена (была не завершена, а стала завершена)
  if (isNowCompleted && !wasCompleted) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        topicsCompleted: { increment: 1 },
        xp: { increment: 50 }, // бонус за тему
      },
    });
    // Обновляем уровень и достижения
    await updateUserLevel(user.id);
    await checkAndUnlockAchievements(user.id);
  }

  return NextResponse.json(updated);
}
