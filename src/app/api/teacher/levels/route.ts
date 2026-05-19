import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
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
  const topicId = parseInt(searchParams.get("topicId") || "");

  if (!topicId) {
    return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
  }

  const topic = await prisma.topic.findFirst({
    where: { id: topicId, teacherId: teacher.id },
  });

  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const levels = await prisma.level.findMany({
    where: { topicId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(levels);
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

    const topic = await prisma.topic.findFirst({
      where: { id: topicId, teacherId: teacher.id },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

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

    const levelCount = await prisma.level.count({ where: { topicId } });
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
  const levelId = parseInt(searchParams.get("id") || "");

  if (!levelId) {
    return NextResponse.json({ error: "Level ID required" }, { status: 400 });
  }

  const level = await prisma.level.findUnique({
    where: { id: levelId },
    include: { topic: true },
  });

  if (!level || level.topic.teacherId !== teacher.id) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  await prisma.level.delete({ where: { id: levelId } });

  const levelCount = await prisma.level.count({
    where: { topicId: level.topicId },
  });
  await prisma.topic.update({
    where: { id: level.topicId },
    data: { lessons: levelCount },
  });

  return NextResponse.json({ success: true });
}
