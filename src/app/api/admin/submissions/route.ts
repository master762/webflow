import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - получить все работы на проверке
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  if (!user || user.role.name !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submissions = await prisma.projectSubmission.findMany({
    where: { status: "pending" },
    include: {
      user: true,
      project: { include: { topic: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(submissions);
}

// PATCH - оценить работу
export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  if (!user || user.role.name !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId, score, comment } = await req.json();

  // XP за балл (например, 10 XP за 1 балл)
  const XP_PER_POINT = 10;
  const xpAwarded = score * XP_PER_POINT;

  const submission = await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      status: "reviewed",
      score,
      comment,
      xpAwarded,
      reviewedAt: new Date(),
    },
  });

  // Начисляем XP пользователю
  await prisma.user.update({
    where: { id: submission.userId },
    data: {
      xp: { increment: xpAwarded },
    },
  });

  return NextResponse.json(submission);
}
