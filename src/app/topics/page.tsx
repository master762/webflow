"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ScrollReveal from "@/app/components/ScrollReveal";
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
  submissionStatus?: "pending" | "reviewed" | null;
  score?: number | null;
  comment?: string | null;
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
  accessLevel?: string;
  teacherId?: string | null;
  projectId?: number | null;
  submission?: {
    status: string;
    score: number | null;
    comment: string | null;
  } | null;
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
  console.log("SESSION:", useSession());
  const { data: session, status } = useSession();

  const roleId = session?.user?.roleId;
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
  const isLocked = (topic: TopicFromDB) => {
    if (!topic.accessLevel) return false;

    // subscriber доступ
    if (topic.accessLevel === "subscriber") {
      return roleId !== 2 && roleId !== 3 && roleId !== 4;
    }

    // admin доступ
    if (topic.accessLevel === "admin") {
      return roleId !== 4;
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
      const locked = isLocked(topic);
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
        // Добавляем статус для проектов
        submissionStatus:
          (topic.submission?.status as "pending" | "reviewed" | null) || null,
        score: topic.submission?.score || null,
        comment: topic.submission?.comment || null,
      };
    });
  }, [topics, progressMap, getProgress, roleId]);
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

  const getCardStyle = (topic: TopicDisplay) => {
    if (topic.category !== "projects") return "";

    if (topic.submissionStatus === "reviewed" && topic.score) {
      if (topic.score >= 8) return "border-green-500 bg-green-500/5";
      if (topic.score >= 5) return "border-yellow-500 bg-yellow-500/5";
      return "border-red-500 bg-red-500/5";
    }

    if (topic.submissionStatus === "pending") {
      return "border-yellow-500 bg-yellow-500/5";
    }

    return "border-accent-blue bg-accent-blue/5";
  };
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
    // Функция для получения стиля карточки
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

  // Генерация ссылки
  const getTopicHref = (topic: TopicDisplay) => {
    // Для проектов используем projectId
    if (topic.category === "projects") {
      const projectId = (topic as any).projectId;
      if (projectId) {
        return `/projects/${projectId}`;
      }
      return "#";
    }
    // Для обычных тем – на первый уровень
    return topic.levels?.[0] ? `/level/${topic.levels[0].id}` : "#";
  };

  // Функция для получения статус-бейджа проекта
  const getProjectStatusBadge = (topic: TopicDisplay) => {
    if (topic.category !== "projects") return null;

    const isPending = topic.submissionStatus === "pending";
    const isReviewed = topic.submissionStatus === "reviewed";
    const score = topic.score;
    const scoreColor =
      score && score >= 8 ? "green" : score && score >= 5 ? "yellow" : "red";

    const statusConfig = {
      green: {
        bg: "bg-green-500/20",
        border: "border-green-500",
        text: "text-green-400",
        icon: "fa-check-circle",
        label: "Зачтено",
      },
      yellow: {
        bg: "bg-yellow-500/20",
        border: "border-yellow-500",
        text: "text-yellow-400",
        icon: "fa-clock",
        label: "На доработке",
      },
      red: {
        bg: "bg-red-500/20",
        border: "border-red-500",
        text: "text-red-400",
        icon: "fa-exclamation-triangle",
        label: "Требует исправлений",
      },
    };

    if (isReviewed && score) {
      const config = statusConfig[scoreColor];
      return (
        <div
          className={`mb-3 p-3 rounded-lg ${config.bg} border ${config.border}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className={`fas ${config.icon} ${config.text}`}></i>
              <span className={`font-semibold ${config.text}`}>
                {config.label}
              </span>
            </div>
            <span className={`text-xl font-bold ${config.text}`}>
              {score}/10
            </span>
          </div>
          {topic.comment && (
            <p className="text-xs text-text-dim mt-2">{topic.comment}</p>
          )}
        </div>
      );
    }

    if (isPending) {
      return (
        <div className="mb-3 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500">
          <div className="flex items-center gap-2">
            <i className="fas fa-hourglass-half text-yellow-400"></i>
            <span className="font-semibold text-yellow-400">На проверке</span>
          </div>
          <p className="text-xs text-text-dim mt-1">
            Работа отправлена, ожидайте оценки
          </p>
        </div>
      );
    }

    if (!isPending && !isReviewed) {
      return (
        <div className="mb-3 p-3 rounded-lg bg-accent-blue/20 border border-accent-blue">
          <div className="flex items-center gap-2">
            <i className="fas fa-play-circle text-accent-blue"></i>
            <span className="font-semibold text-accent-blue">
              Ожидает выполнения
            </span>
          </div>
          <p className="text-xs text-text-dim mt-1">
            Ознакомьтесь с заданием и отправьте ссылку на GitHub
          </p>
        </div>
      );
    }

    return null;
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
    <div className="min-h-screen text-text-light">
      {/* Toast-сообщения */}
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
          {msg.text}
        </div>
      ))}

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Шапка со статистикой */}
        <ScrollReveal variant="fade-up" className="my-8 p-8 glass-card rounded-2xl text-center border border-glass-border">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Все темы для изучения
          </h1>
          <p className="text-lg text-text-dim max-w-3xl mx-auto mb-8">
            Выберите тему, которую хотите изучить. Прогресс сохраняется
            автоматически. Темы разбиты на уровни сложности и рекомендуются к
            изучению последовательно.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="stat-card-glow p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-green transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-green stat-animate"
                data-value={completedTopics}
              >
                0
              </div>
              <div className="text-sm text-text-dim">Завершено</div>
            </div>
            <div className="stat-card-glow p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-blue transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-blue stat-animate"
                data-value={inProgressTopics}
              >
                0
              </div>
              <div className="text-sm text-text-dim">В процессе</div>
            </div>
            <div className="stat-card-glow p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-purple transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-purple stat-animate"
                data-value={totalTopics}
              >
                0
              </div>
              <div className="text-sm text-text-dim">Всего тем</div>
            </div>
            <div className="stat-card-glow p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-yellow transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-yellow stat-animate"
                data-value={overallProgress}
              >
                0%
              </div>
              <div className="text-sm text-text-dim">Общий прогресс</div>
            </div>
          </div>
        </ScrollReveal>

        {/* Фильтры и поиск */}
        <ScrollReveal variant="fade-up" delay={100} className="glass-card rounded-xl p-6 border border-glass-border mb-8">
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
        </ScrollReveal>

        {/* Сетка карточек тем */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTopics.map((topic, index) => {
            const isProject = topic.category === "projects";
            return (
              <ScrollReveal
                key={topic.id}
                variant="fade-up"
                delay={Math.min(index * 80, 400)}
                className="h-full"
              >
              <div
                className={`
  glass-card glass-card-interactive rounded-xl p-6 border flex flex-col h-full relative
  ${getCardStyle(topic)}
  ${topic.locked ? "opacity-70 grayscale" : "hover:shadow-neon-blue hover:border-accent-blue/50"}
`}
                onClick={
                  topic.locked ? () => handleLockedTopicClick(topic) : undefined
                }
              >
                {/* Иконка блокировки */}
                {topic.locked && (
                  <i className="fas fa-lock text-accent-red text-xl absolute top-5 right-5 z-10"></i>
                )}

                {/* Заголовок карточки: иконка + уровень сложности */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl bg-linear-to-br ${topic.gradientClass}`}
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

                {/* Статус-бейдж для проектов */}
                {getProjectStatusBadge(topic)}

                {/* Прогресс-бар (только для обычных тем) */}
                {!isProject && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Прогресс</span>
                      <span className="font-semibold">{topic.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          topic.completed
                            ? "bg-accent-green"
                            : "bg-linear-to-r from-accent-blue to-accent-purple"
                        } progress-animate`}
                        data-width={`${topic.progress}%`}
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Бейдж "Задание от учителя" - внизу карточки */}
                {topic.teacherId && !topic.locked && (
                  <div className="mb-3">
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-md text-xs flex items-center gap-1 w-fit">
                      <i className="fas fa-chalkboard-user text-xs"></i> Задание
                      от учителя
                    </span>
                  </div>
                )}

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
                        className={`flex-1 px-4 py-3 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          topic.completed
                            ? "bg-accent-green/20 text-accent-green border border-accent-green hover:bg-accent-green/30"
                            : "bg-linear-to-r from-accent-blue to-accent-purple text-white hover:shadow-neon-purple"
                        }`}
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
              </ScrollReveal>
            );
          })}
        </div>
      </div>
      {filteredTopics.length === 0 && (
        <ScrollReveal variant="fade-up" className="container mx-auto px-4 max-w-7xl">
        <div className="text-center py-12 glass-card rounded-xl border border-glass-border mb-12">
          <i className="fas fa-search text-4xl text-text-dim mb-4"></i>
          <h3 className="text-xl font-bold mb-2">Темы не найдены</h3>
          <p className="text-text-dim">
            Попробуйте изменить параметры фильтрации или очистить поиск
          </p>
        </div>
        </ScrollReveal>
      )}
    </div>
  );
}
