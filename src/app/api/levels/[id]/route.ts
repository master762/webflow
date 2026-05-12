import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const levelId = Number(id);

  if (!levelId) {
    return NextResponse.json({ error: "Invalid level id" }, { status: 400 });
  }

  const level = await prisma.level.findUnique({
    where: { id: levelId },
  });

  if (!level) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json(level);
}
