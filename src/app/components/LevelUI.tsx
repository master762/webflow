"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  validateLevelCode,
  type RuleCheckResult,
} from "@/lib/levelValidation";
import type { RankProgress } from "@/lib/levelUtils";
import {
  isSoundEnabled,
  setSoundEnabled,
  playCyberWinSound,
  playCyberErrorSound,
} from "@/lib/soundSettings";
import Confetti from "@/app/components/level/Confetti";
import VictoryModal from "@/app/components/level/VictoryModal";
import CodeEditor from "@/app/components/level/CodeEditor";
import ComparePreview from "@/app/components/level/ComparePreview";
import ValidationFeedback from "@/app/components/level/ValidationFeedback";

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

type CompleteResponse = {
  success: boolean;
  xpAwarded: number;
  topicBonusXp: number;
  completed: boolean;
  rankProgress: RankProgress;
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

  const [validationFailures, setValidationFailures] = useState<
    RuleCheckResult[]
  >([]);
  const [expectedHtml, setExpectedHtml] = useState(level.html);
  const [expectedCss, setExpectedCss] = useState(level.css);
  const [showCompare, setShowCompare] = useState(false);
  const [activeArrowLine, setActiveArrowLine] = useState<number | null>(null);
  const [arrowLabel, setArrowLabel] = useState("");

  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previewShake, setPreviewShake] = useState<"none" | "success" | "error">(
    "none",
  );
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [victoryData, setVictoryData] = useState<CompleteResponse | null>(null);

  const previewRef = useRef<HTMLIFrameElement>(null);
  const checkBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSoundEnabledState(isSoundEnabled());
  }, []);

  const showMessage = useCallback((text: string, type: Message["type"]) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 5000);
  }, []);

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
    setValidationFailures([]);
    setShowCompare(false);
    setActiveArrowLine(null);
    setShowVictoryModal(false);
    setShowConfetti(false);
    setPreviewShake("none");
  }, [level]);

  const highlightLines = validationFailures
    .filter((f) => f.targetTab === activeTab)
    .map((f) => f.line);

  const handleReset = () => {
    setHtmlCode(level.html);
    setCssCode(level.css);
    setValidationFailures([]);
    setShowCompare(false);
    setActiveArrowLine(null);
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

  const completeLevel = useCallback(async (): Promise<CompleteResponse | null> => {
    try {
      const res = await fetch("/api/levels/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId: level.id }),
      });
      const data = await res.json();
      if (data.success) {
        return data as CompleteResponse;
      }
      showMessage("Ошибка сохранения прогресса", "error");
      return null;
    } catch (err) {
      console.error(err);
      showMessage("Ошибка сервера", "error");
      return null;
    }
  }, [level.id, showMessage]);

  const triggerPreviewShake = (type: "success" | "error") => {
    setPreviewShake(type);
    setTimeout(() => setPreviewShake("none"), 600);
  };

  const handleJumpToIssue = (tab: "html" | "css", line: number) => {
    setActiveTab(tab);
    const failure = validationFailures.find(
      (f) => f.targetTab === tab && f.line === line,
    );
    setActiveArrowLine(line);
    setArrowLabel(failure?.arrowLabel ?? "");
  };

  const handleCheck = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setValidationFailures([]);
    setShowCompare(false);
    setActiveArrowLine(null);

    await new Promise((r) => setTimeout(r, 800));

    if (level.validation) {
      try {
        const parsed = JSON.parse(level.validation);
        if (parsed.type === "manual") {
          showMessage(
            "Это задание проверяется преподавателем. Отправьте ссылку на GitHub.",
            "info",
          );
          setIsChecking(false);
          return;
        }
      } catch {
        /* continue */
      }
    }

    const outcome = validateLevelCode(htmlCode, cssCode, level.validation);

    if (outcome.allPassed) {
      const data = await completeLevel();
      if (data) {
        setVictoryData(data);
        setShowConfetti(true);
        triggerPreviewShake("success");
        playCyberWinSound();
        setShowVictoryModal(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      setValidationFailures(outcome.results);
      setExpectedHtml(outcome.expectedHtml);
      setExpectedCss(outcome.expectedCss);
      setShowCompare(true);

      const first = outcome.results[0];
      if (first) {
        setActiveTab(first.targetTab);
        setActiveArrowLine(first.line);
        setArrowLabel(first.arrowLabel);
      }

      triggerPreviewShake("error");
      playCyberErrorSound();
      showMessage(
        `Не всё верно — исправьте ${outcome.results.length} ${outcome.results.length === 1 ? "пункт" : "пункта"}`,
        "error",
      );

      if (checkBtnRef.current) {
        checkBtnRef.current.classList.add("animate-shake");
        setTimeout(() => {
          checkBtnRef.current?.classList.remove("animate-shake");
        }, 500);
      }
    }

    setIsChecking(false);
  };

  const handleVictoryContinue = () => {
    setShowVictoryModal(false);
    if (nextLevelId !== null) {
      router.push(`/level/${nextLevelId}`);
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    setSoundEnabledState(enabled);
  };

  const handleRefreshPreview = () => {
    updatePreview();
    showMessage("Предпросмотр обновлен", "info");
  };

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

  const defaultRank: RankProgress = {
    rankLevel: 1,
    rankTitle: "Новичок",
    totalXp: 0,
    nextRankTitle: "Ученик",
    nextRankXp: 100,
    progressPercent: 0,
    xpToNext: 100,
  };

  return (
    <div className="min-h-screen text-text-light">
      <Confetti active={showConfetti} />

      {victoryData && (
        <VictoryModal
          open={showVictoryModal}
          levelTitle={level.title}
          xpAwarded={victoryData.xpAwarded}
          topicBonusXp={victoryData.topicBonusXp}
          rankProgress={victoryData.rankProgress ?? defaultRank}
          topicCompleted={victoryData.completed}
          nextLevelId={nextLevelId}
          onContinue={handleVictoryContinue}
          soundEnabled={soundEnabled}
          onSoundToggle={handleSoundToggle}
        />
      )}

      <style jsx global>{`
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
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`toast-slide-in fixed top-24 right-5 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            msg.type === "success"
              ? "bg-accent-green/90 text-black border-l-4 border-accent-green"
              : msg.type === "error"
                ? "bg-accent-red/90 text-white border-l-4 border-accent-red"
                : "bg-accent-blue/90 text-black border-l-4 border-accent-blue"
          }`}
        >
          <i
            className={`fas ${msg.type === "success" ? "fa-check-circle" : msg.type === "error" ? "fa-exclamation-circle" : "fa-info-circle"} mr-2`}
          ></i>
          {msg.text}
        </div>
      ))}

      <div className="container mx-auto px-4 max-w-7xl">
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
              <p className="text-text-dim mt-3 max-w-2xl">{level.description}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="px-4 py-2 rounded-full bg-accent-green/10 text-accent-green border border-accent-green shadow-neon-green">
                <i className="fas fa-bolt mr-2"></i>+{level.xp} XP
              </div>
              <button
                type="button"
                onClick={() => handleSoundToggle(!soundEnabled)}
                className="px-3 py-2 rounded-lg border border-glass-border text-text-dim hover:text-accent-blue hover:border-accent-blue transition-colors text-sm"
                title={soundEnabled ? "Выключить звук" : "Включить звук"}
              >
                <i
                  className={`fas ${soundEnabled ? "fa-volume-up" : "fa-volume-mute"} mr-1`}
                />
                Звук
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-secondary-dark rounded-xl overflow-hidden border border-glass-border shadow-lg">
            <div className="p-4 bg-black/50 border-b border-glass-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex items-center gap-3 font-bold">
                <i className="fas fa-code text-accent-blue"></i>
                <span>Редактор кода</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10"
                >
                  <i className="fas fa-redo mr-2"></i>Сбросить
                </button>
                <button
                  type="button"
                  onClick={handleHint}
                  className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10"
                >
                  <i className="fas fa-lightbulb mr-2"></i>Подсказка
                </button>
                <button
                  ref={checkBtnRef}
                  type="button"
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
                type="button"
                onClick={() => setActiveTab("html")}
                className={`px-6 py-3 flex items-center gap-2 transition-all duration-300 ${activeTab === "html" ? "text-accent-blue bg-accent-blue/5 border-b-2 border-accent-blue" : "text-text-dim hover:text-text-light"}`}
              >
                <i className="fab fa-html5"></i>index.html
                {validationFailures.some((f) => f.targetTab === "html") && (
                  <span className="w-2 h-2 rounded-full bg-accent-red" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("css")}
                className={`px-6 py-3 flex items-center gap-2 transition-all duration-300 ${activeTab === "css" ? "text-accent-blue bg-accent-blue/5 border-b-2 border-accent-blue" : "text-text-dim hover:text-text-light"}`}
              >
                <i className="fab fa-css3-alt"></i>style.css
                {validationFailures.some((f) => f.targetTab === "css") && (
                  <span className="w-2 h-2 rounded-full bg-accent-red" />
                )}
              </button>
            </div>

            <CodeEditor
              value={activeTab === "html" ? htmlCode : cssCode}
              onChange={(v) =>
                activeTab === "html" ? setHtmlCode(v) : setCssCode(v)
              }
              highlightLines={highlightLines}
              activeArrowLine={
                validationFailures.some((f) => f.targetTab === activeTab)
                  ? activeArrowLine
                  : null
              }
              arrowLabel={arrowLabel}
            />

            <ValidationFeedback
              failures={validationFailures}
              onJumpTo={handleJumpToIssue}
            />
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-glass-border">
              <h3 className="text-xl font-bold text-accent-blue flex items-center gap-3">
                <i className="fas fa-eye"></i>Предпросмотр результата
              </h3>
              <button
                type="button"
                onClick={handleRefreshPreview}
                className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10"
              >
                <i className="fas fa-sync-alt mr-2"></i>Обновить
              </button>
            </div>
            <div
              className={`h-[280px] bg-white rounded-lg overflow-hidden border-2 border-gray-200 transition-transform ${
                previewShake === "success"
                  ? "preview-shake-success"
                  : previewShake === "error"
                    ? "preview-shake-error"
                    : ""
              }`}
            >
              <iframe
                ref={previewRef}
                className="w-full h-full border-0"
                title="Предпросмотр уровня"
              />
            </div>

            {showCompare && validationFailures.length > 0 && (
              <ComparePreview
                userHtml={htmlCode}
                userCss={cssCode}
                expectedHtml={expectedHtml}
                expectedCss={expectedCss}
              />
            )}

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
                  type="button"
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
