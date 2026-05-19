"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const isAdmin = session?.user?.role === "admin";
  const isTeacher = session?.user?.role === "teacher";
  const isEmployer = session?.user?.role === "employer";
  const userXP = session?.user?.xp || 0;
  const showMainLinks = !isEmployer;

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(10,10,20,0.95)] backdrop-blur-sm border-b border-glass-border py-4 shadow-lg shadow-black/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 text-2xl font-bold text-text-light no-underline"
          >
            <i className="fas fa-code text-accent-blue shadow-neon-blue"></i>
            <span className="gradient-text">CodeLingo</span>
          </Link>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center">
            {showMainLinks && (
              <>
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 no-underline ${
                    isActive("/")
                      ? "bg-[rgba(0,217,255,0.15)] text-accent-blue shadow-neon-blue"
                      : "text-text-light hover:bg-[rgba(0,217,255,0.1)] hover:text-accent-blue"
                  }`}
                >
                  Главная
                </Link>
                <Link
                  href="/topics"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 no-underline ${
                    isActive("/topics")
                      ? "bg-[rgba(0,217,255,0.15)] text-accent-blue shadow-neon-blue"
                      : "text-text-light hover:bg-[rgba(0,217,255,0.1)] hover:text-accent-blue"
                  }`}
                >
                  Темы
                </Link>
                <Link
                  href="/materials"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 no-underline ${
                    isActive("/materials")
                      ? "bg-[rgba(0,217,255,0.15)] text-accent-blue shadow-neon-blue"
                      : "text-text-light hover:bg-[rgba(0,217,255,0.1)] hover:text-accent-blue"
                  }`}
                >
                  Материалы
                </Link>
              </>
            )}

            {/* Пункт для работодателя */}
            {isEmployer && (
              <Link
                href="/employer"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 no-underline ${
                  pathname.startsWith("/employer")
                    ? "bg-[rgba(0,217,255,0.15)] text-accent-blue shadow-neon-blue"
                    : "text-text-light hover:bg-[rgba(0,217,255,0.1)] hover:text-accent-blue"
                }`}
              >
                <i className="fas fa-briefcase mr-2"></i>
                Каталог специалистов
              </Link>
            )}

            {/* Пункт для администратора */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 no-underline ${
                  pathname.startsWith("/admin")
                    ? "bg-[rgba(168,85,247,0.15)] text-accent-purple shadow-neon-purple"
                    : "text-text-light hover:bg-[rgba(168,85,247,0.1)] hover:text-accent-purple"
                }`}
              >
                <i className="fas fa-shield-alt mr-2"></i>
                Админ панель
              </Link>
            )}

            {/* Пункт для учителя */}
            {isTeacher && (
              <Link
                href="/teacher"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 no-underline ${
                  pathname.startsWith("/teacher")
                    ? "bg-[rgba(0,217,255,0.15)] text-accent-blue shadow-neon-blue"
                    : "text-text-light hover:bg-[rgba(0,217,255,0.1)] hover:text-accent-blue"
                }`}
              >
                <i className="fas fa-chalkboard-user mr-2"></i>
                Мои ученики
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {session && (
              <div className="bg-[rgba(0,255,157,0.1)] text-accent-green px-3 py-1.5 rounded-full text-sm border border-accent-green shadow-neon-green">
                <i className="fas fa-star mr-1"></i>
                XP: {userXP.toLocaleString()}
              </div>
            )}

            {!session ? (
              <Link
                href="/auth"
                className="px-4 py-2 rounded-lg font-medium text-text-light hover:bg-[rgba(0,217,255,0.1)] hover:text-accent-blue transition-all duration-300 no-underline"
              >
                Войти
              </Link>
            ) : (
              <Link href="/profile" className="relative group">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-sm font-bold border border-accent-blue shadow-lg shadow-accent-blue/30 transition-all duration-300 hover:scale-105">
                  {getInitials(session.user?.name || "Пользователь")}
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
