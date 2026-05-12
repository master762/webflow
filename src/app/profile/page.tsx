"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface TopicProgress {
  title: string;
  percent: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Алексей Жуков");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(true);
  const [language, setLanguage] = useState("Русский");
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  // Константы для профиля
  const rank = "Мастер верстки";
  const bio =
    "Изучаю веб-разработку с 2022 года. Люблю создавать красивые и функциональные интерфейсы. На платформе CodeDuolingo уже 3 месяца.";
  const streak = 42;
  const topicsCompleted = 8;
  const totalXP = 1245;
  const level = 12;
  const xpToNextLevel = 255;
  const currentXp = 1245;

  // Прогресс по темам
  const topicsProgress: TopicProgress[] = [
    { title: "Основы HTML", percent: 100 },
    { title: "Основы CSS", percent: 90 },
    { title: "Flexbox", percent: 70 },
    { title: "CSS Grid", percent: 40 },
    { title: "Адаптивный дизайн", percent: 20 },
  ];

  // Достижения
  const achievements: Achievement[] = [
    {
      id: 1,
      title: "Первые шаги",
      description: "Завершил 5 уроков",
      icon: "fa-rocket",
      unlocked: true,
    },
    {
      id: 2,
      title: "Скоростное обучение",
      description: "3 урока за день",
      icon: "fa-bolt",
      unlocked: true,
    },
    {
      id: 3,
      title: "Мастер HTML",
      description: "Завершил HTML",
      icon: "fa-code",
      unlocked: true,
    },
    {
      id: 4,
      title: "Серия побед",
      description: "10 заданий без ошибок",
      icon: "fa-fire",
      unlocked: true,
    },
    {
      id: 5,
      title: "Неделя усердия",
      description: "7 дней подряд",
      icon: "fa-calendar",
      unlocked: true,
    },
    {
      id: 6,
      title: "Мастер верстки",
      description: "Все темы CSS",
      icon: "fa-crown",
      unlocked: false,
    },
    {
      id: 7,
      title: "Легенда платформы",
      description: "100 дней подряд",
      icon: "fa-gem",
      unlocked: false,
    },
    {
      id: 8,
      title: "Бесконечное обучение",
      description: "Все материалы",
      icon: "fa-infinity",
      unlocked: false,
    },
  ];

  // Ежедневные цели
  const dailyGoal = {
    completed: 3,
    total: 4,
    percent: 75,
    xpToday: 150,
  };

  // Активность за неделю
  const weeklyActivity = [
    { day: "ПН", value: 80 },
    { day: "ВТ", value: 60 },
    { day: "СР", value: 90 },
    { day: "ЧТ", value: 70 },
    { day: "ПТ", value: 95 },
    { day: "СБ", value: 50 },
    { day: "ВС", value: 30 },
  ];

  // Показать сообщение
  const showMessage = useCallback(
    (text: string, type: "success" | "error" | "info") => {
      const id = messageIdCounter + 1;
      setMessageIdCounter(id);
      setMessages((prev) => [...prev, { id, text, type }]);

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 3000);
    },
    [messageIdCounter],
  );

  // Обработчики действий
  const handleEditProfile = useCallback(() => {
    const newName = prompt("Введите новое имя:", userName);
    if (newName && newName.trim() !== "") {
      setUserName(newName);
      showMessage("Имя профиля обновлено", "success");
    }
  }, [userName, showMessage]);

  const handleShareProfile = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Мой профиль на CodeDuolingo",
          text: "Посмотрите мой прогресс в изучении HTML и CSS на CodeDuolingo!",
          url: window.location.href,
        });
        showMessage("Профиль успешно отправлен!", "success");
      } catch (err) {
        console.log("Ошибка при попытке поделиться:", err);
      }
    } else {
      // Fallback для браузеров без поддержки Web Share API
      const profileUrl = window.location.href;
      try {
        await navigator.clipboard.writeText(profileUrl);
        showMessage("Ссылка на профиль скопирована в буфер обмена!", "info");
      } catch (err) {
        showMessage("Не удалось скопировать ссылку", "error");
      }
    }
  }, [showMessage]);

  const handleToggleNotifications = useCallback(() => {
    setNotificationsEnabled(!notificationsEnabled);
    showMessage(
      `Уведомления ${!notificationsEnabled ? "включены" : "выключены"}`,
      "info",
    );
  }, [notificationsEnabled, showMessage]);

  const handleToggleTheme = useCallback(() => {
    setDarkThemeEnabled(!darkThemeEnabled);
    showMessage(
      `Темная тема ${!darkThemeEnabled ? "включена" : "выключена"}`,
      "info",
    );
  }, [darkThemeEnabled, showMessage]);

  const handleChangeLanguage = useCallback(() => {
    const languages = ["Русский", "English", "Español", "Deutsch"];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
    showMessage(`Язык изменен на ${languages[nextIndex]}`, "info");
  }, [language, showMessage]);

  const handleSecuritySettings = useCallback(() => {
    const newPassword = prompt("Введите новый пароль (минимум 8 символов):");
    if (newPassword && newPassword.length >= 8) {
      showMessage("Пароль успешно изменен!", "success");
    } else if (newPassword) {
      showMessage("Пароль слишком короткий. Минимум 8 символов.", "error");
    }
  }, [showMessage]);

  const handleExportData = useCallback(() => {
    showMessage(
      "Подготовка данных для экспорта... Это может занять несколько секунд.",
      "info",
    );

    setTimeout(() => {
      const exportData = {
        user: userName,
        level,
        xp: totalXP,
        topicsCompleted,
        streak,
        achievements: achievements.filter((a) => a.unlocked).length,
        joined: "2023-01-15",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const link = document.createElement("a");
      link.setAttribute("href", dataUri);
      link.setAttribute("download", "codeduolingo-progress.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showMessage("Данные успешно экспортированы!", "success");
    }, 1500);
  }, [userName, achievements, showMessage]);

  const handleLogout = useCallback(async () => {
    if (confirm("Вы уверены, что хотите выйти из аккаунта?")) {
      await signOut({ callbackUrl: "/" });
    }
  }, []);

  const handleAchievementClick = useCallback(
    (achievement: Achievement) => {
      if (!achievement.unlocked) {
        alert(
          `Достижение &quot;${achievement.title}&quot; заблокировано.\n\nОписание: ${achievement.description}\n\nПродолжайте обучение, чтобы разблокировать это достижение!`,
        );
      } else {
        showMessage(
          `Достижение: ${achievement.title} - ${achievement.description}`,
          "info",
        );
      }
    },
    [showMessage],
  );

  // Анимация при загрузке
  useEffect(() => {
    const progressBars = document.querySelectorAll(".progress-animate");
    progressBars.forEach((bar, index) => {
      setTimeout(
        () => {
          const targetWidth = bar.getAttribute("data-width");
          if (bar instanceof HTMLElement) {
            bar.style.width = targetWidth || "0%";
          }
        },
        index * 200 + 500,
      );
    });

    const levelFill = document.querySelector(".level-animate");
    if (levelFill) {
      setTimeout(() => {
        const targetWidth = levelFill.getAttribute("data-width");
        if (levelFill instanceof HTMLElement) {
          levelFill.style.width = targetWidth || "0%";
        }
      }, 800);
    }
  }, []);

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

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Сообщения */}
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
        {/* Шапка профиля */}
        <div className="my-8 p-8 glass-card rounded-2xl relative overflow-hidden border border-glass-border">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-accent-blue to-accent-purple"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Аватар */}
            <div className="relative">
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-4xl md:text-5xl font-bold text-white border-4 border-accent-blue shadow-lg shadow-accent-blue/30">
                AJ
              </div>
            </div>

            {/* Информация профиля */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {userName}
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-accent-purple to-purple-700 text-white rounded-full font-semibold mb-4 border border-accent-purple shadow-lg shadow-accent-purple/30">
                <i className="fas fa-crown"></i>
                <span>{rank}</span>
              </div>

              <p className="text-text-dim text-lg mb-6 max-w-2xl">{bio}</p>

              {/* Статистика */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="px-6 py-4 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-green transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl font-bold text-accent-green">
                    {streak}
                  </div>
                  <div className="text-sm text-text-dim">Дней подряд</div>
                </div>
                <div className="px-6 py-4 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-blue transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl font-bold text-accent-blue">
                    {topicsCompleted}
                  </div>
                  <div className="text-sm text-text-dim">Тем завершено</div>
                </div>
                <div className="px-6 py-4 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-purple transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl font-bold text-accent-purple">
                    {totalXP.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-dim">Всего XP</div>
                </div>
              </div>
            </div>

            {/* Действия */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleEditProfile}
                className="px-6 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-edit"></i>
                <span>Редактировать</span>
              </button>
              <button
                onClick={handleShareProfile}
                className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-lg hover:shadow-accent-purple/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-share-alt"></i>
                <span>Поделиться</span>
              </button>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Левая колонка - Прогресс */}
          <div className="lg:col-span-2 space-y-6">
            {/* Прогресс по темам */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-chart-line text-accent-blue"></i>
                <span>Прогресс по темам</span>
              </h3>

              <div className="space-y-5">
                {topicsProgress.map((topic, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{topic.title}</span>
                      <span className="text-accent-blue font-semibold">
                        {topic.percent}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r progress-animate"
                        data-width={`${topic.percent}%`}
                        style={{
                          backgroundImage: `linear-gradient(to right, var(--accent-blue), var(--accent-purple))`,
                          width: "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Активность за неделю */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-calendar-alt text-accent-blue"></i>
                <span>Активность за неделю</span>
              </h3>

              <div className="h-48 flex items-end justify-between gap-2">
                {weeklyActivity.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className="w-full rounded-t-lg bg-linear-to-t from-accent-blue to-accent-purple transition-all duration-300 hover:opacity-80"
                      style={{ height: `${item.value}%` }}
                      title={`${item.value}% активности`}
                    ></div>
                    <div className="text-sm text-text-dim mt-2">{item.day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Достижения */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-trophy text-accent-yellow"></i>
                <span>Достижения</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <button
                    key={achievement.id}
                    onClick={() => handleAchievementClick(achievement)}
                    className={`p-4 rounded-xl border border-glass-border text-center transition-all duration-300 cursor-pointer ${
                      achievement.unlocked
                        ? "hover:border-accent-yellow hover:shadow-lg hover:shadow-accent-yellow/20"
                        : "opacity-50 grayscale"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-2xl mb-3`}
                    >
                      <i className={`fas ${achievement.icon}`}></i>
                    </div>
                    <h4 className="font-semibold mb-1 text-sm">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-text-dim">
                      {achievement.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка - Боковая панель */}
          <div className="space-y-6">
            {/* Ежедневная цель */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <i className="fas fa-bullseye text-accent-green"></i>
                  <span>Ежедневная цель</span>
                </h3>
                <span className="text-accent-green font-semibold">
                  {dailyGoal.percent}%
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-8 border-white/10"></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-transparent"
                    style={{
                      borderTopColor: "var(--accent-green)",
                      borderRightColor: "var(--accent-green)",
                      transform: `rotate(${dailyGoal.percent * 3.6}deg)`,
                      transition: "transform 1s ease",
                    }}
                  ></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-accent-green">
                      {dailyGoal.percent}%
                    </div>
                    <div className="text-sm text-text-dim">Выполнено</div>
                  </div>
                </div>
                <p className="text-text-dim text-sm">
                  Выполнено {dailyGoal.completed} из {dailyGoal.total}{" "}
                  ежедневных целей
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-glass-border">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-green">
                    {dailyGoal.completed}
                  </div>
                  <div className="text-xs text-text-dim">Выполнено</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{dailyGoal.total}</div>
                  <div className="text-xs text-text-dim">Всего целей</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent-blue">
                    {dailyGoal.xpToday}
                  </div>
                  <div className="text-xs text-text-dim">XP за день</div>
                </div>
              </div>
            </div>

            {/* Уровень и ранг */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-arrow-up text-accent-blue"></i>
                <span>Уровень и ранг</span>
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-bold text-accent-blue">
                  {level}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{rank}</h4>
                  <p className="text-text-dim text-sm">
                    Следующий уровень через {xpToNextLevel} XP
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Текущий XP: {currentXp.toLocaleString()}</span>
                  <span>До след. уровня: {xpToNextLevel}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-accent-blue to-accent-purple level-animate"
                    data-width={`${(currentXp % 1000) / 10}%`}
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-accent-blue/5 rounded-lg border-l-4 border-accent-blue">
                <h4 className="font-semibold mb-2 text-accent-blue flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i>
                  <span>Совет для роста</span>
                </h4>
                <p className="text-sm text-text-dim">
                  Завершите тему &quot;CSS Grid&quot; до 80%, чтобы получить
                  бонусные 100 XP и быстрее перейти на следующий уровень.
                </p>
              </div>
            </div>

            {/* Настройки профиля */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-cog text-accent-blue"></i>
                <span>Настройки профиля</span>
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-glass-border">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-bell text-text-dim"></i>
                    <span>Уведомления</span>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    className="text-accent-blue hover:text-accent-purple transition-colors"
                  >
                    {notificationsEnabled ? "Включено" : "Выключено"}
                  </button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-glass-border">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-moon text-text-dim"></i>
                    <span>Темная тема</span>
                  </div>
                  <button
                    onClick={handleToggleTheme}
                    className="text-accent-blue hover:text-accent-purple transition-colors"
                  >
                    {darkThemeEnabled ? "Включена" : "Выключена"}
                  </button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-glass-border">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-language text-text-dim"></i>
                    <span>Язык</span>
                  </div>
                  <button
                    onClick={handleChangeLanguage}
                    className="text-accent-blue hover:text-accent-purple transition-colors"
                  >
                    {language}
                  </button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-glass-border">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-shield-alt text-text-dim"></i>
                    <span>Безопасность</span>
                  </div>
                  <button
                    onClick={handleSecuritySettings}
                    className="text-accent-blue hover:text-accent-purple transition-colors"
                  >
                    Изменить пароль
                  </button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-glass-border">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-download text-text-dim"></i>
                    <span>Экспорт данных</span>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="text-accent-blue hover:text-accent-purple transition-colors"
                  >
                    Скачать прогресс
                  </button>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-sign-out-alt text-accent-red"></i>
                    <span>Выход</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-accent-red hover:text-red-400 transition-colors"
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
