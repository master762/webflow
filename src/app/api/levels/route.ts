import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const levels = await prisma.level.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return NextResponse.json(levels);
}
