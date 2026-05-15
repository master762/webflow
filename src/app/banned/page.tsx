import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function BannedPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      role: {
        select: { name: true },
      },
      banReason: true,
    },
  });

  if (user?.role?.name !== "banned") {
    redirect("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#0a0a1a",
        color: "white",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 32 }}>🚫 Аккаунт заблокирован</h1>

      <p style={{ marginTop: 10, opacity: 0.8 }}>Причина:</p>

      <p style={{ marginTop: 5, color: "#ff4444" }}>
        {user?.banReason || "Причина не указана"}
      </p>
    </div>
  );
}
