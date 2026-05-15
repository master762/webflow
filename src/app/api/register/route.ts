import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";

type WeeklyActivity = { day: string; value: number };

export async function POST(req: Request) {
  try {
    const { email, password, name, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password и username обязательны" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь уже существует" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultWeeklyActivity: WeeklyActivity[] = [
      { day: "ПН", value: 0 },
      { day: "ВТ", value: 0 },
      { day: "СР", value: 0 },
      { day: "ЧТ", value: 0 },
      { day: "ПТ", value: 0 },
      { day: "СБ", value: 0 },
      { day: "ВС", value: 0 },
    ];

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: username,
        username,
        roleId: 1,
        topicsProgress: "[]",
        achievements: "[]",
        weeklyActivity: JSON.stringify(defaultWeeklyActivity),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
  }
}
