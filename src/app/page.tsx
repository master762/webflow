"use client";

import { useEffect, useMemo, useState } from "react";
import TopicCard from "@/app/components/TopicCard";
import AchievementCard from "@/app/components/AchievementCard";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Topic {
  id: string;
  title: string;
  icon: string;
  description: string;
  isBoss: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface UserProgress {
  topicsProgress: { title: string; percent: number }[];
  achievements: Achievement[];
}

export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const load = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) return;

        const data = await res.json();

        setUserProgress({
          topicsProgress: JSON.parse(data.topicsProgress || "[]"),
          achievements: JSON.parse(data.achievements || "[]"),
        });
      } catch (e) {
        console.log("no progress");
      }
    };

    load();
  }, [isLoggedIn]);

  const topics: Topic[] = useMemo(
    () => [
      {
        id: "flexbox",
        title: "Flexbox",
        icon: "fas fa-boxes",
        description: "Изучи Flexbox",
        isBoss: false,
      },
      {
        id: "grid",
        title: "CSS Grid",
        icon: "fas fa-th",
        description: "Освой Grid",
        isBoss: false,
      },
      {
        id: "animations",
        title: "Анимации CSS",
        icon: "fas fa-magic",
        description: "Анимации",
        isBoss: false,
      },
      {
        id: "boss",
        title: "Интернет-магазин",
        icon: "fas fa-crown",
        description: "Босс уровень",
        isBoss: true,
      },
    ],
    [],
  );

  const getProgress = (title: string) => {
    if (!userProgress) return 0;

    const found = userProgress.topicsProgress.find((t) => t.title === title);

    return found?.percent ?? 0;
  };

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
          href={isLoggedIn ? "/topics" : "/auth/register"}
          className="inline-block px-8 py-4 gradient-bg text-white font-semibold rounded-lg shadow-lg hover:-translate-y-1 transition-all"
        >
          Начать обучение
        </Link>
      </section>

      {/* 🚫 если нет сессии — только hero */}
      {!isLoggedIn ? null : (
        <>
          {/* ПРОГРЕСС */}
          <h2 className="text-3xl font-bold mb-2">Текущий прогресс</h2>
          <p className="text-text-dim mb-8">
            Продолжай обучение с того места, где остановился
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
            {topics.map((topic) => {
              const progress = getProgress(topic.title);

              return (
                <TopicCard
                  key={topic.id}
                  topic={{
                    ...topic,
                    progress,
                    lessonsCompleted: Math.round(progress / 10),
                    totalLessons: 10,
                  }}
                />
              );
            })}
          </div>

          {/* ДОСТИЖЕНИЯ */}
          <section className="my-16">
            <h2 className="text-3xl font-bold mb-4">Последние достижения</h2>
            <p className="text-text-dim mb-8">Ваши последние успехи</p>

            {userProgress?.achievements?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userProgress.achievements.map((a) => (
                  <AchievementCard key={a.id} achievement={a} />
                ))}
              </div>
            ) : (
              <p className="text-text-dim text-center">
                Пока нет достижений — начни обучение 🚀
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
