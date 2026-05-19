"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StudentProject {
  id: number;
  title: string;
  repoLink: string;
  score: number | null;
  comment: string | null;
  submittedAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  username: string | null;
  xp: number;
  level: number;
  topicsCompleted: number;
  streak: number;
  progressPercent: number;
  projects: StudentProject[];
}

export default function EmployerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<
    { id: number; text: string; type: string }[]
  >([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "employer") {
      router.push("/");
    } else {
      fetchStudents();
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

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/employer/students");
      if (res.ok) {
        setStudents(await res.json());
      } else {
        showMessage("Ошибка загрузки данных", "error");
      }
    } catch (error) {
      console.error(error);
      showMessage("Ошибка", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false),
  );

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

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Каталог специалистов
          </h1>
          <p className="text-text-dim">Список студентов и их проекты</p>
        </div>

        {/* Поиск */}
        <div className="glass-card rounded-xl p-6 border border-glass-border mb-8">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-text-dim"></i>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по имени, email или username..."
              className="w-full pl-12 pr-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue"
            />
          </div>
        </div>

        {/* Список студентов */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl border border-glass-border">
            <i className="fas fa-users text-4xl text-text-dim mb-4"></i>
            <p className="text-text-dim">Студенты не найдены</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="glass-card rounded-xl p-6 border border-glass-border hover:border-accent-blue transition-all"
              >
                {/* Информация о студенте */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-glass-border">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{student.name}</h2>
                        <p className="text-text-dim text-sm">
                          @{student.username || student.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-envelope text-accent-blue"></i>
                        <span className="text-text-dim">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-star text-accent-yellow"></i>
                        <span className="text-text-dim">
                          XP: {student.xp.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-chart-line text-accent-green"></i>
                        <span className="text-text-dim">
                          Уровень: {student.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-fire text-accent-red"></i>
                        <span className="text-text-dim">
                          Дней подряд: {student.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-purple">
                        {student.topicsCompleted}
                      </div>
                      <div className="text-xs text-text-dim">тем завершено</div>
                    </div>
                  </div>
                </div>

                {/* Прогресс-бар */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Общий прогресс</span>
                    <span className="font-semibold text-accent-blue">
                      {student.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-accent-blue to-accent-purple transition-all duration-700"
                      style={{ width: `${student.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Проекты студента */}
                {student.projects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <i className="fas fa-project-diagram text-accent-blue"></i>
                      Проекты студента
                    </h3>
                    <div className="space-y-3">
                      {student.projects.map((project) => {
                        const scoreColor =
                          project.score && project.score >= 8
                            ? "green"
                            : project.score && project.score >= 5
                              ? "yellow"
                              : "red";
                        const scoreClass =
                          {
                            green:
                              "border-green-500 bg-green-500/10 text-green-400",
                            yellow:
                              "border-yellow-500 bg-yellow-500/10 text-yellow-400",
                            red: "border-red-500 bg-red-500/10 text-red-400",
                          }[scoreColor] || "border-gray-500 bg-gray-500/10";
                        return (
                          <div
                            key={project.id}
                            className={`p-4 rounded-lg border ${scoreClass}`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {project.title}
                                </h4>
                                <a
                                  href={project.repoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-blue text-sm hover:underline flex items-center gap-1 mt-1"
                                >
                                  <i className="fab fa-github"></i>{" "}
                                  {project.repoLink}
                                </a>
                                {project.comment && (
                                  <p className="text-xs text-text-dim mt-2">
                                    Комментарий: {project.comment}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  {project.score}/10
                                </div>
                                <div className="text-xs text-text-dim">
                                  оценка
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
