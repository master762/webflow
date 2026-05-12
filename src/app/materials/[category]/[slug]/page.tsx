"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getMaterialByPath,
  getMaterialHref,
  getMaterialNeighbors,
} from "@/app/data/materials";

export default function MaterialDetailPage() {
  const [activeSection, setActiveSection] = useState("intro");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<boolean[] | null>(null);
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [isMounted, setIsMounted] = useState(false);

  const params = useParams();
  const categoryParam = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const material = getMaterialByPath(categoryParam, slugParam);
  const materialNeighbors = material
    ? getMaterialNeighbors(material.id)
    : { previous: null, next: null };

  // Рефы для редакторов кода
  const axisEditorRef = useRef<HTMLTextAreaElement>(null);
  const axisPreviewRef = useRef<HTMLDivElement>(null);
  const itemsEditorRef = useRef<HTMLTextAreaElement>(null);
  const itemsPreviewRef = useRef<HTMLDivElement>(null);
  const practiceEditorRef = useRef<HTMLTextAreaElement>(null);
  const practicePreviewRef = useRef<HTMLDivElement>(null);

  // Секции материала
  const sections = useMemo(
    () => [
      { id: "intro", title: "Введение в Flexbox", icon: "fa-play-circle" },
      { id: "basics", title: "Основные понятия", icon: "fa-cube" },
      { id: "container", title: "Свойства контейнера", icon: "fa-box" },
      { id: "items", title: "Свойства элементов", icon: "fa-th" },
      {
        id: "examples",
        title: "Примеры использования",
        icon: "fa-laptop-code",
      },
      { id: "practice", title: "Практическое задание", icon: "fa-tasks" },
      {
        id: "quiz",
        title: "Тест на проверку знаний",
        icon: "fa-question-circle",
      },
    ],
    [],
  );

  // Код для примеров свойств контейнера
  const containerExampleCode = `.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  height: 200px;
  background-color: #1a1a2e;
  border: 2px solid #00d9ff;
}
.item {
  width: 80px;
  height: 80px;
  background-color: #00d9ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
}`;

  // Код для свойств элементов
  const itemsPropertiesCode = `.container {
  display: flex;
  width: 100%;
  height: 200px;
  background-color: #1a1a2e;
  border: 2px solid #00d9ff;
  gap: 10px;
  padding: 10px;
}
.item {
  width: 60px;
  height: 60px;
  background-color: #00d9ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
}
/* Пример свойств элементов */
.item:nth-child(1) { order: 2; flex-grow: 1; }
.item:nth-child(2) { order: 1; flex-grow: 2; align-self: center; }
.item:nth-child(3) { order: 3; flex-grow: 1; }`;

  // Исходный код для практики (уже был)
  const practiceExampleCode = `/* Ваш CSS код здесь */
.product-card {
  /* Сделайте карточку flex-контейнером */
  display: flex;
  flex-direction: column;
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
}

.product-image {
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin-bottom: 15px;
}

.product-content {
  /* Распределите контент по вертикали */
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-description {
  color: #666;
  margin-bottom: 15px;
  flex-grow: 1;
}

.product-footer {
  /* Выровняйте цену и кнопку по горизонтали */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.add-to-cart {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Медиа-запрос для мобильных */
@media (max-width: 480px) {
  .product-footer {
    /* На мобильных кнопка должна занимать всю ширину */
    flex-direction: column;
    gap: 15px;
  }
  
  .add-to-cart {
    width: 100%;
  }
}`;

  // Показ сообщений
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

  // Универсальная функция обновления превью
  const updatePreview = useCallback(
    (
      editor: HTMLTextAreaElement | null,
      preview: HTMLDivElement | null,
      customHtml?: string,
    ) => {
      if (!editor || !preview) return;
      const code = editor.value;
      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      preview.innerHTML = "";
      preview.appendChild(iframe);
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        let htmlContent = "";
        if (customHtml) {
          htmlContent = customHtml.replace("{{CODE}}", code);
        } else {
          // Для демонстрации осей и свойств элементов используем общий шаблон
          htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa; }
                    ${code}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="item">1</div>
                    <div class="item">2</div>
                    <div class="item">3</div>
                </div>
            </body>
            </html>
          `;
        }
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    },
    [],
  );

  useEffect(() => {
    setTimeout(() => {
      updatePreview(axisEditorRef.current, axisPreviewRef.current);
      updatePreview(itemsEditorRef.current, itemsPreviewRef.current);
      updatePreview(
        practiceEditorRef.current,
        practicePreviewRef.current,
        `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa; }
                {{CODE}}
            </style>
        </head>
        <body>
            <div class="product-card">
                <div class="product-image"></div>
                <div class="product-content">
                    <h3 class="product-title">Ноутбук Gaming Pro</h3>
                    <p class="product-description">Мощный игровой ноутбук с процессором Intel Core i7 и видеокартой NVIDIA RTX 3060.</p>
                    <div class="product-footer">
                        <div class="product-price">89 990 &#8381;</div>
                        <button class="add-to-cart">В корзину</button>
                    </div>
                </div>
            </div>
        </body>
        </html>`,
      );
    }, 100);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(`${section.id}-section`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, updatePreview]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Обработчики действий
  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    showMessage(
      !isBookmarked
        ? "Материал добавлен в закладки"
        : "Материал удален из закладок",
      !isBookmarked ? "success" : "info",
    );
  }, [isBookmarked, showMessage]);

  const handleComplete = useCallback(() => {
    if (!isCompleted) {
      setIsCompleted(true);
      showMessage("Материал отмечен как пройденный! +30 XP", "success");
    }
  }, [isCompleted, showMessage]);

  const handleStartLearning = useCallback(() => {
    const introSection = document.getElementById("intro-section");
    if (introSection) {
      introSection.scrollIntoView({ behavior: "smooth" });
    }
    showMessage(
      "Приятного обучения! Не забудьте выполнить практические задания.",
      "info",
    );
  }, [showMessage]);

  const handleCopyCode = useCallback(
    (code: string) => {
      navigator.clipboard.writeText(code).then(() => {
        showMessage("Код скопирован в буфер обмена", "success");
      });
    },
    [showMessage],
  );

  const handleResetCode = useCallback(
    (type: "axis" | "items" | "practice") => {
      let code = "";
      let ref = practiceEditorRef;
      let isPractice = false;
      switch (type) {
        case "axis":
          code = containerExampleCode;
          ref = axisEditorRef;
          break;
        case "items":
          code = itemsPropertiesCode;
          ref = itemsEditorRef;
          break;
        case "practice":
          code = practiceExampleCode;
          ref = practiceEditorRef;
          isPractice = true;
          break;
      }
      if (ref.current) {
        ref.current.value = code;
        if (isPractice) {
          updatePreview(
            ref.current,
            practicePreviewRef.current,
            `<!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa; }
                    {{CODE}}
                </style>
            </head>
            <body>
                <div class="product-card">
                    <div class="product-image"></div>
                    <div class="product-content">
                        <h3 class="product-title">Ноутбук Gaming Pro</h3>
                        <p class="product-description">Мощный игровой ноутбук с процессором Intel Core i7 и видеокартой NVIDIA RTX 3060.</p>
                        <div class="product-footer">
                            <div class="product-price">89 990 &#8381;</div>
                            <button class="add-to-cart">В корзину</button>
                        </div>
                    </div>
                </div>
            </body>
            </html>`,
          );
        } else {
          updatePreview(
            ref.current,
            type === "axis" ? axisPreviewRef.current : itemsPreviewRef.current,
          );
        }
        showMessage("Код сброшен к исходному состоянию", "info");
      }
    },
    [
      containerExampleCode,
      itemsPropertiesCode,
      practiceExampleCode,
      updatePreview,
      showMessage,
    ],
  );

  const handleCheckPractice = useCallback(() => {
    if (!practiceEditorRef.current) return;
    const code = practiceEditorRef.current.value;
    const checks = {
      hasFlexDisplay:
        code.includes("display: flex") || code.includes("display:flex"),
      hasFlexDirection: code.includes("flex-direction"),
      hasJustifyContent: code.includes("justify-content"),
      hasMediaQuery: code.includes("@media"),
    };
    const passedChecks = Object.values(checks).filter(Boolean).length;
    if (passedChecks >= 3) {
      showMessage(
        "Отлично! Ваше решение правильное. Вы хорошо поняли основы Flexbox!",
        "success",
      );
    } else {
      showMessage(
        "Почти получилось! Проверьте, что используете все необходимые свойства Flexbox.",
        "info",
      );
    }
  }, [showMessage]);

  const handleAnswerQuestion = useCallback(
    (questionNumber: number, answer: string) => {
      if (quizSubmitted) return;
      setSelectedAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[questionNumber - 1] = answer;
        return newAnswers;
      });
    },
    [quizSubmitted],
  );

  const handleSubmitQuiz = useCallback(() => {
    if (quizSubmitted) return;
    const correctAnswersMap: Record<number, string> = {
      1: "display: flex",
      2: "flex-direction",
      3: "space-around",
    };
    const unanswered = selectedAnswers.some((a) => a === null);
    if (unanswered) {
      const answeredCount = selectedAnswers.filter((a) => a !== null).length;
      showMessage(
        `Вы ответили только на ${answeredCount} из 3 вопросов. Ответьте на все вопросы для завершения теста.`,
        "info",
      );
      return;
    }
    const results = selectedAnswers.map(
      (ans, idx) => ans === correctAnswersMap[idx + 1],
    );
    setQuizResults(results);
    setQuizSubmitted(true);
    const correctCount = results.filter(Boolean).length;
    const percentage = Math.round((correctCount / 3) * 100);
    let message = "";
    if (percentage >= 80) {
      message = `Превосходно! Вы набрали ${percentage}% правильных ответов. Вы отлично усвоили материал!`;
    } else if (percentage >= 60) {
      message = `Хорошо! Вы набрали ${percentage}% правильных ответов. Вы хорошо поняли основы Flexbox.`;
    } else {
      message = `Вы набрали ${percentage}% правильных ответов. Рекомендуем повторить материал и попробовать снова.`;
    }
    showMessage(message, percentage >= 60 ? "success" : "info");
  }, [selectedAnswers, quizSubmitted, showMessage]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`${sectionId}-section`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!material) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light">
        <div className="container mx-auto px-4 max-w-7xl py-16">
          <div className="glass-card rounded-2xl p-8 text-center border border-glass-border">
            <div className="w-16 h-16 rounded-full bg-accent-red/10 border border-accent-red mx-auto mb-6 flex items-center justify-center">
              <i className="fas fa-search text-accent-red text-2xl"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Материал не найден
            </h1>
            <p className="text-text-dim max-w-2xl mx-auto mb-8">
              Проверьте адрес страницы или вернитесь к общей сетке материалов.
            </p>
            <Link
              href="/materials"
              className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple transition-all duration-300"
            >
              <i className="fas fa-book"></i>
              Все материалы
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const materialTypeLabel = {
    article: "Статья",
    video: "Видео",
    cheatsheet: "Шпаргалка",
    interactive: "Интерактив",
  }[material.type];
  const materialLevelLabel = {
    beginner: "Начинающий",
    intermediate: "Средний",
    advanced: "Продвинутый",
  }[material.level];
  const materialLevelClass = {
    beginner: "text-accent-blue",
    intermediate: "text-accent-purple",
    advanced: "text-accent-red",
  }[material.level];

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <style jsx global>{`
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
        .code-comment {
          color: #6a9955;
        }
        .code-keyword {
          color: #569cd6;
        }
        .code-string {
          color: #ce9178;
        }
        .code-property {
          color: #9cdcfe;
        }
        .code-value {
          color: #b5cea8;
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
        {/* Хлебные крошки */}
        <nav className="my-6 p-4 glass-card rounded-lg">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className="text-text-dim hover:text-accent-blue transition-colors"
            >
              Главная
            </Link>
            <span className="text-text-dim">/</span>
            <Link
              href="/materials"
              className="text-text-dim hover:text-accent-blue transition-colors"
            >
              Материалы
            </Link>
            <span className="text-text-dim">/</span>
            <Link
              href="/materials"
              className="text-text-dim hover:text-accent-blue transition-colors"
            >
              {material.categoryLabel}
            </Link>
            <span className="text-text-dim">/</span>
            <span className="text-accent-blue font-medium">
              {material.title}
            </span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Боковая панель */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <i className="fas fa-list-ul"></i>
                Содержание
              </h3>
              <div className="space-y-2 mb-6">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                      activeSection === section.id
                        ? "bg-accent-blue/10 text-accent-blue border-l-4 border-accent-blue"
                        : "text-text-dim hover:text-text-light hover:bg-white/5"
                    }`}
                  >
                    <i className={`fas ${section.icon} w-5 text-center`}></i>
                    <span>{section.title}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-glass-border pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-dim">Тип:</span>
                    <span className="text-accent-yellow font-medium">
                      {materialTypeLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Сложность:</span>
                    <span className={`${materialLevelClass} font-medium`}>
                      {materialLevelLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Время:</span>
                    <span className="text-accent-green font-medium">
                      {material.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">XP:</span>
                    <span className="text-accent-yellow font-medium">
                      +30 XP
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleBookmark}
                    className="flex-1 px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue transition-all duration-300"
                  >
                    <i
                      className={`${isBookmarked ? "fas" : "far"} fa-bookmark mr-2`}
                    ></i>
                    {isBookmarked ? "В закладках" : "В закладки"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue transition-all duration-300"
                  >
                    <i className="fas fa-print"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl p-6 lg:p-8">
              {/* Заголовок */}
              <div className="mb-8 pb-6 border-b border-glass-border">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                  {material.title}
                </h1>
                <p className="text-lg text-text-dim mb-6">
                  {material.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {Array.from(
                    new Set([material.categoryLabel, ...material.tags]),
                  ).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleStartLearning}
                    className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <i className="fas fa-play-circle mr-2"></i>
                    Начать обучение
                  </button>
                  <button
                    onClick={handleComplete}
                    className={`px-6 py-3 border rounded-lg transition-all duration-300 ${
                      isCompleted
                        ? "bg-accent-green text-black border-accent-green"
                        : "bg-secondary-dark/50 border-glass-border hover:bg-accent-blue/10 hover:border-accent-blue"
                    }`}
                  >
                    <i
                      className={`fas ${isCompleted ? "fa-check-circle" : "fa-check"} mr-2`}
                    ></i>
                    {isCompleted ? "Пройдено" : "Отметить пройденным"}
                  </button>
                </div>
              </div>

              {/* 1. Введение */}
              <div
                className="mb-12 pb-8 border-b border-glass-border"
                id="intro-section"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <i className="fas fa-play-circle text-accent-blue"></i>
                  1. Введение в Flexbox
                </h2>
                <div className="space-y-4">
                  <p>
                    Flexbox (Flexible Box Layout) — это модуль CSS, который
                    позволяет создавать гибкие и адаптивные макеты. Он был
                    разработан для упрощения выравнивания и распределения
                    пространства между элементами в контейнере, даже когда их
                    размер неизвестен или динамически изменяется.
                  </p>
                  <p>Основные преимущества Flexbox:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Простое выравнивание элементов по горизонтали и вертикали
                    </li>
                    <li>
                      Автоматическое распределение свободного пространства
                    </li>
                    <li>Возможность изменения порядка отображения элементов</li>
                    <li>
                      Автоматическое изменение размеров элементов для заполнения
                      доступного пространства
                    </li>
                    <li>Простое создание адаптивных макетов</li>
                  </ul>
                  <p>
                    Flexbox особенно полезен для создания навигационных панелей,
                    карточек товаров, форм и других компонентов.
                  </p>
                </div>
                <div className="mt-6 bg-[#1a1a2e] rounded-lg overflow-hidden border border-glass-border">
                  <div className="p-4 bg-[#0f0f1a] border-b border-glass-border flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium">
                      <i className="fas fa-code text-accent-blue"></i>
                      Активация Flexbox
                    </div>
                    <button
                      onClick={() =>
                        handleCopyCode(
                          `.container {\n    display: flex;\n}\n\n.container {\n    display: inline-flex;\n}`,
                        )
                      }
                      className="px-3 py-1 bg-black/30 border border-glass-border rounded text-sm hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                    >
                      Копировать
                    </button>
                  </div>
                  <div className="p-4 font-mono text-sm">
                    <span className="text-[#6a9955]">
                      {"/* Чтобы сделать элемент flex-контейнером */"}
                    </span>
                    <br />
                    .container {"{"} <br />
                    &nbsp;&nbsp;<span className="text-[#9cdcfe]">
                      display
                    </span>: <span className="text-[#b5cea8]">flex</span>;{" "}
                    <br />
                    {"}"} <br />
                    <br />
                    <span className="text-[#6a9955]">
                      {"/* Или inline-flex для строчного контейнера */"}
                    </span>
                    <br />
                    .container {"{"} <br />
                    &nbsp;&nbsp;<span className="text-[#9cdcfe]">
                      display
                    </span>: <span className="text-[#b5cea8]">inline-flex</span>
                    ; <br />
                    {"}"}
                  </div>
                </div>
              </div>

              {/* 2. Основные понятия */}
              <div
                className="mb-12 pb-8 border-b border-glass-border"
                id="basics-section"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <i className="fas fa-cube text-accent-blue"></i>
                  2. Основные понятия
                </h2>
                <div className="space-y-4">
                  <p>Flexbox состоит из двух основных типов элементов:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      <strong>Flex Container</strong> — родительский элемент,
                      задающий контекст flex-форматирования.
                    </li>
                    <li>
                      <strong>Flex Items</strong> — дочерние элементы,
                      располагающиеся внутри контейнера.
                    </li>
                  </ol>
                  <p>Концепция осей:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Главная ось (Main Axis)</strong> — направление, по
                      которому выкладываются элементы (по умолчанию слева
                      направо).
                    </li>
                    <li>
                      <strong>Поперечная ось (Cross Axis)</strong> — ось,
                      перпендикулярная главной (по умолчанию сверху вниз).
                    </li>
                  </ul>
                  <p>
                    Свойство <code>flex-direction</code> меняет направление
                    главной оси.
                  </p>
                </div>
                <div className="mt-6 bg-[#1a1a2e] rounded-lg overflow-hidden border border-glass-border">
                  <div className="p-4 bg-[#0f0f1a] border-b border-glass-border flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium">
                      <i className="fas fa-play-circle text-accent-blue"></i>
                      Интерактивный пример: изменение направления
                    </div>
                    <button
                      onClick={() => handleResetCode("axis")}
                      className="px-3 py-1 bg-black/30 border border-glass-border rounded text-sm hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                    >
                      Сбросить
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <textarea
                      ref={axisEditorRef}
                      className="w-full h-64 bg-[#0f0f1a] text-white font-mono text-sm p-4 rounded resize-none focus:outline-none"
                      defaultValue={containerExampleCode}
                      onChange={() =>
                        updatePreview(
                          axisEditorRef.current,
                          axisPreviewRef.current,
                        )
                      }
                    />
                    <div
                      ref={axisPreviewRef}
                      className="bg-white rounded min-h-64"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Свойства контейнера */}
              <div
                className="mb-12 pb-8 border-b border-glass-border"
                id="container-section"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <i className="fas fa-box text-accent-blue"></i>
                  3. Свойства контейнера
                </h2>
                <div className="space-y-4">
                  <p>
                    Flex-контейнер управляет расположением всех дочерних
                    элементов. Основные свойства:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <code>flex-direction</code> — направление главной оси
                      (row, column, row-reverse, column-reverse).
                    </li>
                    <li>
                      <code>justify-content</code> — выравнивание по главной оси
                      (flex-start, flex-end, center, space-between,
                      space-around, space-evenly).
                    </li>
                    <li>
                      <code>align-items</code> — выравнивание по поперечной оси
                      (stretch, flex-start, flex-end, center, baseline).
                    </li>
                    <li>
                      <code>flex-wrap</code> — перенос элементов на новую строку
                      (nowrap, wrap, wrap-reverse).
                    </li>
                    <li>
                      <code>gap</code> — расстояние между элементами.
                    </li>
                  </ul>
                  <p>
                    Поэкспериментируйте с кодом в редакторе, чтобы увидеть
                    эффект от изменения этих свойств.
                  </p>
                </div>
                <div className="mt-6 bg-[#1a1a2e] rounded-lg overflow-hidden border border-glass-border">
                  <div className="p-4 bg-[#0f0f1a] border-b border-glass-border flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium">
                      <i className="fas fa-code text-accent-blue"></i>
                      Редактор свойств контейнера
                    </div>
                    <button
                      onClick={() => handleResetCode("axis")}
                      className="px-3 py-1 bg-black/30 border border-glass-border rounded text-sm hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                    >
                      Сбросить
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <textarea
                      ref={axisEditorRef}
                      className="w-full h-80 bg-[#0f0f1a] text-white font-mono text-sm p-4 rounded resize-none focus:outline-none"
                      defaultValue={containerExampleCode}
                      onChange={() =>
                        updatePreview(
                          axisEditorRef.current,
                          axisPreviewRef.current,
                        )
                      }
                    />
                    <div
                      ref={axisPreviewRef}
                      className="bg-white rounded min-h-80"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Свойства элементов */}
              <div
                className="mb-12 pb-8 border-b border-glass-border"
                id="items-section"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <i className="fas fa-th text-accent-blue"></i>
                  4. Свойства элементов
                </h2>
                <div className="space-y-4">
                  <p>
                    Flex-элементы могут иметь собственные свойства, управляющие
                    их размерами и порядком:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <code>order</code> — порядок следования элемента (по
                      умолчанию 0).
                    </li>
                    <li>
                      <code>flex-grow</code> — коэффициент растяжения элемента,
                      если есть свободное место.
                    </li>
                    <li>
                      <code>flex-shrink</code> — коэффициент сжатия элемента.
                    </li>
                    <li>
                      <code>align-self</code> — переопределяет выравнивание для
                      конкретного элемента.
                    </li>
                  </ul>
                  <p>
                    Используйте редактор ниже, чтобы изменить свойства отдельных
                    элементов и увидеть, как меняется раскладка.
                  </p>
                </div>
                <div className="mt-6 bg-[#1a1a2e] rounded-lg overflow-hidden border border-glass-border">
                  <div className="p-4 bg-[#0f0f1a] border-b border-glass-border flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium">
                      <i className="fas fa-code text-accent-blue"></i>
                      Редактор свойств элементов
                    </div>
                    <button
                      onClick={() => handleResetCode("items")}
                      className="px-3 py-1 bg-black/30 border border-glass-border rounded text-sm hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                    >
                      Сбросить
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <textarea
                      ref={itemsEditorRef}
                      className="w-full h-80 bg-[#0f0f1a] text-white font-mono text-sm p-4 rounded resize-none focus:outline-none"
                      defaultValue={itemsPropertiesCode}
                      onChange={() =>
                        updatePreview(
                          itemsEditorRef.current,
                          itemsPreviewRef.current,
                        )
                      }
                    />
                    <div
                      ref={itemsPreviewRef}
                      className="bg-white rounded min-h-80"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Примеры использования */}
              <div
                className="mb-12 pb-8 border-b border-glass-border"
                id="examples-section"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <i className="fas fa-laptop-code text-accent-blue"></i>
                  5. Примеры использования
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Горизонтальная навигационная панель
                    </h3>
                    <p className="text-text-dim mb-2">
                      Flexbox идеально подходит для создания адаптивного меню:
                    </p>
                    <pre className="bg-[#1a1a2e] p-3 rounded-lg overflow-x-auto text-sm">
                      <code>{`.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #333;
  padding: 1rem;
}
.nav-menu {
  display: flex;
  gap: 20px;
  list-style: none;
}`}</code>
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Карточки товаров
                    </h3>
                    <p className="text-text-dim mb-2">
                      Равномерное распределение карточек в строке:
                    </p>
                    <pre className="bg-[#1a1a2e] p-3 rounded-lg overflow-x-auto text-sm">
                      <code>{`.products {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}
.product-card {
  flex: 1 1 250px; /* растяжение, сжатие, базовый размер */
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}`}</code>
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Центрирование блока по вертикали и горизонтали
                    </h3>
                    <p className="text-text-dim mb-2">
                      Классический трюк с абсолютным центрированием:
                    </p>
                    <pre className="bg-[#1a1a2e] p-3 rounded-lg overflow-x-auto text-sm">
                      <code>{`.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.child {
  /* любой размер */
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* 6. Практическое задание */}
              <div
                className="mb-12 pb-8 border-b border-glass-border"
                id="practice-section"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <i className="fas fa-tasks text-accent-blue"></i>
                  6. Практическое задание
                </h2>
                <p className="text-text-dim mb-6">
                  Создайте адаптивную карточку товара с использованием Flexbox
                </p>
                <div className="space-y-4 mb-6">
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Иметь изображение товара сверху</li>
                    <li>Содержать заголовок, описание и цену</li>
                    <li>
                      Иметь кнопку &quot;В корзину&quot;, выровненную по правому
                      краю
                    </li>
                    <li>На мобильных устройствах кнопка занимает всю ширину</li>
                    <li>Использовать Flexbox для выравнивания элементов</li>
                  </ol>
                </div>
                <div className="bg-[#1a1a2e] rounded-lg overflow-hidden border border-glass-border">
                  <div className="p-4 bg-[#0f0f1a] border-b border-glass-border flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium">
                      <i className="fas fa-code text-accent-blue"></i>
                      Редактор задания
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetCode("practice")}
                        className="px-3 py-1 bg-black/30 border border-glass-border rounded text-sm hover:bg-accent-blue/10 hover:border-accent-blue transition-colors"
                      >
                        Сбросить
                      </button>
                      <button
                        onClick={handleCheckPractice}
                        className="px-3 py-1 bg-accent-blue/20 border border-accent-blue rounded text-sm hover:bg-accent-blue/30 transition-colors"
                      >
                        Проверить
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <textarea
                      ref={practiceEditorRef}
                      className="w-full h-80 bg-[#0f0f1a] text-white font-mono text-sm p-4 rounded resize-none focus:outline-none"
                      defaultValue={practiceExampleCode}
                      onChange={() =>
                        updatePreview(
                          practiceEditorRef.current,
                          practicePreviewRef.current,
                          `<!DOCTYPE html>
                          <html>
                          <head>
                              <style>
                                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa; }
                                  {{CODE}}
                              </style>
                          </head>
                          <body>
                              <div class="product-card">
                                  <div class="product-image"></div>
                                  <div class="product-content">
                                      <h3 class="product-title">Ноутбук Gaming Pro</h3>
                                      <p class="product-description">Мощный игровой ноутбук с процессором Intel Core i7 и видеокартой NVIDIA RTX 3060.</p>
                                      <div class="product-footer">
                                          <div class="product-price">89 990 &#8381;</div>
                                          <button class="add-to-cart">В корзину</button>
                                      </div>
                                  </div>
                              </div>
                          </body>
                          </html>`,
                        )
                      }
                    />
                    <div
                      ref={practicePreviewRef}
                      className="bg-white rounded min-h-80"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Тест */}
              <div className="mb-12" id="quiz-section">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <i className="fas fa-question-circle text-accent-blue"></i>
                  7. Тест на проверку знаний
                </h2>
                <div className="mb-6 p-5 bg-accent-blue/5 rounded-lg border-l-4 border-accent-blue">
                  <h3 className="font-bold mb-4">
                    Вопрос 1: создание flex-контейнера
                  </h3>
                  <div className="space-y-2">
                    {[
                      "display: flex",
                      "display: block",
                      "position: flex",
                      "layout: flex",
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswerQuestion(1, opt)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          quizSubmitted
                            ? opt === "display: flex"
                              ? "border-green-500 bg-green-500/20 text-green-300"
                              : selectedAnswers[0] === opt
                                ? "border-red-500 bg-red-500/20 text-red-300"
                                : "opacity-50"
                            : selectedAnswers[0] === opt
                              ? "bg-accent-blue/20 border-accent-blue"
                              : "bg-secondary-dark/50 border border-glass-border hover:bg-accent-blue/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6 p-5 bg-accent-blue/5 rounded-lg border-l-4 border-accent-blue">
                  <h3 className="font-bold mb-4">
                    Вопрос 2: направление главной оси
                  </h3>
                  <div className="space-y-2">
                    {[
                      "justify-content",
                      "flex-direction",
                      "align-items",
                      "flex-wrap",
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswerQuestion(2, opt)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          quizSubmitted
                            ? opt === "flex-direction"
                              ? "border-green-500 bg-green-500/20 text-green-300"
                              : selectedAnswers[1] === opt
                                ? "border-red-500 bg-red-500/20 text-red-300"
                                : "opacity-50"
                            : selectedAnswers[1] === opt
                              ? "bg-accent-blue/20 border-accent-blue"
                              : "bg-secondary-dark/50 border border-glass-border hover:bg-accent-blue/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8 p-5 bg-accent-blue/5 rounded-lg border-l-4 border-accent-blue">
                  <h3 className="font-bold mb-4">
                    Вопрос 3: равномерное распределение с отступами
                  </h3>
                  <div className="space-y-2">
                    {[
                      "space-between",
                      "space-evenly",
                      "space-around",
                      "center",
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswerQuestion(3, opt)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          quizSubmitted
                            ? opt === "space-around"
                              ? "border-green-500 bg-green-500/20 text-green-300"
                              : selectedAnswers[2] === opt
                                ? "border-red-500 bg-red-500/20 text-red-300"
                                : "opacity-50"
                            : selectedAnswers[2] === opt
                              ? "bg-accent-blue/20 border-accent-blue"
                              : "bg-secondary-dark/50 border border-glass-border hover:bg-accent-blue/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={quizSubmitted}
                    className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple transition disabled:opacity-50"
                  >
                    Завершить тест
                  </button>
                  {isMounted && (
                    <p className="text-text-dim mt-4">
                      Правильных ответов:{" "}
                      {quizResults
                        ? quizResults.filter(Boolean).length
                        : selectedAnswers.filter((a) => a !== null).length}{" "}
                      из 3
                    </p>
                  )}
                </div>
              </div>

              {/* Навигация между материалами */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-glass-border">
                {materialNeighbors.previous ? (
                  <Link
                    href={getMaterialHref(materialNeighbors.previous)}
                    className="px-6 py-3 glass-card rounded-lg border border-glass-border hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-arrow-left text-accent-blue"></i>
                    Предыдущий материал
                  </Link>
                ) : (
                  <span />
                )}
                {materialNeighbors.next && (
                  <Link
                    href={getMaterialHref(materialNeighbors.next)}
                    className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    Следующий материал
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
