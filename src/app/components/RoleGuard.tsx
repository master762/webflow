"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Когда сессия загружена и пользователь авторизован
    if (status === "authenticated") {
      const role = session.user?.role;
      const path = window.location.pathname;

      // Если роль banned и текущий путь не /banned → редирект
      if (role === "banned" && path !== "/banned") {
        router.push("/banned");
      }

      // Если роль не banned, а путь /banned → редирект на главную
      if (role !== "banned" && path === "/banned") {
        router.push("/");
      }
    }
  }, [session, status, router]);

  // Пока сессия загружается, ничего не показываем (или спиннер)
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        Загрузка...
      </div>
    );
  }

  return <>{children}</>;
}
