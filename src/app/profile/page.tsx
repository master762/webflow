"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

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

interface WeeklyActivity {
  day: string;
  value: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  username: string | null;
  bio: string;
  avatar: string;
  title: string;
  xp: number;
  level: number;
  streak: number;
  topicsCompleted: number;
  topicsProgress: TopicProgress[];
  achievements: Achievement[];
  weeklyActivity: WeeklyActivity[];
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  // Функция показа сообщений (должна быть объявлена первой)
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

  // Функция загрузки данных (объявляем после showMessage)
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();

      const parsedData: UserData = {
        ...data,
        topicsProgress: JSON.parse(data.topicsProgress || "[]"),
        achievements: JSON.parse(data.achievements || "[]"),
        weeklyActivity: JSON.parse(data.weeklyActivity || "[]").map(
          (item: { day: string; value: number }) => ({
            day: item.day,
            value: Number(item.value),
          }),
        ),
      };
      setUserData(parsedData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      showMessage("Ошибка загрузки данных профиля", "error");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session, status, router, fetchUserData]);

  // Остальные обработчики
  const handleEditProfile = useCallback(async () => {
    const newName = prompt("Введите новое имя:", userData?.name);
    if (newName && newName.trim() !== "") {
      try {
        const response = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });
        if (response.ok) {
          setUserData((prev) => (prev ? { ...prev, name: newName } : null));
          showMessage("Имя профиля обновлено", "success");
        } else {
          showMessage("Ошибка обновления имени", "error");
        }
      } catch {
        showMessage("Ошибка обновления имени", "error");
      }
    }
  }, [userData?.name, showMessage]);

  const handleShareProfile = useCallback(async () => {
    const profileUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Мой профиль на CodeDuolingo",
          text: "Посмотрите мой прогресс в изучении HTML и CSS!",
          url: profileUrl,
        });
        showMessage("Профиль успешно отправлен!", "success");
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(profileUrl);
        showMessage("Ссылка на профиль скопирована!", "info");
      } catch {
        showMessage("Не удалось скопировать ссылку", "error");
      }
    }
  }, [showMessage]);

  const handleExportData = useCallback(() => {
    if (!userData) return;
    showMessage("Подготовка данных для экспорта...", "info");
    setTimeout(() => {
      const exportData = {
        user: userData.name,
        email: userData.email,
        level: userData.level,
        xp: userData.xp,
        topicsCompleted: userData.topicsCompleted,
        streak: userData.streak,
        achievements: userData.achievements.filter((a) => a.unlocked).length,
        joined: userData.createdAt,
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
  }, [userData, showMessage]);

  const handleLogout = useCallback(async () => {
    if (confirm("Вы уверены, что хотите выйти из аккаунта?")) {
      await signOut({ callbackUrl: "/" });
    }
  }, []);

  const handleAchievementClick = useCallback(
    (achievement: Achievement) => {
      if (!achievement.unlocked) {
        alert(
          `Достижение "${achievement.title}" заблокировано.\n\nОписание: ${achievement.description}\n\nПродолжайте обучение, чтобы разблокировать это достижение!`,
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

  useEffect(() => {
    if (!loading && userData) {
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
      if (levelFill instanceof HTMLElement) {
        setTimeout(() => {
          const targetWidth = levelFill.getAttribute("data-width");
          levelFill.style.width = targetWidth || "0%";
        }, 800);
      }
    }
  }, [loading, userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-accent-blue mb-4"></i>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-primary-dark text-text-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent-red">Не удалось загрузить данные профиля</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-accent-blue text-white rounded-lg"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const xpToNextLevel = (userData.level + 1) * 100 - userData.xp;
  const currentLevelXp = userData.xp % 100;
  const levelProgress = (currentLevelXp / 100) * 100;

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

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Шапка профиля */}
        <div className="my-8 p-8 glass-card rounded-2xl relative overflow-hidden border border-glass-border">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-accent-blue to-accent-purple"></div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-4xl md:text-5xl font-bold text-white border-4 border-accent-blue shadow-lg shadow-accent-blue/30">
                {userData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {userData.name}
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-accent-purple to-purple-700 text-white rounded-full font-semibold mb-4 border border-accent-purple shadow-lg shadow-accent-purple/30">
                <i className="fas fa-crown"></i>
                <span>{userData.title}</span>
              </div>
              <p className="text-text-dim text-lg mb-6 max-w-2xl">
                {userData.bio}
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="px-6 py-4 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-green transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl font-bold text-accent-green">
                    {userData.streak}
                  </div>
                  <div className="text-sm text-text-dim">Дней подряд</div>
                </div>
                <div className="px-6 py-4 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-blue transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl font-bold text-accent-blue">
                    {userData.topicsCompleted}
                  </div>
                  <div className="text-sm text-text-dim">Тем завершено</div>
                </div>
                <div className="px-6 py-4 bg-secondary-dark/50 rounded-xl border border-glass-border hover:border-accent-purple transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl font-bold text-accent-purple">
                    {userData.xp.toLocaleString()}
                  </div>
                  <div className="text-sm text-text-dim">Всего XP</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleEditProfile}
                className="px-6 py-3 bg-secondary-dark/50 border border-glass-border rounded-lg text-text-light hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-edit"></i> Редактировать
              </button>
              <button
                onClick={handleShareProfile}
                className="px-6 py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-bold rounded-lg hover:shadow-lg hover:shadow-accent-purple/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-share-alt"></i> Поделиться
              </button>
            </div>
          </div>
        </div>

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
                {userData.topicsProgress.length === 0 ? (
                  <p className="text-text-dim text-sm">
                    Прогресса по темам пока нет. Начни обучение, чтобы он
                    появился
                  </p>
                ) : (
                  userData.topicsProgress.map((topic, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{topic.title}</span>
                        <span className="text-accent-blue font-semibold">
                          {topic.percent}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full progress-animate"
                          data-width={`${topic.percent}%`}
                          style={{
                            backgroundImage:
                              "linear-gradient(to right, var(--accent-blue), var(--accent-purple))",
                            width: "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Активность за неделю */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-calendar-alt text-accent-blue"></i>
                <span>Активность за неделю (минуты)</span>
              </h3>
              <div className="flex items-end justify-between gap-2 h-64 bg-secondary-dark/20 rounded-lg p-2">
                {userData.weeklyActivity.length === 0 ? (
                  <p className="text-text-dim text-sm w-full text-center">
                    Нет данных
                  </p>
                ) : (
                  (() => {
                    const maxValue = Math.max(
                      ...userData.weeklyActivity.map((v) => v.value),
                    );
                    return userData.weeklyActivity.map((item, idx) => {
                      const barHeight =
                        maxValue > 0 ? (item.value / maxValue) * 200 : 0;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className="w-full bg-accent-blue rounded-t-lg transition-all duration-500"
                            style={{
                              height: `${barHeight}px`,
                              minHeight: item.value > 0 ? "4px" : "0px",
                            }}
                          />
                          <div className="text-sm text-text-dim mt-2">
                            {item.day}
                          </div>
                          <div className="text-xs text-accent-blue font-medium mt-1">
                            {item.value} мин
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>

            {/* Достижения */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-trophy text-accent-yellow"></i>
                <span>Достижения</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {userData.achievements.length === 0 ? (
                  <p className="text-text-dim text-sm col-span-4">
                    Достижений пока нет — продолжай обучение
                  </p>
                ) : (
                  userData.achievements.map((achievement) => (
                    <button
                      key={achievement.id}
                      onClick={() => handleAchievementClick(achievement)}
                      className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                        achievement.unlocked
                          ? "hover:border-accent-yellow"
                          : "opacity-50 grayscale"
                      }`}
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
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Правая колонка - Боковая панель */}
          <div className="space-y-6">
            {/* Уровень и ранг */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-arrow-up text-accent-blue"></i>
                <span>Уровень и ранг</span>
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-bold text-accent-blue">
                  {userData.level}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{userData.title}</h4>
                  <p className="text-text-dim text-sm">
                    Следующий уровень через {xpToNextLevel} XP
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Текущий XP: {userData.xp.toLocaleString()}</span>
                  <span>До след. уровня: {xpToNextLevel}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-accent-blue to-accent-purple level-animate"
                    data-width={`${levelProgress}%`}
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>

            {/* Настройки профиля (только экспорт и выход) */}
            <div className="glass-card rounded-xl p-6 border border-glass-border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <i className="fas fa-cog text-accent-blue"></i>
                <span>Настройки профиля</span>
              </h3>
              <div className="space-y-4">
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
