"use client";

import { useEffect } from "react";
import TopicCard from "@/app/components/TopicCard";
import AchievementCard from "@/app/components/AchievementCard";
import Link from "next/link";

export default function Home() {
  const topics = [
    {
      id: "flexbox",
      title: "Flexbox",
      icon: "fas fa-boxes",
      description:
        "Изучи гибкую модель разметки Flexbox для создания адаптивных макетов",
      progress: 70,
      lessonsCompleted: 7,
      totalLessons: 10,
      isBoss: false,
    },
    {
      id: "grid",
      title: "CSS Grid",
      icon: "fas fa-th",
      description:
        "Освой двумерную систему компоновки Grid для сложных макетов",
      progress: 40,
      lessonsCompleted: 4,
      totalLessons: 10,
      isBoss: false,
    },
    {
      id: "animations",
      title: "Анимации CSS",
      icon: "fas fa-magic",
      description:
        "Создавай плавные переходы и анимации для улучшения пользовательского опыта",
      progress: 20,
      lessonsCompleted: 2,
      totalLessons: 10,
      isBoss: false,
    },
    {
      id: "boss",
      title: "Верстка интернет-магазина",
      icon: "fas fa-crown",
      description:
        "Босс-уровень: сверстай главную страницу интернет-магазина с нуля",
      progress: 0,
      lessonsCompleted: 0,
      totalLessons: 1,
      isBoss: true,
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "Первые шаги",
      description: "Завершил 5 уроков по основам HTML",
      icon: "fas fa-rocket",
    },
    {
      id: 2,
      title: "Скоростное обучение",
      description: "Прошел 3 урока за один день",
      icon: "fas fa-bolt",
    },
    {
      id: 3,
      title: "Мастер Flexbox",
      description: "Завершил все уроки по Flexbox",
      icon: "fas fa-code",
    },
    {
      id: 4,
      title: "Серия побед",
      description: "Выполнил 10 заданий подряд без ошибок",
      icon: "fas fa-fire",
    },
  ];

  useEffect(() => {
    const progressBars = document.querySelectorAll(".progress-fill");
    progressBars.forEach((bar) => {
      const element = bar as HTMLElement;
      const width = element.style.width;
      element.style.width = "0%";
      setTimeout(() => {
        element.style.width = width;
      }, 300);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Герой-секция */}
      <section className="text-center my-16 py-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
          Изучай HTML/CSS как в игре
        </h1>
        <p className="text-lg text-text-dim max-w-3xl mx-auto mb-8 leading-relaxed">
          Прокачивай навыки веб-разработки, проходя уровни, сражайся с боссами и
          отслеживай прогресс. Начни свой путь к мастерству верстки прямо
          сейчас!
        </p>
        <Link
          href="/topics"
          className="inline-block px-8 py-4 gradient-bg text-white font-semibold rounded-lg shadow-lg hover:shadow-neon-purple hover:-translate-y-1 transition-all duration-300 animate-pulse no-underline"
        >
          Начать обучение
        </Link>
      </section>

      {/* Текущий прогресс */}
      <h2 className="text-3xl md:text-4xl font-bold text-text-light mb-4">
        Текущий прогресс
      </h2>
      <p className="text-lg text-text-dim mb-8">
        Продолжай изучать темы, над которыми работал в последний раз
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>

      {/* Достижения */}
      <section className="my-16">
        <h2 className="text-3xl md:text-4xl font-bold text-text-light mb-4">
          Последние достижения
        </h2>
        <p className="text-lg text-text-dim mb-8">
          Ваши последние успехи в изучении HTML и CSS
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </section>
    </div>
  );
}
