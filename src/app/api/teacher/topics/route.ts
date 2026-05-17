import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  if (!teacher || teacher.role.name !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const topics = await prisma.topic.findMany({
    where: { teacherId: teacher.id },
    include: { levels: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  if (!teacher || teacher.role.name !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const {
      title,
      description,
      category,
      difficulty,
      iconKey,
      lessons,
      xpPerLesson,
      accessLevel,
    } = await req.json();

    const newTopic = await prisma.topic.create({
      data: {
        title,
        description,
        category,
        difficulty,
        iconKey,
        lessons: lessons || 1,
        xpPerLesson: xpPerLesson || 50,
        accessLevel: accessLevel || "free",
        teacherId: teacher.id,
      },
    });

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  if (!teacher || teacher.role.name !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const topicId = parseInt(searchParams.get("id") || "");

  if (!topicId) {
    return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
  }

  const topic = await prisma.topic.findFirst({
    where: { id: topicId, teacherId: teacher.id },
  });

  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  await prisma.level.deleteMany({ where: { topicId } });
  await prisma.userTopicProgress.deleteMany({ where: { topicId } });
  await prisma.topic.delete({ where: { id: topicId } });

  return NextResponse.json({ success: true });
}
