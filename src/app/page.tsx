"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface TopicFromDB {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  iconKey: string;
  lessons: number;
  xpPerLesson: number;
  accessLevel: string;
  levels: { id: number }[];
}

interface UserProgress {
  topicId: number;
  progress: number;
  completed: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const roleId = session?.user?.roleId;

  const [topics, setTopics] = useState<TopicFromDB[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const topicsRes = await fetch("/api/topics");
        const topicsData = await topicsRes.json();
        setTopics(topicsData.topics || []);
        setProgress(topicsData.progress || []);

        if (isLoggedIn) {
          const profileRes = await fetch("/api/user/profile");
          if (profileRes.ok) {
            const data = await profileRes.json();
            setAchievements(JSON.parse(data.achievements || "[]"));
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isLoggedIn]);

  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    progress.forEach((p) => map.set(p.topicId, p.progress));
    return map;
  }, [progress]);

  const getProgress = (id: number) => progressMap.get(id) ?? 0;
  const isCompleted = (progress: number) => progress >= 100;

  const isTopicLocked = (topic: TopicFromDB) => {
    if (!topic.accessLevel) return false;
    if (topic.accessLevel === "subscriber") {
      return roleId !== 2 && roleId !== 4;
    }
    if (topic.accessLevel === "admin") {
      return roleId !== 4;
    }
    return false;
  };

  const getTopicHref = (topic: TopicFromDB) => {
    return topic.levels?.[0] ? `/level/${topic.levels[0].id}` : "#";
  };

  const regularTopics = useMemo(() => {
    return topics.filter((topic) => topic.category !== "project");
  }, [topics]);

  const unlockedAchievements = useMemo(() => {
    return achievements.filter((a) => a.unlocked).slice(0, 4);
  }, [achievements]);

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-accent-green/10 text-accent-green border-accent-green";
      case "intermediate":
        return "bg-accent-blue/10 text-accent-blue border-accent-blue";
      case "advanced":
        return "bg-accent-purple/10 text-accent-purple border-accent-purple";
      default:
        return "bg-white/10 text-text-dim border-glass-border";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "fas fa-seedling";
      case "intermediate":
        return "fas fa-chart-line";
      case "advanced":
        return "fas fa-rocket";
      default:
        return "fas fa-question";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Для начинающих";
      case "intermediate":
        return "Средний уровень";
      case "advanced":
        return "Продвинутый уровень";
      default:
        return "";
    }
  };

  const getGradientClass = (category: string) => {
    switch (category) {
      case "html":
        return "from-orange-500 to-red-500";
      case "css":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-accent-blue to-accent-purple";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-accent-blue mb-4"></i>
          <p className="text-text-dim">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* HERO */}
      <section className="text-center my-16 py-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
          Изучай HTML/CSS как в игре
        </h1>

        <p className="text-lg text-text-dim max-w-3xl mx-auto mb-8">
          Прокачивай навыки веб-разработки, проходя уровни, сражайся с боссами и
          отслеживай прогресс.
        </p>

        <Link
          href={isLoggedIn ? "/topics" : "/auth"}
          className="inline-block px-8 py-4 bg-linear-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg shadow-lg hover:shadow-neon-purple hover:-translate-y-1 transition-all duration-300"
        >
          {isLoggedIn ? "Продолжить обучение" : "Начать обучение"}
        </Link>
      </section>

      {isLoggedIn && (
        <>
          {/* ПРОГРЕСС */}
          <section className="my-12">
            <h2 className="text-3xl font-bold mb-2">Текущий прогресс</h2>
            <p className="text-text-dim mb-8">
              Продолжай обучение с того места, где остановился
            </p>

            {regularTopics.length === 0 ? (
              <p className="text-text-dim text-center py-8">
                Тем пока нет. Загляните позже!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {regularTopics.slice(0, 4).map((topic) => {
                  const progress = getProgress(topic.id);
                  const completed = isCompleted(progress);
                  const locked = isTopicLocked(topic);

                  return (
                    <div
                      key={topic.id}
                      className={`glass-card rounded-xl p-6 border flex flex-col transition-all duration-300 relative
                        ${locked ? "opacity-70 grayscale" : "hover:border-accent-blue hover:shadow-neon-blue hover:-translate-y-2"}
                        ${completed ? "border-accent-green bg-accent-green/5 shadow-md" : "border-glass-border"}
                      `}
                    >
                      {locked && (
                        <i className="fas fa-lock text-accent-red text-xl absolute top-5 right-5 z-10"></i>
                      )}

                      {/* Иконка и тэг сложности */}
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl bg-gradient-to-br ${getGradientClass(topic.category)}`}
                        >
                          <i className={topic.iconKey}></i>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyClass(topic.difficulty)}`}
                        >
                          <i
                            className={`${getDifficultyIcon(topic.difficulty)} mr-1`}
                          ></i>
                          {getDifficultyLabel(topic.difficulty)}
                        </div>
                      </div>

                      {/* Название темы */}
                      <h3 className="text-xl font-bold mb-6">{topic.title}</h3>

                      {/* Прогресс-бар */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-text-dim">Прогресс</span>
                          <span className="font-semibold text-accent-blue">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              completed
                                ? "bg-accent-green"
                                : "bg-linear-to-r from-accent-blue to-accent-purple"
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Кнопка действия */}
                      <div className="mt-auto">
                        {locked ? (
                          <button
                            className="w-full px-4 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-dim cursor-not-allowed flex items-center justify-center gap-2"
                            disabled
                          >
                            <i className="fas fa-lock"></i>
                            Заблокировано
                          </button>
                        ) : (
                          <Link
                            href={getTopicHref(topic)}
                            className={`w-full px-4 py-3 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                              completed
                                ? "bg-accent-green/20 text-accent-green border border-accent-green hover:bg-accent-green/30"
                                : "bg-linear-to-r from-accent-blue to-accent-purple text-white hover:shadow-neon-purple"
                            }`}
                          >
                            <i className="fas fa-play-circle"></i>
                            {completed
                              ? "Повторить"
                              : progress > 0
                                ? "Продолжить"
                                : "Начать"}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ДОСТИЖЕНИЯ */}
          <section className="my-16">
            <h2 className="text-3xl font-bold mb-4">Последние достижения</h2>
            <p className="text-text-dim mb-8">Ваши последние успехи</p>

            {unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-xl border text-center transition-all duration-300 hover:border-accent-yellow bg-gradient-to-br from-accent-blue/10 to-accent-purple/10"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-2xl mb-3">
                      <i className={`fas ${achievement.icon}`} />
                    </div>
                    <h4 className="font-semibold text-sm">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-text-dim">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card rounded-xl border border-glass-border">
                <i className="fas fa-trophy text-5xl text-text-dim mb-4"></i>
                <p className="text-text-dim">
                  Пока нет достижений — начни обучение, чтобы получить первые
                  награды!
                </p>
                <Link
                  href="/topics"
                  className="inline-block mt-4 px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors"
                >
                  Начать обучение
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
