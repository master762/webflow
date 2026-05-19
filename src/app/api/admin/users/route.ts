import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

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

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  if (!admin || admin.role.name !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, action, reason, roleId } = await req.json();

  if (action === "ban") {
    await prisma.user.update({
      where: { id: userId },
      data: { roleId: 3, banReason: reason },
    });
  } else if (action === "unban") {
    await prisma.user.update({
      where: { id: userId },
      data: { roleId: 1, banReason: null },
    });
  } else if (action === "changeRole") {
    await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });
  }

  return NextResponse.json({ success: true });
}
