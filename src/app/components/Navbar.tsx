"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/topics", label: "Темы" },
    { href: "/materials", label: "Материалы" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  // Функция для получения инициалов (до 2 букв)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

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
            <span className="gradient-text">WebFlow</span>
          </Link>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 no-underline ${
                  isActive(link.href)
                    ? "bg-[rgba(0,217,255,0.15)] text-accent-blue shadow-neon-blue"
                    : "text-text-light hover:bg-[rgba(0,217,255,0.1)] hover:text-accent-blue"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="bg-[rgba(0,255,157,0.1)] text-accent-green px-3 py-1.5 rounded-full text-sm border border-accent-green shadow-neon-green">
              XP: 1,245
            </div>

            {!session ? (
              <Link
                href="/auth"
                className="px-4 py-2 rounded-lg font-medium text-text-light hover:bg-[rgba(0,217,255,0.1)] hover:text-accent-blue transition-all duration-300 no-underline"
              >
                Войти
              </Link>
            ) : (
              <Link href="/profile" className="relative group">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-sm font-bold border border-accent-blue shadow-lg shadow-accent-blue/30 transition-all duration-300 hover:scale-105">
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
