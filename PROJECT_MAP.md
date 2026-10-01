# PROJECT MAP — Today Animal & Personal Dashboard

Карта архитектуры и кодовой базы для эффективной работы нейросетей (AI-агентов) и разработчиков.

---

## 1. Обзор проекта и стек

- **Тип приложения**: Офлайн-first персональный дашборд / SPA на React 19 + TypeScript + Vite.
- **Архитектура**: Feature-Sliced Design (FSD 2.1) со строгим разделением слоёв: `app/` -> `pages/` -> `widgets/` -> `features/` -> `entities/` -> `shared/`.
- **Стилизация**: Чистый CSS / компонентная инкапсуляция на системных CSS-переменных (`var(--bg)`, `var(--panel)`, `var(--accent)`, `var(--line)`). **Без Tailwind и CSS-in-JS**.
- **Темы оформления**: Каждая тема — блок CSS-переменных в `src/app/styles/base.css`: `--bg`, `--fg`, `--muted`, `--line`, `--accent`, `--coral`, `--panel`, `--light-panel`, `--ink` (тёмный контраст, в т.ч. фон/рамки) и `--on-accent` (текст на акценте; тёмный в тёмных темах, белый в светлых). Выбранная палитра хранится в `dailyStore.themePalette` (`auto | spring | summer | autumn | winter`), VIP-скины — в `shopStore.activeThemeSkin`; `src/app/providers/ThemeSync/ThemeSync.tsx` пишет `data-theme`, `data-theme-mode`, `data-theme-override`. Список палитр и VIP-тем для UI — `src/lib/theme/palettes.ts`. **Чтобы добавить тему**: блок переменных в `base.css`, элемент в `THEME_PALETTES`/`VIP_THEMES` и подписи в `src/lib/i18n/settings.ts`.
- **UI-примитивы**: Полный набор доступных headless-примитивов Radix UI (`@radix-ui/react-*`: Dialog, DropdownMenu, Popover, Select, Accordion, Tabs, Tooltip, Checkbox, ToggleGroup, RadioGroup, ScrollArea, Collapsible, Slider, Switch) + собственные легковесные SVG-графики.
- **Стейт-менеджмент**: Zustand с `persist` (`hybridStorage` = IDB + localStorage, прямое `idbPersistStorage` для объемных заметок). Все мутации вызывают `scheduleDebouncedSync` для фоновой синхронизации с бэкендом. Полный сброс данных (`resetAllData` в `lib/backup`) очищает и IndexedDB (`idbClear`), и localStorage.
- **Интернационализация**: Кастомный типизированный движок i18n (`ru` / `en`) в `src/lib/i18n/`.
- **Драг-энд-дроп**: `@dnd-kit/core`, `@dnd-kit/sortable`.
- **Иконки**: `lucide-react`.
- **PWA**: `vite-plugin-pwa` — workbox service worker, `autoUpdate`, `CacheFirst` для ассетов, `NetworkFirst` для API. Манифест генерируется из `vite.config.ts`.
- **Премиум-доступ и превью**: фронтенд-стор `src/store/premium/premiumStore.ts` (`PremiumSectionId`, `isUnlocked`, `unlock`) с dev-флагом `PREMIUM_DEV_UNLOCK_ALL` (в dev включён через `import.meta.env.DEV`, в production-сборке выключен; можно переопределить `VITE_PREMIUM_DEV_UNLOCK_ALL`). Компонент `src/shared/ui/PremiumGate` показывает размытое превью платного контента (Boost-style) с оверлеем и CTA. Аналогичный флаг `SHOP_DEV_UNLOCK_ALL` в `src/store/shop/shopStore.ts`. То есть в разработке всё открыто, в собранном сайте — платно.
- **Серверная экономика монет**: монеты и купленные части — серверные. Начисление идёт через `POST /api/shop/earn` (журнал `shop_coin_ops`, идемпотентность по `id`, лимиты по причинам из `worker/src/lib/economy.ts`), покупка — через `POST /api/shop/buy` (проверка цены/баланса). `POST /api/sync` не перезаписывает `coins`/`unlockedParts` из клиента. Клиент (`src/store/shop/shopStore.ts`) ведёт оптимистичный баланс и очередь `pendingOps`, которая сбрасывается (`flushOps`) перед push/pull.
- **Подтверждения**: переиспользуемый `src/shared/ui/ConfirmDialog` (на базе `Modal`); используется, в частности, в `src/widgets/ExtraNav` для подтверждения скрытия раздела (защита от случайного скрытия на мобильных).
- **Реферальная программа (TAU-коины)**: при регистрации можно указать код друга (`POST /auth/register`, опциональное поле `referralCode`). Воркер проверяет, что код существует и друг новый, пишет запись в `referrals` и начисляет монеты: пригласившему +250, приглашённому +100. `GET /auth/referral` отдаёт код пользователя и статистику. Слой запросов — `worker/src/db/queries/referrals.ts`, UI — поле кода и карточка «Пригласи друзей» в `src/pages/AuthPage/AuthPage.tsx`, ссылка-приглашение `…/auth?ref=CODE`.
- **Валидация данных**: Valibot — ультра-лёгкая типобезопасная схемная валидация сетевых ответов и снимков хранилища (`src/lib/validation/`).
- **Анализ бандла и безопасность**: `rollup-plugin-visualizer` (`dist/stats.html`), отключённые source maps в продакшене (`build.sourcemap: false`) для сокрытия исходного кода в браузере, валидация безопасных URL в медиа-блоках.
- **Версионирование и обновления**: версия приложения (из `package.json`) и коммит инъектятся через Vite `define` (`__APP_VERSION__`, `__APP_COMMIT__`, `__APP_BUILT_AT__`, helper `src/lib/version.ts`) и показываются в настройках (раздел «О приложении»). PWA в режиме `prompt`: `src/app/providers/PwaUpdater` показывает баннер «Доступно обновление». Релизы — git-теги `vX.Y.Z` и npm-скрипты `release:patch|minor|major`; история — `CHANGELOG.md`.
- **Тесты**: Vitest (`vitest.config.ts`), environment `node`. Тесты рядом с модулями (`*.test.ts`). `npm run test:run` — single pass, `npm run test` — watch.
- **Бэкенд**: Cloudflare Workers + Cloudflare D1 + Hono RPC (`worker/`). Drizzle ORM (`drizzle-orm/d1`) для типобезопасной работы с БД, `@hono/valibot-validator` для валидации, WebSockets для real-time связи. Подробная архитектура, тесты `@cloudflare/vitest-pool-workers` и эндпоинты в `worker/BACKEND_MAP.md`.

---

## 2. Структура каталогов (FSD 2.1)

```
TAU/
├── AGENTS.md                  # Правила для AI-агентов (коммиты, документация)
├── PROJECT_MAP.md             # Настоящая карта проекта
├── package.json               # Зависимости и скрипты
├── vite.config.ts             # Конфигурация сборщика Vite
├── worker/                    # Cloudflare Worker + D1 (см. worker/BACKEND_MAP.md)
└── src/
    ├── main.tsx               # Точка входа React
    ├── app/                   # Слой инициализации, провайдеров, роутера и стилей
    │   ├── App.tsx            # Корневой компонент сборки провайдеров и роутера
    │   ├── router/            # Роутер и React.lazy чанки (AppRouter.tsx)
    │   ├── providers/         # Провайдеры (ErrorBoundary, ThemeSync)
    │   └── styles/            # Базовые токены, шрифты, каркас (base.css, fonts.css, shared.css)
    ├── pages/                 # Страницы и маршруты приложения
    │   ├── DailyPage/         # Главный экран дня (декомпозирован в components/)
    │   ├── AnimalPage/        # Страница животного дня
    │   ├── FavoritesPage/     # Избранные животные
    │   ├── TrainingPage/      # Тренировки
    │   ├── AuthPage/          # Авторизация и профиль
    │   ├── AdminPage/         # Панель администратора
    │   ├── NotesPage/         # Полнофункциональный редактор заметок и снов (дерево страниц Sidebar Tree, хлебные крошки, MoveNoteModal, NotesHelpModal — справочная инструкция, упрощённый фокусированный режим для дневника снов)
    │   ├── ExtraPage/         # Раздел полезного (Training, Finance Hub с табами: Operations, Deposits, Loans, Subscriptions, Advice + общий итог/прогноз `FinanceOverviewPanel`; Productivity, Mind, Remind, Media; управление плотностью на уровне блоков, контекстное скрытие разделов)
    │   ├── MiscPage/          # Раздел разного (Together, Languages, Fun, Lottery; контекстное скрытие разделов)
    │   ├── SettingsPage/      # Настройки темы (блок «Темы»: сезонные палитры + light/dark вариант), языка, города, плотности по блокам (VIEW_PAGES), управление видимостью разделов меню (восстановление скрытых блоков)
    │   ├── CreatorPage/       # Страница об авторе
    │   └── HelpPage/          # Пользовательская справка /help (типизированный контент ru/en в content/, аккордеон разделов, боковая навигация, поиск по справке)
    ├── widgets/               # Крупные композиционные блоки страниц
    │   ├── Header/            # Шапка сайта (Header, AppTopbar, MainNav, TopbarControls)
    │   ├── Footer/            # Единый подвал страниц (Footer, AppFooter, CreatorNote)
    │   ├── CatAssistant/      # Интерактивный кот-помощник (звуки, аватары, фильтрация скрытых разделов)
    │   ├── SectionTabs/       # Навигационные табы разделов
    │   ├── DailyOverview/     # Обзор главного экрана
    │   ├── ExtraNav/          # Навигация разделов /extra и /misc с кнопкой «···» и Radix DropdownMenu для быстрого скрытия блоков
    │   └── Collection/        # Канбан-доска и поиск медиа-коллекций (книги, фильмы, игры)
    ├── features/              # Пользовательские интерактивные сценарии с бизнес-логикой
    │   ├── block-editor/      # Блочный редактор Notion-style (блок-модель, slash-меню, DND)
    │   ├── birthdays/         # Создание и редактирование дней рождения (BirthdayModal)
    │   ├── friends/           # Управление друзьями и заявками (FriendsModal)
    │   ├── lang-switcher/     # Переключатель языка (LangSwitcher)
    │   ├── onboarding/        # Подсказка нового пользователя (NewUserHint)
    │   └── theme-switcher/    # Переключатель темы оформления (ThemeSwitcher)
    ├── entities/              # Бизнес-сущности (model, api, ui)
    │   ├── task/              # Задачи, цели, привычки, начисление баллов
    │   ├── animal/            # Животные, избранное, Wikipedia API
    │   ├── finance/           # Доходы, расходы, курсы валют
    │   ├── friend/            # Профиль друга, заявки в друзья
    │   ├── note/              # Заметки, сны, IndexedDB
    │   ├── subscription/      # Регулярные подписки и расчёт затрат
    │   └── user/              # Профиль пользователя, авторизация, токен
    ├── shared/                # Базовый фундамент без бизнес-логики
    │   └── ui/                # Headless и презентационные компоненты (Radix UI, SVG Charts)
    ├── data/                  # Статические данные, константы, города, пресеты
    ├── lib/                   # Чистая бизнес-логика, утилиты, форматирование, i18n
    ├── services/              # Внешние API и фоновая синхронизация
    ├── store/                 # Zustand-хранилища (сохранена обратная совместимость; availability/ — окна доступности)
    └── hooks/                 # Кастомные React-хуки
```

---

## 3. Детализация слоёв

### 3.1. `src/app/` — Слой инициализации приложения

- **`App.tsx`**: Верхнеуровневая композиция: `BrowserRouter` -> `ThemeSync` -> фоновые загрузчики (`AnimalsLoader`, `AuthLoader`) -> глобальные виджеты (`CatAssistant`, `NewUserHint`, `FriendsModal`) -> `ErrorBoundary` -> `AppRouter`.
- **`router/`** (`AppRouter.tsx`): Маршрутизация с разделением кода через `React.lazy()` чанки страниц, лоадером `PageLoader` и обработчиком `NotFound`. Включает справочный маршрут `/help` (см. `pages/HelpPage`).
- **`providers/`**:
  - `ErrorBoundary/`: Класс-компонент защиты от сбоев рендеринга.
  - `ThemeSync/`: Синхронизация системной/сезонной темы и темы скина магазина с `:root`.
- **`styles/`**:
  - `base.css`: Токены темы `:root`, калиброванные темы WCAG AA, базовые сбросы CSS.
  - `fonts.css`: Подключение веб-шрифтов (Fraunces, DM Mono, Manrope).
  - `shared.css`: Каркас страницы (`.page-shell`), общая типографика (`.intro`, `.eyebrow`).
  - `index.css`: Корневая сборка стилей.

### 3.2. `src/widgets/` — Композиционные блоки страниц

- **`Header/`** (`Header.tsx`, `MainNav.tsx`, `TopbarControls.tsx`, `Header.css`): Единый виджет шапки сайта. Объединяет брендинг, навигационную строку с бейджем избранного, баланс монет, кнопки настроек и профиля. Экспортирует `Header` и псевдоним `AppTopbar`.
- **`Footer/`** (`Footer.tsx`, `CreatorNote.tsx`, `Footer.css`): Единый подвал страниц со статусной строкой и ссылкой на создателя (`CreatorNote`). Экспортирует `Footer` и псевдоним `AppFooter`.
- **`CatAssistant/`** (`CatAssistant.tsx`, `CatFace.tsx`, `CatPremiumAvatar.tsx`, `CatPremiumPanel.tsx`, `catAudio.ts`): Полнофункциональный интерактивный кот-помощник с синтезом звуков (мяуканье, мурчание), оракулом, играми и скинами.
- **`SectionTabs/`** (`SectionTabs.tsx`): Доступная строка табов разделов на базе `NavLink` с иконками, подсказками и индикаторами активных вкладок.
- **`DailyOverview/`** (`DailyOverview.tsx`): Обзор главного экрана.
- **`ExtraNav/`** (`ExtraNav.tsx`, `ExtraNav.css`): Горизонтальное меню подразделов `/extra` и `/misc`.
- **`Collection/`** (`CollectionView.tsx`, `CollectionBoard.tsx`, `CollectionFilters.tsx`, `SearchPanel.tsx`, `DetailsModal.tsx`, `SortableItemRow.tsx`): Полноценный виджет для медиа-коллекций (фильмы, книги, игры) с поиском и drag-and-drop сортировкой `@dnd-kit`.

### 3.3. `src/features/` — Пользовательские сценарии

- **`block-editor/`** (`BlockEditor.tsx`, `BlockItem.tsx`, `MediaBlock.tsx`, `SlashMenu.tsx`, `serialization.ts`, `slashCommands.ts`, `mediaUtils.ts`, `types.ts`, `BlockEditor.css`): Полнофункциональный блочный редактор в стиле Notion. Независимые блоки (абзацы, заголовки H1-H3, задачи с чекбоксами, списки, выпадающие спойлеры toggle-list, коллауты с эмодзи, цитаты, блоки кода с подсветкой и копированием, разделители, мультимедиа: изображения с оптимизацией через Canvas/DataURL, полноэкранным просмотром и подписями, аудиозаписи со встроенным плеером, PDF-документы с интерактивным просмотром), прямое перетаскивание файлов с рабочего стола (drag-and-drop), вставка скриншотов из буфера обмена (`Ctrl+V`), быстрое меню команд через слэш (`/`) с поиском и клавиатурной навигацией, drag-and-drop перетаскивание блоков за 6 точек (`⋮⋮`) на `@dnd-kit`.
- **`birthdays/`** (`BirthdayModal.tsx`, `types.ts`): Модальное окно добавления и редактирования дней рождения с валидацией даты.
- **`friends/`** (`FriendsModal.tsx`): Управление списком друзей, поиск пользователей, принятие и отклонение заявок, отправка задач другу.
- **`lang-switcher/`** (`LangSwitcher.tsx`): Переключатель языка интерфейса (RU / EN) с синхронизацией в хранилище.
- **`theme-switcher/`** (`ThemeSwitcher.tsx`): Циклический переключатель тем оформления и светлого/тёмного режима.
- **`onboarding/`** (`NewUserHint.tsx`): Приветственный баннер первого входа с подсказками по возможностям системы.

### 3.4. `src/entities/` — Бизнес-сущности

Каждая сущность изолирует работу со своими данными:

- **`task/`**: Задачи, цели, мечты (`useProductivityStore`, типы, алгоритмы очков).
- **`animal/`**: Животные дня и избранное (`useAnimalsStore`, `useFavoritesStore`, Wikipedia API).
- **`finance/`**: Финансовый комплекс (`useFinanceStore`, операции доходов/расходов, баланс по валютам, курсы, вклады и накопительные счета с расчётом пассивного дохода по дням/неделям/месяцам/годам `deposits.ts`, кредиты и ипотеки с контролем остатка долга и графиком платежей `loans.ts`).
- **`friend/`**: Модель профиля друга, API заявок (`useFriendsStore`, `friendsService`).
- **`together/`**: Окна доступности для совместного времяпровождения с друзьями (`useAvailabilityStore`, `availabilityService`; еженедельные окна по дням недели и разовые окна на конкретную дату, необязательная заметка, чтение окон принятых друзей).
- **`note/`**: Заметки и сны (`useNotesStore`, типы, автосохранение, `model/tree.ts` — алгоритмы древовидной иерархии страниц: построение дерева `buildNoteTree`, хлебные крошки `getBreadcrumbs`, каскадное удаление потомков `getAllDescendantIds`, безопасный поиск циклов при переносе, фильтрация `searchTree`).
- **`subscription/`**: Регулярные подписки (`useSubscriptionStore`, расчёт годовых и месячных затрат).
- **`user/`**: Авторизация и профиль пользователя (`useAuthStore`, `apiClient`).

### 3.5. `src/shared/ui/` — Презентационный UI-слой

Все компоненты не содержат доменной логики, типизированы и стилизованы через переменные темы. Строгий приоритет отдаётся headless-примитивам Radix UI (`@radix-ui/react-*`) для обеспечения доступности (WCAG), фокуса и защиты от ошибок верстки. Сводный статус компонентов зафиксирован в локальном `ROADMAP.md`.

- **`Dialog/`** (`Dialog.tsx`, `Dialog.css`): Обёртки над `@radix-ui/react-dialog` (`Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`), а также универсальный `<Modal>`. ARIA-атрибуты, `Escape`, блокировка скролла, ловушка фокуса, клик вне окна.
- **`DropdownMenu/`** (`DropdownMenu.tsx`, `DropdownMenu.css`): Обёртки над `@radix-ui/react-dropdown-menu` (`DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`, `DropdownMenuLabel`). Навигация стрелками, порталы, выравнивание.
- **`Popover/`** (`Popover.tsx`, `Popover.css`): Обёртки над `@radix-ui/react-popover` (`Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverClose`) для всплывающих пикеров и панелей.
- **`Select/`** (`Select.tsx`, `Select.css`): Обёртки над `@radix-ui/react-select` (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`) с поддержкой прокрутки и клавиатурного выбора.
- **`Accordion/`** (`Accordion.tsx`, `Accordion.css`): Обёртки над `@radix-ui/react-accordion` (`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`) для раскладывающихся списков (single/multiple).
- **`Tabs/`** (`Tabs.tsx`, `Tabs.css`): Обёртки над `@radix-ui/react-tabs` (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) для доступных вкладок.
- **`Tooltip/`** (`Tooltip.tsx`, `Tooltip.css`): Обёртки над `@radix-ui/react-tooltip` (`TooltipProvider`, `TooltipRoot`, `TooltipTrigger`, `TooltipContent`, `Tooltip`) для информационных подсказок при наведении и фокусе.
- **`Slider/`** (`Slider.tsx`, `Slider.css`): Обёртка над `@radix-ui/react-slider` с плавной регулировкой и переменными темы.
- **`Switch/`** (`Switch.tsx`, `Switch.css`): Обёртка над `@radix-ui/react-switch` (`Root`, `Thumb`) с поддержкой меток, подсказок, блокировки и автономного режима (`standalone`).
- **`Checkbox/`** (`Checkbox.tsx`, `Checkbox.css`): Доступный чекбокс на базе `@radix-ui/react-checkbox` с поддержкой неопределённого состояния (indeterminate).
- **`ToggleGroup/`** (`ToggleGroup.tsx`, `ToggleGroup.css`): Сегментированные переключатели режимов на базе `@radix-ui/react-toggle-group`.
- **`RadioGroup/`** (`RadioGroup.tsx`, `RadioGroup.css`): Группы радио-кнопок на базе `@radix-ui/react-radio-group`.
- **`ScrollArea/`** (`ScrollArea.tsx`, `ScrollArea.css`): Кастомный кросс-браузерный скроллбар на базе `@radix-ui/react-scroll-area`.
- **`Collapsible/`** (`Collapsible.tsx`, `Collapsible.css`): Раскрывающиеся секции на базе `@radix-ui/react-collapsible`.
- **`Button/`** (`Button.tsx`, `Button.css`): Кнопка с вариантами (`primary`, `secondary`, `outline`, `ghost`, `danger`), размерами (`sm`, `md`, `lg`), поддержкой иконок и индикатора загрузки.
- **`Badge/`** (`Badge.tsx`, `Badge.css`): Статусные плашки (`default`, `accent`, `coral`, `muted`, `success`, `outline`).
- **`Input/`** (`Input.tsx`, `Input.css`): Инпуты с поддержкой лейбла, подсказки, текста ошибки и иконок.
- **`Card/`** (`Card.tsx`, `Card.css`): Контейнеры контента (`default`, `flat`, `interactive`).
- **`Charts/`** (`BarChart.tsx`, `DonutChart.tsx`, `ProgressRing.tsx`, `Charts.css`): Легковесные SVG-графики нулевого оверхеда.
- **`ViewModeToggle/`** (`ViewModeToggle.tsx`, `ViewModeToggle.css`): Переключатель плотности интерфейса на базе `ToggleGroup` и `Tooltip`.
- **`WeatherIcon/`** (`WeatherIcon.tsx`): Иконка погоды по WMO-коду на Lucide-иконках.
- **`ComingSoon/`** (`ComingSoon.tsx`): Презентационная заглушка разрабатываемых разделов.
- **`index.ts`**: Единый barrel export дизайн-системы.

### 3.6. `src/services/` — Внешние сервисы и API

Каждый сервис изолирован в своей подпапке с fallback-стратегией на случай отсутствия сети:

- **`api/`**: Взаимодействие с бэкендом Cloudflare Worker (сквозной типобезопасный Hono RPC клиент `rpcClient`, WebSocket-клиент `realtimeService`, авторизация `authService`, синхронизация `syncService`, дебаунсер синхронизации `syncDebounce`, друзья и задачи `friendsService`, окна доступности `availabilityService`, админка `adminService`).
- **`animals/`**: Получение фактов и фото животных из Wikipedia API.
- **`holidays/`**: Загрузка государственных праздников (Nager.Date API).
- **`rates/`**: Курсы валют (USD, GEL к RUB) с таймаутами и fallback-значениями.
- **`tmdb/`**: Поиск фильмов и деталей в The Movie Database API + встроенная офлайн-база `fallbackMovies.ts`, изолированные типы `types.ts`.
- **`weather/`**: Погода и 7-дневный прогноз Open-Meteo API.
- **`ambient/`**: Воспроизведение фоновых звуковых дорожек.
- **`index.ts`**: Реэкспорт всех сервисов.

### 3.7. `src/store/` — Состояние приложения (Zustand)

Все хранилища обеспечивают обратную совместимость для существующих модулей и реэкспортируют данные сущностей.

---

## 4. Ключевые правила и соглашения для нейросетей

1. **Коммиты (`AGENTS.md`)**:
   - Формат Conventional Commits: `<type>[область]: <описание>`, настоящее время, императив, строчные буквы.
   - **Строгое правило**: Коммиты создаются **только** по явной просьбе пользователя.

2. **Документация (`AGENTS.md`)**:
   - **Строгое правило**: Файл `README.md` обновляется своевременно при добавлении новых библиотек/инструментов/слоёв. Описание — строго деловое и структурированное.

3. **Комментарии в коде (`AGENTS.md`)**:
   - **Строго запрещено писать любые комментарии в коде** (включая JSDoc, инлайн-комментарии, CSS/HTML/TSX/SQL комментарии), пока пользователь явно не попросит. В diff не должно быть ни одного комментария.

4. **Стили, темы и CSS**:
   - Не добавлять Tailwind, styled-components или тяжелые UI-киты.
   - Все цвета и отступы брать из токенов `:root` в `src/app/styles/base.css`.
   - **Светлая тема**: все сезонные темы в светлом режиме откалиброваны по стандарту контрастности WCAG AA (контраст > 4.5:1 к фону панели).
   - **Двухрежимные VIP-темы**: темы (`theme_cyberpunk`, `theme_midnight_gold`) реагируют на `data-theme-mode` ('light' | 'dark').
   - Для мобильных экранов поддерживать узкие вьюпорты (от 320px до OnePlus 12 / 450px) через `minmax(0, 1fr)`, `clamp()` и медиазапросы `@media (max-width: 640px)`.

5. **Оптимизация бандла**:
   - Не подключать тяжелые библиотеки чартов (Recharts, Chart.js) — использовать легковесные SVG-компоненты из `src/shared/ui/Charts/`.
   - Страницы подключать через `React.lazy()` в `src/app/router/AppRouter.tsx`.
   - Не дублировать библиотеки иконок — использовать `lucide-react`.

6. **Окружение Windows**:
   - Оболочка PowerShell: команды `npm` запускать через `cmd /c "npm run ..."` во избежание блокировок execution policy.
   - Обязательно проверять целостность проекта перед сдачей: `cmd /c "npm run check"`.

---

## 5. Карта инструментов разработки и DevOps-пайплайн

```
[Разработка кода]
       │
       ▼
[git commit] ──► .husky/pre-commit
                    ├── lint-staged (Prettier + ESLint только по staged файлам)
                    └── tsc -b --noEmit (проверка типов TypeScript всего проекта)
                           │ (при ошибке коммит блокируется)
                           ▼
[Тестирование]
       ├── Фронтенд: vitest run (unit-тесты логики и схем Valibot)
       └── Бэкенд: @cloudflare/vitest-pool-workers (тесты Hono в Miniflare V8 с in-memory D1)
              │
              ▼
[Сборка production] ──► npm run build (Vite)
                            ├── vite-plugin-pwa (генерация Service Worker и офлайн-манифеста)
                            └── rollup-plugin-visualizer (генерация интерактивного отчёта dist/stats.html)
                                   │
                                   ▼
[Рантайм приложения]
       ├── Хранилище: hybridStorage (localStorage + IndexedDB для объемных заметок)
       ├── Валидация: Valibot (проверка входящих снимков сети и кэша перед попаданием в сторы)
       └── Cloudflare Edge: secureHeaders + Rate Limiter + PBKDF2/JWT + структурированный JSON-логгер
```
