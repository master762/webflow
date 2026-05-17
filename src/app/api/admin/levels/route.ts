import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - получение всех уровней
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

  const levels = await prisma.level.findMany({
    include: { topic: true },
    orderBy: [{ topicId: "asc" }, { order: "asc" }],
  });
  return NextResponse.json(levels);
}

// POST - создание нового уровня
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
      topicId,
      order,
      title,
      description,
      html,
      css,
      hint,
      xp,
      validation,
    } = await req.json();

    // Проверяем обязательные поля
    if (!topicId || !title || !description || !html || !css || !xp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Проверяем существование темы
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Если order не указан, ставим следующий по порядку
    let levelOrder = order;
    if (!levelOrder) {
      const lastLevel = await prisma.level.findFirst({
        where: { topicId },
        orderBy: { order: "desc" },
      });
      levelOrder = lastLevel ? lastLevel.order + 1 : 1;
    }

    const newLevel = await prisma.level.create({
      data: {
        topicId,
        order: levelOrder,
        title,
        description,
        html,
        css,
        hint: hint || null,
        xp,
        validation: validation || null,
      },
    });

    // Обновляем количество уроков в теме
    const levelCount = await prisma.level.count({
      where: { topicId },
    });
    await prisma.topic.update({
      where: { id: topicId },
      data: { lessons: levelCount },
    });

    return NextResponse.json(newLevel, { status: 201 });
  } catch (error) {
    console.error("Error creating level:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - обновление уровня
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
      topicId,
      order,
      title,
      description,
      html,
      css,
      hint,
      xp,
      validation,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Level ID required" }, { status: 400 });
    }

    const updatedLevel = await prisma.level.update({
      where: { id },
      data: {
        topicId,
        order,
        title,
        description,
        html,
        css,
        hint: hint || null,
        xp,
        validation: validation || null,
      },
    });

    return NextResponse.json(updatedLevel);
  } catch (error) {
    console.error("Error updating level:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - удаление уровня
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
      return NextResponse.json({ error: "Level ID required" }, { status: 400 });
    }

    const level = await prisma.level.findUnique({
      where: { id },
    });

    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    await prisma.level.delete({ where: { id } });

    // Обновляем количество уроков в теме
    const levelCount = await prisma.level.count({
      where: { topicId: level.topicId },
    });
    await prisma.topic.update({
      where: { id: level.topicId },
      data: { lessons: levelCount },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting level:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
