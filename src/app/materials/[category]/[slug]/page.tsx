"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getMaterialByPath,
  getMaterialHref,
  getMaterialNeighbors,
} from "@/app/data/materials";

type QuizAnswers = Record<string, string>;
type QuizSubmitted = Record<number, boolean>;
type QuizResults = Record<number, boolean[]>;

export default function MaterialDetailPage() {
  const params = useParams();
  const categoryParam = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const slugParam = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const material = getMaterialByPath(categoryParam, slugParam);
  const materialNeighbors = material
    ? getMaterialNeighbors(material.id)
    : { previous: null, next: null };

  const [activeSection, setActiveSection] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [clientReady, setClientReady] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [quizSubmitted, setQuizSubmitted] = useState<QuizSubmitted>({});
  const [quizResults, setQuizResults] = useState<QuizResults>({});

  const practiceEditorRef = useRef<HTMLTextAreaElement>(null);
  const practicePreviewRef = useRef<HTMLDivElement>(null);

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

  const updatePracticePreview = useCallback(() => {
    if (!practiceEditorRef.current || !practicePreviewRef.current) return;
    const code = practiceEditorRef.current.value;
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";
    practicePreviewRef.current.innerHTML = "";
    practicePreviewRef.current.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa; }
            ${code}
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
        </html>
      `);
      doc.close();
    }
  }, []);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClientReady(true);
    const practiceSection = material?.content?.sections.find(
      (s) => s.id === "practice",
    );
    if (practiceSection?.codeExample && practiceEditorRef.current) {
      practiceEditorRef.current.value = practiceSection.codeExample.initialCode;
      updatePracticePreview();
    }
  }, [material, updatePracticePreview]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[data-section-id]");
      const scrollPos = window.scrollY + 150;
      let current = "";
      sections.forEach((section) => {
        const top = (section as HTMLElement).offsetTop;
        const height = (section as HTMLElement).offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = section.getAttribute("data-section-id") || "";
        }
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    showMessage(
      !isBookmarked
        ? "Материал добавлен в закладки"
        : "Материал удален из закладок",
      !isBookmarked ? "success" : "info",
    );
  };

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      showMessage("Материал отмечен как пройденный! +30 XP", "success");
    }
  };

  const handleStartLearning = () => {
    const firstSection = document.querySelector("[data-section-id]");
    if (firstSection) firstSection.scrollIntoView({ behavior: "smooth" });
    showMessage(
      "Приятного обучения! Не забудьте выполнить практические задания.",
      "info",
    );
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showMessage("Код скопирован в буфер обмена", "success");
  };

  const handleAnswerQuestion = (
    sectionIndex: number,
    questionIndex: number,
    answer: string,
  ) => {
    if (quizSubmitted[sectionIndex]) return;
    const key = `${sectionIndex}-${questionIndex}`;
    setQuizAnswers((prev) => ({ ...prev, [key]: answer }));
  };

  const handleSubmitQuiz = (
    sectionIndex: number,
    questions: Array<{ text: string; options: string[]; correct: string }>,
  ) => {
    if (quizSubmitted[sectionIndex]) return;
    const total = questions.length;
    let correctCount = 0;
    const results: boolean[] = [];
    for (let i = 0; i < total; i++) {
      const answer = quizAnswers[`${sectionIndex}-${i}`];
      const isCorrect = answer === questions[i].correct;
      results.push(isCorrect);
      if (isCorrect) correctCount++;
    }
    const percentage = Math.round((correctCount / total) * 100);
    let message = "";
    if (percentage >= 80)
      message = `Превосходно! ${percentage}% правильных ответов.`;
    else if (percentage >= 60)
      message = `Хорошо! ${percentage}% правильных ответов.`;
    else
      message = `${percentage}% правильных ответов. Рекомендуем повторить материал.`;
    showMessage(message, percentage >= 60 ? "success" : "info");
    setQuizSubmitted((prev) => ({ ...prev, [sectionIndex]: true }));
    setQuizResults((prev) => ({ ...prev, [sectionIndex]: results }));
  };

  if (!material || !material.content) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light">
        <div className="container mx-auto px-4 max-w-7xl py-16">
          <div className="glass-card rounded-2xl p-8 text-center border border-glass-border">
            <i className="fas fa-file-alt text-4xl text-text-dim mb-4"></i>
            <h1 className="text-3xl font-bold mb-4 gradient-text">
              Скоро здесь появится контент
            </h1>
            <p className="text-text-dim mb-6">
              Материал &quot;{material?.title || "Эта страница"}&quot; пока в
              разработке.
            </p>
            <Link
              href="/materials"
              className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white rounded-lg"
            >
              Вернуться к материалам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sections = material.content.sections;
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
        <nav className="my-6 p-4 glass-card rounded-lg">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="text-text-dim hover:text-accent-blue">
              Главная
            </Link>
            <span className="text-text-dim">/</span>
            <Link
              href="/materials"
              className="text-text-dim hover:text-accent-blue"
            >
              Материалы
            </Link>
            <span className="text-text-dim">/</span>
            <Link
              href="/materials"
              className="text-text-dim hover:text-accent-blue"
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
                <i className="fas fa-list-ul"></i> Содержание
              </h3>
              <div className="space-y-2 mb-6">
                {sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const el = document.getElementById(
                        `section-${section.id}`,
                      );
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                      activeSection === section.id
                        ? "bg-accent-blue/10 text-accent-blue border-l-4 border-accent-blue"
                        : "text-text-dim hover:text-text-light hover:bg-white/5"
                    }`}
                  >
                    <i
                      className={`fas ${section.icon || "fa-book"} w-5 text-center`}
                    ></i>
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
                    className="flex-1 px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg hover:bg-accent-blue/10"
                  >
                    <i
                      className={`${isBookmarked ? "fas" : "far"} fa-bookmark mr-2`}
                    ></i>
                    {isBookmarked ? "В закладках" : "В закладки"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
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
                    className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple"
                  >
                    Начать обучение
                  </button>
                  <button
                    onClick={handleComplete}
                    className={`px-6 py-3 border rounded-lg transition ${isCompleted ? "bg-accent-green text-black border-accent-green" : "bg-secondary-dark/50 border-glass-border hover:bg-accent-blue/10"}`}
                  >
                    <i
                      className={`fas ${isCompleted ? "fa-check-circle" : "fa-check"} mr-2`}
                    ></i>
                    {isCompleted ? "Пройдено" : "Отметить пройденным"}
                  </button>
                </div>
              </div>

              {sections.map((section, secIdx) => (
                <div
                  key={secIdx}
                  id={`section-${section.id}`}
                  data-section-id={section.id}
                  className="mb-12 pb-8 border-b border-glass-border last:border-0"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <i className="fas fa-book-open text-accent-blue"></i>{" "}
                    {section.title}
                  </h2>
                  <div
                    className="prose prose-invert max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />

                  {section.codeExample && !section.id.includes("practice") && (
                    <div className="mt-6 bg-[#1a1a2e] rounded-lg overflow-hidden">
                      <div className="p-4 bg-[#0f0f1a] border-b border-glass-border flex justify-between items-center">
                        <span className="font-medium">
                          {section.codeExample.description || "Пример кода"}
                        </span>
                        <button
                          onClick={() =>
                            handleCopyCode(section.codeExample!.initialCode)
                          }
                          className="px-3 py-1 bg-black/30 rounded text-sm hover:bg-accent-blue/10"
                        >
                          Копировать
                        </button>
                      </div>
                      <pre className="p-4 font-mono text-sm overflow-x-auto">
                        <code>{section.codeExample.initialCode}</code>
                      </pre>
                    </div>
                  )}

                  {section.id === "practice" && section.codeExample && (
                    <div className="mt-6 bg-[#1a1a2e] rounded-lg overflow-hidden">
                      <div className="p-4 bg-[#0f0f1a] border-b border-glass-border flex justify-between">
                        <span className="font-medium">
                          {section.codeExample.description ||
                            "Практическое задание"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (practiceEditorRef.current) {
                                practiceEditorRef.current.value =
                                  section.codeExample!.initialCode;
                                updatePracticePreview();
                                showMessage(
                                  "Код сброшен к исходному состоянию",
                                  "info",
                                );
                              }
                            }}
                            className="px-3 py-1 bg-black/30 rounded text-sm hover:bg-accent-blue/10"
                          >
                            Сбросить
                          </button>
                          <button
                            onClick={() => {
                              const code =
                                practiceEditorRef.current?.value || "";
                              const hasFlex =
                                code.includes("display: flex") ||
                                code.includes("display:flex");
                              const hasJustify =
                                code.includes("justify-content");
                              if (hasFlex && hasJustify) {
                                showMessage(
                                  "Отлично! Решение правильное.",
                                  "success",
                                );
                              } else {
                                showMessage(
                                  "Почти получилось! Проверьте свойства.",
                                  "info",
                                );
                              }
                            }}
                            className="px-3 py-1 bg-accent-blue/20 border border-accent-blue rounded text-sm"
                          >
                            Проверить
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        <textarea
                          ref={practiceEditorRef}
                          className="w-full h-80 bg-[#0f0f1a] text-white font-mono text-sm p-4 rounded resize-none focus:outline-none"
                          defaultValue={section.codeExample.initialCode}
                          onChange={updatePracticePreview}
                        />
                        <div
                          ref={practicePreviewRef}
                          className="bg-white rounded min-h-80"
                        />
                      </div>
                    </div>
                  )}

                  {section.quiz && (
                    <div className="mt-6 p-5 bg-accent-blue/5 rounded-lg border-l-4 border-accent-blue">
                      <h3 className="text-xl font-bold mb-4">
                        Проверьте знания
                      </h3>
                      {section.quiz.questions.map((q, qIdx) => {
                        const answerKey = `${secIdx}-${qIdx}`;
                        const selectedAnswer = quizAnswers[answerKey];
                        const isSubmitted = quizSubmitted[secIdx];
                        return (
                          <div key={qIdx} className="mb-6">
                            <p className="font-bold mb-3">{q.text}</p>
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => {
                                let bgClass =
                                  "bg-secondary-dark/50 border border-glass-border hover:bg-accent-blue/10";
                                if (isSubmitted) {
                                  if (opt === q.correct)
                                    bgClass =
                                      "border-green-500 bg-green-500/20 text-green-300";
                                  else if (
                                    selectedAnswer === opt &&
                                    opt !== q.correct
                                  )
                                    bgClass =
                                      "border-red-500 bg-red-500/20 text-red-300";
                                  else
                                    bgClass =
                                      "opacity-50 bg-secondary-dark/50 border border-glass-border";
                                } else if (selectedAnswer === opt) {
                                  bgClass =
                                    "bg-accent-blue/20 border-accent-blue";
                                }
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() =>
                                      handleAnswerQuestion(secIdx, qIdx, opt)
                                    }
                                    className={`w-full text-left p-3 rounded-lg transition ${bgClass}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() =>
                          handleSubmitQuiz(secIdx, section.quiz!.questions)
                        }
                        disabled={quizSubmitted[secIdx]}
                        className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white rounded-lg disabled:opacity-50"
                      >
                        {quizSubmitted[secIdx]
                          ? "Тест пройден"
                          : "Завершить тест"}
                      </button>
                      {clientReady && quizSubmitted[secIdx] && (
                        <p className="text-text-dim mt-4">
                          Правильных ответов:{" "}
                          {quizResults[secIdx]?.filter(Boolean).length || 0} из{" "}
                          {section.quiz.questions.length}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-glass-border">
                {materialNeighbors.previous ? (
                  <Link
                    href={getMaterialHref(materialNeighbors.previous)}
                    className="px-6 py-3 glass-card rounded-lg border border-glass-border hover:border-accent-blue flex items-center gap-3"
                  >
                    <i className="fas fa-arrow-left text-accent-blue"></i>{" "}
                    Предыдущий материал
                  </Link>
                ) : (
                  <span />
                )}
                {materialNeighbors.next && (
                  <Link
                    href={getMaterialHref(materialNeighbors.next)}
                    className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg flex items-center gap-3"
                  >
                    Следующий материал <i className="fas fa-arrow-right"></i>
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
