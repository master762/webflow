import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Заполните все поля" },
        { status: 400 },
      );
    }

    const db = await getDB();

    const existingUser = await db.get(
      "SELECT * FROM users WHERE email = ?",
      email,
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь уже существует" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(
      `
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
      `,
      username,
      email,
      hashedPassword,
    );

    return NextResponse.json({
      message: "Регистрация успешна",
    });
  } catch (error) {
    console.log(error);
  }
}
