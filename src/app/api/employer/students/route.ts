import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  if (!employer || employer.role.name !== "employer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Получаем всех пользователей с ролями user и subscriber
  const users = await prisma.user.findMany({
    where: {
      roleId: { in: [1, 2] }, // user и subscriber
    },
    include: {
      role: true,
      projectSubmissions: {
        include: {
          project: {
            include: {
              topic: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Форматируем данные для каждого пользователя
  const formattedUsers = users.map((user) => {
    const totalLessons = 0; // нужно будет добавить логику подсчёта
    const completedLessons = 0; // нужно будет добавить логику подсчёта
    const progressPercent =
      user.topicsCompleted > 0 ? (user.topicsCompleted / 8) * 100 : 0; // 8 - всего тем

    const projects = user.projectSubmissions
      .filter((sub) => sub.status === "reviewed")
      .map((sub) => ({
        id: sub.id,
        title: sub.project.topic.title,
        repoLink: sub.repoLink,
        score: sub.score,
        comment: sub.comment,
        submittedAt: sub.submittedAt,
      }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      xp: user.xp,
      level: user.level,
      topicsCompleted: user.topicsCompleted,
      streak: user.streak,
      progressPercent: Math.round(progressPercent),
      projects,
    };
  });

  return NextResponse.json(formattedUsers);
}
