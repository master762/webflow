import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { getRankProgress, updateUserLevel } from "@/lib/levelUtils";
import { checkAndUnlockAchievements } from "@/lib/achievements";

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

  const level = await prisma.level.findUnique({
    where: { id: levelId },
    include: { topic: true },
  });
  if (!level) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  const topic = level.topic;
  const totalLessons = topic.lessons;

  const progressRecord = await prisma.userTopicProgress.findUnique({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId: topic.id,
      },
    },
  });

  let completedLessons = 0;
  if (progressRecord) {
    completedLessons = Math.round(
      (progressRecord.progress / 100) * totalLessons,
    );
  }

  const newCompletedLessons = completedLessons + 1;
  const newProgress = Math.min(
    100,
    Math.round((newCompletedLessons / totalLessons) * 100),
  );
  const completed = newProgress >= 100;

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

  if (completed && (!progressRecord || !progressRecord.completed)) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        topicsCompleted: { increment: 1 },
        xp: { increment: 50 },
      },
    });
  }

  await updateUserLevel(user.id);
  await checkAndUnlockAchievements(user.id);

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { xp: true, level: true, title: true },
  });

  const rankProgress = getRankProgress(updatedUser?.xp ?? user.xp);

  return NextResponse.json({
    success: true,
    xpAwarded,
    topicBonusXp: completed && (!progressRecord || !progressRecord.completed) ? 50 : 0,
    completed,
    newProgress,
    totalXp: updatedUser?.xp ?? user.xp,
    rankProgress,
  });
}
