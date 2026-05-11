"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const router = useRouter();

  // Форма входа
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Форма регистрации
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    // Имитация успешного входа
    alert("Успешный вход! Перенаправление на главную страницу...");
    router.push("/");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !registerForm.username ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    if (!termsAgreed) {
      alert("Необходимо согласиться с условиями использования");
      return;
    }

    // Имитация успешной регистрации
    alert("Регистрация прошла успешно! Теперь вы можете войти в систему.");
    setActiveTab("login");
    // Сброс формы
    setRegisterForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 0.5s ease;
        }

        .auth-side-img {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 200px;
          border-radius: 10px;
          border: 2px solid var(--accent-blue);
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          margin-top: 30px;
        }
      `}</style>

      {/* Основной контент */}
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="glass-card rounded-2xl overflow-hidden border border-glass-border shadow-neon-blue backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row">
                {/* Левая часть - приветствие */}
                <div className="lg:w-1/2 p-8 lg:p-12 bg-linear-to-br from-accent-blue/10 to-accent-purple/10">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-6 gradient-text">
                    Присоединяйся к сообществу
                  </h2>
                  <p className="text-text-dim mb-8 leading-relaxed">
                    Изучай HTML и CSS в игровой форме, проходи уровни, сражайся
                    с боссами и отслеживай свой прогресс. Стань мастером верстки
                    вместе с CodeDuolingo!
                  </p>

                  <div className="auth-side-img">
                    <div className="text-center p-4">
                      <i className="fas fa-laptop-code text-5xl mb-4"></i>
                      <p>Изучай кодинг с удовольствием!</p>
                    </div>
                  </div>
                </div>

                {/* Правая часть - формы */}
                <div className="lg:w-1/2 p-8 lg:p-12">
                  {/* Табы */}
                  <div className="flex border-b border-glass-border mb-8">
                    <button
                      onClick={() => setActiveTab("login")}
                      className={`flex-1 py-4 text-center font-medium transition-all duration-300 ${
                        activeTab === "login"
                          ? "text-accent-blue border-b-2 border-accent-blue"
                          : "text-text-dim hover:text-text-light"
                      }`}
                    >
                      Вход
                    </button>
                    <button
                      onClick={() => setActiveTab("register")}
                      className={`flex-1 py-4 text-center font-medium transition-all duration-300 ${
                        activeTab === "register"
                          ? "text-accent-blue border-b-2 border-accent-blue"
                          : "text-text-dim hover:text-text-light"
                      }`}
                    >
                      Регистрация
                    </button>
                  </div>

                  {/* Форма входа */}
                  <form
                    onSubmit={handleLoginSubmit}
                    className={`space-y-6 ${activeTab === "login" ? "block fade-in" : "hidden"}`}
                  >
                    <div>
                      <label
                        htmlFor="login-email"
                        className="block mb-2 font-medium"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="login-email"
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, email: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-secondary-dark/70 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue focus:shadow-neon-blue transition-all duration-300"
                        placeholder="Введите ваш email"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="login-password"
                        className="block mb-2 font-medium"
                      >
                        Пароль
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          id="login-password"
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              password: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-secondary-dark/70 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue focus:shadow-neon-blue transition-all duration-300 pr-12"
                          placeholder="Введите ваш пароль"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-text-light transition-colors duration-300"
                        >
                          <i
                            className={`far ${showLoginPassword ? "fa-eye-slash" : "fa-eye"}`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 accent-accent-blue"
                        />
                        <span className="text-text-dim">Запомнить меня</span>
                      </label>
                      <button
                        type="button"
                        className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-300"
                      >
                        Забыли пароль?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:shadow-neon-purple hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Войти
                    </button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-glass-border"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-primary-dark text-text-dim">
                          или войти с помощью
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="py-3 border border-glass-border rounded-lg flex items-center justify-center space-x-2 hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 text-text-dim hover:text-text-light"
                      >
                        <i className="fab fa-google text-red-400"></i>
                        <span>Google</span>
                      </button>
                      <button
                        type="button"
                        className="py-3 border border-glass-border rounded-lg flex items-center justify-center space-x-2 hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 text-text-dim hover:text-text-light"
                      >
                        <i className="fab fa-github"></i>
                        <span>GitHub</span>
                      </button>
                    </div>

                    <div className="text-center text-text-dim">
                      Нет аккаунта?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("register")}
                        className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-300"
                      >
                        Зарегистрируйтесь
                      </button>
                    </div>
                  </form>

                  {/* Форма регистрации */}
                  <form
                    onSubmit={handleRegisterSubmit}
                    className={`space-y-6 ${activeTab === "register" ? "block fade-in" : "hidden"}`}
                  >
                    <div>
                      <label
                        htmlFor="register-username"
                        className="block mb-2 font-medium"
                      >
                        Имя пользователя
                      </label>
                      <input
                        type="text"
                        id="register-username"
                        value={registerForm.username}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            username: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-secondary-dark/70 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue focus:shadow-neon-blue transition-all duration-300"
                        placeholder="Придумайте имя пользователя"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="register-email"
                        className="block mb-2 font-medium"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="register-email"
                        value={registerForm.email}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-secondary-dark/70 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue focus:shadow-neon-blue transition-all duration-300"
                        placeholder="Введите ваш email"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="register-password"
                        className="block mb-2 font-medium"
                      >
                        Пароль
                      </label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          id="register-password"
                          value={registerForm.password}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              password: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-secondary-dark/70 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue focus:shadow-neon-blue transition-all duration-300 pr-12"
                          placeholder="Придумайте пароль"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword(!showRegisterPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-text-light transition-colors duration-300"
                        >
                          <i
                            className={`far ${showRegisterPassword ? "fa-eye-slash" : "fa-eye"}`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="register-password-confirm"
                        className="block mb-2 font-medium"
                      >
                        Подтверждение пароля
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="register-password-confirm"
                          value={registerForm.confirmPassword}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-secondary-dark/70 border border-glass-border rounded-lg text-text-light focus:outline-none focus:border-accent-blue focus:shadow-neon-blue transition-all duration-300 pr-12"
                          placeholder="Повторите пароль"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-text-light transition-colors duration-300"
                        >
                          <i
                            className={`far ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    <label className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="w-4 h-4 mt-1 accent-accent-blue"
                        required
                      />
                      <span className="text-text-dim text-sm">
                        Я согласен с{" "}
                        <button
                          type="button"
                          className="text-accent-blue hover:text-accent-blue/80"
                        >
                          условиями использования
                        </button>{" "}
                        и{" "}
                        <button
                          type="button"
                          className="text-accent-blue hover:text-accent-blue/80"
                        >
                          политикой конфиденциальности
                        </button>
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="w-full py-3 bg-linear-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:shadow-neon-purple hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Зарегистрироваться
                    </button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-glass-border"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-primary-dark text-text-dim">
                          или зарегистрироваться с помощью
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="py-3 border border-glass-border rounded-lg flex items-center justify-center space-x-2 hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 text-text-dim hover:text-text-light"
                      >
                        <i className="fab fa-google text-red-400"></i>
                        <span>Google</span>
                      </button>
                      <button
                        type="button"
                        className="py-3 border border-glass-border rounded-lg flex items-center justify-center space-x-2 hover:border-accent-blue hover:bg-accent-blue/5 transition-all duration-300 text-text-dim hover:text-text-light"
                      >
                        <i className="fab fa-github"></i>
                        <span>GitHub</span>
                      </button>
                    </div>

                    <div className="text-center text-text-dim">
                      Уже есть аккаунт?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-300"
                      >
                        Войдите
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
