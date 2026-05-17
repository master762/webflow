import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, repoLink } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Проверяем, есть ли уже отправка
  const existing = await prisma.projectSubmission.findFirst({
    where: { projectId, userId: user.id },
  });

  if (existing) {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const submission = await prisma.projectSubmission.create({
    data: {
      projectId,
      userId: user.id,
      repoLink,
      status: "pending",
    },
  });

  return NextResponse.json(submission, { status: 201 });
}
