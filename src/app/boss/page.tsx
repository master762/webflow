"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function BossPage() {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechStore - Интернет-магазин электроники</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Ваш код здесь -->
    <header class="header">
        <div class="container">
            <div class="logo">
                <i class="fas fa-laptop-code"></i>
                <span>TechStore</span>
            </div>
            
            <nav class="nav">
                <ul class="nav-list">
                    <li><a href="#">Главная</a></li>
                    <li><a href="#">Каталог</a></li>
                    <li><a href="#">Акции</a></li>
                    <li><a href="#">Доставка</a></li>
                    <li><a href="#">Контакты</a></li>
                </ul>
            </nav>
            
            <div class="header-actions">
                <button class="btn-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">3</span>
                </button>
                <button class="btn-login">
                    <i class="fas fa-user"></i>
                    Войти
                </button>
            </div>
        </div>
    </header>
    
    <main class="main">
        <section class="hero">
            <div class="container">
                <h1>Новые поступления</h1>
                <p>Современные гаджеты по лучшим ценам</p>
                <button class="btn-primary">Смотреть каталог</button>
            </div>
        </section>
        
        <section class="products">
            <div class="container">
                <h2 class="section-title">Популярные товары</h2>
                
                <div class="products-grid">
                    <!-- Товары будут здесь -->
                </div>
            </div>
        </section>
        
        <section class="features">
            <div class="container">
                <h2 class="section-title">Почему выбирают нас</h2>
                
                <div class="features-grid">
                    <!-- Преимущества будут здесь -->
                </div>
            </div>
        </section>
    </main>
    
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <!-- Футер будет здесь -->
            </div>
        </div>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`);

  const [cssCode, setCssCode] =
    useState(`/* Стили для интернет-магазина TechStore */

/* Сброс и базовые стили */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Шапка сайта */
.header {
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
}

.logo {
    display: flex;
    align-items: center;
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
}

.logo i {
    color: #3498db;
    margin-right: 10px;
    font-size: 2rem;
}

.nav-list {
    display: flex;
    list-style: none;
    gap: 30px;
}

.nav-list a {
    text-decoration: none;
    color: #2c3e50;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-list a:hover {
    color: #3498db;
}

.header-actions {
    display: flex;
    gap: 15px;
    align-items: center;
}

.btn-cart {
    position: relative;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #2c3e50;
    cursor: pointer;
}

.cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #e74c3c;
    color: white;
    font-size: 0.8rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-login {
    padding: 8px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-login:hover {
    background-color: #2980b9;
}

/* Основной контент */
.hero {
    background: linear-gradient(135deg, #3498db, #2c3e50);
    color: white;
    padding: 80px 0;
    text-align: center;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 15px;
}

.hero p {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
}

.btn-primary {
    padding: 12px 30px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-primary:hover {
    background-color: #c0392b;
}

/* Сетка товаров */
.products {
    padding: 80px 0;
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 50px;
    color: #2c3e50;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
}

/* Адаптивность */
@media (max-width: 768px) {
    .header .container {
        flex-direction: column;
        gap: 15px;
    }
    
    .nav-list {
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;
    }
    
    .hero h1 {
        font-size: 2.2rem;
    }
    
    .products-grid {
        grid-template-columns: 1fr;
    }
}`);

  const [jsCode, setJsCode] =
    useState(`// JavaScript для интернет-магазина TechStore

document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница интернет-магазина загружена');
    
    // Инициализация корзины
    let cart = [];
    const cartCountElement = document.querySelector('.cart-count');
    
    // Данные товаров
    const products = [
        {
            id: 1,
            name: 'Ноутбук Gaming Pro',
            price: 89990,
            image: 'laptop.jpg',
            category: 'Ноутбуки'
        },
        {
            id: 2,
            name: 'Смартфон Ultra X',
            price: 54990,
            image: 'phone.jpg',
            category: 'Смартфоны'
        },
        {
            id: 3,
            name: 'Наушники SoundMax',
            price: 12990,
            image: 'headphones.jpg',
            category: 'Аксессуары'
        },
        {
            id: 4,
            name: 'Планшет Tab Pro',
            price: 42990,
            image: 'tablet.jpg',
            category: 'Планшеты'
        },
        {
            id: 5,
            name: 'Умные часы Watch 3',
            price: 19990,
            image: 'watch.jpg',
            category: 'Гаджеты'
        },
        {
            id: 6,
            name: 'Игровая консоль GameBox',
            price: 32990,
            image: 'console.jpg',
            category: 'Консоли'
        }
    ];
    
    // Данные преимуществ
    const features = [
        {
            icon: 'fa-truck',
            title: 'Бесплатная доставка',
            description: 'При заказе от 5000 рублей'
        },
        {
            icon: 'fa-shield-alt',
            title: 'Гарантия 2 года',
            description: 'На всю технику'
        },
        {
            icon: 'fa-headset',
            title: 'Поддержка 24/7',
            description: 'Круглосуточная техподдержка'
        },
        {
            icon: 'fa-credit-card',
            title: 'Удобная оплата',
            description: 'Наличные, карты, рассрочка'
        }
    ];
    
    // Функция для генерации карточек товаров
    function generateProductCards() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = \`
                <div class="product-image">
                    <img src="/image.jpg" alt="\${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">\${product.name}</h3>
                    <p class="product-category">\${product.category}</p>
                    <p class="product-price">\${product.price.toLocaleString()} ₽</p>
                    <button class="btn-add-to-cart" data-id="\${product.id}">
                        <i class="fas fa-cart-plus"></i> В корзину
                    </button>
                </div>
            \`;
            
            productsGrid.appendChild(productCard);
        });
        
        // Добавляем обработчики для кнопок "В корзину"
        document.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
            });
        });
    }
    
    // Функция для генерации преимуществ
    function generateFeatures() {
        const featuresGrid = document.querySelector('.features-grid');
        if (!featuresGrid) return;
        
        featuresGrid.innerHTML = '';
        
        features.forEach(feature => {
            const featureCard = document.createElement('div');
            featureCard.className = 'feature-card';
            featureCard.innerHTML = \`
                <div class="feature-icon">
                    <i class="fas \${feature.icon}"></i>
                </div>
                <h3 class="feature-title">\${feature.title}</h3>
                <p class="feature-description">\${feature.description}</p>
            \`;
            
            featuresGrid.appendChild(featureCard);
        });
    }
    
    // Функция добавления товара в корзину
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        cart.push(product);
        updateCartCount();
        
        // Показываем уведомление
        showNotification(\`Товар "\${product.name}" добавлен в корзину!\`, 'success');
    }
    
    // Функция обновления счетчика корзины
    function updateCartCount() {
        if (cartCountElement) {
            cartCountElement.textContent = cart.length;
        }
    }
    
    // Функция показа уведомления
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = \`notification \${type}\`;
        notification.textContent = message;
        notification.style.cssText = \`
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            background-color: \${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        \`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Добавляем стили для анимации
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        \`;
        
        document.head.appendChild(style);
    }
    
    // Инициализация страницы
    generateProductCards();
    generateFeatures();
    updateCartCount();
    
    // Обработчик для кнопки "Смотреть каталог"
    const catalogButton = document.querySelector('.btn-primary');
    if (catalogButton) {
        catalogButton.addEventListener('click', function() {
            document.querySelector('.products').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Обработчик для кнопки корзины
    const cartButton = document.querySelector('.btn-cart');
    if (cartButton) {
        cartButton.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Ваша корзина пуста', 'error');
            } else {
                showNotification(\`В корзине \${cart.length} товаров на сумму \${cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()} ₽\`, 'success');
            }
        });
    }
});`);

  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 минут в секундах
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "success" | "error" | "info" }>
  >([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Показ сообщений
  const showMessage = useCallback(
    (text: string, type: "success" | "error" | "info") => {
      const id = Date.now();
      setMessages((prev) => [...prev, { id, text, type }]);

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 5000);
    },
    [],
  );

  // Таймер
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showMessage("Время на выполнение босс-уровня истекло!", "error");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showMessage]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Обновление предпросмотра
  const updatePreview = useCallback(() => {
    if (!previewRef.current) return;

    const iframe = previewRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <style>
            ${cssCode}
            
            /* Дополнительные стили для предпросмотра */
            .product-card {
              background: white;
              border-radius: 10px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              transition: transform 0.3s ease;
            }
            
            .product-card:hover {
              transform: translateY(-5px);
            }
            
            .product-image {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              height: 200px;
              border-radius: 8px;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 3rem;
            }
            
            .feature-card {
              background: white;
              border-radius: 10px;
              padding: 25px;
              text-align: center;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .feature-icon {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #3498db, #2c3e50);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              color: white;
              font-size: 1.5rem;
            }
            
            .footer {
              background: #2c3e50;
              color: white;
              padding: 40px 0;
              margin-top: 60px;
            }
            
            /* Заполнители для контента */
            .products-grid:empty::after,
            .features-grid:empty::after {
              content: "Здесь будут товары";
              display: block;
              text-align: center;
              padding: 40px;
              color: #666;
              background: #f9f9f9;
              border-radius: 10px;
              border: 2px dashed #ddd;
            }
          </style>
        </head>
        <body>
          ${htmlCode
            .replace("<!DOCTYPE html>", "")
            .replace('<html lang="ru">', "")
            .replace("</html>", "")
            .replace("<head>", "")
            .replace("</head>", "")
            .replace("<body>", "")
            .replace("</body>", "")}
          <script>${jsCode.replace(/\\/g, "\\\\")}<\/script>
        </body>
        </html>
      `);
      iframeDoc.close();
    }
  }, [htmlCode, cssCode, jsCode]);

  // Автоматическое обновление предпросмотра
  useEffect(() => {
    const timeout = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeout);
  }, [updatePreview]);

  // Функции действий
  const handleDownload = useCallback(() => {
    const projectContent = `=== index.html ===\n${htmlCode}\n\n=== style.css ===\n${cssCode}\n\n=== script.js ===\n${jsCode}`;
    navigator.clipboard.writeText(projectContent).then(() => {
      showMessage("Содержимое проекта скопировано в буфер обмена!", "info");
    });
  }, [htmlCode, cssCode, jsCode, showMessage]);

  const handleHint = useCallback(() => {
    const hints = [
      "Используйте CSS Grid для основного макета страницы: grid-template-areas, grid-template-columns.",
      "Для навигации и карточек товаров используйте Flexbox.",
      "Не забудьте про медиа-запросы для мобильной версии.",
      "Используйте семантические теги HTML5: header, nav, main, section, article, footer.",
      "Добавьте hover-эффекты для интерактивных элементов.",
      "Создайте карточки товаров с изображением, названием, ценой и кнопкой 'В корзину'.",
    ];

    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    showMessage(`Подсказка: ${randomHint}`, "info");
  }, [showMessage]);

  const handleSubmit = useCallback(() => {
    // Имитация проверки решения
    const checks = {
      hasGrid: cssCode.includes("grid") || cssCode.includes("Grid"),
      hasFlexbox: cssCode.includes("flex") || cssCode.includes("Flex"),
      hasSemanticTags:
        htmlCode.includes("<header") &&
        htmlCode.includes("<nav") &&
        htmlCode.includes("<main") &&
        htmlCode.includes("<footer"),
      hasMediaQueries: cssCode.includes("@media"),
      hasHoverEffects: cssCode.includes(":hover"),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    if (score >= 80) {
      showMessage(
        `Поздравляем! Вы успешно прошли босс-уровень! Оценка: ${score}% +500 XP`,
        "success",
      );
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    } else {
      showMessage(
        `Пока не достаточно хорошо. Оценка: ${score}%. Попробуйте учесть рекомендации и отправить снова.`,
        "error",
      );
    }
  }, [htmlCode, cssCode, showMessage]);

  // Обработчик изменения активной вкладки
  const handleTabChange = (tab: "html" | "css" | "js") => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-primary-dark text-text-light">
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 10px rgba(255, 0, 85, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 0, 85, 0.8);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .pulse {
          animation: pulse 2s infinite;
        }
        .shake {
          animation: shake 0.5s;
        }
        .glow {
          animation: glow 2s infinite;
        }
        .slide-in {
          animation: slideIn 0.3s ease;
        }
        .slide-out {
          animation: slideOut 0.3s ease;
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
        {/* Шапка босса */}
        <div className="my-8 p-8 rounded-2xl bg-gradient-to-br from-accent-red/10 to-accent-orange/10 border border-accent-red/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-red to-accent-orange"></div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-accent-red to-accent-orange bg-clip-text text-transparent">
            БОСС: Вёрстка интернет-магазина
          </h1>

          <p className="text-lg text-text-dim text-center max-w-3xl mx-auto mb-6">
            Используйте все полученные знания для создания главной страницы
            интернет-магазина электроники. Вам нужно сверстать адаптивный макет
            с использованием Flexbox, CSS Grid и семантических тегов HTML5.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="px-4 py-2 rounded-full bg-accent-red/15 text-accent-red border border-accent-red shadow-neon-red">
              <i className="fas fa-skull-crossbones mr-2"></i>
              Очень сложно
            </span>
            <span className="px-4 py-2 rounded-full bg-accent-orange/15 text-accent-orange border border-accent-orange shadow-neon-orange">
              <i className="fas fa-trophy mr-2"></i>
              Награда: 500 XP + достижение
            </span>
            <span
              className={`px-4 py-2 rounded-full bg-accent-blue/15 text-accent-blue border border-accent-blue shadow-neon-blue ${
                timeLeft <= 300 ? "animate-pulse" : ""
              }`}
            >
              <i className="fas fa-clock mr-2"></i>
              Осталось: {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Основной контент босса */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Левая панель - требования */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-accent-red flex items-center gap-3">
              <i className="fas fa-scroll"></i>
              Требования к проекту
            </h2>

            <div className="space-y-4 mb-8">
              {[
                {
                  icon: "fa-mobile-alt",
                  title: "Адаптивный дизайн",
                  desc: "Макет должен корректно отображаться на мобильных устройствах, планшетах и десктопах",
                },
                {
                  icon: "fa-th-large",
                  title: "Использование CSS Grid",
                  desc: "Для основного макета страницы необходимо использовать CSS Grid",
                },
                {
                  icon: "fa-boxes",
                  title: "Использование Flexbox",
                  desc: "Для внутренних компонентов (навигация, карточки товаров) использовать Flexbox",
                },
                {
                  icon: "fa-code",
                  title: "Семантические теги HTML5",
                  desc: "Использовать header, nav, main, section, article, footer и другие семантические теги",
                },
                {
                  icon: "fa-palette",
                  title: "Дизайн по макету",
                  desc: "Верстка должна соответствовать предоставленному дизайн-макету",
                },
              ].map((req, index) => (
                <div
                  key={index}
                  className="p-4 bg-secondary-dark/50 rounded-lg border-l-4 border-accent-red hover:bg-accent-red/5 hover:translate-x-1 transition-all duration-300 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-red to-accent-orange flex items-center justify-center text-lg shrink-0">
                    <i className={`fas ${req.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{req.title}</h4>
                    <p className="text-text-dim text-sm">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Награда */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-accent-orange/10 to-accent-red/10 border border-accent-orange/30">
              <h3 className="text-xl font-bold mb-4 text-accent-orange flex items-center gap-3">
                <i className="fas fa-gem"></i>
                Награда за выполнение
              </h3>

              <div className="space-y-3">
                {[
                  { icon: "fa-bolt", text: "+500 XP к вашему профилю" },
                  { icon: "fa-trophy", text: 'Достижение "Мастер верстки"' },
                  { icon: "fa-unlock", text: "Разблокировка продвинутых тем" },
                  { icon: "fa-crown", text: "Особый значок в профиле" },
                ].map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"
                  >
                    <i className={`fas ${reward.icon} text-accent-orange`}></i>
                    <span>{reward.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая панель - редактор */}
          <div className="bg-secondary-dark rounded-xl overflow-hidden border border-glass-border shadow-lg">
            <div className="p-4 bg-black/50 border-b border-glass-border flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3 font-bold">
                <i className="fas fa-code text-accent-blue"></i>
                <span>Редактор босс-уровня</span>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
                >
                  <i className="fas fa-download mr-2"></i>
                  Скачать проект
                </button>

                <button
                  onClick={handleHint}
                  className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
                >
                  <i className="fas fa-lightbulb mr-2"></i>
                  Подсказка
                </button>

                <button
                  onClick={handleSubmit}
                  className={`px-4 py-2 bg-gradient-to-r from-accent-red to-accent-orange text-white font-bold rounded-lg hover:shadow-neon-orange hover:-translate-y-0.5 transition-all duration-300 ${
                    showAnimation ? "pulse" : ""
                  }`}
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Отправить на проверку
                </button>
              </div>
            </div>

            {/* Вкладки редактора */}
            <div className="flex bg-black/50 border-b border-glass-border overflow-x-auto">
              {[
                { id: "html" as const, label: "index.html", icon: "fa-html5" },
                { id: "css" as const, label: "style.css", icon: "fa-css3-alt" },
                { id: "js" as const, label: "script.js", icon: "fa-js" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-3 flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-accent-blue bg-accent-blue/5 border-b-2 border-accent-blue"
                      : "text-text-dim hover:text-text-light"
                  }`}
                >
                  <i className={`fab ${tab.icon}`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Область кода */}
            <textarea
              value={
                activeTab === "html"
                  ? htmlCode
                  : activeTab === "css"
                    ? cssCode
                    : jsCode
              }
              onChange={(e) => {
                if (activeTab === "html") setHtmlCode(e.target.value);
                else if (activeTab === "css") setCssCode(e.target.value);
                else setJsCode(e.target.value);
              }}
              className="w-full h-96 bg-secondary-dark text-text-light p-4 font-mono text-sm resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Панель предпросмотра */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-glass-border">
            <h3 className="text-2xl font-bold text-accent-blue flex items-center gap-3">
              <i className="fas fa-eye"></i>
              Предпросмотр результата
            </h3>

            <button
              onClick={updatePreview}
              className="px-4 py-2 bg-black/30 border border-glass-border rounded-lg hover:bg-accent-blue/10 hover:border-accent-blue hover:text-accent-blue transition-all duration-300"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Обновить предпросмотр
            </button>
          </div>

          <div className="glass-card rounded-xl p-6 min-h-[500px]">
            <div className="h-[500px] bg-white rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
              <iframe
                ref={previewRef}
                className="w-full h-full border-0"
                title="Предпросмотр интернет-магазина"
              />
            </div>

            <div className="mt-4 p-4 bg-accent-red/5 rounded-lg border-l-4 border-accent-red">
              <p className="text-text-light font-medium">
                <i className="fas fa-exclamation-triangle text-accent-red mr-2"></i>
                Это босс-уровень! У вас есть 120 минут, чтобы завершить верстку
                интернет-магазина.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
