import Link from "next/link";

export default function Footer() {
  const footerLinks = [
    { href: "/", label: "Главная" },
    { href: "/topics", label: "Темы" },
    { href: "/materials", label: "Материалы" },
    { href: "/profile", label: "Профиль" },
    { href: "/auth", label: "Войти" },
  ];

  return (
    <footer className="bg-[rgba(10,10,20,0.95)] border-t border-glass-border py-8 mt-16">
      <div className="container mx-auto px-4 max-w-7xl text-center">
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
          © {new Date().getFullYear()} WebFlow. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
