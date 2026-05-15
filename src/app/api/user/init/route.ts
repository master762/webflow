import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" });
    }

    // Создаем нового пользователя с данными по умолчанию
    const defaultTopicsProgress = JSON.stringify([
      { title: "Основы HTML", percent: 0 },
      { title: "Основы CSS", percent: 0 },
      { title: "Flexbox", percent: 0 },
      { title: "CSS Grid", percent: 0 },
      { title: "Адаптивный дизайн", percent: 0 },
    ]);

    const defaultAchievements = JSON.stringify([
      {
        id: 1,
        title: "Первые шаги",
        description: "Завершил 5 уроков",
        icon: "fa-rocket",
        unlocked: false,
      },
      {
        id: 2,
        title: "Скоростное обучение",
        description: "3 урока за день",
        icon: "fa-bolt",
        unlocked: false,
      },
      {
        id: 3,
        title: "Мастер HTML",
        description: "Завершил HTML",
        icon: "fa-code",
        unlocked: false,
      },
      {
        id: 4,
        title: "Серия побед",
        description: "10 заданий без ошибок",
        icon: "fa-fire",
        unlocked: false,
      },
      {
        id: 5,
        title: "Неделя усердия",
        description: "7 дней подряд",
        icon: "fa-calendar",
        unlocked: false,
      },
      {
        id: 6,
        title: "Мастер верстки",
        description: "Все темы CSS",
        icon: "fa-crown",
        unlocked: false,
      },
      {
        id: 7,
        title: "Легенда платформы",
        description: "100 дней подряд",
        icon: "fa-gem",
        unlocked: false,
      },
      {
        id: 8,
        title: "Бесконечное обучение",
        description: "Все материалы",
        icon: "fa-infinity",
        unlocked: false,
      },
    ]);

    const defaultWeeklyActivity = JSON.stringify([
      { day: "ПН", value: 0 },
      { day: "ВТ", value: 0 },
      { day: "СР", value: 0 },
      { day: "ЧТ", value: 0 },
      { day: "ПТ", value: 0 },
      { day: "СБ", value: 0 },
      { day: "ВС", value: 0 },
    ]);

    const user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || "Новый пользователь",
        password: await bcrypt.hash(Math.random().toString(36), 10), // Временный пароль
        topicsProgress: defaultTopicsProgress,
        achievements: defaultAchievements,
        weeklyActivity: defaultWeeklyActivity,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
