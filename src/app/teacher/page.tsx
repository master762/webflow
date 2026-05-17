"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
  username: string | null;
  xp: number;
  level: number;
  topicsCompleted: number;
}

interface Level {
  id: number;
  topicId: number;
  order: number;
  title: string;
  description: string;
  html: string;
  css: string;
  hint: string | null;
  xp: number;
  validation: string | null;
}

interface TeacherTopic {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  iconKey: string;
  lessons: number;
  xpPerLesson: number;
  accessLevel: string;
  levels: Level[];
  createdAt: string;
}

export default function TeacherPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [topics, setTopics] = useState<TeacherTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "topics" | "create">(
    "students",
  );
  const [messages, setMessages] = useState<
    { id: number; text: string; type: string }[]
  >([]);

  // Состояния для модального окна уровней
  const [selectedTopic, setSelectedTopic] = useState<TeacherTopic | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelForm, setLevelForm] = useState({
    title: "",
    description: "",
    html: "",
    css: "",
    hint: "",
    xp: 50,
    validation: "",
    order: 0,
  });

  // Форма создания темы
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    category: "css",
    difficulty: "intermediate",
    iconKey: "fas fa-code",
    lessons: 1,
    xpPerLesson: 50,
    accessLevel: "free",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "teacher") {
      router.push("/");
    } else {
      fetchData();
    }
  }, [session, status, router]);

  const showMessage = (text: string, type: string) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, text, type }]);
    setTimeout(
      () => setMessages((prev) => prev.filter((m) => m.id !== id)),
      3000,
    );
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, topicsRes] = await Promise.all([
        fetch("/api/teacher/students"),
        fetch("/api/teacher/topics"),
      ]);
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (topicsRes.ok) setTopics(await topicsRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLevels = async (topicId: number) => {
    const res = await fetch(`/api/teacher/levels?topicId=${topicId}`);
    if (res.ok) {
      setLevels(await res.json());
    }
  };

  const handleCreateLevel = async () => {
    if (!selectedTopic) return;
    if (!levelForm.title || !levelForm.html || !levelForm.css) {
      showMessage("Заполните название, HTML и CSS код", "error");
      return;
    }

    try {
      const res = await fetch("/api/teacher/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...levelForm, topicId: selectedTopic.id }),
      });
      if (res.ok) {
        showMessage("Уровень создан", "success");
        setLevelForm({
          title: "",
          description: "",
          html: "",
          css: "",
          hint: "",
          xp: 50,
          validation: "",
          order: 0,
        });
        loadLevels(selectedTopic.id);
        fetchData();
      } else {
        showMessage("Ошибка", "error");
      }
    } catch (error) {
      showMessage("Ошибка", "error");
    }
  };

  const handleDeleteLevel = async (levelId: number) => {
    if (!confirm("Удалить уровень?")) return;
    const res = await fetch(`/api/teacher/levels?id=${levelId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showMessage("Уровень удалён", "success");
      if (selectedTopic) loadLevels(selectedTopic.id);
      fetchData();
    }
  };

  const handleCreateTopic = async () => {
    if (!topicForm.title || !topicForm.description) {
      showMessage("Заполните название и описание", "error");
      return;
    }

    try {
      const res = await fetch("/api/teacher/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topicForm),
      });

      if (res.ok) {
        showMessage("Тема создана", "success");
        setTopicForm({
          title: "",
          description: "",
          category: "css",
          difficulty: "intermediate",
          iconKey: "fas fa-code",
          lessons: 1,
          xpPerLesson: 50,
          accessLevel: "free",
        });
        fetchData();
        setActiveTab("topics");
      } else {
        showMessage("Ошибка", "error");
      }
    } catch (error) {
      showMessage("Ошибка", "error");
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm("Удалить тему? Все уровни также будут удалены.")) return;
    try {
      const res = await fetch(`/api/teacher/topics?id=${topicId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showMessage("Тема удалена", "success");
        fetchData();
      } else {
        showMessage("Ошибка удаления", "error");
      }
    } catch (error) {
      showMessage("Ошибка", "error");
    }
  };

  const openLevelManager = (topic: TeacherTopic) => {
    setSelectedTopic(topic);
    loadLevels(topic.id);
    setShowLevelModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-accent-blue"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          Панель наставника
        </h1>
        <p className="text-text-dim mb-8">
          Управление учениками и создание заданий
        </p>

        {/* Сообщения */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`fixed top-24 right-5 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
              msg.type === "success"
                ? "bg-accent-green/90 text-black"
                : "bg-accent-red/90 text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* Табы */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-glass-border pb-4">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "students"
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue"
                : "text-text-dim hover:text-text-light hover:bg-white/5"
            }`}
          >
            <i className="fas fa-users"></i> Мои ученики
          </button>
          <button
            onClick={() => setActiveTab("topics")}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "topics"
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue"
                : "text-text-dim hover:text-text-light hover:bg-white/5"
            }`}
          >
            <i className="fas fa-folder"></i> Мои темы
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === "create"
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue"
                : "text-text-dim hover:text-text-light hover:bg-white/5"
            }`}
          >
            <i className="fas fa-plus"></i> Создать тему
          </button>
        </div>

        {/* Мои ученики */}
        {activeTab === "students" && (
          <div className="glass-card rounded-xl p-6 border border-glass-border">
            <h2 className="text-xl font-bold mb-6">Мои ученики</h2>
            {students.length === 0 ? (
              <p className="text-text-dim text-center py-8">
                У вас пока нет привязанных учеников
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-glass-border">
                    <tr className="text-left text-text-dim">
                      <th className="pb-3">Ученик</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">XP</th>
                      <th className="pb-3">Уровень</th>
                      <th className="pb-3">Тем завершено</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-glass-border/50 hover:bg-white/5"
                      >
                        <td className="py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold">
                            {student.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold">{student.name}</span>
                        </td>
                        <td className="py-4">{student.email}</td>
                        <td className="py-4">{student.xp}</td>
                        <td className="py-4">{student.level}</td>
                        <td className="py-4">{student.topicsCompleted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Мои темы */}
        {activeTab === "topics" && (
          <div className="glass-card rounded-xl p-6 border border-glass-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Мои темы</h2>
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Создать тему
              </button>
            </div>
            {topics.length === 0 ? (
              <p className="text-text-dim text-center py-8">
                У вас пока нет созданных тем
              </p>
            ) : (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 glass-card rounded-xl border border-glass-border hover:border-accent-blue transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <i
                          className={`${topic.iconKey} text-2xl text-accent-blue`}
                        ></i>
                        <div>
                          <h3 className="font-bold text-lg">{topic.title}</h3>
                          <p className="text-text-dim text-sm">
                            {topic.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openLevelManager(topic)}
                          className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-lg text-sm hover:bg-accent-blue/30"
                        >
                          Уровни ({topic.levels.length})
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-text-dim">
                      <span>Сложность: {topic.difficulty}</span>
                      <span>Уроков: {topic.lessons}</span>
                      <span>XP: {topic.xpPerLesson}</span>
                      <span className="text-accent-yellow">
                        Доступ: {topic.accessLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Создание темы */}
        {activeTab === "create" && (
          <div className="glass-card rounded-xl p-6 border border-glass-border">
            <h2 className="text-xl font-bold mb-6">Создать новую тему</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Название темы *
                </label>
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Описание *
                </label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Категория
                  </label>
                  <select
                    value={topicForm.category}
                    onChange={(e) =>
                      setTopicForm({ ...topicForm, category: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                  >
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="js">JavaScript</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Сложность
                  </label>
                  <select
                    value={topicForm.difficulty}
                    onChange={(e) =>
                      setTopicForm({ ...topicForm, difficulty: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                  >
                    <option value="beginner">Для начинающих</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Кол-во уроков
                  </label>
                  <input
                    type="number"
                    value={topicForm.lessons}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        lessons: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    XP за урок
                  </label>
                  <input
                    type="number"
                    value={topicForm.xpPerLesson}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        xpPerLesson: parseInt(e.target.value) || 50,
                      })
                    }
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Доступ
                  </label>
                  <select
                    value={topicForm.accessLevel}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        accessLevel: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                  >
                    <option value="free">Free</option>
                    <option value="subscriber">Subscriber</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Иконка (FontAwesome)
                </label>
                <input
                  type="text"
                  value={topicForm.iconKey}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, iconKey: e.target.value })
                  }
                  placeholder="fas fa-code"
                  className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setActiveTab("topics")}
                  className="px-6 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateTopic}
                  className="px-6 py-2 bg-linear-to-r from-accent-blue to-accent-purple text-white rounded-lg hover:shadow-neon-purple"
                >
                  Создать тему
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно управления уровнями (в стиле админки) */}
      {showLevelModal && selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto border border-glass-border">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text">
                  Управление уровнями
                </h2>
                <p className="text-text-dim text-sm mt-1">
                  Тема: {selectedTopic.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLevelModal(false);
                  setSelectedTopic(null);
                  setLevels([]);
                }}
                className="text-text-dim hover:text-accent-red transition-colors"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            {/* Список существующих уровней */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <i className="fas fa-list text-accent-blue"></i> Существующие
                уровни
              </h3>
              {levels.length === 0 ? (
                <p className="text-text-dim text-center py-6 bg-secondary-dark/30 rounded-lg">
                  Нет созданных уровней
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {levels.map((level) => (
                    <div
                      key={level.id}
                      className="flex justify-between items-center p-3 bg-secondary-dark/50 rounded-lg hover:bg-secondary-dark/80 transition-all"
                    >
                      <div>
                        <span className="font-semibold">
                          {level.order}. {level.title}
                        </span>
                        <span className="text-text-dim text-sm ml-3">
                          XP: {level.xp}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteLevel(level.id)}
                        className="text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded hover:bg-red-500/10"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Форма создания уровня */}
            <div className="border-t border-glass-border pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-plus-circle text-accent-green"></i> Создать
                новый уровень
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Название уровня *
                    </label>
                    <input
                      type="text"
                      value={levelForm.title}
                      onChange={(e) =>
                        setLevelForm({ ...levelForm, title: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                      placeholder="Пример: Центрирование элементов"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Порядок (order)
                    </label>
                    <input
                      type="number"
                      value={levelForm.order || ""}
                      onChange={(e) =>
                        setLevelForm({
                          ...levelForm,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Автоматически"
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Описание
                  </label>
                  <textarea
                    value={levelForm.description}
                    onChange={(e) =>
                      setLevelForm({
                        ...levelForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                    placeholder="Краткое описание задания"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      HTML код *
                    </label>
                    <textarea
                      value={levelForm.html}
                      onChange={(e) =>
                        setLevelForm({ ...levelForm, html: e.target.value })
                      }
                      rows={6}
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg font-mono text-sm focus:outline-none focus:border-accent-blue"
                      placeholder='<div class="container">...</div>'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CSS код *
                    </label>
                    <textarea
                      value={levelForm.css}
                      onChange={(e) =>
                        setLevelForm({ ...levelForm, css: e.target.value })
                      }
                      rows={6}
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg font-mono text-sm focus:outline-none focus:border-accent-blue"
                      placeholder=".container { display: flex; }"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Подсказка
                    </label>
                    <input
                      type="text"
                      value={levelForm.hint}
                      onChange={(e) =>
                        setLevelForm({ ...levelForm, hint: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                      placeholder="Необязательно"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      XP за уровень *
                    </label>
                    <input
                      type="number"
                      value={levelForm.xp}
                      onChange={(e) =>
                        setLevelForm({
                          ...levelForm,
                          xp: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Правила проверки (JSON)
                    </label>
                    <input
                      type="text"
                      value={levelForm.validation}
                      onChange={(e) =>
                        setLevelForm({
                          ...levelForm,
                          validation: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg font-mono text-sm"
                      placeholder='{"type":"cssContains","rules":[...]}'
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setLevelForm({
                        title: "",
                        description: "",
                        html: "",
                        css: "",
                        hint: "",
                        xp: 50,
                        validation: "",
                        order: 0,
                      });
                    }}
                    className="px-6 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg hover:bg-accent-red/10 hover:border-accent-red transition-colors"
                  >
                    Очистить
                  </button>
                  <button
                    onClick={handleCreateLevel}
                    className="px-6 py-2 bg-linear-to-r from-accent-blue to-accent-purple text-white rounded-lg hover:shadow-neon-purple transition-all"
                  >
                    <i className="fas fa-save mr-2"></i> Создать уровень
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
