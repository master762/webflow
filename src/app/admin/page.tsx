"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  username: string | null;
  bio: string;
  xp: number;
  level: number;
  streak: number;
  topicsCompleted: number;
  role: { name: string };
  banReason: string | null;
  createdAt: string;
}

interface Topic {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  iconKey: string;
  lessons: number;
  xpPerLesson: number;
  requirements: string | null;
  accessLevel: string;
  technicalSpec?: string;
  materials?: string;
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
  topic?: Topic;
}

interface Submission {
  id: number;
  projectId: number;
  userId: string;
  repoLink: string;
  status: string;
  score: number | null;
  comment: string | null;
  submittedAt: string;
  user: { name: string };
  project: { topic: { title: string } };
}

type TabType = "users" | "levels" | "topics" | "stats" | "reviews";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    category: "css",
    difficulty: "beginner",
    iconKey: "fas fa-code",
    lessons: 1,
    xpPerLesson: 50,
    requirements: "",
    accessLevel: "free",
    technicalSpec: "",
    materials: "",
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [levelForm, setLevelForm] = useState({
    topicId: 0,
    order: 0,
    title: "",
    description: "",
    html: "",
    css: "",
    hint: "",
    xp: 50,
    validation: "",
  });

  // ========== ПОКАЗ СООБЩЕНИЙ (СНАЧАЛА) ==========
  const showMessage = useCallback(
    (text: string, type: "success" | "error" | "info") => {
      const id = Date.now();
      setMessages((prev) => [...prev, { id, text, type }]);
      setTimeout(
        () => setMessages((prev) => prev.filter((m) => m.id !== id)),
        3000,
      );
    },
    [],
  );

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, topicsRes, levelsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/topics"),
        fetch("/api/admin/levels"),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (topicsRes.ok) setTopics(await topicsRes.json());
      if (levelsRes.ok) setLevels(await levelsRes.json());
    } catch {
      showMessage("Ошибка загрузки данных", "error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // ========== РАБОТЫ НА ПРОВЕРКУ ==========
  const fetchSubmissions = useCallback(async () => {
    const res = await fetch("/api/admin/submissions");
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data);
      setPendingCount(data.length);
    }
  }, []);

  const handleReview = useCallback(
    async (submissionId: number, score: number, comment: string) => {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, score, comment }),
      });
      if (res.ok) {
        showMessage("Работа оценена", "success");
        fetchSubmissions();
      }
    },
    [fetchSubmissions, showMessage],
  );

  // ========== УПРАВЛЕНИЕ ТЕМАМИ ==========
  const handleSaveTopic = async () => {
    if (!topicForm.title || !topicForm.description) {
      showMessage("Заполните обязательные поля", "error");
      return;
    }

    try {
      const url = "/api/admin/topics";
      const method = editingTopic ? "PUT" : "POST";
      const body = editingTopic
        ? { ...topicForm, id: editingTopic.id }
        : topicForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showMessage(
          editingTopic ? "Тема обновлена" : "Тема создана",
          "success",
        );
        setShowTopicModal(false);
        setEditingTopic(null);
        setTopicForm({
          title: "",
          description: "",
          category: "css",
          difficulty: "beginner",
          iconKey: "fas fa-code",
          lessons: 1,
          xpPerLesson: 50,
          requirements: "",
          accessLevel: "free",
          technicalSpec: "",
          materials: "",
        });
        fetchData();
      } else {
        const error = await res.json();
        showMessage(error.error || "Ошибка", "error");
      }
    } catch {
      showMessage("Ошибка", "error");
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (
      !confirm(
        "Удалить тему? Все связанные уровни также будут удалены. Это действие нельзя отменить.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/topics?id=${topicId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showMessage("Тема удалена", "success");
        fetchData();
      } else {
        showMessage("Ошибка удаления", "error");
      }
    } catch {
      showMessage("Ошибка", "error");
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description,
      category: topic.category,
      difficulty: topic.difficulty,
      iconKey: topic.iconKey,
      lessons: topic.lessons,
      xpPerLesson: topic.xpPerLesson,
      requirements: topic.requirements || "",
      accessLevel: topic.accessLevel,
      technicalSpec: topic.technicalSpec || "",
      materials: topic.materials || "",
    });
    setShowTopicModal(true);
  };

  // ========== УПРАВЛЕНИЕ УРОВНЯМИ ==========
  const handleSaveLevel = async () => {
    if (
      !levelForm.topicId ||
      !levelForm.title ||
      !levelForm.html ||
      !levelForm.css
    ) {
      showMessage("Заполните обязательные поля", "error");
      return;
    }

    try {
      const url = "/api/admin/levels";
      const method = editingLevel ? "PUT" : "POST";
      const body = editingLevel
        ? { ...levelForm, id: editingLevel.id }
        : levelForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showMessage(
          editingLevel ? "Уровень обновлён" : "Уровень создан",
          "success",
        );
        setShowLevelModal(false);
        setEditingLevel(null);
        setLevelForm({
          topicId: 0,
          order: 0,
          title: "",
          description: "",
          html: "",
          css: "",
          hint: "",
          xp: 50,
          validation: "",
        });
        fetchData();
      } else {
        const error = await res.json();
        showMessage(error.error || "Ошибка", "error");
      }
    } catch {
      showMessage("Ошибка", "error");
    }
  };

  const handleDeleteLevel = async (levelId: number) => {
    if (!confirm("Удалить уровень? Это действие нельзя отменить.")) return;

    try {
      const res = await fetch(`/api/admin/levels?id=${levelId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showMessage("Уровень удалён", "success");
        fetchData();
      } else {
        showMessage("Ошибка удаления", "error");
      }
    } catch {
      showMessage("Ошибка", "error");
    }
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level);
    setLevelForm({
      topicId: level.topicId,
      order: level.order,
      title: level.title,
      description: level.description,
      html: level.html,
      css: level.css,
      hint: level.hint || "",
      xp: level.xp,
      validation: level.validation || "",
    });
    setShowLevelModal(true);
  };

  // ========== ПОЛЬЗОВАТЕЛИ ==========
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);
      const matchesRole = roleFilter === "all" || user.role.name === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleBanUser = async (
    userId: string,
    ban: boolean,
    reason?: string,
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: ban ? "ban" : "unban", reason }),
      });
      if (res.ok) {
        showMessage(
          `Пользователь ${ban ? "заблокирован" : "разблокирован"}`,
          "success",
        );
        fetchData();
      } else {
        showMessage("Ошибка", "error");
      }
    } catch {
      showMessage("Ошибка", "error");
    }
  };

  const handleChangeRole = async (userId: string, newRoleId: number) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "changeRole",
          roleId: newRoleId,
        }),
      });
      if (res.ok) {
        showMessage("Роль изменена", "success");
        fetchData();
      } else {
        showMessage("Ошибка", "error");
      }
    } catch {
      showMessage("Ошибка", "error");
    }
  };

  // ========== REDIRECT ==========
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [session, status, router, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-accent-blue mb-4"></i>
          <p>Загрузка админ-панели...</p>
        </div>
      </div>
    );
  }

  const roleNames: Record<number, string> = {
    1: "user",
    2: "subscriber",
    3: "banned",
    4: "admin",
    5: "teacher",
    6: "employer",
  };

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

      {/* Модальное окно добавления/редактирования уровня */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-glass-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                {editingLevel ? "Редактировать уровень" : "Новый уровень"}
              </h2>
              <button
                onClick={() => {
                  setShowLevelModal(false);
                  setEditingLevel(null);
                  setLevelForm({
                    topicId: 0,
                    order: 0,
                    title: "",
                    description: "",
                    html: "",
                    css: "",
                    hint: "",
                    xp: 50,
                    validation: "",
                  });
                }}
                className="text-text-dim hover:text-accent-red transition-colors"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Тема *
                  </label>
                  <select
                    value={levelForm.topicId}
                    onChange={(e) =>
                      setLevelForm({
                        ...levelForm,
                        topicId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                  >
                    <option value={0}>Выберите тему</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Описание
                </label>
                <textarea
                  value={levelForm.description}
                  onChange={(e) =>
                    setLevelForm({ ...levelForm, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Подсказка (hint)
                  </label>
                  <input
                    type="text"
                    value={levelForm.hint}
                    onChange={(e) =>
                      setLevelForm({ ...levelForm, hint: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
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
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Правила проверки (JSON)
                </label>
                <textarea
                  value={levelForm.validation}
                  onChange={(e) =>
                    setLevelForm({ ...levelForm, validation: e.target.value })
                  }
                  rows={4}
                  placeholder='{"type": "cssContains", "rules": [{"selector": ".container", "property": "justify-content", "value": "center"}]}'
                  className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg font-mono text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowLevelModal(false);
                    setEditingLevel(null);
                    setLevelForm({
                      topicId: 0,
                      order: 0,
                      title: "",
                      description: "",
                      html: "",
                      css: "",
                      hint: "",
                      xp: 50,
                      validation: "",
                    });
                  }}
                  className="px-6 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg hover:bg-accent-red/10 hover:border-accent-red transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveLevel}
                  className="px-6 py-2 bg-linear-to-r from-accent-blue to-accent-purple text-white rounded-lg hover:shadow-neon-purple transition-all"
                >
                  {editingLevel ? "Сохранить" : "Создать"}
                </button>
              </div>
            </div>{" "}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {showTopicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="glass-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-glass-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">
                  {editingTopic ? "Редактировать тему" : "Новая тема"}
                </h2>
                <button
                  onClick={() => {
                    setShowTopicModal(false);
                    setEditingTopic(null);
                    setTopicForm({
                      title: "",
                      description: "",
                      category: "css",
                      difficulty: "beginner",
                      iconKey: "fas fa-code",
                      lessons: 1,
                      xpPerLesson: 50,
                      requirements: "",
                      accessLevel: "free",
                      technicalSpec: "",
                      materials: "",
                    });
                  }}
                  className="text-text-dim hover:text-accent-red transition-colors"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Категория *
                    </label>
                    <select
                      value={topicForm.category}
                      onChange={(e) =>
                        setTopicForm({ ...topicForm, category: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                    >
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="js">JavaScript</option>
                      <option value="projects">Проекты</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Описание *
                  </label>
                  <textarea
                    value={topicForm.description}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Сложность *
                    </label>
                    <select
                      value={topicForm.difficulty}
                      onChange={(e) =>
                        setTopicForm({
                          ...topicForm,
                          difficulty: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                    >
                      <option value="beginner">
                        Beginner (Для начинающих)
                      </option>
                      <option value="intermediate">
                        Intermediate (Средний)
                      </option>
                      <option value="advanced">Advanced (Продвинутый)</option>
                      <option value="expert">Expert (Эксперт)</option>
                    </select>
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
                      placeholder="fab fa-html5"
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                    />
                  </div>
                </div>

                {topicForm.category === "projects" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Техническое задание (HTML)
                      </label>
                      <textarea
                        value={topicForm.technicalSpec}
                        onChange={(e) =>
                          setTopicForm({
                            ...topicForm,
                            technicalSpec: e.target.value,
                          })
                        }
                        rows={8}
                        className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg font-mono text-sm"
                        placeholder="<h3>Требования к проекту</h3><ul><li>Сверстать...</li></ul>"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Материалы (ссылки, файлы)
                      </label>
                      <textarea
                        value={topicForm.materials}
                        onChange={(e) =>
                          setTopicForm({
                            ...topicForm,
                            materials: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg font-mono text-sm"
                        placeholder="&lt;a href='https://figma.com/...'&gt;Макет Figma&lt;/a&gt;"
                      />
                    </div>
                  </>
                )}

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
                          lessons: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
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
                          xpPerLesson: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
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
                      className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                    >
                      <option value="free">Free</option>
                      <option value="subscriber">Subscriber</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Требования (JSON)
                  </label>
                  <textarea
                    value={topicForm.requirements}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        requirements: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder='{"requiredTopics": [1, 2]}'
                    className="w-full px-4 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg font-mono text-sm focus:outline-none focus:border-accent-blue"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowTopicModal(false);
                      setEditingTopic(null);
                      setTopicForm({
                        title: "",
                        description: "",
                        category: "css",
                        difficulty: "beginner",
                        iconKey: "fas fa-code",
                        lessons: 1,
                        xpPerLesson: 50,
                        requirements: "",
                        accessLevel: "free",
                        technicalSpec: "",
                        materials: "",
                      });
                    }}
                    className="px-6 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg hover:bg-accent-red/10 hover:border-accent-red transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveTopic}
                    className="px-6 py-2 bg-linear-to-r from-accent-blue to-accent-purple text-white rounded-lg hover:shadow-neon-purple transition-all"
                  >
                    {editingTopic ? "Сохранить" : "Создать"}
                  </button>
                </div>
              </div>{" "}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Панель администратора
          </h1>
          <p className="text-text-dim">
            Управление пользователями, темами и уровнями
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-glass-border pb-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue"
                : "text-text-dim hover:text-text-light hover:bg-white/5"
            }`}
          >
            <i className="fas fa-users"></i> Пользователи
          </button>
          <button
            onClick={() => setActiveTab("levels")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === "levels"
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue"
                : "text-text-dim hover:text-text-light hover:bg-white/5"
            }`}
          >
            <i className="fas fa-tasks"></i> Уровни
          </button>
          <button
            onClick={() => setActiveTab("topics")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === "topics"
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue"
                : "text-text-dim hover:text-text-light hover:bg-white/5"
            }`}
          >
            <i className="fas fa-folder"></i> Темы
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === "stats"
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue"
                : "text-text-dim hover:text-text-light hover:bg-white/5"
            }`}
          >
            <i className="fas fa-chart-line"></i> Статистика
          </button>
          <button
            onClick={() => {
              setActiveTab("reviews");
              fetchSubmissions();
            }}
            className="relative px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
          >
            <i className="fas fa-tasks"></i> Проверка
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Вкладка: Проверка проектов */}
        {activeTab === "reviews" && (
          <div className="glass-card rounded-xl p-6 border border-glass-border">
            <h2 className="text-xl font-bold mb-6">Работы на проверке</h2>
            {submissions.length === 0 ? (
              <p className="text-text-dim text-center">Нет работ на проверке</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 glass-card rounded-xl border border-glass-border"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold">{sub.project.topic.title}</h3>
                        <p className="text-text-dim text-sm">
                          Студент: {sub.user.name}
                        </p>
                        <a
                          href={sub.repoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-blue text-sm hover:underline"
                        >
                          <i className="fab fa-github mr-1"></i> {sub.repoLink}
                        </a>
                      </div>
                      <div className="text-xs text-text-dim">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <input
                        type="number"
                        placeholder="Оценка 0-10"
                        id={`score-${sub.id}`}
                        className="px-3 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg w-32"
                      />
                      <input
                        type="text"
                        placeholder="Комментарий"
                        id={`comment-${sub.id}`}
                        className="flex-1 px-3 py-2 bg-secondary-dark/50 border border-glass-border rounded-lg"
                      />
                      <button
                        onClick={() => {
                          const score = parseInt(
                            (
                              document.getElementById(
                                `score-${sub.id}`,
                              ) as HTMLInputElement
                            ).value,
                          );
                          const comment = (
                            document.getElementById(
                              `comment-${sub.id}`,
                            ) as HTMLInputElement
                          ).value;
                          if (!isNaN(score) && score >= 0 && score <= 10) {
                            handleReview(sub.id, score, comment);
                          } else {
                            showMessage(
                              "Оценка должна быть от 0 до 10",
                              "error",
                            );
                          }
                        }}
                        className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80"
                      >
                        Оценить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Вкладка: Пользователи */}
        {activeTab === "users" && (
          <div className="glass-card rounded-xl p-6 border border-glass-border">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-text-dim"></i>
                <input
                  type="text"
                  placeholder="Поиск по имени, email или username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue"
              >
                <option value="all">Все роли</option>
                <option value="user">Пользователи</option>
                <option value="subscriber">Подписчики</option>
                <option value="admin">Администраторы</option>
                <option value="teacher">Наставники</option>
                <option value="employer">Работодатели</option>
                <option value="banned">Заблокированные</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-glass-border">
                  <tr className="text-left text-text-dim">
                    <th className="pb-3">Пользователь</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Роль</th>
                    <th className="pb-3">XP / Уровень</th>
                    <th className="pb-3">Дата регистрации</th>
                    <th className="pb-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-glass-border/50 hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-xs text-text-dim">
                              @{user.username || user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">{user.email}</td>
                      <td className="py-4">
                        <select
                          value={user.role.name}
                          onChange={(e) => {
                            const roleId = Object.entries(roleNames).find(
                              ([_, name]) => name === e.target.value,
                            )?.[0];
                            if (roleId)
                              handleChangeRole(user.id, parseInt(roleId));
                          }}
                          className="px-3 py-1 bg-secondary-dark/50 border border-glass-border rounded-lg text-sm focus:outline-none focus:border-accent-blue"
                        >
                          {Object.entries(roleNames).map(([id, name]) => (
                            <option key={id} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4">
                        {user.xp} XP (уровень {user.level})
                      </td>
                      <td className="py-4 text-text-dim">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {user.role.name !== "banned" ? (
                            <button
                              onClick={() => {
                                const reason = prompt(
                                  "Причина блокировки:",
                                  "Нарушение правил",
                                );
                                if (reason)
                                  handleBanUser(user.id, true, reason);
                              }}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                            >
                              Заблокировать
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user.id, false)}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                            >
                              Разблокировать
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-text-dim mb-4"></i>
                <p className="text-text-dim">Пользователи не найдены</p>
              </div>
            )}
          </div>
        )}

        {/* Вкладка: Уровни */}
        {activeTab === "levels" && (
          <div className="glass-card rounded-xl p-6 border border-glass-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Управление уровнями</h2>
              <button
                onClick={() => {
                  setEditingLevel(null);
                  setLevelForm({
                    topicId: 0,
                    order: 0,
                    title: "",
                    description: "",
                    html: "",
                    css: "",
                    hint: "",
                    xp: 50,
                    validation: "",
                  });
                  setShowLevelModal(true);
                }}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Добавить уровень
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-glass-border">
                  <tr className="text-left text-text-dim">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Название</th>
                    <th className="pb-3">Тема</th>
                    <th className="pb-3">Порядок</th>
                    <th className="pb-3">XP</th>
                    <th className="pb-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map((level) => (
                    <tr
                      key={level.id}
                      className="border-b border-glass-border/50 hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="py-4">{level.id}</td>
                      <td className="py-4 font-semibold">{level.title}</td>
                      <td className="py-4 text-text-dim">
                        {level.topic?.title || "—"}
                      </td>
                      <td className="py-4">{level.order}</td>
                      <td className="py-4">{level.xp}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditLevel(level)}
                            className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors text-sm"
                          >
                            <i className="fas fa-edit mr-1"></i> Ред.
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(level.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                          >
                            <i className="fas fa-trash mr-1"></i> Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {levels.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-tasks text-4xl text-text-dim mb-4"></i>
                <p className="text-text-dim">Уровни не найдены</p>
                <button
                  onClick={() => setShowLevelModal(true)}
                  className="mt-4 px-4 py-2 bg-accent-blue text-white rounded-lg"
                >
                  Создать первый уровень
                </button>
              </div>
            )}
          </div>
        )}

        {/* Вкладка: Темы */}
        {/* Вкладка: Темы */}
        {activeTab === "topics" && (
          <div className="glass-card rounded-xl p-6 border border-glass-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Управление темами</h2>
              <button
                onClick={() => {
                  setEditingTopic(null);
                  setTopicForm({
                    title: "",
                    description: "",
                    category: "css",
                    difficulty: "beginner",
                    iconKey: "fas fa-code",
                    lessons: 1,
                    xpPerLesson: 50,
                    requirements: "",
                    accessLevel: "free",
                    technicalSpec: "",
                    materials: "",
                  });
                  setShowTopicModal(true);
                }}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Добавить тему
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-glass-border">
                  <tr className="text-left text-text-dim">
                    <th className="pb-3">Название</th>
                    <th className="pb-3">Категория</th>
                    <th className="pb-3">Сложность</th>
                    <th className="pb-3">Уроков</th>
                    <th className="pb-3">XP за урок</th>
                    <th className="pb-3">Доступ</th>
                    <th className="pb-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((topic) => (
                    <tr
                      key={topic.id}
                      className="border-b border-glass-border/50 hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="py-4 font-semibold flex items-center gap-2">
                        <i className={`${topic.iconKey} text-accent-blue`}></i>
                        {topic.title}
                      </td>
                      <td className="py-4 text-text-dim">{topic.category}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            topic.difficulty === "beginner"
                              ? "text-accent-green"
                              : topic.difficulty === "intermediate"
                                ? "text-accent-yellow"
                                : "text-accent-red"
                          }`}
                        >
                          {topic.difficulty}
                        </span>
                      </td>
                      <td className="py-4">{topic.lessons}</td>
                      <td className="py-4">{topic.xpPerLesson}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            topic.accessLevel === "free"
                              ? "text-accent-green bg-accent-green/20"
                              : "text-accent-yellow bg-accent-yellow/20"
                          }`}
                        >
                          {topic.accessLevel}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTopic(topic)}
                            className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors text-sm"
                          >
                            <i className="fas fa-edit mr-1"></i> Ред.
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                          >
                            <i className="fas fa-trash mr-1"></i> Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {topics.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-folder text-4xl text-text-dim mb-4"></i>
                <p className="text-text-dim">Темы не найдены</p>
                <button
                  onClick={() => setShowTopicModal(true)}
                  className="mt-4 px-4 py-2 bg-accent-blue text-white rounded-lg"
                >
                  Создать первую тему
                </button>
              </div>
            )}
          </div>
        )}

        {/* Вкладка: Статистика */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-xl p-6 text-center border border-glass-border">
              <i className="fas fa-users text-4xl text-accent-blue mb-3"></i>
              <div className="text-3xl font-bold">{users.length}</div>
              <div className="text-text-dim">Всего пользователей</div>
            </div>
            <div className="glass-card rounded-xl p-6 text-center border border-glass-border">
              <i className="fas fa-chalkboard-user text-4xl text-accent-green mb-3"></i>
              <div className="text-3xl font-bold">
                {users.filter((u) => u.role.name === "teacher").length}
              </div>
              <div className="text-text-dim">Наставников</div>
            </div>
            <div className="glass-card rounded-xl p-6 text-center border border-glass-border">
              <i className="fas fa-crown text-4xl text-accent-yellow mb-3"></i>
              <div className="text-3xl font-bold">
                {users.filter((u) => u.role.name === "subscriber").length}
              </div>
              <div className="text-text-dim">Подписчиков</div>
            </div>
            <div className="glass-card rounded-xl p-6 text-center border border-glass-border">
              <i className="fas fa-flag-checkered text-4xl text-accent-purple mb-3"></i>
              <div className="text-3xl font-bold">{topics.length}</div>
              <div className="text-text-dim">Всего тем</div>
            </div>
            <div className="glass-card rounded-xl p-6 text-center border border-glass-border">
              <i className="fas fa-tasks text-4xl text-accent-blue mb-3"></i>
              <div className="text-3xl font-bold">{levels.length}</div>
              <div className="text-text-dim">Всего уровней</div>
            </div>
            <div className="glass-card rounded-xl p-6 text-center border border-glass-border">
              <i className="fas fa-chart-line text-4xl text-accent-green mb-3"></i>
              <div className="text-3xl font-bold">
                {Math.round(
                  users.reduce((sum, u) => sum + u.xp, 0) / (users.length || 1),
                )}
              </div>
              <div className="text-text-dim">Средний XP</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
