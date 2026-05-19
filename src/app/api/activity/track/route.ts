import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

type WeeklyActivityItem = { day: string; value: number };

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { minutes } = await req.json();
  if (typeof minutes !== "number" || minutes <= 0) {
    return NextResponse.json({ error: "Invalid minutes" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { weeklyActivity: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let weekly: WeeklyActivityItem[] = JSON.parse(user.weeklyActivity);
  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const dayIndex = weekly.findIndex((d) => d.day === today);
  if (dayIndex !== -1) {
    weekly[dayIndex].value += minutes;
  } else {
    weekly.push({ day: today, value: minutes });
  }

  weekly = weekly.slice(-7);

  await prisma.user.update({
    where: { email: session.user.email },
    data: { weeklyActivity: JSON.stringify(weekly) },
  });

  return NextResponse.json({ success: true });
}
