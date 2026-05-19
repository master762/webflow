"use client";

import Link from "next/link";

interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    icon: string;
    description: string;
    progress: number;
    lessonsCompleted: number;
    totalLessons: number;
    isBoss: boolean;
    category?: string;
    submissionStatus?: "pending" | "reviewed" | null;
    score?: number | null;
    comment?: string | null;
    gradientClass?: string;
    difficultyClass?: string;
    difficultyIcon?: string;
    difficultyLabel?: string;
    locked?: boolean;
    xpValue?: number;
    requirements?: string | null;
    teacherId?: string | null;
  };
}

export default function TopicCard({ topic }: TopicCardProps) {
  // Определяем статус для проектов
  const isProject = topic.category === "projects";
  const isPending = topic.submissionStatus === "pending";
  const isReviewed = topic.submissionStatus === "reviewed";
  const score = topic.score;
  const scoreColor =
    score && score >= 8 ? "green" : score && score >= 5 ? "yellow" : "red";

  const statusConfig = {
    green: {
      bg: "bg-green-500/20",
      border: "border-green-500",
      text: "text-green-400",
      icon: "fa-check-circle",
      label: "Зачтено",
    },
    yellow: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-500",
      text: "text-yellow-400",
      icon: "fa-clock",
      label: "На доработке",
    },
    red: {
      bg: "bg-red-500/20",
      border: "border-red-500",
      text: "text-red-400",
      icon: "fa-exclamation-triangle",
      label: "Требует исправлений",
    },
  };

  const getStatusBadge = () => {
    if (isProject && isReviewed && score) {
      const config = statusConfig[scoreColor];
      return (
        <div
          className={`mb-3 p-3 rounded-lg ${config.bg} border ${config.border}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className={`fas ${config.icon} ${config.text}`}></i>
              <span className={`font-semibold ${config.text}`}>
                {config.label}
              </span>
            </div>
            <span className={`text-xl font-bold ${config.text}`}>
              {score}/10
            </span>
          </div>
          {topic.comment && (
            <p className="text-xs text-text-dim mt-2">{topic.comment}</p>
          )}
        </div>
      );
    }

    if (isProject && isPending) {
      return (
        <div className="mb-3 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500">
          <div className="flex items-center gap-2">
            <i className="fas fa-hourglass-half text-yellow-400"></i>
            <span className="font-semibold text-yellow-400">На проверке</span>
          </div>
          <p className="text-xs text-text-dim mt-1">
            Работа отправлена, ожидайте оценки
          </p>
        </div>
      );
    }

    if (isProject && !isPending && !isReviewed) {
      return (
        <div className="mb-3 p-3 rounded-lg bg-accent-blue/20 border border-accent-blue">
          <div className="flex items-center gap-2">
            <i className="fas fa-play-circle text-accent-blue"></i>
            <span className="font-semibold text-accent-blue">
              Ожидает выполнения
            </span>
          </div>
          <p className="text-xs text-text-dim mt-1">
            Ознакомьтесь с заданием и отправьте ссылку на GitHub
          </p>
        </div>
      );
    }

    return null;
  };

  // Для обычных тем показываем прогресс
  const showProgress = !isProject;

  return (
    <div
      className={`glass-card rounded-xl p-6 border flex flex-col transition-all duration-300 relative
        ${topic.locked ? "opacity-70 grayscale" : "hover:border-accent-blue hover:shadow-neon-blue hover:-translate-y-2"}
        ${topic.progress === 100 ? "border-accent-green bg-accent-green/5 shadow-md" : "border-glass-border"}
      `}
    >
      {/* Иконка блокировки */}
      {topic.locked && (
        <i className="fas fa-lock text-accent-red text-xl absolute top-5 right-5 z-10"></i>
      )}

      {/* Бейдж "Задание от учителя" */}
      {topic.teacherId && !topic.locked && (
        <div className="absolute top-5 left-5 z-10">
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-md text-xs flex items-center gap-1">
            <i className="fas fa-chalkboard-user text-xs"></i> От учителя
          </span>
        </div>
      )}

      {/* Заголовок карточки: иконка + уровень сложности */}
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl bg-linear-to-br ${topic.gradientClass}`}
        >
          <i className={topic.icon}></i>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${topic.difficultyClass}`}
        >
          <i className={`${topic.difficultyIcon} mr-1`}></i>
          {topic.difficultyLabel}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-3">{topic.title}</h3>
      <p className="text-text-dim mb-6 grow">{topic.description}</p>

      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2 text-text-dim">
          <i className="far fa-clock"></i>
          <span className="text-sm">
            {topic.totalLessons}{" "}
            {topic.totalLessons === 1
              ? "урок"
              : topic.totalLessons < 5
                ? "урока"
                : "уроков"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-text-dim">
          <i className="fas fa-star text-accent-yellow"></i>
          <span className="text-sm">{topic.xpValue} XP</span>
        </div>
      </div>

      {/* Статус бейдж для проектов */}
      {getStatusBadge()}

      {/* Прогресс-бар для обычных тем */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Прогресс</span>
            <span className="font-semibold">{topic.progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                topic.progress === 100
                  ? "bg-accent-green"
                  : "bg-linear-to-r from-accent-blue to-accent-purple"
              }`}
              style={{ width: `${topic.progress}%` }}
            ></div>
          </div>
        </div>
      )}

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
              href={topic.isBoss ? "/boss" : `/level?topic=${topic.id}`}
              className={`flex-1 px-4 py-3 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                topic.progress === 100
                  ? "bg-accent-green/20 text-accent-green border border-accent-green hover:bg-accent-green/30"
                  : "bg-linear-to-r from-accent-blue to-accent-purple text-white hover:shadow-neon-purple"
              }`}
            >
              <i className="fas fa-play-circle"></i>
              {topic.progress === 100
                ? "Повторить"
                : topic.progress > 0
                  ? "Продолжить"
                  : "Начать"}
            </Link>
            <button className="px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300 flex items-center justify-center gap-2">
              <i className="fas fa-redo"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
