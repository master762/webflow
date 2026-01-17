"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

interface Material {
  id: number;
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  type: "article" | "video" | "cheatsheet" | "interactive";
  duration: string;
  tags: string[];
  locked: boolean;
  requirements?: string;
  icon: string;
}

export default function MaterialsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(["article", "video", "cheatsheet", "interactive"]),
  );
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(
    new Set(["beginner", "intermediate", "advanced"]),
  );
  const [accessFilter, setAccessFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);

  // Материалы
  const materials: Material[] = useMemo(
    () => [
      {
        id: 1,
        title: "Структура HTML-документа",
        description:
          "Изучите базовую структуру HTML-документа, теги head и body, doctype и мета-теги. Основы для начинающих.",
        category: "html",
        level: "beginner",
        type: "article",
        duration: "10 мин",
        tags: ["HTML", "Основы", "Структура"],
        locked: false,
        icon: "fab fa-html5",
      },
      {
        id: 2,
        title: "Селекторы и каскадность CSS",
        description:
          "Подробное руководство по CSS-селекторам, специфичности и каскадности стилей. Шпаргалка для быстрого доступа.",
        category: "css",
        level: "beginner",
        type: "cheatsheet",
        duration: "15 мин",
        tags: ["CSS", "Селекторы", "Шпаргалка"],
        locked: false,
        icon: "fab fa-css3-alt",
      },
      {
        id: 3,
        title: "Основы Flexbox",
        description:
          "Полное руководство по свойствам Flexbox: flex-direction, justify-content, align-items и другие. С примерами кода.",
        category: "flexbox",
        level: "intermediate",
        type: "article",
        duration: "20 мин",
        tags: ["Flexbox", "CSS", "Макет"],
        locked: false,
        icon: "fas fa-boxes",
      },
      {
        id: 4,
        title: "Создание сеток с Grid",
        description:
          "Изучите grid-template, grid-area и другие свойства CSS Grid. Видеоурок с практическими примерами.",
        category: "grid",
        level: "intermediate",
        type: "video",
        duration: "25 мин",
        tags: ["CSS Grid", "Видео", "Макет"],
        locked: true,
        requirements: "Требуется 80% Flexbox",
        icon: "fas fa-th",
      },
      {
        id: 5,
        title: "Медиа-запросы на практике",
        description:
          "Интерактивное руководство по созданию адаптивных интерфейсов с помощью медиа-запросов. Практика с живыми примерами.",
        category: "responsive",
        level: "intermediate",
        type: "interactive",
        duration: "30 мин",
        tags: ["Адаптивность", "CSS", "Интерактив"],
        locked: false,
        icon: "fas fa-mobile-alt",
      },
      {
        id: 6,
        title: "Верстка сложных макетов",
        description:
          "Практическое руководство по верстке реальных проектов. Подробный разбор сложных кейсов.",
        category: "projects",
        level: "advanced",
        type: "article",
        duration: "40 мин",
        tags: ["Проекты", "Макет", "Практика"],
        locked: true,
        requirements: "Все темы CSS",
        icon: "fas fa-crown",
      },
      {
        id: 7,
        title: "Семантические теги HTML5",
        description:
          "Полное руководство по семантическим тегам HTML5: header, nav, main, section, article и другим.",
        category: "html",
        level: "intermediate",
        type: "article",
        duration: "18 мин",
        tags: ["HTML5", "Семантика", "Доступность"],
        locked: false,
        icon: "fab fa-html5",
      },
      {
        id: 8,
        title: "CSS Анимации и переходы",
        description:
          "Интерактивное руководство по созданию плавных анимаций и переходов в CSS. Практические примеры.",
        category: "css",
        level: "intermediate",
        type: "interactive",
        duration: "35 мин",
        tags: ["Анимации", "CSS", "Интерактив"],
        locked: false,
        icon: "fas fa-magic",
      },
    ],
    [],
  );

  // Категории с количеством материалов
  const categories = useMemo(
    () => [
      { id: "all", label: "Все материалы", count: materials.length },
      {
        id: "html",
        label: "HTML",
        count: materials.filter((m) => m.category === "html").length,
      },
      {
        id: "css",
        label: "CSS",
        count: materials.filter((m) => m.category === "css").length,
      },
      {
        id: "flexbox",
        label: "Flexbox",
        count: materials.filter((m) => m.category === "flexbox").length,
      },
      {
        id: "grid",
        label: "CSS Grid",
        count: materials.filter((m) => m.category === "grid").length,
      },
      {
        id: "responsive",
        label: "Адаптивный дизайн",
        count: materials.filter((m) => m.category === "responsive").length,
      },
      {
        id: "projects",
        label: "Проекты",
        count: materials.filter((m) => m.category === "projects").length,
      },
    ],
    [materials],
  );

  // Показать сообщение
  const showMessage = useCallback(
    (text: string, type: "success" | "error" | "info") => {
      const id = Date.now();
      setMessages((prev) => [...prev, { id, text, type }]);

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 3000);
    },
    [],
  );

  // Переключение типа материала
  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  // Переключение уровня сложности
  const handleLevelToggle = useCallback((level: string) => {
    setSelectedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  }, []);

  // Переключение закладки
  const handleBookmarkToggle = useCallback(
    (materialId: number) => {
      setBookmarks((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(materialId)) {
          newSet.delete(materialId);
          showMessage("Материал удален из закладок", "info");
        } else {
          newSet.add(materialId);
          showMessage("Материал добавлен в закладки", "success");
        }
        return newSet;
      });
    },
    [showMessage],
  );

  // Обработчик клика по заблокированному материалу
  const handleLockedClick = useCallback(
    (material: Material) => {
      showMessage(
        `Материал "${material.title}" заблокирован. Требования: ${material.requirements}`,
        "info",
      );
    },
    [showMessage],
  );

  // Отфильтрованные материалы
  const filteredMaterials = useMemo(() => {
    const filtered = materials.filter((material) => {
      // Фильтрация по категории
      if (activeCategory !== "all" && material.category !== activeCategory) {
        return false;
      }

      // Фильтрация по типу
      if (!selectedTypes.has(material.type)) {
        return false;
      }

      // Фильтрация по уровню
      if (!selectedLevels.has(material.level)) {
        return false;
      }

      // Фильтрация по доступности
      if (accessFilter === "unlocked" && material.locked) {
        return false;
      }
      if (accessFilter === "locked" && !material.locked) {
        return false;
      }

      // Фильтрация по поиску
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = material.title.toLowerCase().includes(searchLower);
        const matchesDesc = material.description
          .toLowerCase()
          .includes(searchLower);
        const matchesTags = material.tags.some((tag) =>
          tag.toLowerCase().includes(searchLower),
        );

        if (!matchesTitle && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.id - a.id; // По умолчанию - новые сверху
        case "oldest":
          return a.id - b.id;
        case "difficulty":
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.level] - difficultyOrder[b.level];
        case "popular":
          // Для имитации популярности используем id вместо Math.random()
          return b.id - a.id; // Или любая другая детерминированная логика
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    materials,
    activeCategory,
    selectedTypes,
    selectedLevels,
    accessFilter,
    searchTerm,
    sortBy,
  ]);

  // Пагинация
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Функции для рендеринга
  const getTypeBadge = (type: Material["type"]) => {
    const badges = {
      article: { label: "Статья", className: "badge-article" },
      video: { label: "Видео", className: "badge-video" },
      cheatsheet: { label: "Шпаргалка", className: "badge-cheatsheet" },
      interactive: { label: "Интерактивный", className: "badge-interactive" },
    };
    return badges[type];
  };

  const getLevelLabel = (level: Material["level"]) => {
    const labels = {
      beginner: "Начинающий",
      intermediate: "Средний",
      advanced: "Продвинутый",
    };
    return labels[level];
  };

  const getLevelColor = (level: Material["level"]) => {
    const colors = {
      beginner: "text-accent-blue",
      intermediate: "text-accent-purple",
      advanced: "text-accent-red",
    };
    return colors[level];
  };

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .slide-in {
          animation: slideIn 0.5s ease;
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
        {/* Шапка материалов */}
        <div className="my-8 p-8 glass-card rounded-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Учебные материалы
          </h1>
          <p className="text-lg text-text-dim max-w-3xl mx-auto mb-6">
            Доступные материалы по мере прохождения уровней. Новые материалы
            разблокируются после выполнения заданий. Используйте фильтры для
            поиска нужного материала.
          </p>
        </div>

        {/* Панель фильтров */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Тип материала */}
          <div className="glass-card rounded-xl p-6 hover:border-accent-blue transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 text-accent-blue flex items-center gap-2">
              <i className="fas fa-filter"></i> Тип материала
            </h3>
            <div className="space-y-3">
              {["article", "video", "cheatsheet", "interactive"].map((type) => {
                const labels = {
                  article: "Статьи",
                  video: "Видеоуроки",
                  cheatsheet: "Шпаргалки",
                  interactive: "Интерактивные",
                };
                return (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.has(type)}
                      onChange={() => handleTypeToggle(type)}
                      className="w-4 h-4 accent-accent-blue"
                    />
                    <span>{labels[type as keyof typeof labels]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Уровень сложности */}
          <div className="glass-card rounded-xl p-6 hover:border-accent-blue transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 text-accent-blue flex items-center gap-2">
              <i className="fas fa-signal"></i> Уровень сложности
            </h3>
            <div className="space-y-3">
              {["beginner", "intermediate", "advanced"].map((level) => {
                const labels = {
                  beginner: "Для начинающих",
                  intermediate: "Средний уровень",
                  advanced: "Продвинутый уровень",
                };
                return (
                  <label
                    key={level}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLevels.has(level)}
                      onChange={() => handleLevelToggle(level)}
                      className="w-4 h-4 accent-accent-blue"
                    />
                    <span>{labels[level as keyof typeof labels]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Доступность */}
          <div className="glass-card rounded-xl p-6 hover:border-accent-blue transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 text-accent-blue flex items-center gap-2">
              <i className="fas fa-unlock"></i> Доступность
            </h3>
            <div className="space-y-3">
              {[
                { value: "all", label: "Все материалы" },
                { value: "unlocked", label: "Только доступные" },
                { value: "locked", label: "Только заблокированные" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="access"
                    value={option.value}
                    checked={accessFilter === option.value}
                    onChange={(e) => setAccessFilter(e.target.value)}
                    className="w-4 h-4 accent-accent-blue"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Боковая панель с категориями */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <i className="fas fa-folder"></i> Категории
              </h3>
              <div className="space-y-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center justify-between ${
                      activeCategory === category.id
                        ? "bg-accent-blue/10 text-accent-blue border-l-4 border-accent-blue"
                        : "text-text-dim hover:text-text-light hover:bg-white/5"
                    }`}
                  >
                    <span>{category.label}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        activeCategory === category.id
                          ? "bg-accent-blue text-black"
                          : "bg-white/10 text-text-dim"
                      }`}
                    >
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Совет */}
              <div className="p-4 bg-accent-blue/5 rounded-lg border-l-4 border-accent-blue">
                <h4 className="font-bold mb-2 text-accent-blue flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i> Совет
                </h4>
                <p className="text-sm text-text-dim leading-relaxed">
                  Материалы разблокируются по мере прохождения тем. Чтобы
                  получить доступ ко всем материалам, продолжайте обучение!
                </p>
              </div>
            </div>
          </div>

          {/* Контейнер материалов */}
          <div className="lg:col-span-3">
            {/* Панель поиска и сортировки */}
            <div className="glass-card rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-text-dim"></i>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Поиск материалов..."
                    className="w-full pl-12 pr-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue focus:shadow-neon-blue transition-all duration-300"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-dim text-sm">Сортировка:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue transition-all duration-300"
                  >
                    <option value="newest">Сначала новые</option>
                    <option value="oldest">Сначала старые</option>
                    <option value="popular">По популярности</option>
                    <option value="difficulty">По сложности</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Сетка материалов */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedMaterials.map((material, index) => {
                const badge = getTypeBadge(material.type);
                const isBookmarked = bookmarks.has(material.id);

                return (
                  <div
                    key={material.id}
                    className={`glass-card rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full ${
                      material.locked
                        ? "opacity-70 grayscale"
                        : "hover:border-accent-blue hover:shadow-neon-blue hover:-translate-y-1"
                    }`}
                    style={{
                      animation: `slideIn 0.5s ease ${index * 0.1}s both`,
                    }}
                  >
                    {/* Иконка блокировки */}
                    {material.locked && (
                      <div className="absolute top-4 left-4 z-10">
                        <i className="fas fa-lock text-accent-red text-xl"></i>
                      </div>
                    )}

                    {/* Изображение материала */}
                    <div className="h-48 bg-linear-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center relative">
                      <i
                        className={`${material.icon} text-5xl text-accent-blue`}
                      ></i>
                      <span
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                          badge.className === "badge-article"
                            ? "bg-accent-blue/20 text-accent-blue border border-accent-blue"
                            : badge.className === "badge-video"
                              ? "bg-accent-red/20 text-accent-red border border-accent-red"
                              : badge.className === "badge-cheatsheet"
                                ? "bg-accent-green/20 text-accent-green border border-accent-green"
                                : "bg-accent-yellow/20 text-accent-yellow border border-accent-yellow"
                        }`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Контент материала */}
                    <div className="p-6 flex flex-col grow">
                      <h3 className="text-xl font-bold mb-3">
                        {material.title}
                      </h3>
                      <p className="text-text-dim mb-4 grow">
                        {material.description}
                      </p>

                      {/* Мета-информация */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <i className="far fa-clock text-text-dim"></i>
                          <span className="text-sm text-text-dim">
                            {material.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-signal text-text-dim"></i>
                          <span
                            className={`text-sm ${getLevelColor(material.level)}`}
                          >
                            {getLevelLabel(material.level)}
                          </span>
                        </div>
                      </div>

                      {/* Теги */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {material.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-white/5 rounded-full text-xs text-text-dim border border-glass-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Действия */}
                      <div className="flex gap-3 mt-auto">
                        {material.locked ? (
                          <>
                            <button
                              onClick={() => handleLockedClick(material)}
                              className="flex-1 px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-dim cursor-not-allowed flex items-center justify-center gap-2"
                              disabled
                            >
                              <i className="fas fa-lock"></i>
                              Заблокировано
                            </button>
                            <button
                              onClick={() => handleLockedClick(material)}
                              className="px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-dim text-sm hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-colors"
                            >
                              {material.requirements}
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/materials/${material.id}`}
                              className="flex-1 px-4 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <i
                                className={
                                  material.type === "article"
                                    ? "fas fa-book-open"
                                    : material.type === "video"
                                      ? "fas fa-play-circle"
                                      : material.type === "cheatsheet"
                                        ? "fas fa-download"
                                        : "fas fa-play-circle"
                                }
                              ></i>
                              {material.type === "article"
                                ? "Читать"
                                : material.type === "video"
                                  ? "Смотреть"
                                  : material.type === "cheatsheet"
                                    ? "Скачать"
                                    : "Начать"}
                            </Link>
                            <button
                              onClick={() => handleBookmarkToggle(material.id)}
                              className="px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                            >
                              <i
                                className={`${isBookmarked ? "fas" : "far"} fa-bookmark ${
                                  isBookmarked
                                    ? "text-accent-yellow"
                                    : "text-text-dim"
                                }`}
                              ></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg bg-secondary-dark/50 border border-glass-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-accent-blue text-black border border-accent-blue"
                          : "bg-secondary-dark/50 border border-glass-border hover:bg-accent-blue/10 hover:border-accent-blue"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg bg-secondary-dark/50 border border-glass-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}

            {/* Информация о пустом результате */}
            {paginatedMaterials.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-text-dim mb-4"></i>
                <h3 className="text-xl font-bold mb-2">Материалы не найдены</h3>
                <p className="text-text-dim">
                  Попробуйте изменить параметры фильтрации или очистить поиск
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
