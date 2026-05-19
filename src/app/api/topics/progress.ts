import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicId, progress } = await req.json();

  if (typeof topicId !== "number" || typeof progress !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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

  if (progress >= 100) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        topicsCompleted: {
          increment: 1,
        },
        xp: {
          increment: 50,
        },
      },
    });
  }

  return NextResponse.json(updated);
}
