export type MaterialCategory = "html" | "css" | "projects";
export type MaterialLevel = "beginner" | "intermediate" | "advanced";
export type MaterialType = "article" | "video" | "cheatsheet" | "interactive";

export interface Material {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: MaterialCategory;
  categoryLabel: string;
  level: MaterialLevel;
  type: MaterialType;
  duration: string;
  tags: string[];
  locked: boolean;
  requirements?: string;
  icon: string;
}

export const materials: Material[] = [
  {
    id: 1,
    slug: "struktura-html-dokumenta",
    title: "Структура HTML-документа",
    description:
      "Изучите базовую структуру HTML-документа, теги head и body, doctype и мета-теги. Основа для уверенного старта в верстке.",
    category: "html",
    categoryLabel: "HTML",
    level: "beginner",
    type: "article",
    duration: "10 мин",
    tags: ["HTML", "Основы", "Структура"],
    locked: false,
    icon: "fab fa-html5",
  },
  {
    id: 2,
    slug: "selektory-i-kaskadnost-css",
    title: "Селекторы и каскадность CSS",
    description:
      "Подробное руководство по CSS-селекторам, специфичности и каскадности стилей. Удобная шпаргалка для быстрого доступа.",
    category: "css",
    categoryLabel: "CSS",
    level: "beginner",
    type: "cheatsheet",
    duration: "15 мин",
    tags: ["CSS", "Селекторы", "Шпаргалка"],
    locked: false,
    icon: "fab fa-css3-alt",
  },
  {
    id: 3,
    slug: "osnovy-flexbox",
    title: "Основы Flexbox",
    description:
      "Полное руководство по свойствам Flexbox: flex-direction, justify-content, align-items и другим. С примерами кода.",
    category: "css",
    categoryLabel: "CSS",
    level: "intermediate",
    type: "article",
    duration: "20 мин",
    tags: ["Flexbox", "CSS", "Макет"],
    locked: false,
    icon: "fas fa-boxes",
  },
  {
    id: 4,
    slug: "sozdanie-setok-s-grid",
    title: "Создание сеток с Grid",
    description:
      "Изучите grid-template, grid-area и другие свойства CSS Grid. Видеоурок с практическими примерами.",
    category: "css",
    categoryLabel: "CSS",
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
    slug: "media-zaprosy-na-praktike",
    title: "Медиа-запросы на практике",
    description:
      "Интерактивное руководство по созданию адаптивных интерфейсов с помощью медиа-запросов. Практика с живыми примерами.",
    category: "css",
    categoryLabel: "CSS",
    level: "intermediate",
    type: "interactive",
    duration: "30 мин",
    tags: ["Адаптивность", "CSS", "Интерактив"],
    locked: false,
    icon: "fas fa-mobile-alt",
  },
  {
    id: 6,
    slug: "verstka-slozhnyh-maketov",
    title: "Верстка сложных макетов",
    description:
      "Практическое руководство по верстке реальных проектов. Подробный разбор сложных случаев и устойчивых решений.",
    category: "projects",
    categoryLabel: "Проекты",
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
    slug: "semanticheskie-tegi-html5",
    title: "Семантические теги HTML5",
    description:
      "Полное руководство по семантическим тегам HTML5: header, nav, main, section, article и другим.",
    category: "html",
    categoryLabel: "HTML",
    level: "intermediate",
    type: "article",
    duration: "18 мин",
    tags: ["HTML5", "Семантика", "Доступность"],
    locked: false,
    icon: "fab fa-html5",
  },
  {
    id: 8,
    slug: "css-animacii-i-perehody",
    title: "CSS-анимации и переходы",
    description:
      "Интерактивное руководство по созданию плавных анимаций и переходов в CSS. Практические примеры для интерфейсов.",
    category: "css",
    categoryLabel: "CSS",
    level: "intermediate",
    type: "interactive",
    duration: "35 мин",
    tags: ["Анимации", "CSS", "Интерактив"],
    locked: false,
    icon: "fas fa-magic",
  },
];

export const materialCategories: Array<{
  id: "all" | MaterialCategory;
  label: string;
}> = [
  { id: "all", label: "Все материалы" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "projects", label: "Проекты" },
];

export const getMaterialHref = (material: Material) =>
  `/materials/${material.category}/${material.slug}`;

export const getMaterialByPath = (category?: string, slug?: string) =>
  materials.find(
    (material) => material.category === category && material.slug === slug,
  );

export const getMaterialNeighbors = (materialId: number) => {
  const index = materials.findIndex((material) => material.id === materialId);

  return {
    previous: index > 0 ? materials[index - 1] : null,
    next: index >= 0 && index < materials.length - 1 ? materials[index + 1] : null,
  };
};
