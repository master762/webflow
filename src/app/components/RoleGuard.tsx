"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const role = session.user?.role;
      const path = window.location.pathname;

      if (role === "banned" && path !== "/banned") {
        router.push("/banned");
      }

      if (role !== "banned" && path === "/banned") {
        router.push("/");
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        Загрузка...
      </div>
    );
  }

  return <>{children}</>;
}
