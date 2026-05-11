"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PopularPage {
  title: string;
  description: string;
  icon: string;
  href: string;
}

export default function NotFoundPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("Загрузка...");
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [glitchActive, setGlitchActive] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Популярные страницы
  const popularPages: PopularPage[] = [
    {
      title: "Главная",
      description: "Начните обучение с главной страницы",
      icon: "fas fa-home",
      href: "/",
    },
    {
      title: "Темы",
      description: "Все темы для изучения HTML и CSS",
      icon: "fas fa-book",
      href: "/topics",
    },
    {
      title: "Материалы",
      description: "Учебные материалы и справочники",
      icon: "fas fa-graduation-cap",
      href: "/materials",
    },
    {
      title: "Профиль",
      description: "Ваш прогресс и достижения",
      icon: "fas fa-user",
      href: "/profile",
    },
  ];

  // Исходный текст для эффекта печатания
  const descriptionText =
    "Запрашиваемая вами страница не существует или была перемещена. Возможно, вы ввели неправильный адрес или страница была удалена.";

  // Показать сообщение
  const showMessage = useCallback(
    (text: string, type: "success" | "error" | "info") => {
      const id = messageIdCounter + 1;
      setMessageIdCounter(id);
      setMessages((prev) => [...prev, { id, text, type }]);

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 3000);
    },
    [messageIdCounter],
  );

  // Обработчик кнопки "Назад"
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  // Обработчик кнопки копирования ошибки
  const handleCopyError = useCallback(() => {
    const errorText = `404 Error - Page not found\nPath: ${window.location.pathname}\nTime: ${new Date().toLocaleString()}\nUser Agent: ${navigator.userAgent}`;

    navigator.clipboard
      .writeText(errorText)
      .then(() => {
        showMessage("Информация об ошибке скопирована в буфер обмена", "info");
      })
      .catch(() => {
        showMessage("Не удалось скопировать текст", "error");
      });
  }, [showMessage]);

  // Обработчик кнопки сообщения об ошибке
  const handleReportError = useCallback(() => {
    const email = "support@codeduolingo.com";
    const subject = "404 Error Report";
    const body = `I encountered a 404 error on the following page:\n\nURL: ${window.location.href}\n\nBrowser: ${navigator.userAgent}\n\nAdditional details: `;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  }, []);

  // Эффект печатания текста
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < descriptionText.length) {
        setTypedText(descriptionText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [descriptionText]);

  // Эффект мигания курсора
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Обновление времени
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("ru-RU"));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Эффект глитча
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 500);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  // Показать приветственное сообщение
  useEffect(() => {
    const timer = setTimeout(() => {
      showMessage(
        "Страница не найдена. Используйте навигацию для перехода на доступные страницы.",
        "info",
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [showMessage]);

  return (
    <div className="min-h-screen bg-primary-dark text-text-light flex flex-col">
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -20px) rotate(90deg);
          }
          50% {
            transform: translate(-15px, 15px) rotate(180deg);
          }
          75% {
            transform: translate(10px, -10px) rotate(270deg);
          }
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .floating-element {
          animation: float 15s infinite ease-in-out;
        }

        .glitch {
          animation: glitch 0.5s;
        }

        .blink {
          animation: blink 1s infinite;
        }
      `}</style>

      {/* Сообщения */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`fixed top-24 right-5 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            msg.type === "success"
              ? "bg-accent-green/90 text-black border-l-4 border-accent-green"
              : msg.type === "error"
                ? "bg-accent-red/90 text-white border-l-4 border-accent-red"
                : "bg-accent-blue/90 text-black border-l-4 border-accent-blue"
          }`}
          style={{ animation: "slideIn 0.3s ease" }}
        >
          {msg.text}
        </div>
      ))}

      <div className="flex-1 relative overflow-hidden">
        {/* Анимированные элементы */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-24 h-24 top-20 left-10 rounded-full bg-radial-gradient(circle, rgba(0, 217, 255, 0.3), transparent) floating-element"></div>
          <div
            className="absolute w-36 h-36 top-60 right-15 rounded-full bg-radial-gradient(circle, rgba(157, 78, 221, 0.2), transparent) floating-element"
            style={{ animationDelay: "-5s" }}
          ></div>
          <div
            className="absolute w-20 h-20 bottom-30 left-20 rounded-full bg-radial-gradient(circle, rgba(255, 0, 85, 0.2), transparent) floating-element"
            style={{ animationDelay: "-10s" }}
          ></div>
          <div
            className="absolute w-28 h-28 top-40 right-25 rounded-full bg-radial-gradient(circle, rgba(0, 255, 157, 0.2), transparent) floating-element"
            style={{ animationDelay: "-2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          {/* Код ошибки */}
          <div
            className={`text-center mt-12 mb-8 ${glitchActive ? "glitch" : ""}`}
          >
            <div className="text-9xl md:text-15xl font-black bg-linear-to-r from-accent-red to-accent-purple bg-clip-text text-transparent">
              404
            </div>
          </div>

          {/* Сообщение об ошибке */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Страница не найдена
          </h1>

          {/* Описание */}
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <p className="text-lg text-text-dim">
              {typedText}
              <span
                className={`inline-block w-0.5 h-6 bg-accent-blue ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}
              ></span>
            </p>
          </div>

          {/* Действия */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              href="/"
              className="px-8 py-4 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-xl hover:shadow-lg hover:shadow-accent-purple/30 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <i className="fas fa-home"></i>
              <span>На главную</span>
            </Link>
            <Link
              href="/topics"
              className="px-8 py-4 bg-secondary-dark/50 border border-glass-border text-text-light rounded-xl hover:bg-accent-blue/10 hover:border-accent-blue transition-all duration-300 flex items-center justify-center gap-3"
            >
              <i className="fas fa-book"></i>
              <span>К темам</span>
            </Link>
            <button
              onClick={handleGoBack}
              className="px-8 py-4 bg-secondary-dark/50 border border-glass-border text-text-light rounded-xl hover:bg-accent-blue/10 hover:border-accent-blue transition-all duration-300 flex items-center justify-center gap-3"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Назад</span>
            </button>
          </div>

          {/* Консоль с ошибкой */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-glass-border">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                  <i className="fas fa-terminal text-accent-blue"></i>
                  <h3 className="text-lg font-semibold">Консоль ошибки</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyError}
                    className="px-4 py-2 bg-secondary-dark/50 border border-glass-border text-text-dim rounded-lg hover:bg-accent-blue/10 hover:text-accent-blue transition-all duration-300 flex items-center gap-2"
                  >
                    <i className="far fa-copy"></i>
                    <span>Копировать</span>
                  </button>
                  <button
                    onClick={handleReportError}
                    className="px-4 py-2 bg-secondary-dark/50 border border-glass-border text-text-dim rounded-lg hover:bg-accent-blue/10 hover:text-accent-blue transition-all duration-300 flex items-center gap-2"
                  >
                    <i className="fas fa-bug"></i>
                    <span>Сообщить</span>
                  </button>
                </div>
              </div>

              <div className="font-mono text-sm space-y-3">
                <div>
                  <span className="text-accent-red">ERROR 404:</span> Page not
                  found
                </div>
                <div>
                  <span className="text-accent-green">PATH:</span>{" "}
                  {typeof window !== "undefined"
                    ? window.location.pathname
                    : "/unknown"}
                </div>
                <div>
                  <span className="text-accent-green">TIME:</span> {currentTime}
                </div>
                <div>
                  <span className="text-accent-yellow">SUGGESTION:</span>{" "}
                  Проверьте URL или перейдите на одну из доступных страниц
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent-yellow">STATUS:</span>
                  <span className="blink text-accent-red">●</span>
                  <span>Connection lost</span>
                </div>
              </div>
            </div>
          </div>

          {/* Популярные страницы */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">
              Популярные страницы
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularPages.map((page, index) => (
                <Link
                  key={index}
                  href={page.href}
                  className="glass-card rounded-xl p-6 border border-glass-border hover:border-accent-blue hover:shadow-neon-blue transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-2xl mb-4">
                    <i className={page.icon}></i>
                  </div>
                  <h4 className="font-bold text-lg mb-2">{page.title}</h4>
                  <p className="text-text-dim text-sm">{page.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
