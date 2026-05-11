"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LevelContent() {
  const [activeTab, setActiveTab] = useState<"html" | "css">("html");
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flexbox выравнивание</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="item">3</div>
    </div>
  </body>
</html>`);

  const [cssCode, setCssCode] = useState(`.container {
    /* Ваш код здесь */
    display: flex;
    width: 100%;
    height: 300px;
    border: 2px solid #333;
    background-color: #f0f0f0;
}

.item {
    width: 80px;
    height: 80px;
    background-color: #00d9ff;
    margin: 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}`);

  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [showHint, setShowHint] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const checkBtnRef = useRef<HTMLButtonElement>(null);
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "flexbox";

  // Показ сообщений
  const showMessage = useCallback(
    (text: string, type: "success" | "error" | "info") => {
      const id = Date.now();
      setMessages((prev) => [...prev, { id, text, type }]);

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 5000);
    },
    [],
  );

  // Обновление предпросмотра
  const updatePreview = useCallback(() => {
    if (!previewRef.current) return;

    const iframe = previewRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${cssCode}
          </style>
        </head>
        <body style="margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
          ${htmlCode
            .replace("<!DOCTYPE html>", "")
            .replace('<html lang="ru">', "")
            .replace("</html>", "")
            .replace("<head>", "")
            .replace("</head>", "")
            .replace("<body>", "")
            .replace("</body>", "")}
        </body>
        </html>
      `);
      iframeDoc.close();
    }
  }, [htmlCode, cssCode]);

  // Автоматическое обновление предпросмотра
  useEffect(() => {
    const timeout = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeout);
  }, [updatePreview]);

  // Функции действий
  const handleReset = useCallback(() => {
    const initialCSSCode = `.container {
    /* Ваш код здесь */
    display: flex;
    width: 100%;
    height: 300px;
    border: 2px solid #333;
    background-color: #f0f0f0;
}

.item {
    width: 80px;
    height: 80px;
    background-color: #00d9ff;
    margin: 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}`;

    setCssCode(initialCSSCode);
    updatePreview();
    showMessage("Код сброшен к начальному состоянию", "info");
  }, [showMessage, updatePreview]);

  const handleHint = useCallback(() => {
    setShowHint((prev) => !prev);
    if (!showHint) {
      showMessage(
        "Подсказка открыта. Попробуйте использовать justify-content и align-items со значением center.",
        "info",
      );
    }
  }, [showHint, showMessage]);

  const handleCheck = useCallback(() => {
    setIsChecking(true);

    // Имитация проверки решения
    const checks = {
      hasJustifyContent:
        cssCode.includes("justify-content:") && cssCode.includes("center"),
      hasAlignItems:
        cssCode.includes("align-items:") && cssCode.includes("center"),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    setTimeout(() => {
      setIsChecking(false);

      if (passedChecks === totalChecks) {
        showMessage(
          "Поздравляем! Вы успешно выполнили задание! +50 XP",
          "success",
        );
        if (checkBtnRef.current) {
          checkBtnRef.current.classList.add("animate-pulse");
          setTimeout(() => {
            if (checkBtnRef.current) {
              checkBtnRef.current.classList.remove("animate-pulse");
            }
          }, 2000);
        }
      } else {
        showMessage(
          "Пока не совсем правильно. Проверьте, что вы добавили justify-content и align-items со значением center.",
          "error",
        );
        if (checkBtnRef.current) {
          checkBtnRef.current.classList.add("animate-shake");
          setTimeout(() => {
            if (checkBtnRef.current) {
              checkBtnRef.current.classList.remove("animate-shake");
            }
          }, 500);
        }
      }
    }, 1000);
  }, [cssCode, showMessage]);

  const handleRefreshPreview = useCallback(() => {
    updatePreview();
    showMessage("Предпросмотр обновлен", "info");
  }, [updatePreview, showMessage]);

  // Обработчик изменения активной вкладки
  const handleTabChange = (tab: "html" | "css") => {
    setActiveTab(tab);
  };

  // Текущая тема
  const getTopicInfo = (topic: string) => {
    const topics: Record<
      string,
      { title: string; icon: string; color: string }
    > = {
      html: {
        title: "Основы HTML",
        icon: "fab fa-html5",
        color: "text-accent-green",
      },
      css: {
        title: "Основы CSS",
        icon: "fab fa-css3-alt",
        color: "text-accent-blue",
      },
      flexbox: {
        title: "Flexbox",
        icon: "fas fa-boxes",
        color: "text-accent-blue",
      },
      grid: {
        title: "CSS Grid",
        icon: "fas fa-th",
        color: "text-accent-purple",
      },
      animations: {
        title: "CSS Анимации",
        icon: "fas fa-magic",
        color: "text-accent-green",
      },
      responsive: {
        title: "Адаптивный дизайн",
        icon: "fas fa-mobile-alt",
        color: "text-accent-purple",
      },
      javascript: {
        title: "Основы JavaScript",
        icon: "fab fa-js",
        color: "text-accent-yellow",
      },
    };

    return topics[topic] || topics.flexbox;
  };

  const topicInfo = getTopicInfo(topic);

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .slide-in {
          animation: slideIn 0.3s ease;
        }
        .slide-out {
          animation: slideOut 0.3s ease;
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

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Шапка уровня */}
        <div className="my-8 pb-6 border-b border-glass-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">
                Уровень 7: {topicInfo.title} - Выравнивание
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue text-sm">
                  Средняя сложность
                </span>
                <span className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple text-sm">
                  {topicInfo.title}
                </span>
                <span className="px-3 py-1 rounded-full bg-glass-border/50 text-text-dim border border-glass-border text-sm">
                  CSS
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="px-4 py-2 rounded-full bg-accent-green/10 text-accent-green border border-accent-green shadow-neon-green">
                <i className="fas fa-bolt mr-2"></i>
                +50 XP
              </div>
              <div className="xp-badge">Текущая серия: 3 дня</div>
            </div>
          </div>
        </div>

        {/* Основной контент уровня */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Редактор кода */}
          <div className="bg-secondary-dark rounded-xl overflow-hidden border border-glass-border shadow-lg">
            <div className="p-4 bg-black/50 border-b border-glass-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex items-center gap-3 font-bold">
                <i className="fas fa-code text-accent-blue"></i>
                <span>Редактор кода</span>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Сбросить
                </button>

                <button
                  onClick={handleHint}
                  className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
                >
                  <i className="fas fa-lightbulb mr-2"></i>
                  Подсказка
                </button>

                <button
                  ref={checkBtnRef}
                  onClick={handleCheck}
                  disabled={isChecking}
                  className="px-4 py-2 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChecking ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Проверка...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Проверить
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Вкладки редактора */}
            <div className="flex bg-black/50 border-b border-glass-border">
              <button
                onClick={() => handleTabChange("html")}
                className={`px-6 py-3 flex items-center gap-2 transition-all duration-300 ${
                  activeTab === "html"
                    ? "text-accent-blue bg-accent-blue/5 border-b-2 border-accent-blue"
                    : "text-text-dim hover:text-text-light"
                }`}
              >
                <i className="fab fa-html5"></i>
                index.html
              </button>

              <button
                onClick={() => handleTabChange("css")}
                className={`px-6 py-3 flex items-center gap-2 transition-all duration-300 ${
                  activeTab === "css"
                    ? "text-accent-blue bg-accent-blue/5 border-b-2 border-accent-blue"
                    : "text-text-dim hover:text-text-light"
                }`}
              >
                <i className="fab fa-css3-alt"></i>
                style.css
              </button>
            </div>

            {/* Область кода */}
            <textarea
              value={activeTab === "html" ? htmlCode : cssCode}
              onChange={(e) => {
                if (activeTab === "html") setHtmlCode(e.target.value);
                else setCssCode(e.target.value);
              }}
              className="w-full h-96 bg-secondary-dark text-text-light p-4 font-mono text-sm resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>

          {/* Панель предпросмотра */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-glass-border">
              <h3 className="text-xl font-bold text-accent-blue flex items-center gap-3">
                <i className="fas fa-eye"></i>
                Предпросмотр результата
              </h3>

              <button
                onClick={handleRefreshPreview}
                className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Обновить
              </button>
            </div>

            <div className="h-87.5 bg-white rounded-lg overflow-hidden border-2 border-gray-200">
              <iframe
                ref={previewRef}
                className="w-full h-full border-0"
                title="Предпросмотр уровня"
              />
            </div>

            {/* Описание задания */}
            <div className="mt-6 p-5 bg-secondary-dark/50 rounded-lg border-l-4 border-accent-blue">
              <h4 className="text-lg font-bold mb-3 text-accent-blue flex items-center gap-2">
                <i className="fas fa-tasks"></i>
                Задание
              </h4>

              <div className="space-y-3">
                <p className="text-text-light">
                  Добавьте в CSS для .container свойства, которые выровняют
                  элементы по центру как по горизонтали, так и по вертикали.
                  Используйте свойства{" "}
                  <strong className="text-accent-blue">justify-content</strong>{" "}
                  и<strong className="text-accent-blue"> align-items</strong>.
                </p>
                <p className="text-text-dim">
                  Цель: три синих квадрата должны быть расположены по центру
                  контейнера по горизонтали и вертикали.
                </p>
              </div>

              {/* Подсказка */}
              <div
                className={`mt-4 p-4 rounded-lg transition-all duration-300 ${
                  showHint
                    ? "bg-accent-purple/10 border-l-4 border-accent-purple"
                    : "bg-secondary-dark/30"
                }`}
              >
                <button
                  onClick={handleHint}
                  className="w-full flex justify-between items-center text-left"
                >
                  <span className="font-medium text-accent-purple">
                    <i className="fas fa-lightbulb mr-2"></i>
                    {showHint ? "Скрыть подсказку" : "Показать подсказку"}
                  </span>
                  <i
                    className={`fas fa-chevron-${showHint ? "up" : "down"} text-accent-purple`}
                  ></i>
                </button>

                {showHint && (
                  <div className="mt-3 pt-3 border-t border-accent-purple/20">
                    <p className="text-text-dim mb-2">
                      Для центрирования элементов по горизонтали в
                      flex-контейнере используйте{" "}
                      <code className="bg-black/30 px-2 py-1 rounded">
                        justify-content: center;
                      </code>
                    </p>
                    <p className="text-text-dim mb-2">
                      Для центрирования по вертикали используйте
                      <code className="bg-black/30 px-2 py-1 rounded">
                        {" "}
                        align-items: center;
                      </code>
                    </p>
                    <p className="text-text-dim">
                      Добавьте эти свойства в CSS для класса{" "}
                      <code className="bg-black/30 px-2 py-1 rounded">
                        .container
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Навигация между уровнями */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 my-12 pt-6 border-t border-glass-border">
          <Link
            href="/level?prev"
            className="px-6 py-3 glass-card rounded-lg border border-glass-border hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <i className="fas fa-arrow-left text-accent-blue group-hover:-translate-x-1 transition-transform duration-300"></i>
            <span>Предыдущий уровень</span>
          </Link>

          <Link
            href="/level?next"
            className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <span>Следующий уровень</span>
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LevelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-primary-dark text-text-light">
          <div className="container mx-auto px-4 max-w-7xl py-16">
            <div className="glass-card rounded-xl p-8 text-center">
              <i className="fas fa-spinner fa-spin text-accent-blue text-3xl mb-4"></i>
              <p className="text-text-dim">Загрузка уровня...</p>
            </div>
          </div>
        </div>
      }
    >
      <LevelContent />
    </Suspense>
  );
}
