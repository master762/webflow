"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: number;
  topicId: number;
  technicalSpec: string;
  materials: string | null;
  topic: {
    title: string;
    description: string;
    xpPerLesson: number;
  };
  submissions?: {
    id: number;
    repoLink: string;
    status: string;
    score: number | null;
    comment: string | null;
    xpAwarded: number | null;
  }[];
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [repoLink, setRepoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<
    { id: number; text: string; type: string }[]
  >([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }
    fetchProject();
  }, [params.id, status]);

  const showMessage = (text: string, type: string) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, text, type }]);
    setTimeout(
      () => setMessages((prev) => prev.filter((m) => m.id !== id)),
      3000,
    );
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        setProject(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!repoLink.trim()) {
      showMessage("Введите ссылку на GitHub", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: parseInt(params.id), repoLink }),
      });

      if (res.ok) {
        showMessage("Работа отправлена на проверку!", "success");
        fetchProject();
        setRepoLink("");
      } else {
        const error = await res.json();
        showMessage(error.error || "Ошибка", "error");
      }
    } catch (error) {
      showMessage("Ошибка", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-accent-blue"></i>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-dim">Проект не найден</p>
          <Link href="/topics" className="text-accent-blue mt-4 inline-block">
            Вернуться к темам
          </Link>
        </div>
      </div>
    );
  }

  const existingSubmission = project.submissions?.[0];
  const isPending = existingSubmission?.status === "pending";
  const isReviewed = existingSubmission?.status === "reviewed";
  const score = existingSubmission?.score;
  const scoreColor =
    score && score >= 8 ? "green" : score && score >= 5 ? "yellow" : "red";
  const scoreClass =
    {
      green: "border-green-500 bg-green-500/10 text-green-400",
      yellow: "border-yellow-500 bg-yellow-500/10 text-yellow-400",
      red: "border-red-500 bg-red-500/10 text-red-400",
    }[scoreColor] || "border-gray-500 bg-gray-500/10";

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <div className="container mx-auto px-4 max-w-4xl py-8">
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

        {/* Заголовок */}
        <div className="mb-8">
          <Link
            href="/topics"
            className="text-accent-blue hover:underline mb-4 inline-block"
          >
            ← Назад к темам
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mt-4">
            {project.topic.title}
          </h1>
          <p className="text-text-dim mt-2">{project.topic.description}</p>
        </div>

        {/* Статус задачи */}
        {isReviewed && (
          <div className={`mb-6 p-6 rounded-xl border ${scoreClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i
                  className={`fas fa-${score && score >= 8 ? "crown" : score && score >= 5 ? "thumbs-up" : "frown"} text-2xl`}
                ></i>
                <div>
                  <h3 className="font-bold text-lg">Работа оценена</h3>
                  <p className="text-sm opacity-80">
                    Получено {existingSubmission?.xpAwarded} XP
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{score}/10</div>
                <div className="text-sm opacity-80">Оценка</div>
              </div>
            </div>
            {existingSubmission?.comment && (
              <div className="mt-4 p-4 bg-black/30 rounded-lg">
                <p className="text-sm">{existingSubmission.comment}</p>
              </div>
            )}
          </div>
        )}

        {isPending && (
          <div className="mb-6 p-6 rounded-xl border border-yellow-500 bg-yellow-500/10 text-yellow-400">
            <div className="flex items-center gap-3">
              <i className="fas fa-hourglass-half text-2xl"></i>
              <div>
                <h3 className="font-bold">На проверке</h3>
                <p className="text-sm">
                  Ваша работа отправлена на проверку. Ожидайте оценки.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ТЗ */}
        <div className="glass-card rounded-xl p-6 border border-glass-border mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-file-alt text-accent-blue"></i> Техническое
            задание
          </h2>
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: project.technicalSpec }}
          />
        </div>

        {/* Материалы */}
        {project.materials && (
          <div className="glass-card rounded-xl p-6 border border-glass-border mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-books text-accent-green"></i> Материалы
            </h2>
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: project.materials }}
            />
          </div>
        )}

        {/* Форма отправки */}
        {!isReviewed && !isPending && (
          <div className="glass-card rounded-xl p-6 border border-glass-border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fab fa-github text-accent-purple"></i> Отправить
              решение
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ссылка на GitHub репозиторий
                </label>
                <input
                  type="url"
                  value={repoLink}
                  onChange={(e) => setRepoLink(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg focus:outline-none focus:border-accent-blue"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-neon-purple transition-all disabled:opacity-50"
              >
                {submitting ? "Отправка..." : "Отправить на проверку"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
