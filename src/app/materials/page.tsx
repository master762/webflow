"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  getMaterialHref,
  materialCategories,
  materials,
  type Material,
} from "@/app/data/materials";

const typeOptions: Array<{ id: Material["type"]; label: string }> = [
  { id: "article", label: "Статьи" },
  { id: "video", label: "Видеоуроки" },
  { id: "cheatsheet", label: "Шпаргалки" },
  { id: "interactive", label: "Интерактивные" },
];

const levelOptions: Array<{ id: Material["level"]; label: string }> = [
  { id: "beginner", label: "Для начинающих" },
  { id: "intermediate", label: "Средний уровень" },
  { id: "advanced", label: "Продвинутый уровень" },
];

const typeBadges: Record<
  Material["type"],
  { label: string; className: string; icon: string }
> = {
  article: {
    label: "Статья",
    className: "bg-accent-blue/20 text-accent-blue border border-accent-blue",
    icon: "fas fa-book-open",
  },
  video: {
    label: "Видео",
    className: "bg-accent-red/20 text-accent-red border border-accent-red",
    icon: "fas fa-play-circle",
  },
  cheatsheet: {
    label: "Шпаргалка",
    className: "bg-accent-green/20 text-accent-green border border-accent-green",
    icon: "fas fa-download",
  },
  interactive: {
    label: "Интерактив",
    className:
      "bg-accent-purple/20 text-accent-purple border border-accent-purple",
    icon: "fas fa-play-circle",
  },
};

const levelLabels: Record<Material["level"], string> = {
  beginner: "Начинающий",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const levelColors: Record<Material["level"], string> = {
  beginner: "text-accent-blue",
  intermediate: "text-accent-purple",
  advanced: "text-accent-red",
};

export default function MaterialsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTypes, setSelectedTypes] = useState<Set<Material["type"]>>(
    new Set(typeOptions.map((type) => type.id)),
  );
  const [selectedLevels, setSelectedLevels] = useState<Set<Material["level"]>>(
    new Set(levelOptions.map((level) => level.id)),
  );
  const [accessFilter, setAccessFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);

  const categories = useMemo(
    () =>
      materialCategories.map((category) => ({
        ...category,
        count:
          category.id === "all"
            ? materials.length
            : materials.filter((material) => material.category === category.id)
                .length,
      })),
    [],
  );

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

  const handleTypeToggle = useCallback((type: Material["type"]) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
    setCurrentPage(1);
  }, []);

  const handleLevelToggle = useCallback((level: Material["level"]) => {
    setSelectedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
    setCurrentPage(1);
  }, []);

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

  const handleLockedClick = useCallback(
    (material: Material) => {
      showMessage(
        `Материал "${material.title}" заблокирован. Требования: ${material.requirements}`,
        "info",
      );
    },
    [showMessage],
  );

  const filteredMaterials = useMemo(() => {
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const searchLower = searchTerm.trim().toLowerCase();

    return materials
      .filter((material) => {
        if (
          activeCategory !== "all" &&
          material.category !== activeCategory
        ) {
          return false;
        }

        if (!selectedTypes.has(material.type)) {
          return false;
        }

        if (!selectedLevels.has(material.level)) {
          return false;
        }

        if (accessFilter === "unlocked" && material.locked) {
          return false;
        }

        if (accessFilter === "locked" && !material.locked) {
          return false;
        }

        if (!searchLower) {
          return true;
        }

        return (
          material.title.toLowerCase().includes(searchLower) ||
          material.description.toLowerCase().includes(searchLower) ||
          material.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "oldest":
            return a.id - b.id;
          case "difficulty":
            return difficultyOrder[a.level] - difficultyOrder[b.level];
          case "popular":
          case "newest":
          default:
            return b.id - a.id;
        }
      });
  }, [
    activeCategory,
    accessFilter,
    searchTerm,
    selectedLevels,
    selectedTypes,
    sortBy,
  ]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <style jsx global>{`
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
      `}</style>

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
        <div className="my-8 p-8 glass-card rounded-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Учебные материалы
          </h1>
          <p className="text-lg text-text-dim max-w-3xl mx-auto mb-6">
            Единая сетка теории по HTML и CSS. Карточки берутся из общего списка
            материалов, поэтому новые статьи можно добавлять в одном месте.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 hover:border-accent-blue transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 text-accent-blue flex items-center gap-2">
              <i className="fas fa-filter"></i> Тип материала
            </h3>
            <div className="space-y-3">
              {typeOptions.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(type.id)}
                    onChange={() => handleTypeToggle(type.id)}
                    className="w-4 h-4 accent-accent-blue"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 hover:border-accent-blue transition-all duration-300">
            <h3 className="text-lg font-bold mb-4 text-accent-blue flex items-center gap-2">
              <i className="fas fa-signal"></i> Уровень сложности
            </h3>
            <div className="space-y-3">
              {levelOptions.map((level) => (
                <label
                  key={level.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLevels.has(level.id)}
                    onChange={() => handleLevelToggle(level.id)}
                    className="w-4 h-4 accent-accent-blue"
                  />
                  <span>{level.label}</span>
                </label>
              ))}
            </div>
          </div>

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
                    onChange={(e) => {
                      setAccessFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 accent-accent-blue"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
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

              <div className="p-4 bg-accent-blue/5 rounded-lg border-l-4 border-accent-blue">
                <h4 className="font-bold mb-2 text-accent-blue flex items-center gap-2">
                  <i className="fas fa-route"></i> Структура
                </h4>
                <p className="text-sm text-text-dim leading-relaxed">
                  Детальная страница строится по схеме: Главная / Материалы /
                  Категория / Название материала.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedMaterials.map((material, index) => {
                const badge = typeBadges[material.type];
                const isBookmarked = bookmarks.has(material.id);

                return (
                  <div
                    key={material.id}
                    className={`glass-card rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full relative ${
                      material.locked
                        ? "opacity-70 grayscale"
                        : "hover:border-accent-blue hover:shadow-neon-blue hover:-translate-y-1"
                    }`}
                    style={{
                      animation: `slideIn 0.5s ease ${index * 0.1}s both`,
                    }}
                  >
                    {material.locked && (
                      <div className="absolute top-4 left-4 z-10">
                        <i className="fas fa-lock text-accent-red text-xl"></i>
                      </div>
                    )}

                    <div className="h-48 bg-linear-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center relative">
                      <i
                        className={`${material.icon} text-5xl text-accent-blue`}
                      ></i>
                      <span
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col grow">
                      <div className="flex items-center gap-2 mb-3 text-xs text-text-dim">
                        <span className="px-2 py-1 rounded-full bg-white/5 border border-glass-border">
                          {material.categoryLabel}
                        </span>
                        <span className={levelColors[material.level]}>
                          {levelLabels[material.level]}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3">
                        {material.title}
                      </h3>
                      <p className="text-text-dim mb-4 grow">
                        {material.description}
                      </p>

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
                            className={`text-sm ${levelColors[material.level]}`}
                          >
                            {levelLabels[material.level]}
                          </span>
                        </div>
                      </div>

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
                              href={getMaterialHref(material)}
                              className="flex-1 px-4 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <i className={badge.icon}></i>
                              {material.type === "video"
                                ? "Смотреть"
                                : material.type === "cheatsheet"
                                  ? "Открыть"
                                  : material.type === "interactive"
                                    ? "Начать"
                                    : "Читать"}
                            </Link>
                            <button
                              onClick={() => handleBookmarkToggle(material.id)}
                              className="px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                              aria-label="Переключить закладку"
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

            {paginatedMaterials.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-text-dim mb-4"></i>
                <h3 className="text-xl font-bold mb-2">
                  Материалы не найдены
                </h3>
                <p className="text-text-dim">
                  Попробуйте изменить параметры фильтрации или очистить поиск.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
