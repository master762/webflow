"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Topic {
  id: number;
  title: string;
  description: string;
  category: "html" | "css" | "js" | "projects";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  icon: string;
  iconColor?: string;
  lessons: number;
  xp: number;
  progress: number;
  completed: boolean;
  locked: boolean;
  requirements?: string;
}

export default function TopicsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [topics] = useState<Topic[]>([
    {
      id: 1,
      title: "Основы HTML",
      description:
        "Изучите базовые теги, структуру документа, семантику и основные элементы HTML5. Начните свой путь в веб-разработке.",
      category: "html",
      difficulty: "beginner",
      icon: "fab fa-html5",
      lessons: 8,
      xp: 100,
      progress: 100,
      completed: true,
      locked: false,
    },
    {
      id: 2,
      title: "Основы CSS",
      description:
        "Селекторы, свойства, каскадность, наследование и основные стили для текста и блоков. Создавайте красивые веб-страницы.",
      category: "css",
      difficulty: "beginner",
      icon: "fab fa-css3-alt",
      lessons: 10,
      xp: 120,
      progress: 90,
      completed: true,
      locked: false,
    },
    {
      id: 3,
      title: "Flexbox",
      description:
        "Гибкая модель разметки для создания адаптивных макетов без сложных вычислений. Освойте современный подход к верстке.",
      category: "css",
      difficulty: "intermediate",
      icon: "fas fa-boxes",
      lessons: 12,
      xp: 150,
      progress: 70,
      completed: false,
      locked: false,
    },
    {
      id: 4,
      title: "CSS Grid",
      description:
        "Двумерная система компоновки для создания сложных адаптивных макетов. Мощный инструмент для современной верстки.",
      category: "css",
      difficulty: "intermediate",
      icon: "fas fa-th",
      lessons: 10,
      xp: 140,
      progress: 40,
      completed: false,
      locked: false,
    },
    {
      id: 5,
      title: "Адаптивный дизайн",
      description:
        "Медиа-запросы, относительные единицы и техники создания адаптивных интерфейсов. Сделайте ваш сайт идеальным на всех устройствах.",
      category: "css",
      difficulty: "intermediate",
      icon: "fas fa-mobile-alt",
      lessons: 8,
      xp: 120,
      progress: 20,
      completed: false,
      locked: false,
    },
    {
      id: 6,
      title: "Анимации CSS",
      description:
        "Создавайте плавные переходы и анимации для улучшения пользовательского опыта. Добавьте динамики вашим веб-страницам.",
      category: "css",
      difficulty: "advanced",
      icon: "fas fa-magic",
      lessons: 10,
      xp: 150,
      progress: 0,
      completed: false,
      locked: true,
      requirements: "Требуется 80% по CSS Grid",
    },
    {
      id: 7,
      title: "Основы JavaScript",
      description:
        "Переменные, функции, условия, циклы и работа с DOM. Добавьте интерактивности вашим веб-страницам.",
      category: "js",
      difficulty: "beginner",
      icon: "fab fa-js",
      lessons: 15,
      xp: 200,
      progress: 0,
      completed: false,
      locked: true,
      requirements: "Требуется 100% по HTML и CSS",
    },
    {
      id: 8,
      title: "Верстка лендинга",
      description:
        "Примените все полученные знания для верстки полноценного лендинга с нуля. Реальный проект для вашего портфолио.",
      category: "projects",
      difficulty: "expert",
      icon: "fas fa-flag-checkered",
      iconColor: "from-accent-red to-accent-yellow",
      lessons: 1,
      xp: 300,
      progress: 0,
      completed: false,
      locked: true,
      requirements: "Требуется 80% по всем темам",
    },
    {
      id: 9,
      title: "Интернет-магазин",
      description:
        "Создайте полноценный интернет-магазин с каталогом товаров, корзиной и адаптивным дизайном. Самый сложный проект на платформе.",
      category: "projects",
      difficulty: "expert",
      icon: "fas fa-crown",
      iconColor: "from-accent-red to-orange-500",
      lessons: 1,
      xp: 500,
      progress: 0,
      completed: false,
      locked: true,
      requirements: "Требуется завершить все темы",
    },
  ]);

  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  // Статистика
  const completedTopics = topics.filter((t) => t.completed).length;
  const inProgressTopics = topics.filter(
    (t) => !t.completed && t.progress > 0 && !t.locked,
  ).length;
  const totalTopics = topics.length;
  const overallProgress = Math.round(
    topics.reduce((sum, t) => sum + t.progress, 0) / topics.length,
  );

  // Фильтры
  const filters = [
    { id: "all", label: "Все темы" },
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "js", label: "JavaScript" },
    { id: "beginner", label: "Для начинающих" },
    { id: "projects", label: "Проекты" },
  ];

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

  // Отфильтрованные темы
  const filteredTopics = topics.filter((topic) => {
    // Фильтрация по категории/сложности
    if (activeFilter !== "all") {
      if (activeFilter === "beginner") {
        if (topic.difficulty !== "beginner") return false;
      } else if (activeFilter === "projects") {
        if (topic.category !== "projects") return false;
      } else if (topic.category !== activeFilter) {
        return false;
      }
    }

    // Фильтрация по поиску
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTitle = topic.title.toLowerCase().includes(searchLower);
      const matchesDesc = topic.description.toLowerCase().includes(searchLower);

      if (!matchesTitle && !matchesDesc) {
        return false;
      }
    }

    return true;
  });

  // Обработчики действий
  const handleReviewClick = useCallback(
    (topic: Topic) => {
      showMessage(`Начинаем повторение темы: "${topic.title}"`, "info");
      // В реальном приложении здесь был бы редирект
    },
    [showMessage],
  );

  const handleLockedTopicClick = useCallback((topic: Topic) => {
    alert(
      `Тема &quot;${topic.title}&quot; заблокирована.\n\nТребования: ${topic.requirements}`,
    );
  }, []);

  // Функция для получения класса сложности
  const getDifficultyClass = (difficulty: Topic["difficulty"]) => {
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

  // Функция для получения иконки сложности
  const getDifficultyIcon = (difficulty: Topic["difficulty"]) => {
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

  const getTopicHref = (topic: Topic) => {
    if (topic.category === "projects") {
      return "/boss";
    }

    const topicSlugs: Record<number, string> = {
      1: "html",
      2: "css",
      3: "flexbox",
      4: "grid",
      5: "responsive",
      6: "animations",
      7: "javascript",
    };

    return `/level?topic=${topicSlugs[topic.id] ?? "flexbox"}`;
  };

  // Анимация при загрузке
  useEffect(() => {
    const progressBars = document.querySelectorAll(".progress-animate");
    progressBars.forEach((bar, index) => {
      setTimeout(
        () => {
          const targetWidth = bar.getAttribute("data-width");
          if (bar instanceof HTMLElement) {
            bar.style.width = targetWidth || "0%";
          }
        },
        index * 200 + 500,
      );
    });

    // Анимация статистики
    const statValues = document.querySelectorAll(".stat-animate");
    statValues.forEach((value, index) => {
      setTimeout(() => {
        const targetText = value.getAttribute("data-value");
        const targetNumber = targetText ? parseInt(targetText) : 0;

        if (!isNaN(targetNumber)) {
          let currentNumber = 0;
          const increment = Math.ceil(targetNumber / 30);

          const interval = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= targetNumber) {
              currentNumber = targetNumber;
              clearInterval(interval);
            }
            if (value instanceof HTMLElement) {
              value.textContent = currentNumber.toString();
            }
          }, 50);
        }
      }, index * 300);
    });
  }, []);

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
        {/* Шапка тем */}
        <div className="my-8 p-8 glass-card rounded-2xl text-center border border-glass-border">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            Все темы для изучения
          </h1>
          <p className="text-lg text-text-dim max-w-3xl mx-auto mb-8">
            Выберите тему, которую хотите изучить. Прогресс сохраняется
            автоматически. Темы разбиты на уровни сложности и рекомендуются к
            изучению последовательно.
          </p>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-green transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-green stat-animate"
                data-value={completedTopics}
              >
                {completedTopics}
              </div>
              <div className="text-sm text-text-dim">Завершено</div>
            </div>
            <div className="p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-blue transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-blue stat-animate"
                data-value={inProgressTopics}
              >
                {inProgressTopics}
              </div>
              <div className="text-sm text-text-dim">В процессе</div>
            </div>
            <div className="p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-purple transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-purple stat-animate"
                data-value={totalTopics}
              >
                {totalTopics}
              </div>
              <div className="text-sm text-text-dim">Всего тем</div>
            </div>
            <div className="p-6 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-yellow transition-all duration-300 hover:-translate-y-1">
              <div
                className="text-3xl font-bold text-accent-yellow stat-animate"
                data-value={overallProgress}
              >
                {overallProgress}%
              </div>
              <div className="text-sm text-text-dim">Общий прогресс</div>
            </div>
          </div>
        </div>

        {/* Фильтры */}
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

        {/* Сетка тем */}
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

              {/* Заголовок темы */}
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl ${
                    topic.iconColor ||
                    "bg-linear-to-br from-accent-blue to-accent-purple"
                  }`}
                >
                  <i className={topic.icon}></i>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyClass(topic.difficulty)}`}
                >
                  <i
                    className={`${getDifficultyIcon(topic.difficulty)} mr-1`}
                  ></i>
                  {topic.difficulty === "beginner" && "Для начинающих"}
                  {topic.difficulty === "intermediate" && "Средний уровень"}
                  {topic.difficulty === "advanced" && "Продвинутый уровень"}
                  {topic.difficulty === "expert" &&
                    (topic.category === "projects" ? "Проект" : "Эксперт")}
                </div>
              </div>

              {/* Название и описание */}
              <h3 className="text-xl font-bold mb-3">{topic.title}</h3>
              <p className="text-text-dim mb-6 grow">{topic.description}</p>

              {/* Мета-информация */}
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
                  <span className="text-sm">{topic.xp} XP</span>
                </div>
              </div>

              {/* Прогресс */}
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
                      onClick={() => handleReviewClick(topic)}
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

        {/* Сообщение о пустом результате */}
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
