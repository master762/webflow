"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Level = {
  id: number;
  title: string;
  description: string;
  html: string;
  css: string;
  hint?: string;
  xp: number;
  topicId: number;
  order: number;
  validation?: string | null;
};

type Message = {
  id: number;
  text: string;
  type: "success" | "error" | "info";
};

export default function LevelUI({
  level,
  prevLevelId,
  nextLevelId,
}: {
  level: Level;
  prevLevelId: number | null;
  nextLevelId: number | null;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"html" | "css">("html");
  const [htmlCode, setHtmlCode] = useState(level.html);
  const [cssCode, setCssCode] = useState(level.css);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const checkBtnRef = useRef<HTMLButtonElement>(null);

  // =========================
  // MESSAGE
  // =========================
  const showMessage = useCallback((text: string, type: Message["type"]) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 5000);
  }, []);

  // =========================
  // UPDATE PREVIEW
  // =========================
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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            ${cssCode}
          </style>
        </head>
        <body>${htmlCode}</body>
        </html>
      `);
      iframeDoc.close();
    }
  }, [htmlCode, cssCode]);

  useEffect(() => {
    const timeout = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeout);
  }, [updatePreview]);

  useEffect(() => {
    setHtmlCode(level.html);
    setCssCode(level.css);
  }, [level]);

  // =========================
  // ACTIONS
  // =========================
  const handleReset = () => {
    setHtmlCode(level.html);
    setCssCode(level.css);
    updatePreview();
    showMessage("Код сброшен к начальному состоянию", "info");
  };

  const handleHint = () => {
    setShowHint((prev) => !prev);
    if (!showHint) {
      showMessage(
        level.hint ||
          "Подсказка открыта. Попробуйте использовать необходимые CSS свойства.",
        "info",
      );
    }
  };

  // =========================
  // COMPLETE LEVEL (API)
  // =========================
  const completeLevel = useCallback(async () => {
    try {
      const res = await fetch("/api/levels/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId: level.id }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage(`Уровень пройден! +${data.xpAwarded} XP`, "success");
        return data.completed; // true если тема полностью завершена
      } else {
        showMessage("Ошибка сохранения прогресса", "error");
        return false;
      }
    } catch (err) {
      console.error(err);
      showMessage("Ошибка сервера", "error");
      return false;
    }
  }, [level.id, showMessage]);

  // =========================
  // VALIDATION
  // =========================
  const isSolutionCorrect = useCallback(() => {
    if (!level.validation) {
      console.warn("Нет правил проверки для уровня", level.id);
      return false;
    }
    try {
      const validation = JSON.parse(level.validation);
      const type = validation.type;

      if (type === "cssContains") {
        return validation.rules.every((rule: any) => {
          const {
            selector,
            property,
            value,
            withinMedia,
            rule: mediaRule,
            inside,
          } = rule;
          if (selector && property && value && !withinMedia) {
            const regex = new RegExp(
              `${selector}\\s*\\{[^}]*${property}\\s*:\\s*${value}[;\\s]`,
              "i",
            );
            return regex.test(cssCode);
          }
          if (mediaRule && inside) {
            const mediaRegex = new RegExp(
              `${mediaRule}\\s*\\{[^}]*${inside}[^}]*\\}`,
              "i",
            );
            return mediaRegex.test(cssCode);
          }
          if (selector && property && value && withinMedia) {
            const mediaRegex = new RegExp(
              `${withinMedia}\\s*\\{[^}]*${selector}\\s*\\{[^}]*${property}\\s*:\\s*${value}[;\\s][^}]*\\}[^}]*\\}`,
              "i",
            );
            return mediaRegex.test(cssCode);
          }
          return false;
        });
      }

      if (type === "htmlContains") {
        return validation.rules.every((rule: any) => {
          const { tag, contentRequired } = rule;
          if (tag) {
            const tagRegex = new RegExp(`<${tag}[\\s>]`, "i");
            const hasTag = tagRegex.test(htmlCode);
            if (!hasTag) return false;
            if (contentRequired) {
              const contentRegex = new RegExp(
                `<${tag}[^>]*>([^<]*)</${tag}>`,
                "i",
              );
              const match = htmlCode.match(contentRegex);
              return match && match[1] && match[1].trim().length > 0;
            }
            return true;
          }
          return false;
        });
      }

      if (type === "jsContains") {
        const scriptMatch = htmlCode.match(
          /<script[^>]*>([\s\S]*?)<\/script>/i,
        );
        const jsCode = scriptMatch ? scriptMatch[1] : htmlCode;
        return validation.rules.every((rule: any) => {
          const { codePattern } = rule;
          if (codePattern) {
            const regex = new RegExp(codePattern, "i");
            return regex.test(jsCode);
          }
          return false;
        });
      }

      if (type === "manual") {
        return false; // ручная проверка
      }
      return false;
    } catch (e) {
      console.error("Ошибка парсинга validation", e);
      return false;
    }
  }, [cssCode, htmlCode, level.validation]);

  // =========================
  // CHECK BUTTON HANDLER
  // =========================
  const handleCheck = async () => {
    if (isChecking) return;
    setIsChecking(true);

    setTimeout(async () => {
      // Ручная проверка
      if (level.validation && JSON.parse(level.validation).type === "manual") {
        showMessage(
          "Это задание проверяется преподавателем. Отправьте ссылку на GitHub в нужное поле.",
          "info",
        );
        setIsChecking(false);
        return;
      }

      const correct = isSolutionCorrect();
      if (correct) {
        const topicCompleted = await completeLevel();
        if (nextLevelId !== null) {
          router.push(`/level/${nextLevelId}`);
        } else {
          setShowCompletionModal(true);
        }
      } else {
        showMessage(
          "Пока не совсем правильно. Проверьте задание и попробуйте ещё раз.",
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
      setIsChecking(false);
    }, 1000);
  };

  const handleRefreshPreview = () => {
    updatePreview();
    showMessage("Предпросмотр обновлен", "info");
  };

  // =========================
  // TOPIC INFO
  // =========================
  const getTopicInfo = () => {
    const topics: Record<
      number,
      { title: string; icon: string; color: string }
    > = {
      1: {
        title: "Основы HTML",
        icon: "fab fa-html5",
        color: "text-accent-green",
      },
      2: {
        title: "Основы CSS",
        icon: "fab fa-css3-alt",
        color: "text-accent-blue",
      },
      3: { title: "Flexbox", icon: "fas fa-boxes", color: "text-accent-blue" },
      4: { title: "CSS Grid", icon: "fas fa-th", color: "text-accent-purple" },
      5: {
        title: "CSS Анимации",
        icon: "fas fa-magic",
        color: "text-accent-green",
      },
      6: {
        title: "Адаптивный дизайн",
        icon: "fas fa-mobile-alt",
        color: "text-accent-purple",
      },
      7: {
        title: "Основы JavaScript",
        icon: "fab fa-js",
        color: "text-accent-yellow",
      },
    };
    return topics[level.topicId] || topics[3];
  };
  const topicInfo = getTopicInfo();

  // =========================
  // MODAL
  // =========================
  const CompletionModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-8 max-w-md mx-4 text-center border border-accent-purple shadow-2xl animate-slideIn">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-green/20 flex items-center justify-center">
          <i className="fas fa-trophy text-5xl text-accent-yellow"></i>
        </div>
        <h3 className="text-2xl font-bold mb-2 gradient-text">Поздравляем!</h3>
        <p className="text-text-dim mb-6">
          Вы успешно завершили тему <strong>{level.title}</strong>!<br />
          Получено <strong>{level.xp}</strong> XP и бонус 50 XP.
        </p>
        <Link
          href="/topics"
          className="inline-block px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple transition-all"
        >
          <i className="fas fa-book-open mr-2"></i>К списку тем
        </Link>
      </div>
    </div>
  );

  // =========================
  // RENDER
  // =========================
  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      {showCompletionModal && <CompletionModal />}

      <style jsx global>{`
        /* все ваши стили (ключевые кадры, цвета) – оставьте без изменений */
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
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .slide-in {
          animation: slideIn 0.3s ease;
        }
        .bg-primary-dark {
          background-color: #0a0a1a;
        }
        .bg-secondary-dark {
          background-color: #13162b;
        }
        .text-text-light {
          color: #e0e0e0;
        }
        .text-text-dim {
          color: #8888aa;
        }
        .border-glass-border {
          border-color: rgba(100, 100, 150, 0.2);
        }
        .glass-card {
          background: rgba(19, 22, 43, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(100, 100, 150, 0.2);
        }
        .gradient-text {
          background: linear-gradient(135deg, #00d9ff, #a855f7);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .shadow-neon-green {
          box-shadow: 0 0 10px rgba(0, 255, 100, 0.3);
        }
        .shadow-neon-purple {
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
        }
        .text-accent-green {
          color: #00ff88;
        }
        .text-accent-blue {
          color: #00d9ff;
        }
        .text-accent-purple {
          color: #a855f7;
        }
        .text-accent-yellow {
          color: #fbbf24;
        }
        .text-accent-red {
          color: #ff4444;
        }
        .bg-accent-green {
          background-color: #00ff88;
        }
        .bg-accent-blue {
          background-color: #00d9ff;
        }
        .bg-accent-purple {
          background-color: #a855f7;
        }
        .bg-accent-red {
          background-color: #ff4444;
        }
        .bg-linear-to-r {
          background: linear-gradient(90deg, #00d9ff, #a855f7);
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
          <i
            className={`fas ${msg.type === "success" ? "fa-check-circle" : msg.type === "error" ? "fa-exclamation-circle" : "fa-info-circle"} mr-2`}
          ></i>
          {msg.text}
        </div>
      ))}

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Шапка уровня (без изменений) */}
        <div className="my-8 pb-6 border-b border-glass-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">
                Уровень {level.order}: {level.title}
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue text-sm">
                  Уровень {level.order}
                </span>
                <span className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple text-sm">
                  <i className={`${topicInfo.icon} mr-1`}></i>
                  {topicInfo.title}
                </span>
              </div>
              <p className="text-text-dim mt-3 max-w-2xl">
                {level.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="px-4 py-2 rounded-full bg-accent-green/10 text-accent-green border border-accent-green shadow-neon-green">
                <i className="fas fa-bolt mr-2"></i>+{level.xp} XP
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент (редактор + превью) – без изменений */}
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
                  <i className="fas fa-redo mr-2"></i>Сбросить
                </button>
                <button
                  onClick={handleHint}
                  className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
                >
                  <i className="fas fa-lightbulb mr-2"></i>Подсказка
                </button>
                <button
                  ref={checkBtnRef}
                  onClick={handleCheck}
                  disabled={isChecking}
                  className="px-4 py-2 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChecking ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>Проверка...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>Проверить
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex bg-black/50 border-b border-glass-border">
              <button
                onClick={() => setActiveTab("html")}
                className={`px-6 py-3 flex items-center gap-2 transition-all duration-300 ${activeTab === "html" ? "text-accent-blue bg-accent-blue/5 border-b-2 border-accent-blue" : "text-text-dim hover:text-text-light"}`}
              >
                <i className="fab fa-html5"></i>index.html
              </button>
              <button
                onClick={() => setActiveTab("css")}
                className={`px-6 py-3 flex items-center gap-2 transition-all duration-300 ${activeTab === "css" ? "text-accent-blue bg-accent-blue/5 border-b-2 border-accent-blue" : "text-text-dim hover:text-text-light"}`}
              >
                <i className="fab fa-css3-alt"></i>style.css
              </button>
            </div>
            <textarea
              value={activeTab === "html" ? htmlCode : cssCode}
              onChange={(e) =>
                activeTab === "html"
                  ? setHtmlCode(e.target.value)
                  : setCssCode(e.target.value)
              }
              className="w-full h-96 bg-secondary-dark text-text-light p-4 font-mono text-sm resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>

          {/* Панель предпросмотра */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-glass-border">
              <h3 className="text-xl font-bold text-accent-blue flex items-center gap-3">
                <i className="fas fa-eye"></i>Предпросмотр результата
              </h3>
              <button
                onClick={handleRefreshPreview}
                className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
              >
                <i className="fas fa-sync-alt mr-2"></i>Обновить
              </button>
            </div>
            <div className="h-[500px] bg-white rounded-lg overflow-hidden border-2 border-gray-200">
              <iframe
                ref={previewRef}
                className="w-full h-full border-0"
                title="Предпросмотр уровня"
              />
            </div>
            <div className="mt-6 p-5 bg-secondary-dark/50 rounded-lg border-l-4 border-accent-blue">
              <h4 className="text-lg font-bold mb-3 text-accent-blue flex items-center gap-2">
                <i className="fas fa-tasks"></i>Задание
              </h4>
              <div className="space-y-3">
                <p className="text-text-light">{level.description}</p>
              </div>
              <div
                className={`mt-4 p-4 rounded-lg transition-all duration-300 ${showHint ? "bg-accent-purple/10 border-l-4 border-accent-purple" : "bg-secondary-dark/30"}`}
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
                    <p className="text-text-dim">
                      {level.hint ||
                        "Используйте justify-content: center и align-items: center для центрирования элементов"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 my-12 pt-6 border-t border-glass-border">
          {prevLevelId !== null ? (
            <Link
              href={`/level/${prevLevelId}`}
              className="px-6 py-3 glass-card rounded-lg border border-glass-border hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 flex items-center justify-center gap-3 group text-center"
            >
              <i className="fas fa-arrow-left text-accent-blue group-hover:-translate-x-1 transition-transform duration-300"></i>
              <span>Предыдущий уровень</span>
            </Link>
          ) : (
            <span className="px-6 py-3 glass-card rounded-lg border border-glass-border opacity-50 cursor-not-allowed flex items-center justify-center gap-3 text-center">
              <i className="fas fa-arrow-left text-accent-blue"></i>
              <span>Предыдущий уровень</span>
            </span>
          )}
          {nextLevelId !== null ? (
            <Link
              href={`/level/${nextLevelId}`}
              className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group text-center"
            >
              <span>Следующий уровень</span>
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
            </Link>
          ) : (
            <span className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center gap-3 text-center">
              <span>Следующий уровень</span>
              <i className="fas fa-arrow-right"></i>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
