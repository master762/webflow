import { NextResponse } from "next/server";
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

  const users = await prisma.user.findMany({
    where: {
      roleId: { in: [1, 2] },
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

  const formattedUsers = users.map((user: any) => {
    // Вычисляем прогресс (пример: 8 тем всего)
    const progressPercent =
      user.topicsCompleted > 0 ? (user.topicsCompleted / 8) * 100 : 0;

    const projects = user.projectSubmissions
      .filter((sub: any) => sub.status === "reviewed")
      .map((sub: any) => ({
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
      roleId: user.roleId,
      roleName: user.role.name,
      projects,
    };
  });

  return NextResponse.json(formattedUsers);
}
