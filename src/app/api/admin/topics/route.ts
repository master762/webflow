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
    include: {
      project: {
        select: { id: true },
      },
    },
    orderBy: { id: "asc" },
  });

  const topicsWithProjectId = topics.map((topic: any) => ({
    ...topic,
    projectId: topic.project?.id || null,
  }));

  return NextResponse.json(topicsWithProjectId);
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
      technicalSpec,
      materials,
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

    let projectId = null;

    if (category === "projects") {
      const newProject = await prisma.project.create({
        data: {
          topicId: newTopic.id,
          technicalSpec:
            technicalSpec ||
            "<h3>Техническое задание</h3><p>Описание проекта...</p>",
          materials: materials || null,
        },
      });
      projectId = newProject.id;
    }

    return NextResponse.json(
      {
        ...newTopic,
        projectId,
      },
      { status: 201 },
    );
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
      technicalSpec,
      materials,
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

    let projectId = null;

    if (category === "projects") {
      const existingProject = await prisma.project.findUnique({
        where: { topicId: id },
      });

      if (existingProject) {
        const updatedProject = await prisma.project.update({
          where: { topicId: id },
          data: {
            technicalSpec: technicalSpec || existingProject.technicalSpec,
            materials: materials || existingProject.materials,
          },
        });
        projectId = updatedProject.id;
      } else {
        const newProject = await prisma.project.create({
          data: {
            topicId: id,
            technicalSpec:
              technicalSpec ||
              "<h3>Техническое задание</h3><p>Описание проекта...</p>",
            materials: materials || null,
          },
        });
        projectId = newProject.id;
      }
    }

    return NextResponse.json({
      ...updatedTopic,
      projectId,
    });
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

    const topic = await prisma.topic.findUnique({
      where: { id },
      select: { category: true },
    });

    if (topic?.category === "projects") {
      const project = await prisma.project.findUnique({
        where: { topicId: id },
      });

      if (project) {
        await prisma.projectSubmission.deleteMany({
          where: { projectId: project.id },
        });
        await prisma.project.delete({
          where: { topicId: id },
        });
      }
    }

    await prisma.level.deleteMany({ where: { topicId: id } });

    await prisma.userTopicProgress.deleteMany({ where: { topicId: id } });

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
