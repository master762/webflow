import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "./db";

export async function isAdmin() {
  const session = await getServerSession();
  if (!session?.user?.email) return false;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  return user?.role?.name === "admin";
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
