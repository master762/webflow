import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import Providers from "./providers";
import SessionTracker from "@/app/components/SessionTracker";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "CodeLingo",
  description: "Изучай HTML/CSS как в игре",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={inter.className}>
        <AnimatedBackground />
        <Providers>
          <div className="page-content">
            <Navbar />
            {children}
            <Footer />
          </div>
          <SessionTracker />
        </Providers>
      </body>
    </html>
  );
}
