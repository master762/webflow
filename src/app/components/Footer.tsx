import Link from "next/link";
import ScrollReveal from "@/app/components/ScrollReveal";

export default function Footer() {
  const footerLinks = [
    { href: "/", label: "Главная" },
    { href: "/topics", label: "Темы" },
    { href: "/materials", label: "Материалы" },
    { href: "/profile", label: "Профиль" },
  ];

  return (
    <footer className="bg-[rgba(10,10,20,0.85)] backdrop-blur-md border-t border-glass-border py-8 mt-16">
      <ScrollReveal variant="fade-up" className="container mx-auto px-4 max-w-7xl text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-dim hover:text-accent-blue transition-colors duration-300 no-underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-text-dim">
          © {new Date().getFullYear()} CodeLingo. Все права защищены.
        </p>
      </ScrollReveal>
    </footer>
  );
}
