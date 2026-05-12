import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET: получить все темы + уровни + прогресс пользователя
 */
export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 🔥 получаем темы вместе с уровнями
  const topics = await prisma.topic.findMany({
    include: {
      levels: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  // 🔥 прогресс пользователя
  const progressRows = await prisma.userTopicProgress.findMany({
    where: {
      userId: user.id,
    },
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

/**
 * PATCH: обновить прогресс темы
 */
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
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.userTopicProgress.upsert({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId,
      },
    },
    update: {
      progress,
      completed: progress >= 100,
    },
    create: {
      userId: user.id,
      topicId,
      progress,
      completed: progress >= 100,
    },
  });

  return NextResponse.json(updated);
}
