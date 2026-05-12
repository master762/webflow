"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";

// Типы данных из БД
type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";
type Category = "html" | "css" | "js" | "projects";
interface TopicDisplay extends TopicFromDB {
  progress: number;
  completed: boolean;
  locked: boolean;
  xpValue: number;
  iconClass: string;
  gradientClass: string;
}

interface TopicFromDB {
  id: number;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;

  icon?: string;
  iconColor?: string;

  lessons: number;

  levels: Level[];

  xp?: number;
  requirements?: string | null;
}

interface UserProgress {
  topicId: number;
  progress: number;
  completed: boolean;
}

type Level = {
  id: number;
  topicId: number;
  order: number;
  title: string;
  description: string;
  html: string;
  css: string;
  hint?: string;
  xp: number;
};
export default function TopicsPage() {
  // Данные из API
  const [topics, setTopics] = useState<TopicFromDB[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // UI состояние
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
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
  // --- Загрузка данных ---
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/topics");
        const data = await res.json();
        setTopics(data.topics || []);
        setProgress(data.progress || []);
      } catch (error) {
        console.error("Failed to load topics:", error);
        showMessage("Ошибка загрузки тем", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showMessage]);

  // --- Вспомогательные функции ---

  // Мапа прогресса
  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    progress.forEach((p) => map.set(p.topicId, p.progress));
    return map;
  }, [progress]);

  const getProgress = (id: number) => progressMap.get(id) ?? 0;
  const isCompleted = (progress: number) => progress >= 100;

  // Вычисление XP (если в БД нет поля xp)
  const computeXp = (difficulty: Difficulty, lessons: number) => {
    if (difficulty === "beginner") return lessons * 10;
    if (difficulty === "intermediate") return lessons * 20;
    if (difficulty === "advanced") return lessons * 30;
    return lessons * 40; // expert
  };

  // Логика блокировки (из второго варианта)
  const isLocked = (
    topic: TopicFromDB,
    allTopics: TopicFromDB[],
    progressMap: Map<number, number>,
  ) => {
    if (!topic.requirements) return false;
    const req = topic.requirements;
    if (!req) return false;
    // Проверка требований к HTML
    if (req.includes("HTML")) {
      const htmlTopic = allTopics.find((t) => t.category === "html");
      if (!htmlTopic) return true;
      const prog = progressMap.get(htmlTopic.id) ?? 0;
      return prog < 80;
    }
    // Проверка требований к CSS
    if (req.includes("CSS")) {
      const cssTopic = allTopics.find((t) => t.category === "css");
      if (!cssTopic) return true;
      const prog = progressMap.get(cssTopic.id) ?? 0;
      return prog < 80;
    }
    // Проверка "ALL" – все темы завершены на 100%
    if (req.includes("ALL")) {
      return Array.from(progressMap.values()).every((prog) => prog < 100);
    }
    return false;
  };

  // Статические маппинги иконок и градиентов (если в БД не переданы)
  const DEFAULT_ICONS: Record<Category, string> = {
    html: "fab fa-html5",
    css: "fab fa-css3-alt",
    js: "fab fa-js",
    projects: "fas fa-crown",
  };
  const DEFAULT_GRADIENTS: Record<Category, string> = {
    html: "from-orange-500 to-red-500",
    css: "from-blue-500 to-cyan-500",
    js: "from-yellow-400 to-yellow-600",
    projects: "from-purple-500 to-pink-500",
  };

  // Преобразуем сырые данные в расширенный тип для отображения
  const displayTopics: TopicDisplay[] = useMemo(() => {
    return topics.map((topic) => {
      const progressValue = getProgress(topic.id);
      const completed = isCompleted(progressValue);
      const locked = isLocked(topic, topics, progressMap);
      const xpValue = topic.xp ?? computeXp(topic.difficulty, topic.lessons);
      const iconClass = topic.icon ?? DEFAULT_ICONS[topic.category];
      const gradientClass =
        topic.iconColor ?? DEFAULT_GRADIENTS[topic.category];
      return {
        ...topic,
        progress: progressValue,
        completed,
        locked,
        xpValue,
        iconClass,
        gradientClass,
      };
    });
  }, [topics, progressMap, getProgress]); // --- Статистика ---
  const completedTopics = displayTopics.filter((t) => t.completed).length;
  const inProgressTopics = displayTopics.filter(
    (t) => !t.completed && t.progress > 0 && !t.locked,
  ).length;
  const totalTopics = displayTopics.length;
  const overallProgress = displayTopics.length
    ? Math.round(
        displayTopics.reduce((sum, t) => sum + t.progress, 0) /
          displayTopics.length,
      )
    : 0;

  // --- Фильтры ---
  const filters = [
    { id: "all", label: "Все темы" },
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "js", label: "JavaScript" },
    { id: "beginner", label: "Для начинающих" },
    { id: "projects", label: "Проекты" },
  ];

  const filteredTopics = displayTopics.filter((topic) => {
    // Фильтр по категории / сложности
    if (activeFilter !== "all") {
      if (activeFilter === "beginner") {
        if (topic.difficulty !== "beginner") return false;
      } else if (activeFilter === "projects") {
        if (topic.category !== "projects") return false;
      } else if (topic.category !== activeFilter) {
        return false;
      }
    }
    // Поиск
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchTitle = topic.title.toLowerCase().includes(searchLower);
      const matchDesc = topic.description.toLowerCase().includes(searchLower);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // --- Обработчики действий ---
  const handleReviewClick = (topic: TopicDisplay) => {
    showMessage(`Начинаем повторение темы: "${topic.title}"`, "info");
    // реальный редирект можно добавить позже
  };

  const handleLockedTopicClick = (topic: TopicDisplay) => {
    alert(
      `Тема "${topic.title}" заблокирована.\n\nТребования: ${topic.requirements}`,
    );
  };

  // Функции для отображения сложности (как в первом компоненте)
  const getDifficultyClass = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-accent-green/10 text-accent-green border-accent-green";
      case "intermediate":
        return "bg-accent-blue/10 text-accent-blue border-accent-blue";
      case "advanced":
        return "bg-accent-purple/10 text-accent-purple border-accent-purple";
      case "expert":
        return "bg-accent-red/10 text-accent-red border-accent-red";
      default:
        return "bg-white/10 text-text-dim border-glass-border";
    }
  };

  const getDifficultyIcon = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "fas fa-seedling";
      case "intermediate":
        return "fas fa-chart-line";
      case "advanced":
        return "fas fa-rocket";
      case "expert":
        return "fas fa-crown";
      default:
        return "fas fa-question";
    }
  };

  const getDifficultyLabel = (difficulty: Difficulty, category: Category) => {
    if (difficulty === "expert" && category === "projects") return "Проект";
    if (difficulty === "beginner") return "Для начинающих";
    if (difficulty === "intermediate") return "Средний уровень";
    if (difficulty === "advanced") return "Продвинутый уровень";
    if (difficulty === "expert") return "Эксперт";
    return "";
  };

  // Генерация ссылки (используем id или slug – здесь возьмём id как во втором варианте)
  const getTopicHref = (topic: TopicDisplay) => {
    return topic.levels?.[0] ? `/level/${topic.levels[0].id}` : "#";
  };

  // Анимация прогресс-баров и статистики после загрузки данных
  useEffect(() => {
    if (loading) return;
    // Даём время на рендер DOM
    const timeout = setTimeout(() => {
      const progressBars = document.querySelectorAll(".progress-animate");
      progressBars.forEach((bar, index) => {
        setTimeout(() => {
          const targetWidth = bar.getAttribute("data-width");
          if (bar instanceof HTMLElement && targetWidth) {
            bar.style.width = targetWidth;
          }
        }, index * 100);
      });

      const statValues = document.querySelectorAll(".stat-animate");
      statValues.forEach((value) => {
        const targetText = value.getAttribute("data-value");
        const targetNumber = targetText ? parseInt(targetText) : 0;
        if (!isNaN(targetNumber) && value instanceof HTMLElement) {
          let current = 0;
          const step = Math.ceil(targetNumber / 30);
          const interval = setInterval(() => {
            current += step;
            if (current >= targetNumber) {
              current = targetNumber;
              clearInterval(interval);
            }
            value.textContent = current.toString();
          }, 50);
        }
      });
    }, 100);
    return () => clearTimeout(timeout);
  }, [loading, displayTopics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-dim">Загрузка тем...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Toast-сообщения */}
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
        {/* Шапка со статистикой */}
        <div className="my-8 p-8 glass-card rounded-2xl text-center border border-glass-border">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            Все темы для изучения
          </h1>
          <p className="text-lg text-text-dim max-w-3xl mx-auto mb-8">
            Выберите тему, которую хотите изучить. Прогресс сохраняется
            автоматически. Темы разбиты на уровни сложности и рекомендуются к
            изучению последовательно.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-green transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-green stat-animate"
                data-value={completedTopics}
              >
                0
              </div>
              <div className="text-sm text-text-dim">Завершено</div>
            </div>
            <div className="p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-blue transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-blue stat-animate"
                data-value={inProgressTopics}
              >
                0
              </div>
              <div className="text-sm text-text-dim">В процессе</div>
            </div>
            <div className="p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-purple transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-purple stat-animate"
                data-value={totalTopics}
              >
                0
              </div>
              <div className="text-sm text-text-dim">Всего тем</div>
            </div>
            <div className="p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-yellow transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-yellow stat-animate"
                data-value={overallProgress}
              >
                0%
              </div>
              <div className="text-sm text-text-dim">Общий прогресс</div>
            </div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="glass-card rounded-xl p-6 border border-glass-border mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    activeFilter === filter.id
                      ? "bg-accent-blue/10 text-accent-blue border border-accent-blue"
                      : "bg-secondary-dark/50 text-text-dim border border-glass-border hover:bg-accent-blue/5 hover:text-accent-blue"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-text-dim"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск тем..."
                className="w-full pl-12 pr-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue focus:shadow-neon-blue transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Сетка карточек тем */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTopics.map((topic, index) => (
            <div
              key={topic.id}
              className={`glass-card rounded-xl p-6 border border-glass-border flex flex-col transition-all duration-300 ${
                topic.locked
                  ? "opacity-70 grayscale"
                  : "hover:border-accent-blue hover:shadow-neon-blue hover:-translate-y-2"
              } ${topic.completed ? "relative" : ""}`}
              style={{ animation: `slideIn 0.5s ease ${index * 0.1}s both` }}
              onClick={
                topic.locked ? () => handleLockedTopicClick(topic) : undefined
              }
            >
              {/* Галочка завершения */}
              {topic.completed && (
                <>
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-60px border-r-60px border-t-transparent border-r-accent-green"></div>
                  <i className="fas fa-check absolute top-2 right-2 text-black text-sm"></i>
                </>
              )}

              {/* Иконка блокировки */}
              {topic.locked && (
                <i className="fas fa-lock text-accent-red text-xl absolute top-5 right-5"></i>
              )}

              {/* Заголовок карточки: иконка + уровень сложности */}
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl bg-gradient-to-br ${topic.gradientClass}`}
                >
                  <i className={topic.iconClass}></i>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyClass(topic.difficulty)}`}
                >
                  <i
                    className={`${getDifficultyIcon(topic.difficulty)} mr-1`}
                  ></i>
                  {getDifficultyLabel(topic.difficulty, topic.category)}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3">{topic.title}</h3>
              <p className="text-text-dim mb-6 grow">{topic.description}</p>

              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2 text-text-dim">
                  <i className="far fa-clock"></i>
                  <span className="text-sm">
                    {topic.lessons}{" "}
                    {topic.lessons === 1
                      ? "урок"
                      : topic.lessons < 5
                        ? "урока"
                        : "уроков"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-dim">
                  <i className="fas fa-star text-accent-yellow"></i>
                  <span className="text-sm">{topic.xpValue} XP</span>
                </div>
              </div>

              {/* Прогресс-бар */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Прогресс</span>
                  <span className="font-semibold">{topic.progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-accent-blue to-accent-purple progress-animate"
                    data-width={`${topic.progress}%`}
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-3 mt-auto">
                {topic.locked ? (
                  <>
                    <button
                      className="flex-1 px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-dim cursor-not-allowed flex items-center justify-center gap-2"
                      disabled
                    >
                      <i className="fas fa-lock"></i>
                      Заблокировано
                    </button>
                    <button
                      className="px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-dim text-sm cursor-not-allowed"
                      disabled
                    >
                      {topic.requirements}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={getTopicHref(topic)}
                      className="flex-1 px-4 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-play-circle"></i>
                      {topic.completed
                        ? "Повторить"
                        : topic.progress > 0
                          ? "Продолжить"
                          : "Начать"}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReviewClick(topic);
                      }}
                      className="px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-redo"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12 glass-card rounded-xl border border-glass-border">
            <i className="fas fa-search text-4xl text-text-dim mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Темы не найдены</h3>
            <p className="text-text-dim">
              Попробуйте изменить параметры фильтрации или очистить поиск
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
