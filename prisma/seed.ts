import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.userTopicProgress.deleteMany();
  await prisma.level.deleteMany();
  await prisma.topic.deleteMany();

  // ======================
  // TOPICS
  // ======================
  const topics = [
    {
      title: "Основы HTML",
      description:
        "Изучите базовые теги, структуру документа, семантику и основные элементы HTML5.",
      category: "html",
      difficulty: "beginner",
      iconKey: "fab fa-html5",
      lessons: 2,
      xpPerLesson: 50,
      requirements: null,
    },
    {
      title: "Основы CSS",
      description: "Селекторы, свойства, каскадность и стилизация страниц.",
      category: "css",
      difficulty: "beginner",
      iconKey: "fab fa-css3-alt",
      lessons: 3,
      xpPerLesson: 60,
      requirements: null,
    },
    {
      title: "Flexbox",
      description:
        "Современная система построения макетов через flex-контейнеры.",
      category: "flexbox",
      difficulty: "intermediate",
      iconKey: "fas fa-boxes",
      lessons: 3,
      xpPerLesson: 80,
      requirements: null,
    },
    {
      title: "CSS Grid",
      description: "Двумерная система компоновки макетов.",
      category: "grid",
      difficulty: "intermediate",
      iconKey: "fas fa-th",
      lessons: 3,
      xpPerLesson: 90,
      requirements: null,
    },
    {
      title: "Адаптивный дизайн",
      description: "Создание адаптивных интерфейсов под любые устройства.",
      category: "responsive",
      difficulty: "intermediate",
      iconKey: "fas fa-mobile-alt",
      lessons: 2,
      xpPerLesson: 90,
      requirements: null,
    },
    {
      title: "Анимации CSS",
      description: "Плавные переходы и анимации интерфейса.",
      category: "animations",
      difficulty: "expert",
      iconKey: "fas fa-magic",
      lessons: 2,
      xpPerLesson: 120,
      requirements: null,
    },
    {
      title: "JavaScript основы",
      description: "Переменные, функции, логика и DOM.",
      category: "js",
      difficulty: "beginner",
      iconKey: "fab fa-js",
      lessons: 3,
      xpPerLesson: 100,
      requirements: null,
    },
    {
      title: "Проект: Лендинг",
      description: "Практический проект для закрепления навыков.",
      category: "project",
      difficulty: "expert",
      iconKey: "fas fa-flag-checkered",
      lessons: 1,
      xpPerLesson: 300,
      requirements: null,
    },
  ];

  await prisma.topic.createMany({ data: topics });
  const dbTopics = await prisma.topic.findMany();

  const roles = [
    { id: 1, name: "user", description: "Обычный пользователь" },
    { id: 2, name: "subscriber", description: "Платный подписчик" },
    { id: 3, name: "banned", description: "Заблокированный пользователь" },
    { id: 4, name: "admin", description: "Администратор" },
    { id: 5, name: "teacher", description: "Наставник" },
    { id: 6, name: "employer", description: "Работодатель" },
  ];
  await prisma.role.createMany({ data: roles });
  // ======================
  // LEVELS with VALIDATION
  // ======================
  const levels = [
    // HTML
    {
      topic: "html",
      order: 1,
      title: "Базовая структура HTML",
      description: "Создай базовую HTML-страницу",
      html: `<div class="box">Hello</div>`,
      css: `.box { color: red; }`,
      hint: "Используй div и class",
      xp: 50,
      validation: JSON.stringify({
        type: "cssContains",
        rules: [{ selector: ".box", property: "color", value: "red" }],
      }),
    },
    {
      topic: "html",
      order: 2,
      title: "Заголовки и параграфы",
      description: "Добавь h1 и p",
      html: `<h1></h1><p></p>`,
      css: ``,
      hint: "h1 — заголовок",
      xp: 50,
      validation: JSON.stringify({
        type: "htmlContains",
        rules: [
          { tag: "h1", contentRequired: true },
          { tag: "p", contentRequired: true },
        ],
      }),
    },

    // CSS
    {
      topic: "css",
      order: 1,
      title: "Селекторы",
      description: "Сделай стиль для класса",
      html: `<div class="box"></div>`,
      css: `.box { }`,
      hint: "Используй .class",
      xp: 60,
      validation: JSON.stringify({
        type: "cssContains",
        rules: [
          { selector: ".box", property: "background-color", value: "blue" },
        ],
      }),
    },

    // FLEXBOX
    {
      topic: "flexbox",
      order: 1,
      title: "Центрирование",
      description: "Отцентрируй блок",
      html: `<div class="container"><div class="item"></div></div>`,
      css: `.container { display: flex; }`,
      hint: "justify-content + align-items",
      xp: 80,
      validation: JSON.stringify({
        type: "cssContains",
        rules: [
          {
            selector: ".container",
            property: "justify-content",
            value: "center",
          },
          { selector: ".container", property: "align-items", value: "center" },
        ],
      }),
    },

    // GRID
    {
      topic: "grid",
      order: 1,
      title: "Grid сетка",
      description: "Создай 2x2 grid",
      html: `<div class="grid"><div></div><div></div></div>`,
      css: `.grid { display: grid; }`,
      hint: "grid-template-columns",
      xp: 90,
      validation: JSON.stringify({
        type: "cssContains",
        rules: [
          {
            selector: ".grid",
            property: "grid-template-columns",
            value: "1fr 1fr",
          },
        ],
      }),
    },
    {
      topic: "responsive",
      order: 1,
      title: "Медиа-запросы",
      description:
        "Используй @media для изменения цвета фона при ширине < 600px",
      html: `<div class="box">Адаптивный блок</div>`,
      css: `.box { width: 300px; height: 200px; background: blue; }
@media (max-width: 600px) { .box { background: red; } }`,
      hint: "@media (max-width: 600px) { ... }",
      xp: 90,
      validation: JSON.stringify({
        type: "cssContains",
        rules: [
          {
            rule: "@media (max-width: 600px)",
            inside: ".box { background: red; }",
          },
        ],
      }),
    },
    {
      topic: "responsive",
      order: 2,
      title: "Адаптивная сетка",
      description:
        "Сделай так, чтобы колонки занимали 100% ширины на мобильных",
      html: `<div class="grid"><div></div><div></div></div>`,
      css: `.grid { display: flex; gap: 10px; }
@media (max-width: 600px) { .grid { flex-direction: column; } }`,
      hint: "flex-direction: column",
      xp: 90,
      validation: JSON.stringify({
        type: "cssContains",
        rules: [
          {
            selector: ".grid",
            property: "flex-direction",
            value: "column",
            withinMedia: "(max-width: 600px)",
          },
        ],
      }),
    },

    // Animations
    {
      topic: "animations",
      order: 1,
      title: "Плавное появление",
      description: "Добавь анимацию opacity для блока",
      html: `<div class="fade">Привет!</div>`,
      css: `.fade { animation: fadeIn 2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`,
      hint: "@keyframes и animation",
      xp: 120,
      validation: JSON.stringify({
        type: "cssContains",
        rules: [
          { selector: ".fade", property: "animation", value: "fadeIn" },
          { keyframes: "fadeIn", contains: "opacity" },
        ],
      }),
    },
    {
      topic: "animations",
      order: 2,
      title: "Движение при ховере",
      description: "При наведении блок должен увеличиваться и менять цвет",
      html: `<div class="card">Наведи</div>`,
      css: `.card { transition: transform 0.3s, background 0.3s; }
.card:hover { transform: scale(1.1); background: gold; }`,
      hint: "transition + :hover",
      xp: 120,
      validation: JSON.stringify({
        type: "cssContains",
        rules: [
          { selector: ".card:hover", property: "transform", value: "scale" },
          { selector: ".card:hover", property: "background", value: "gold" },
        ],
      }),
    },

    // JavaScript
    {
      topic: "js",
      order: 1,
      title: "Переменные и вывод",
      description: "Выведи 'Hello, World!' в alert",
      html: `<button onclick="sayHello()">Click</button>
<script>
  // напиши функцию sayHello
</script>`,
      css: ``,
      hint: "function sayHello() { alert('Hello, World!'); }",
      xp: 100,
      validation: JSON.stringify({
        type: "jsContains",
        rules: [
          { codePattern: "function sayHello" },
          { codePattern: "alert\\s*\\(\\s*['\"`]Hello, World!['\"`]\\s*\\)" },
        ],
      }),
    },
    {
      topic: "js",
      order: 2,
      title: "Изменение стилей",
      description: "При клике на кнопку меняй цвет текста",
      html: `<p id="text">Текст</p>
<button onclick="changeColor()">Изменить цвет</button>
<script>
  // допиши функцию
</script>`,
      css: ``,
      hint: "document.getElementById('text').style.color = 'red'",
      xp: 100,
      validation: JSON.stringify({
        type: "jsContains",
        rules: [
          { codePattern: "function changeColor" },
          { codePattern: "getElementById\\s*\\(\\s*['\"`]text['\"`]\\s*\\)" },
          { codePattern: "\\.style\\.color\\s*=\\s*['\"`]red['\"`]" },
        ],
      }),
    },
    {
      topic: "js",
      order: 3,
      title: "Счётчик",
      description: "Сделай кнопку, увеличивающую счётчик",
      html: `<h2 id="counter">0</h2>
<button onclick="increment()">+1</button>
<script>
  // реализуй increment
</script>`,
      css: ``,
      hint: "let count = 0; затем count++ и обновить текст",
      xp: 100,
      validation: JSON.stringify({
        type: "jsContains",
        rules: [
          { codePattern: "function increment" },
          { codePattern: "let count\\s*=" },
          { codePattern: "count\\s*\\+\\+" },
          { codePattern: "innerHTML\\s*=" },
        ],
      }),
    },

    // Project (manual check)
    {
      topic: "project",
      order: 1,
      title: "Структура лендинга",
      description: "Создай шапку и hero-блок",
      html: `<header>Логотип</header>
<section class="hero"><h1>Добро пожаловать</h1><p>Учимся верстать</p></section>`,
      css: `header { background: #333; color: white; padding: 1rem; }
.hero { text-align: center; padding: 4rem; background: #f0f0f0; }`,
      hint: "Используй section и header",
      xp: 300,
      validation: JSON.stringify({
        type: "manual",
        description: "Проверка преподавателем",
      }),
    },
    {
      topic: "project",
      order: 2,
      title: "Карточки товаров",
      description: "Добавь три карточки с изображениями и ценами",
      html: `<div class="cards">
  <div class="card">Товар 1 - 1000₽</div>
  <div class="card">Товар 2 - 2000₽</div>
  <div class="card">Товар 3 - 3000₽</div>
</div>`,
      css: `.cards { display: flex; gap: 20px; justify-content: center; }
.card { border: 1px solid #ddd; padding: 20px; border-radius: 12px; }`,
      hint: "display: flex",
      xp: 300,
      validation: JSON.stringify({
        type: "manual",
        description: "Проверка преподавателем",
      }),
    },
  ];

  for (const level of levels) {
    const topic = dbTopics.find((t) => t.category === level.topic);
    if (!topic) continue;
    await prisma.level.create({
      data: {
        topicId: topic.id,
        order: level.order,
        title: level.title,
        description: level.description,
        html: level.html,
        css: level.css,
        hint: level.hint,
        xp: level.xp,
        validation: level.validation,
      },
    });
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
