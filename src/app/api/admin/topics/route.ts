import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - получение всех тем
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

  const topics = await prisma.topic.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(topics);
}

// POST - создание новой темы
export async function POST(req: NextRequest) {
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

  try {
    const {
      title,
      description,
      category,
      difficulty,
      iconKey,
      lessons,
      xpPerLesson,
      requirements,
      accessLevel,
    } = await req.json();

    if (!title || !description || !category || !difficulty || !iconKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newTopic = await prisma.topic.create({
      data: {
        title,
        description,
        category,
        difficulty,
        iconKey,
        lessons: lessons || 0,
        xpPerLesson: xpPerLesson || 0,
        requirements: requirements || null,
        accessLevel: accessLevel || "free",
      },
    });

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - обновление темы
export async function PUT(req: NextRequest) {
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

  try {
    const {
      id,
      title,
      description,
      category,
      difficulty,
      iconKey,
      lessons,
      xpPerLesson,
      requirements,
      accessLevel,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
    }

    const updatedTopic = await prisma.topic.update({
      where: { id },
      data: {
        title,
        description,
        category,
        difficulty,
        iconKey,
        lessons,
        xpPerLesson,
        requirements: requirements || null,
        accessLevel: accessLevel || "free",
      },
    });

    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - удаление темы
export async function DELETE(req: NextRequest) {
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

  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) {
      return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
    }

    // Сначала удаляем связанные уровни
    await prisma.level.deleteMany({ where: { topicId: id } });
    // Удаляем прогресс пользователей
    await prisma.userTopicProgress.deleteMany({ where: { topicId: id } });
    // Удаляем тему
    await prisma.topic.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
