// app/data/materials.ts

export type MaterialCategory = "html" | "css" | "projects";
export type MaterialLevel = "beginner" | "intermediate" | "advanced";
export type MaterialType = "article" | "video" | "cheatsheet" | "interactive";

export interface MaterialContent {
  sections: Array<{
    id: string;
    title: string;
    content: string;
    icon?: string;
    codeExample?: {
      initialCode: string;
      description?: string;
    };
    quiz?: {
      questions: Array<{
        text: string;
        options: string[];
        correct: string;
      }>;
    };
  }>;
}

export interface Material {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: MaterialCategory;
  categoryLabel: string;
  level: MaterialLevel;
  type: MaterialType;
  duration: string;
  tags: string[];
  locked: boolean;
  requirements?: string;
  icon: string;
  content?: MaterialContent;
}

export const materials: Material[] = [
  {
    id: 1,
    slug: "struktura-html-dokumenta",
    title: "Структура HTML-документа",
    description:
      "Изучите базовую структуру HTML-документа, теги head и body, doctype и мета-теги. Основа для уверенного старта в верстке.",
    category: "html",
    categoryLabel: "HTML",
    level: "beginner",
    type: "article",
    duration: "10 мин",
    tags: ["HTML", "Основы", "Структура"],
    locked: false,
    icon: "fab fa-html5",
    content: {
      sections: [
        {
          id: "intro",
          title: "1. Что такое HTML-документ",
          content: `
            <p>HTML (HyperText Markup Language) — язык разметки, который определяет структуру веб-страницы. Каждый HTML-документ имеет строгую иерархическую структуру, понятную браузеру.</p>
            <p>Любой HTML-документ начинается с объявления типа документа (<code>!DOCTYPE</code>) и содержит два основных раздела: <code>head</code> (служебная информация) и <code>body</code> (видимое содержимое).</p>
          `,
        },
        {
          id: "doctype",
          title: "2. DOCTYPE и корневой элемент",
          content: `
            <p><code>&lt;!DOCTYPE html&gt;</code> — это инструкция для браузера, сообщающая, что документ написан на HTML5. Она должна быть самой первой строкой.</p>
            <p>Корневой элемент <code>&lt;html&gt;</code> оборачивает весь контент страницы. Ему часто задают атрибут <code>lang</code> для указания языка.</p>
          `,
          codeExample: {
            description: "Базовая структура",
            initialCode: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Моя первая страница</title>
</head>
<body>
  <h1>Привет, мир!</h1>
  <p>Это мой первый HTML-документ.</p>
</body>
</html>`,
          },
        },
        {
          id: "head",
          title: "3. Раздел head",
          content: `
            <p>Внутри <code>&lt;head&gt;</code> размещается мета-информация, которая не отображается на странице, но важна для браузера и поисковых систем:</p>
            <ul>
              <li><code>&lt;meta charset="UTF-8"&gt;</code> — кодировка символов</li>
              <li><code>&lt;title&gt;</code> — заголовок вкладки</li>
              <li><code>&lt;meta name="description"&gt;</code> — описание страницы</li>
              <li><code>&lt;link&gt;</code> — подключение CSS</li>
              <li><code>&lt;script&gt;</code> — подключение JavaScript</li>
            </ul>
          `,
        },
        {
          id: "body",
          title: "4. Раздел body",
          content: `
            <p>Всё, что находится внутри <code>&lt;body&gt;</code>, отображается на экране пользователя. Здесь располагаются заголовки, параграфы, изображения, ссылки, формы и другие элементы.</p>
          `,
        },
        {
          id: "practice-html",
          title: "5. Практическое задание",
          content: `
            <p><strong>Задача:</strong> Создайте HTML-документ, содержащий:</p>
            <ol>
              <li>Заголовок первого уровня «Мои любимые книги».</li>
              <li>Абзац с кратким описанием почему вы любите читать.</li>
              <li>Ненумерованный список из трёх книг, с ссылками на их описание (ссылки могут быть пустыми).</li>
            </ol>
            <p>Проверьте код в браузере и убедитесь, что структура соответствует стандартам.</p>
          `,
        },
        {
          id: "quiz-html",
          title: "6. Тест",
          content: "<p>Проверьте свои знания.</p>",
          quiz: {
            questions: [
              {
                text: "Какой тег определяет корневой элемент HTML-документа?",
                options: ["<head>", "<body>", "<html>", "<!DOCTYPE>"],
                correct: "<html>",
              },
              {
                text: "Где хранится мета-информация о странице?",
                options: ["В body", "В head", "В footer", "В title"],
                correct: "В head",
              },
              {
                text: "Какой атрибут указывает кодировку документа?",
                options: ["charset", "encoding", "content-type", "lang"],
                correct: "charset",
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: 2,
    slug: "selektory-i-kaskadnost-css",
    title: "Селекторы и каскадность CSS",
    description:
      "Подробное руководство по CSS-селекторам, специфичности и каскадности стилей. Удобная шпаргалка для быстрого доступа.",
    category: "css",
    categoryLabel: "CSS",
    level: "beginner",
    type: "cheatsheet",
    duration: "15 мин",
    tags: ["CSS", "Селекторы", "Шпаргалка"],
    locked: false,
    icon: "fab fa-css3-alt",
    content: {
      sections: [
        {
          id: "selectors",
          title: "1. Типы селекторов",
          content: `
            <ul>
              <li><code>element</code> — по имени тега (div, p)</li>
              <li><code>.class</code> — по классу</li>
              <li><code>#id</code> — по идентификатору</li>
              <li><code>*</code> — универсальный селектор</li>
              <li><code>element, element</code> — группировка</li>
              <li><code>element element</code> — вложенный (потомок)</li>
              <li><code>element > element</code> — прямой потомок</li>
              <li><code>element + element</code> — соседний</li>
              <li><code>element ~ element</code> — общий сосед</li>
              <li><code>[attribute]</code>, <code>[attribute="value"]</code> — атрибутные</li>
              <li><code>:pseudo-class</code> — псевдоклассы (:hover, :first-child)</li>
              <li><code>::pseudo-element</code> — псевдоэлементы (::before, ::after)</li>
            </ul>
          `,
          codeExample: {
            description: "Примеры селекторов",
            initialCode: `/* Тег */\np { color: black; }\n\n/* Класс */\n.button { background: blue; }\n\n/* ID */\n#header { font-size: 24px; }\n\n/* Атрибут */\ninput[type="text"] { border: 1px solid gray; }\n\n/* Псевдокласс */\na:hover { text-decoration: underline; }`,
          },
        },
        {
          id: "specificity",
          title: "2. Специфичность",
          content: `
            <p>Специфичность — это вес селектора. Браузер применяет стиль с большим весом.</p>
            <ul>
              <li>Инлайн-стили (атрибут style) — 1000</li>
              <li>ID — 100</li>
              <li>Классы, псевдоклассы, атрибуты — 10</li>
              <li>Теги, псевдоэлементы — 1</li>
              <li>Универсальный селектор (*) — 0</li>
            </ul>
            <p>Пример: <code>.nav li a</code> = 10 (класс) + 1 + 1 = 12.</p>
          `,
        },
        {
          id: "cascade",
          title: "3. Каскад",
          content: `
            <p>Каскад определяет, какое правило будет применено, если несколько правил имеют одинаковый вес. Приоритет:</p>
            <ol>
              <li>Важность (<code>!important</code>)</li>
              <li>Происхождение (пользовательские vs авторские)</li>
              <li>Специфичность</li>
              <li>Порядок объявления (позднее переопределяет раннее)</li>
            </ol>
          `,
        },
        {
          id: "quiz-css",
          title: "4. Тест",
          content: "<p>Проверьте знание селекторов.</p>",
          quiz: {
            questions: [
              {
                text: "Какой селектор имеет наивысшую специфичность?",
                options: [".class", "#id", "div", "*"],
                correct: "#id",
              },
              {
                text: "Что делает селектор `div > p`?",
                options: [
                  "Выбирает все параграфы внутри div",
                  "Выбирает только прямых потомков-параграфов",
                  "Выбирает параграфы, следующие сразу после div",
                  "Выбирает все элементы p и div",
                ],
                correct: "Выбирает только прямых потомков-параграфов",
              },
              {
                text: "Что означает `!important`?",
                options: [
                  "Делает правило самым приоритетным",
                  "Игнорирует правило",
                  "Применяет правило только в IE",
                  "Делает правило необязательным",
                ],
                correct: "Делает правило самым приоритетным",
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: 3,
    slug: "osnovy-flexbox",
    title: "Основы Flexbox",
    description:
      "Полное руководство по свойствам Flexbox: flex-direction, justify-content, align-items и другим. С примерами кода.",
    category: "css",
    categoryLabel: "CSS",
    level: "intermediate",
    type: "interactive",
    duration: "20 мин",
    tags: ["Flexbox", "CSS", "Макет"],
    locked: false,
    icon: "fas fa-boxes",
    content: {
      sections: [
        {
          id: "intro",
          title: "1. Введение в Flexbox",
          content: `
            <p><strong>Flexbox (Flexible Box Layout)</strong> — это модуль CSS, который позволяет создавать гибкие и адаптивные макеты. Он был разработан для упрощения выравнивания и распределения пространства между элементами в контейнере, даже когда их размер неизвестен или динамически изменяется.</p>
            
            <p><strong>Основные преимущества Flexbox:</strong></p>
            <ul>
              <li>Простое выравнивание элементов по горизонтали и вертикали</li>
              <li>Автоматическое распределение свободного пространства</li>
              <li>Возможность изменения порядка отображения элементов</li>
              <li>Автоматическое изменение размеров элементов для заполнения доступного пространства</li>
              <li>Простое создание адаптивных макетов</li>
            </ul>
            
            <p>Flexbox особенно полезен для создания навигационных панелей, карточек товаров, форм и других компонентов, которые должны адаптироваться к разным размерам экрана.</p>
            
            <p>Чтобы начать использовать Flexbox, достаточно задать родительскому элементу свойство <code>display: flex</code> или <code>display: inline-flex</code>.</p>
          `,
          codeExample: {
            description: "Активация Flexbox",
            initialCode: `.container {
  /* Основное свойство для включения Flexbox */
  display: flex;
}

/* Или для строчного flex-контейнера */
.container-inline {
  display: inline-flex;
}`,
          },
        },
        {
          id: "basics",
          title: "2. Основные понятия",
          content: `
            <p>Flexbox вводит два ключевых понятия:</p>
            
            <h3>Flex Container (Flex-контейнер)</h3>
            <p>Родительский элемент, который содержит flex-элементы. Он определяет контекст flex-форматирования для своих дочерних элементов. Все прямые дочерние элементы flex-контейнера автоматически становятся flex-элементами.</p>
            
            <h3>Flex Items (Flex-элементы)</h3>
            <p>Дочерние элементы flex-контейнера. Они располагаются внутри контейнера согласно правилам Flexbox.</p>
            
            <h3>Оси Flexbox</h3>
            <ul>
              <li><strong>Главная ось (Main Axis)</strong> — основное направление, вдоль которого располагаются flex-элементы. По умолчанию это горизонтальная ось (слева направо).</li>
              <li><strong>Поперечная ось (Cross Axis)</strong> — ось, перпендикулярная главной. По умолчанию это вертикальная ось (сверху вниз).</li>
            </ul>
            
            <p><strong>Важно:</strong> Направление главной оси можно менять с помощью свойства <code>flex-direction</code>, что автоматически меняет и направление поперечной оси.</p>
          `,
          codeExample: {
            description: "Изменение направления главной оси",
            initialCode: `.container {
  display: flex;
  flex-direction: row;      /* строка (по умолчанию) → слева направо */
}

.container-column {
  display: flex;
  flex-direction: column;   /* колонка → сверху вниз */
}

.container-row-reverse {
  display: flex;
  flex-direction: row-reverse;    /* строка справа налево */
}

.container-column-reverse {
  display: flex;
  flex-direction: column-reverse; /* колонка снизу вверх */
}`,
          },
        },
        {
          id: "container-properties",
          title: "3. Свойства flex-контейнера",
          content: `
            <p>Flex-контейнер имеет несколько ключевых свойств, которые управляют расположением всех дочерних элементов:</p>
            
            <h3>justify-content — выравнивание по главной оси</h3>
            <ul>
              <li><code>flex-start</code> — элементы прижаты к началу главной оси (по умолчанию)</li>
              <li><code>flex-end</code> — элементы прижаты к концу главной оси</li>
              <li><code>center</code> — элементы центрированы по главной оси</li>
              <li><code>space-between</code> — первый элемент в начале, последний в конце, остальные равномерно распределены</li>
              <li><code>space-around</code> — элементы имеют равные отступы по краям</li>
              <li><code>space-evenly</code> — равные отступы между элементами и от краёв</li>
            </ul>
            
            <h3>align-items — выравнивание по поперечной оси</h3>
            <ul>
              <li><code>stretch</code> — элементы растягиваются на всю высоту (по умолчанию)</li>
              <li><code>flex-start</code> — элементы прижаты к началу поперечной оси</li>
              <li><code>flex-end</code> — элементы прижаты к концу поперечной оси</li>
              <li><code>center</code> — элементы центрированы по поперечной оси</li>
              <li><code>baseline</code> — элементы выравниваются по базовой линии текста</li>
            </ul>
            
            <h3>flex-direction — направление главной оси</h3>
            <ul>
              <li><code>row</code> — горизонтальная ось слева направо (по умолчанию)</li>
              <li><code>row-reverse</code> — горизонтальная ось справа налево</li>
              <li><code>column</code> — вертикальная ось сверху вниз</li>
              <li><code>column-reverse</code> — вертикальная ось снизу вверх</li>
            </ul>
            
            <h3>flex-wrap — перенос элементов</h3>
            <ul>
              <li><code>nowrap</code> — без переноса (по умолчанию)</li>
              <li><code>wrap</code> — перенос на новую строку при необходимости</li>
              <li><code>wrap-reverse</code> — перенос в обратном порядке</li>
            </ul>
            
            <h3>gap — расстояние между элементами</h3>
            <p>Задаёт отступы между flex-элементами (работает и по горизонтали, и по вертикали).</p>
          `,
          codeExample: {
            description: "Пример свойств контейнера",
            initialCode: `.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  height: 300px;
  background-color: #f0f0f0;
  border: 2px solid #333;
}

.item {
  width: 100px;
  height: 100px;
  background-color: #00d9ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}`,
          },
        },
        {
          id: "item-properties",
          title: "4. Свойства flex-элементов",
          content: `
            <p>Flex-элементы могут иметь собственные свойства, которые переопределяют поведение, заданное контейнером:</p>
            
            <h3>order — порядок следования</h3>
            <p>Управляет порядком отображения элементов. По умолчанию все элементы имеют <code>order: 0</code>. Элементы с меньшим значением отображаются раньше.</p>
            
            <h3>flex-grow — коэффициент растяжения</h3>
            <p>Определяет, как элемент будет растягиваться, если есть свободное пространство. По умолчанию <code>flex-grow: 0</code> (элемент не растягивается).</p>
            
            <h3>flex-shrink — коэффициент сжатия</h3>
            <p>Определяет, как элемент будет сжиматься, если не хватает места. По умолчанию <code>flex-shrink: 1</code> (элемент может сжиматься).</p>
            
            <h3>flex-basis — базовый размер</h3>
            <p>Задаёт начальный размер элемента до распределения свободного пространства.</p>
            
            <h3>align-self — индивидуальное выравнивание</h3>
            <p>Переопределяет <code>align-items</code> для конкретного элемента. Возможные значения: auto, flex-start, flex-end, center, baseline, stretch.</p>
          `,
          codeExample: {
            description: "Пример свойств элементов",
            initialCode: `.container {
  display: flex;
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  border: 2px solid #333;
  gap: 10px;
  padding: 10px;
}

.item {
  width: 60px;
  height: 60px;
  background-color: #00d9ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

/* Изменяем свойства отдельных элементов */
.item:nth-child(1) {
  order: 2;
  flex-grow: 1;
}

.item:nth-child(2) {
  order: 1;
  flex-grow: 2;
  align-self: center;
}

.item:nth-child(3) {
  order: 3;
  flex-grow: 1;
  align-self: flex-end;
}`,
          },
        },
        {
          id: "examples",
          title: "5. Примеры использования",
          content: `
            <p>Рассмотрим практические примеры использования Flexbox в реальных проектах.</p>
            
            <h3>Горизонтальная навигационная панель</h3>
            <p>Идеальный пример для Flexbox — адаптивное меню навигации.</p>
            
            <h3>Карточки товаров</h3>
            <p>Flexbox позволяет легко создавать сетки карточек с равномерным распределением.</p>
            
            <h3>Центрирование блока</h3>
            <p>Классический трюк с абсолютным центрированием блока по вертикали и горизонтали.</p>
            
            <h3>Футер, прижатый к низу страницы</h3>
            <p>С помощью Flexbox можно легко прижать футер к низу страницы, даже если контента мало.</p>
          `,
          codeExample: {
            description: "Навигационная панель",
            initialCode: `.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 1rem 2rem;
  color: white;
}

.nav-links {
  display: flex;
  gap: 20px;
  list-style: none;
}

.nav-links a {
  color: white;
  text-decoration: none;
}

.nav-links a:hover {
  color: #00d9ff;
}

/* Адаптивность */
@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 15px;
  }
}`,
          },
        },
        {
          id: "practice",
          title: "6. Практическое задание",
          content: `
            <p><strong>Задача:</strong> Создайте адаптивную карточку товара с использованием Flexbox.</p>
            
            <p><strong>Требования к карточке:</strong></p>
            <ol>
              <li>Иметь изображение товара сверху</li>
              <li>Содержать заголовок, описание и цену</li>
              <li>Кнопка "В корзину" должна быть выровнена по правому краю</li>
              <li>На мобильных устройствах (ширина < 480px) кнопка должна занимать всю ширину</li>
              <li>Использовать Flexbox для выравнивания элементов</li>
              <li>Добавить отступы и тени для красивого внешнего вида</li>
            </ol>
            
            <p><strong>Подсказки:</strong></p>
            <ul>
              <li>Используйте <code>display: flex</code> и <code>flex-direction: column</code> для основной структуры карточки</li>
              <li>Для футера карточки используйте <code>justify-content: space-between</code></li>
              <li>Для адаптивности используйте медиа-запрос <code>@media (max-width: 480px)</code></li>
              <li>Не забудьте про <code>gap</code> для отступов между элементами</li>
            </ul>
            
            <p>Готовый код можно проверить с помощью кнопки "Проверить решение". Успехов!</p>
          `,
          codeExample: {
            description: "Начальный код для практики",
            initialCode: `/* Ваш CSS код здесь */
.product-card {
  /* Сделайте карточку flex-контейнером */
  display: flex;
  flex-direction: column;
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
}

.product-image {
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin-bottom: 15px;
}

.product-content {
  /* Распределите контент по вертикали */
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-description {
  color: #666;
  margin-bottom: 15px;
  flex-grow: 1;
}

.product-footer {
  /* Выровняйте цену и кнопку по горизонтали */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.add-to-cart {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Медиа-запрос для мобильных */
@media (max-width: 480px) {
  .product-footer {
    /* На мобильных кнопка должна занимать всю ширину */
    flex-direction: column;
    gap: 15px;
  }
  
  .add-to-cart {
    width: 100%;
  }
}`,
          },
        },
        {
          id: "quiz",
          title: "7. Тест на проверку знаний",
          content: `
            <p>Проверьте свои знания по теме Flexbox. Ответьте на все вопросы, чтобы завершить тест.</p>
            <p>После завершения вы увидите результат и сможете оценить свой уровень понимания материала.</p>
          `,
          quiz: {
            questions: [
              {
                text: "Какое свойство CSS используется для создания flex-контейнера?",
                options: [
                  "display: flex",
                  "display: block",
                  "position: flex",
                  "layout: flex",
                ],
                correct: "display: flex",
              },
              {
                text: "Какое свойство определяет направление главной оси во flex-контейнере?",
                options: [
                  "justify-content",
                  "flex-direction",
                  "align-items",
                  "flex-wrap",
                ],
                correct: "flex-direction",
              },
              {
                text: "Какой из следующих вариантов свойства justify-content равномерно распределяет элементы с отступами по краям?",
                options: [
                  "space-between",
                  "space-evenly",
                  "space-around",
                  "center",
                ],
                correct: "space-around",
              },
              {
                text: "Какое свойство используется для переноса flex-элементов на новую строку?",
                options: [
                  "flex-wrap",
                  "flex-flow",
                  "wrap-items",
                  "flex-direction",
                ],
                correct: "flex-wrap",
              },
              {
                text: "Какое свойство позволяет изменить порядок отображения конкретного flex-элемента?",
                options: ["flex-order", "order", "display-order", "flex-index"],
                correct: "order",
              },
              {
                text: "Какое свойство выравнивает flex-элементы по поперечной оси?",
                options: [
                  "justify-content",
                  "align-items",
                  "align-content",
                  "justify-items",
                ],
                correct: "align-items",
              },
              {
                text: "Какое значение свойства flex-grow означает, что элемент не будет растягиваться?",
                options: ["0", "1", "auto", "none"],
                correct: "0",
              },
              {
                text: "Какое свойство позволяет переопределить выравнивание для конкретного flex-элемента?",
                options: [
                  "align-self",
                  "self-align",
                  "item-align",
                  "individual-align",
                ],
                correct: "align-self",
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: 4,
    slug: "sozdanie-setok-s-grid",
    title: "Создание сеток с Grid",
    description:
      "Изучите grid-template, grid-area и другие свойства CSS Grid. Видеоурок с практическими примерами.",
    category: "css",
    categoryLabel: "CSS",
    level: "intermediate",
    type: "video",
    duration: "25 мин",
    tags: ["CSS Grid", "Видео", "Макет"],
    locked: true,
    requirements: "Требуется 80% Flexbox",
    icon: "fas fa-th",
    content: {
      sections: [
        {
          id: "intro-grid",
          title: "1. Введение в CSS Grid",
          content: `
            <p>CSS Grid Layout — это мощная двумерная система для создания сеток. В отличие от Flexbox (одномерного), Grid управляет одновременно строками и колонками.</p>
            <p>Основные понятия: Grid-контейнер, Grid-элементы, линии, ячейки, области.</p>
          `,
        },
        {
          id: "container",
          title: "2. Свойства контейнера",
          content: `
            <ul>
              <li><code>display: grid</code> или <code>inline-grid</code></li>
              <li><code>grid-template-columns</code> — размеры колонок</li>
              <li><code>grid-template-rows</code> — размеры строк</li>
              <li><code>gap</code> — отступы между ячейками</li>
              <li><code>justify-items</code>, <code>align-items</code></li>
            </ul>
          `,
          codeExample: {
            description: "Базовая сетка 3x3",
            initialCode: `.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 10px;
}
.item {
  background: #00d9ff;
  padding: 20px;
  text-align: center;
}`,
          },
        },
        {
          id: "placement",
          title: "3. Размещение элементов",
          content: `
            <p>С помощью <code>grid-column</code> и <code>grid-row</code> можно размещать элементы в нужных ячейках.</p>
          `,
          codeExample: {
            description: "Размещение элемента через две колонки",
            initialCode: `.item-large {
  grid-column: 1 / 3; /* от линии 1 до 3 (занимает две колонки) */
  grid-row: 2 / 4;
}`,
          },
        },
        {
          id: "practice-grid",
          title: "4. Практическое задание",
          content: `
            <p><strong>Задача:</strong> Создайте сетку из 4 карточек, которая на десктопе располагается в 2 ряда по 2 карточки, а на мобильных — в 1 колонку. Используйте медиа-запросы или <code>grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))</code>.</p>
          `,
        },
        {
          id: "quiz-grid",
          title: "5. Тест",
          content: "<p>Проверьте знания CSS Grid.</p>",
          quiz: {
            questions: [
              {
                text: "Какое свойство задаёт количество колонок в гриде?",
                options: [
                  "grid-template-rows",
                  "grid-template-columns",
                  "grid-gap",
                  "grid-area",
                ],
                correct: "grid-template-columns",
              },
              {
                text: "Что означает `1fr`?",
                options: [
                  "Одна доля доступного пространства",
                  "Один пиксель",
                  "Одна строка",
                  "Одна колонка",
                ],
                correct: "Одна доля доступного пространства",
              },
              {
                text: "Как заставить элемент занимать 2 колонки?",
                options: [
                  "grid-column: span 2",
                  "grid-column: 2",
                  "grid-span: 2",
                  "col-span: 2",
                ],
                correct: "grid-column: span 2",
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: 5,
    slug: "media-zaprosy-na-praktike",
    title: "Медиа-запросы на практике",
    description:
      "Интерактивное руководство по созданию адаптивных интерфейсов с помощью медиа-запросов. Практика с живыми примерами.",
    category: "css",
    categoryLabel: "CSS",
    level: "intermediate",
    type: "interactive",
    duration: "30 мин",
    tags: ["Адаптивность", "CSS", "Интерактив"],
    locked: false,
    icon: "fas fa-mobile-alt",
    content: {
      sections: [
        {
          id: "intro-media",
          title: "1. Основы медиа-запросов",
          content: `
            <p>Медиа-запросы позволяют применять CSS только при определённых условиях (ширина экрана, ориентация, разрешение и т.д.).</p>
            <p>Синтаксис: <code>@media (max-width: 768px) { ... }</code></p>
          `,
        },
        {
          id: "breakpoints",
          title: "2. Типичные точки перелома",
          content: `
            <ul>
              <li><code>320px — 480px</code> — мобильные устройства</li>
              <li><code>481px — 768px</code> — планшеты</li>
              <li><code>769px — 1024px</code> — маленькие ноутбуки</li>
              <li><code>1025px — 1200px</code> — десктопы</li>
              <li><code>> 1200px</code> — широкие экраны</li>
            </ul>
          `,
        },
        {
          id: "mobile-first",
          title: "3. Mobile First подход",
          content: `
            <p>Сначала пишут стили для мобильных устройств, затем с помощью <code>min-width</code> добавляют стили для больших экранов.</p>
          `,
          codeExample: {
            description: "Пример Mobile First",
            initialCode: `/* Базовые стили для всех экранов */
.container {
  display: flex;
  flex-direction: column;
}
/* Для планшетов и шире */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}`,
          },
        },
        {
          id: "practice-media",
          title: "4. Практическое задание",
          content: `
            <p><strong>Задача:</strong> Сделайте навигационную панель, которая на мобильных устройствах складывается в вертикальный список, а на десктопе располагается горизонтально.</p>
          `,
        },
        {
          id: "quiz-media",
          title: "5. Тест",
          content: "<p>Проверьте себя.</p>",
          quiz: {
            questions: [
              {
                text: "Какой синтаксис медиа-запроса верен?",
                options: [
                  "@media screen and (max-width: 600px)",
                  "@media (max-width: 600px)",
                  "Оба варианта верны",
                  "Ни один",
                ],
                correct: "Оба варианта верны",
              },
              {
                text: "Что делает `orientation: landscape`?",
                options: [
                  "Выбирает устройства с горизонтальной ориентацией",
                  "Выбирает устройства с вертикальной ориентацией",
                  "Применяется всегда",
                  "Не используется в CSS",
                ],
                correct: "Выбирает устройства с горизонтальной ориентацией",
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: 6,
    slug: "verstka-slozhnyh-maketov",
    title: "Верстка сложных макетов",
    description:
      "Практическое руководство по верстке реальных проектов. Подробный разбор сложных случаев и устойчивых решений.",
    category: "projects",
    categoryLabel: "Проекты",
    level: "advanced",
    type: "article",
    duration: "40 мин",
    tags: ["Проекты", "Макет", "Практика"],
    locked: true,
    requirements: "Все темы CSS",
    icon: "fas fa-crown",
    content: {
      sections: [
        {
          id: "intro-proj",
          title: "1. Что значит «сложный макет»",
          content: `
            <p>Сложные макеты — это страницы с множеством компонентов: шапка, слайдеры, многоуровневые меню, сетки с нестандартным расположением, формы, модальные окна, адаптивность под все устройства.</p>
            <p>Основные вызовы: организация кода, семантика, кроссбраузерность, производительность.</p>
          `,
        },
        {
          id: "approaches",
          title: "2. Подходы к верстке",
          content: `
            <ul>
              <li>Компонентный подход (BEM, SMACSS)</li>
              <li>Mobile First + Desktop</li>
              <li>Использование CSS-фреймворков (Tailwind, Bootstrap)</li>
              <li>CSS-модули или CSS-in-JS</li>
            </ul>
          `,
        },
        {
          id: "components",
          title: "3. Разбор реального компонента",
          content: `
            <p>Рассмотрим карточку товара с изображением, заголовком, описанием, ценой и кнопкой. Карточка должна быть адаптивной, с отступами и анимацией при наведении.</p>
            <p>Пример кода будет предоставлен в практической части.</p>
          `,
        },
        {
          id: "practice-proj",
          title: "4. Практическое задание",
          content: `
            <p><strong>Задача:</strong> Сверстать страницу портфолио с header, секцией проектов (grid из карточек), футером. Добавить адаптивность и применить хотя бы одну CSS-анимацию.</p>
          `,
        },
        {
          id: "quiz-proj",
          title: "5. Тест",
          content: "<p>Проверьте понимание сложной вёрстки.</p>",
          quiz: {
            questions: [
              {
                text: "Что такое BEM?",
                options: [
                  "Методология именования классов",
                  "JavaScript библиотека",
                  "CSS-фреймворк",
                  "Система сборки",
                ],
                correct: "Методология именования классов",
              },
              {
                text: "Почему важно разделять CSS на компоненты?",
                options: [
                  "Для повторного использования",
                  "Для упрощения поддержки",
                  "Оба варианта",
                  "Ни один",
                ],
                correct: "Оба варианта",
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: 7,
    slug: "semanticheskie-tegi-html5",
    title: "Семантические теги HTML5",
    description:
      "Полное руководство по семантическим тегам HTML5: header, nav, main, section, article и другим.",
    category: "html",
    categoryLabel: "HTML",
    level: "intermediate",
    type: "article",
    duration: "18 мин",
    tags: ["HTML5", "Семантика", "Доступность"],
    locked: false,
    icon: "fab fa-html5",
    content: {
      sections: [
        {
          id: "semantic",
          title: "1. Что такое семантика",
          content: `
            <p>Семантические теги несут смысловую нагрузку, описывая структуру документа. Они улучшают доступность, SEO и читаемость кода.</p>
          `,
        },
        {
          id: "tags",
          title: "2. Основные семантические теги",
          content: `
            <ul>
              <li><code>&lt;header&gt;</code> — шапка сайта или раздела</li>
              <li><code>&lt;nav&gt;</code> — блок навигации</li>
              <li><code>&lt;main&gt;</code> — главное содержимое</li>
              <li><code>&lt;section&gt;</code> — логический раздел</li>
              <li><code>&lt;article&gt;</code> — самостоятельная статья/блог</li>
              <li><code>&lt;aside&gt;</code> — боковая колонка (доп. информация)</li>
              <li><code>&lt;footer&gt;</code> — подвал</li>
            </ul>
          `,
        },
        {
          id: "example",
          title: "3. Пример типовой страницы",
          content: `
            <p>Структура новостного блога: header с логотипом и nav, main с несколькими article, aside с виджетами, footer с копирайтом.</p>
          `,
          codeExample: {
            description: "Семантическая разметка",
            initialCode: `<body>
  <header>
    <h1>Мой блог</h1>
    <nav>...</nav>
  </header>
  <main>
    <article>
      <h2>Заголовок статьи</h2>
      <p>Содержание...</p>
    </article>
  </main>
  <aside>Боковая панель</aside>
  <footer>© 2025</footer>
</body>`,
          },
        },
        {
          id: "quiz-semantic",
          title: "4. Тест",
          content: "<p>Проверьте знание семантических тегов.</p>",
          quiz: {
            questions: [
              {
                text: "Какой тег предназначен для основного содержимого страницы?",
                options: ["<div>", "<main>", "<content>", "<section>"],
                correct: "<main>",
              },
              {
                text: "Какой тег лучше всего подходит для группы навигационных ссылок?",
                options: ["<nav>", "<menu>", "<ul>", "<div>"],
                correct: "<nav>",
              },
              {
                text: "Зачем нужен тег <article>?",
                options: [
                  "Для обозначения записи в блоге",
                  "Для обычного абзаца",
                  "Для цитаты",
                  "Для кнопки",
                ],
                correct: "Для обозначения записи в блоге",
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: 8,
    slug: "css-animacii-i-perehody",
    title: "CSS-анимации и переходы",
    description:
      "Интерактивное руководство по созданию плавных анимаций и переходов в CSS. Практические примеры для интерфейсов.",
    category: "css",
    categoryLabel: "CSS",
    level: "intermediate",
    type: "interactive",
    duration: "35 мин",
    tags: ["Анимации", "CSS", "Интерактив"],
    locked: false,
    icon: "fas fa-magic",
    content: {
      sections: [
        {
          id: "intro-animations",
          title: "1. Введение в CSS-анимации",
          content: `
          <p><strong>CSS-анимации</strong> позволяют создавать плавные переходы между состояниями элементов без использования JavaScript. Анимации делают интерфейс живым, привлекают внимание пользователя и улучшают用户体验.</p>
          <p>Два основных подхода:</p>
          <ul>
            <li><strong>transition</strong> – плавное изменение свойств при наведении или изменении класса.</li>
            <li><strong>@keyframes</strong> – более сложные покадровые анимации с полным контролем.</li>
          </ul>
        `,
          codeExample: {
            description: "Базовая анимация при наведении",
            initialCode: `.button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.button:hover {
  background-color: #2980b9;
  transform: scale(1.05);
}`,
          },
        },
        {
          id: "transitions",
          title: "2. CSS-переходы (transition)",
          content: `
          <p>Свойство <code>transition</code> – самый простой способ добавить анимацию при изменении свойств (hover, focus, добавление класса и т.д.).</p>
          <p>Синтаксис: <code>transition: свойство длительность [задержка] [функция-времени];</code></p>
          <p>Примеры функций времени: ease, linear, ease-in, ease-out, cubic-bezier().</p>
        `,
          codeExample: {
            description: "Плавное появление и изменение размера",
            initialCode: `.box {
  width: 100px;
  height: 100px;
  background-color: #e74c3c;
  opacity: 0.5;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
.box:hover {
  width: 150px;
  height: 150px;
  background-color: #2ecc71;
  opacity: 1;
}`,
          },
        },
        {
          id: "keyframes",
          title: "3. Ключевые кадры (@keyframes)",
          content: `
          <p>Для более сложных анимаций используются @keyframes. Вы определяете последовательность состояний (0% – 100%) и применяете анимацию к элементу.</p>
          <p>Свойства анимации:</p>
          <ul>
            <li><code>animation-name</code> – имя анимации</li>
            <li><code>animation-duration</code> – длительность</li>
            <li><code>animation-timing-function</code> – функция времени</li>
            <li><code>animation-delay</code> – задержка</li>
            <li><code>animation-iteration-count</code> – количество повторений (infinite – бесконечно)</li>
            <li><code>animation-direction</code> – направление (normal, reverse, alternate)</li>
          </ul>
        `,
          codeExample: {
            description: "Пульсирующая кнопка",
            initialCode: `@keyframes pulse {
  0% {
    transform: scale(1);
    background-color: #3498db;
  }
  50% {
    transform: scale(1.1);
    background-color: #e67e22;
  }
  100% {
    transform: scale(1);
    background-color: #3498db;
  }
}
.pulse-btn {
  animation: pulse 1.5s infinite ease-in-out;
}`,
          },
        },
        {
          id: "practice-animations",
          title: "4. Практическое задание",
          content: `
          <p><strong>Задача:</strong> Создайте анимированную карточку товара с эффектами при наведении.</p>
          <p><strong>Требования:</strong></p>
          <ol>
            <li>При наведении на карточку она должна плавно подниматься вверх (transform: translateY(-5px)).</li>
            <li>Тень карточки должна увеличиваться.</li>
            <li>Кнопка "Купить" должна менять цвет фона с плавным переходом.</li>
            <li>Добавьте лёгкую анимацию появления карточки при загрузке страницы (прозрачность → видимость).</li>
          </ol>
        `,
          codeExample: {
            description: "Начальный код для практики",
            initialCode: `.product-card {
  width: 250px;
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
}

.buy-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.buy-btn:hover {
  background-color: #2980b9;
}

/* Анимация появления карточки */
.product-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`,
          },
        },
        {
          id: "quiz-animations",
          title: "5. Тест на проверку знаний",
          content: `
          <p>Проверьте, как вы усвоили материал по CSS-анимациям.</p>
        `,
          quiz: {
            questions: [
              {
                text: "Какое CSS-свойство используется для создания простых переходов при наведении?",
                options: ["@keyframes", "transition", "animation", "transform"],
                correct: "transition",
              },
              {
                text: "Как сделать анимацию бесконечной?",
                options: [
                  "animation-iteration-count: infinite",
                  "animation-loop: forever",
                  "animation-repeat: true",
                  "animation: infinite",
                ],
                correct: "animation-iteration-count: infinite",
              },
              {
                text: "Какая функция времени по умолчанию используется в transition?",
                options: ["linear", "ease-in", "ease-out", "ease"],
                correct: "ease",
              },
              {
                text: "Какой ключ в @keyframes обозначает начальное состояние?",
                options: ["start", "from", "begin", "0"],
                correct: "from",
              },
              {
                text: "Какое свойство отвечает за задержку анимации?",
                options: [
                  "animation-delay",
                  "transition-delay",
                  "animation-wait",
                  "delay",
                ],
                correct: "animation-delay",
              },
            ],
          },
        },
      ],
    },
  },
];

export const materialCategories: Array<{
  id: "all" | MaterialCategory;
  label: string;
}> = [
  { id: "all", label: "Все материалы" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "projects", label: "Проекты" },
];

export const getMaterialHref = (material: Material) =>
  `/materials/${material.category}/${material.slug}`;

export const getMaterialByPath = (category?: string, slug?: string) =>
  materials.find(
    (material) => material.category === category && material.slug === slug,
  );

export const getMaterialNeighbors = (materialId: number) => {
  const index = materials.findIndex((material) => material.id === materialId);

  return {
    previous: index > 0 ? materials[index - 1] : null,
    next:
      index >= 0 && index < materials.length - 1 ? materials[index + 1] : null,
  };
};
