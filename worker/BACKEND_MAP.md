# BACKEND MAP — Cloudflare Workers & Cloudflare D1 Backend

Карта архитектуры, базы данных, ORM и REST API бэкенда для AI-агентов и разработчиков.

---

## 1. Стек и технологии

- **Runtime**: Cloudflare Workers (V8 Edge isolates, бессерверный запуск с минимальной задержкой по всему миру).
- **Фреймворк**: Hono v4 (TypeScript, типизированный роутинг, встроенный CORS, сквозная RPC-типизация через `hc<AppType>`).
- **ORM и База данных**:
  - **Cloudflare D1**: SQLite-совместимая распределённая реляционная БД на Edge.
  - **Drizzle ORM (`drizzle-orm/d1`)**: легковесная строго типизированная ORM без рантайм-оверхеда для работы с D1.
  - **Drizzle Kit (`drizzle-kit`)**: автоматическая генерация и управление миграциями на основе декларативной схемы (`worker/src/db/schema.ts`).
- **Валидация входных данных**:
  - `@hono/valibot-validator`: валидация тел запросов и параметров на уровне Hono middleware.
  - `Valibot`: легковесные схемы валидации данных (`loginSchema`, `registerSchema`, `createNoteSchema`, `updateNoteSchema`, `createProductivityItemSchema`, `updateProductivityItemSchema`, `friendRequestSchema`, `assignFriendTaskSchema`).
- **Real-Time коммуникация**:
  - Cloudflare WebSockets (`worker/src/routes/realtime.ts`): двустороннее соединение для отправки live-событий клиентам.
  - Durable Objects архитектура (Roadmap): единая точка координации в Cloudflare для комнат совместной работы, синхронизации курсоров и мгновенного вещания изменений.
- **Аутентификация**:
  - Access Token: JWT (Web Crypto API `HMAC SHA-256`), срок жизни 15 минут, передаётся в заголовке `Authorization: Bearer <token>`.
  - Refresh Token: криптографический случайный токен, хэш которого хранится в таблице `refresh_tokens`, срок жизни 30 дней, передаётся в `httpOnly`, `Secure`, `SameSite=Lax` куке `refresh_token`.
  - Хеширование паролей: PBKDF2 (`Web Crypto API`, 100 000 итераций, соль 16 байт, SHA-256).
- **Деплой и миграции**: Wrangler CLI (`wrangler.toml`, `migrations/0001_init.sql`, `migrations/0002_friends_and_tasks.sql`, `migrations/0003_notes_parent_id.sql`, `migrations/0004_availability_windows.sql`, `migrations/0005_referrals.sql`, `migrations/0006_coin_ops.sql`).
- **Безопасность**:
  - `secureHeaders` middleware (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
  - Rate Limiting middleware (`src/middleware/rateLimit.ts`): скользящее окно запросов для `/auth/login` и `/auth/register` для защиты от перебора паролей (brute force) со стандартными заголовками `X-RateLimit-*` и `Retry-After: <seconds>`.
  - Защита от DoS/переполнения: строгие ограничения длины полей (`maxLength`) в схемах Valibot для всех строковых полей (пароли, заголовки, заметки, задачи).
  - Маскирование внутренних ошибок: `onError` отдаёт клиентам обезличенный 500 статус без утечки структуры таблиц и трассировки стека, логируя полные детали в консоль.
- **Мониторинг и логирование**:
  - Централизованное структурированное JSON-логирование ошибок в `app.onError` и мониторинг запросов с кодами >= 400 (`timestamp`, `level`, `method`, `path`, `status`, `durationMs`, `ip`, `userAgent`, `stack`).
- **Тестирование**:
  - `@cloudflare/vitest-pool-workers`: запуск тестов Vitest напрямую в V8-рантайме Miniflare с реальной in-memory D1 базой данных.
- **Прокси**: TMDB API (The Movie Database) с серверным кэшированием в Cloudflare Cache API и безопасным хранением токена `TMDB_TOKEN`.

---

## 2. Структура каталогов `worker/`

```
worker/
├── drizzle.config.ts          # Конфигурация Drizzle Kit для генерации миграций
├── migrations/
│   ├── 0001_init.sql          # Полная схема БД D1 (все 16 таблиц + индексы)
│   ├── 0002_friends_and_tasks.sql # Таблица friendships, allow_friend_tasks, sender_id/name
│   ├── 0003_notes_parent_id.sql # Иерархические заметки (parent_id, icon)
│   ├── 0004_availability_windows.sql # Таблица availability_windows (окна доступности)
│   ├── 0005_referrals.sql     # Реферальные коды и таблица referrals
│   └── 0006_coin_ops.sql      # Журнал серверных начислений (идемпотентность)
├── vitest.config.ts           # Настройка @cloudflare/vitest-pool-workers
├── src/
│   ├── index.ts               # Точка входа Hono, цепочка роутов, AppType для Hono RPC
│   ├── index.test.ts          # Интеграционные тесты эндпоинтов на in-memory D1
│   ├── types.ts               # Типы данных (Env, JWT, таблицы БД, снимки синхронизации)
│   ├── lib/
│   │   ├── crypto.ts          # Хеширование и валидация паролей через Web Crypto PBKDF2
│   │   ├── jwt.ts             # Создание, проверка и декодирование JWT токенов
│   │   └── validation.ts      # Valibot-схемы валидации входящих данных
│   ├── middleware/
│   │   ├── auth.ts            # Проверка Bearer JWT и куки, инъекция user в контекст
│   │   ├── admin.ts           # Проверка прав администратора (role === 'admin')
│   │   └── rateLimit.ts       # Rate Limiting для защиты от brute-force перебора
│   ├── db/
│   │   ├── schema.ts          # Декларативная схема Drizzle ORM (все таблицы D1)
│   │   ├── client.ts          # Инициализация Drizzle клиента getDb(d1), safeLimit/safeOffset
│   │   └── queries/           # Типобезопасные репозитории на Drizzle ORM
│   │       ├── birthdays.ts
│   │       ├── collection.ts
│   │       ├── availability.ts
│   │       ├── favorites.ts
│   │       ├── finance.ts
│   │       ├── friends.ts
│   │       ├── lottery.ts
│   │       ├── notes.ts
│   │       ├── productivity.ts
│   │       ├── settings.ts
│   │       ├── shop.ts
│   │       ├── subscriptions.ts
│   │       ├── sync.ts
│   │       ├── training.ts
│   │       └── viewModes.ts
│   └── routes/                # Модули обработчиков маршрутов
│       ├── admin.ts           # Управление пользователями и БД
│       ├── availability.ts    # Окна доступности: CRUD своих и чтение окон друзей
│       ├── auth.ts            # Регистрация, вход, обновление токена, выход, профиль
│       ├── birthdays.ts       # Дни рождения и свой день рождения
│       ├── collection.ts      # Фильмы, книги, игры (вишлист и просмотренное)
│       ├── favorites.ts       # Избранные животные
│       ├── finance.ts         # Записи расходов/доходов, баланс по валютам, курсы
│       ├── friends.ts         # Друзья, поиск, запросы, назначение задач
│       ├── lottery.ts         # Статистика лотереи и запись бросков
│       ├── notes.ts           # Заметки и дневник снов (древовидная структура)
│       ├── productivity.ts    # Задачи, цели, мечты, статистика месяцев, трекер настроения
│       ├── realtime.ts        # WebSocket эндпоинт для real-time обмена
│       ├── settings.ts        # Язык, тема, город, видимость блоков, стартовая страница
│       ├── shop.ts            # Баланс казны, купленные части, скины, приветствие друга
│       ├── subscriptions.ts   # Подписки, стоимость, период
│       ├── sync.ts            # Комплексный батч-снимок (full state push/pull)
│       ├── tmdb.ts            # Проксирование поиска и карточек TMDB
│       ├── training.ts        # Тренировочные дни и виды спорта
│       └── viewModes.ts       # Режимы отображения страниц и аватара (simple/normal)
├── package.json
├── tsconfig.json
└── wrangler.toml              # Конфигурация Cloudflare Worker и привязка D1
```

---

## 3. Таблицы базы данных (Drizzle Schema / Cloudflare D1)

Схема определена строго в `worker/src/db/schema.ts`:

| Таблица                | Назначение                                    | Ключевые поля в Drizzle                                                                                                          |
| :--------------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `users`                | Учётные записи пользователей                  | `id`, `email`, `password_hash`, `role` (`user` \| `admin`), `created_at`                                                         |
| `refresh_tokens`       | Сессии и refresh-токены                       | `id`, `user_id`, `token_hash`, `expires_at`                                                                                      |
| `settings`             | Глобальные настройки интерфейса               | `user_id`, `lang`, `theme_mode`, `city_id`, `scope`, `extra_tab`, `start_page`, `blocks_json`, `allow_friend_tasks`              |
| `training_days`        | Отметки тренировок по дням                    | `id`, `user_id`, `date`, `sports_json`                                                                                           |
| `training_sports`      | Пользовательские виды спорта                  | `id`, `user_id`, `label`, `color`, `enabled`, `custom`, `sort_order`                                                             |
| `finance_entries`      | Транзакции (доходы/расходы)                   | `id`, `user_id`, `month`, `kind`, `amount`, `currency`, `note`, `created_at`                                                     |
| `finance_balance`      | Текущие остатки по валютам                    | `user_id`, `rub`, `usd`, `gel`                                                                                                   |
| `finance_rates`        | Курсы валют пользователя                      | `user_id`, `rub`, `usd`, `gel`, `source`, `updated_at`                                                                           |
| `productivity_items`   | Задачи, цели, мечты                           | `id`, `user_id`, `kind`, `title`, `date`, `repeat`, `done`, `done_at`, `priority`, `note`, `sender_id`, `sender_name`            |
| `productivity_months`  | Счётчики и баллы за месяцы                    | `user_id`, `month_key`, `points`, `task_count`, `goal_count`, `dream_count`                                                      |
| `productivity_mood`    | Дневник настроения по датам                   | `user_id`, `date`, `level` (1-5), `note`                                                                                         |
| `subscriptions`        | Подписки и регулярные платежи                 | `id`, `user_id`, `name`, `price`, `currency`, `period`, `started_at`, `until`, `note`                                            |
| `birthdays`            | Памятные даты и дни рождения                  | `id`, `user_id`, `name`, `date`                                                                                                  |
| `own_birthday`         | Дата рождения пользователя                    | `user_id`, `date`                                                                                                                |
| `collection_items`     | Медиатека (movies/books/games)                | `id`, `user_id`, `collection`, `list_key` (`wishlist` \| `watched`), `title`, `year`, `score`, `image_url`, `tags_json`          |
| `favorites`            | Избранные животные                            | `id`, `user_id`, `animal_id`, `name`, `breed`, `image`, `added_at`                                                               |
| `lottery_stats`        | Статистика колеса лотереи                     | `user_id`, `sector_id`, `spins`, `wins`, `earned`                                                                                |
| `notes`                | Заметки и дневник снов (иерархическое дерево) | `id`, `user_id`, `kind` (`note` \| `dream`), `title`, `body`, `parent_id`, `icon`, `created_at`, `updated_at`                    |
| `shop_state`           | Казна, скины, покупки, приветствия            | `user_id`, `coins`, `unlocked_parts_json`, `active_cat_skin`, `active_theme_skin`, `greeting_*`                                  |
| `view_modes`           | Состояние режимов simple/normal               | `user_id`, `global_mode`, `page_modes_json`, `avatar_mode`                                                                       |
| `friendships`          | Связи друзей и заявки                         | `id`, `user_id`, `friend_id`, `status` (`pending` \| `accepted`), `created_at`, `updated_at`                                     |
| `availability_windows` | Окна доступности пользователя                 | `id`, `user_id`, `scope` (`weekly` \| `date`), `day_of_week`, `date`, `start_min`, `end_min`, `note`, `created_at`, `updated_at` |
| `referrals`            | Рефералы (кто кого пригласил)                 | `id`, `referrer_id`, `referee_id` (UNIQUE), `code`, `referrer_reward`, `referee_reward`, `created_at`                            |
| `shop_coin_ops`        | Журнал серверных начислений монет             | `id` (PRIMARY KEY, идемпотентность), `user_id`, `reason`, `amount`, `created_at`                                                 |

---

## 4. Каталог REST API эндпоинтов

### 4.1. Аутентификация (`/auth`)

| Метод  | URL              | Доступ | Валидатор (Valibot) | Назначение                    | Ответ                                       |
| :----- | :--------------- | :----- | :------------------ | :---------------------------- | :------------------------------------------ |
| `POST` | `/auth/register` | Public | `registerSchema`    | Регистрация нового аккаунта   | `{ user, accessToken }` + кука `refresh...` |
| `POST` | `/auth/login`    | Public | `loginSchema`       | Авторизация по email и паролю | `{ user, accessToken }` + кука `refresh...` |
| `POST` | `/auth/refresh`  | Cookie | —                   | Обновление токена доступа     | `{ accessToken }`                           |
| `POST` | `/auth/logout`   | Public | —                   | Выход и инвалидация сессии    | `{ success: true }`                         |
| `GET`  | `/auth/me`       | Bearer | —                   | Текущий профиль пользователя  | `{ id, email, role, createdAt }`            |
| `GET`  | `/auth/referral` | Bearer | —                   | Реферальный код и статистика  | `{ code, invited, earned }`                 |

### 4.2. Полная синхронизация состояния (`/api/sync`)

| Метод  | URL         | Доступ | Назначение                                             | Ответ                           |
| :----- | :---------- | :----- | :----------------------------------------------------- | :------------------------------ |
| `GET`  | `/api/sync` | Bearer | Получить полный снимок облачных данных пользователя    | `{ ...SyncSnapshot }`           |
| `POST` | `/api/sync` | Bearer | Передать полный снимок локальных данных для перезаписи | `{ success: true, updated_at }` |

### 4.3. Настройки (`/api/settings`)

| Метод | URL             | Доступ | Назначение                                                |
| :---- | :-------------- | :----- | :-------------------------------------------------------- |
| `GET` | `/api/settings` | Bearer | Получить настройки (lang, theme, city, blocks, startPage) |
| `PUT` | `/api/settings` | Bearer | Обновить настройки интерфейса                             |

### 4.4. Тренировки (`/api/training`)

| Метод    | URL                            | Доступ | Назначение                                                    |
| :------- | :----------------------------- | :----- | :------------------------------------------------------------ |
| `GET`    | `/api/training/days?from=&to=` | Bearer | Получить историю тренировочных дней                           |
| `PUT`    | `/api/training/days/:date`     | Bearer | Установить список видов спорта на дату `{ sports: string[] }` |
| `DELETE` | `/api/training/days/:date`     | Bearer | Очистить тренировочный день                                   |
| `GET`    | `/api/training/sports`         | Bearer | Получить список доступных видов спорта                        |
| `POST`   | `/api/training/sports`         | Bearer | Добавить пользовательский вид спорта                          |
| `PUT`    | `/api/training/sports/:id`     | Bearer | Изменить вид спорта                                           |
| `DELETE` | `/api/training/sports/:id`     | Bearer | Удалить пользовательский вид спорта                           |

### 4.5. Финансы (`/api/finance`)

| Метод    | URL                           | Доступ | Назначение                                      |
| :------- | :---------------------------- | :----- | :---------------------------------------------- |
| `GET`    | `/api/finance/entries?month=` | Bearer | Список операций (с фильтром по месяцу)          |
| `POST`   | `/api/finance/entries`        | Bearer | Добавить транзакцию                             |
| `PUT`    | `/api/finance/entries/:id`    | Bearer | Изменить транзакцию                             |
| `DELETE` | `/api/finance/entries/:id`    | Bearer | Удалить транзакцию                              |
| `GET`    | `/api/finance/balance`        | Bearer | Текущий баланс по трём валютам (RUB, USD, GEL)  |
| `PUT`    | `/api/finance/balance`        | Bearer | Установить остатки по валютам                   |
| `GET`    | `/api/finance/rates`          | Bearer | Текущие курсы конвертации                       |
| `PUT`    | `/api/finance/rates`          | Bearer | Обновить пользовательские курсы или источник ЦБ |

### 4.6. Продуктивность (`/api/productivity`)

| Метод    | URL                             | Доступ | Валидатор (Valibot)            | Назначение                           |
| :------- | :------------------------------ | :----- | :----------------------------- | :----------------------------------- |
| `GET`    | `/api/productivity?kind=&done=` | Bearer | —                              | Список задач/целей/мечт              |
| `POST`   | `/api/productivity`             | Bearer | `createProductivityItemSchema` | Создать задачу, цель или мечту       |
| `PUT`    | `/api/productivity/:id`         | Bearer | `updateProductivityItemSchema` | Изменить статус, заголовок, дату     |
| `DELETE` | `/api/productivity/:id`         | Bearer | —                              | Удалить элемент продуктивности       |
| `GET`    | `/api/productivity/months`      | Bearer | —                              | Статистика продуктивности по месяцам |
| `PUT`    | `/api/productivity/months`      | Bearer | —                              | Сохранить статистику месяцев         |
| `GET`    | `/api/productivity/mood`        | Bearer | —                              | Записи дневника настроения           |
| `PUT`    | `/api/productivity/mood/:date`  | Bearer | —                              | Сохранить уровень настроения (1-5)   |
| `DELETE` | `/api/productivity/mood/:date`  | Bearer | —                              | Удалить запись настроения            |

### 4.7. Подписки (`/api/subscriptions`)

| Метод    | URL                      | Доступ | Назначение                  |
| :------- | :----------------------- | :----- | :-------------------------- |
| `GET`    | `/api/subscriptions`     | Bearer | Список активных подписок    |
| `POST`   | `/api/subscriptions`     | Bearer | Добавить регулярный платёж  |
| `PUT`    | `/api/subscriptions/:id` | Bearer | Изменить параметры подписки |
| `DELETE` | `/api/subscriptions/:id` | Bearer | Удалить подписку            |

### 4.8. Дни рождения (`/api/birthdays`)

| Метод    | URL                  | Доступ | Назначение                              |
| :------- | :------------------- | :----- | :-------------------------------------- |
| `GET`    | `/api/birthdays`     | Bearer | Список дат и день рождения пользователя |
| `POST`   | `/api/birthdays`     | Bearer | Добавить дату                           |
| `DELETE` | `/api/birthdays/:id` | Bearer | Удалить запись                          |
| `PUT`    | `/api/birthdays/own` | Bearer | Установить дату своего дня рождения     |

### 4.9. Коллекции медиа (`/api/collection`)

| Метод    | URL                             | Доступ | Назначение                                     |
| :------- | :------------------------------ | :----- | :--------------------------------------------- |
| `GET`    | `/api/collection/:type`         | Bearer | Список карточек для `movies`, `books`, `games` |
| `POST`   | `/api/collection/:type`         | Bearer | Добавить объект в вишлист или просмотренное    |
| `PUT`    | `/api/collection/:type/:id`     | Bearer | Обновить карточку (оценка, отзыв, статус)      |
| `DELETE` | `/api/collection/:type/:id`     | Bearer | Удалить элемент из коллекции                   |
| `PUT`    | `/api/collection/:type/reorder` | Bearer | Сохранить порядок элементов в списке           |

### 4.10. Избранные животные (`/api/favorites`)

| Метод    | URL                  | Доступ | Назначение                       |
| :------- | :------------------- | :----- | :------------------------------- |
| `GET`    | `/api/favorites`     | Bearer | Список карточек любимых животных |
| `POST`   | `/api/favorites`     | Bearer | Добавить животное в избранное    |
| `DELETE` | `/api/favorites/:id` | Bearer | Удалить животное из избранного   |

### 4.11. Лотерея (`/api/lottery`)

| Метод  | URL            | Доступ | Назначение                                |
| :----- | :------------- | :----- | :---------------------------------------- |
| `GET`  | `/api/lottery` | Bearer | Статистика спинов и выигрышей по секторам |
| `POST` | `/api/lottery` | Bearer | Записать результат вращения барабана      |

### 4.12. Заметки и дневник снов (`/api/notes`)

| Метод    | URL              | Доступ | Валидатор (Valibot) | Назначение                                                     |
| :------- | :--------------- | :----- | :------------------ | :------------------------------------------------------------- |
| `GET`    | `/api/notes`     | Bearer | —                   | Список всех заметок с поддержкой `kind=note\|dream`, пагинации |
| `POST`   | `/api/notes`     | Bearer | `createNoteSchema`  | Создать заметку/сон (поддержка `parentId`, `icon`, блоков)     |
| `PUT`    | `/api/notes/:id` | Bearer | `updateNoteSchema`  | Обновить заголовок, текст, родителя или иконку заметки         |
| `DELETE` | `/api/notes/:id` | Bearer | —                   | Удалить заметку (каскадное перемещение детей в корень)         |

### 4.13. Магазин и казна (`/api/shop`)

| Метод  | URL              | Доступ | Назначение                                                                                                    |
| :----- | :--------------- | :----- | :------------------------------------------------------------------------------------------------------------ |
| `GET`  | `/api/shop`      | Bearer | Баланс монет, купленные части, скины темы и кота                                                              |
| `PUT`  | `/api/shop`      | Bearer | Обновить косметику (скины/приветствия); монеты и покупки игнорируются                                         |
| `POST` | `/api/shop/earn` | Bearer | Серверное начисление монет: `{ ops: [{ id, reason, amount }] }`, идемпотентно по `id`, с лимитами по причинам |
| `POST` | `/api/shop/buy`  | Bearer | Серверная покупка: `{ key }`, проверяет цену и баланс, списывает и открывает часть                            |

Монеты и купленные части — серверные: `POST /api/sync` (push) их не перезаписывает из клиента; начисление идёт через `/earn` (журнал `shop_coin_ops`) и `/buy`.

### 4.14. Режимы отображения (`/api/view-modes`)

| Метод | URL               | Доступ | Назначение                                   |
| :---- | :---------------- | :----- | :------------------------------------------- |
| `GET` | `/api/view-modes` | Bearer | Глобальный режим, режимы страниц, режим кота |
| `PUT` | `/api/view-modes` | Bearer | Сохранить режимы (`simple` / `normal`)       |

### 4.15. Друзья и совместные задачи (`/api/friends`)

| Метод    | URL                        | Доступ | Валидатор (Valibot)      | Назначение                                                   |
| :------- | :------------------------- | :----- | :----------------------- | :----------------------------------------------------------- |
| `GET`    | `/api/friends`             | Bearer | —                        | Список друзей, входящих и исходящих заявок                   |
| `GET`    | `/api/friends/search`      | Bearer | —                        | Поиск пользователей по email (`?q=`)                         |
| `POST`   | `/api/friends/request`     | Bearer | `friendRequestSchema`    | Отправить заявку в друзья `{ email }` или `{ friendId }`     |
| `POST`   | `/api/friends/accept/:id`  | Bearer | —                        | Принять заявку в друзья                                      |
| `POST`   | `/api/friends/decline/:id` | Bearer | —                        | Отклонить заявку в друзья                                    |
| `DELETE` | `/api/friends/:friendId`   | Bearer | —                        | Удалить из друзей                                            |
| `POST`   | `/api/friends/tasks`       | Bearer | `assignFriendTaskSchema` | Назначить задачу другу `{ friendId, title, date, priority }` |
| `GET`    | `/api/friends/tasks/sent`  | Bearer | —                        | Список задач, назначенных друзьям, и их статус               |

### 4.16. Окна доступности (`/api/availability`)

| Метод    | URL                         | Доступ | Валидатор (Valibot)              | Назначение                                                          |
| :------- | :-------------------------- | :----- | :------------------------------- | :------------------------------------------------------------------ |
| `GET`    | `/api/availability`         | Bearer | —                                | Список собственных окон доступности (еженедельных и по датам)       |
| `GET`    | `/api/availability/friends` | Bearer | —                                | Окна доступности принятых друзей, сгруппированные по пользователю   |
| `POST`   | `/api/availability`         | Bearer | `createAvailabilityWindowSchema` | Создать окно `{ scope, dayOfWeek \| date, startMin, endMin, note }` |
| `PUT`    | `/api/availability/:id`     | Bearer | `updateAvailabilityWindowSchema` | Изменить интервал, день или дату, заметку окна                      |
| `DELETE` | `/api/availability/:id`     | Bearer | —                                | Удалить своё окно доступности                                       |

### 4.17. Real-time WebSocket (`/api/realtime`)

| Метод | URL                | Протокол           | Назначение                                                          |
| :---- | :----------------- | :----------------- | :------------------------------------------------------------------ |
| `GET` | `/api/realtime/ws` | `ws://` / `wss://` | Двустороннее WebSocket-соединение с heartbeat ping/pong и событиями |

### 4.18. Панель администратора (`/admin`)

| Метод    | URL                     | Доступ | Назначение                                                          |
| :------- | :---------------------- | :----- | :------------------------------------------------------------------ |
| `GET`    | `/admin/users`          | Admin  | Список всех зарегистрированных пользователей                        |
| `GET`    | `/admin/users/:id/data` | Admin  | Полный слепок базы данных Cloudflare D1 для выбранного пользователя |
| `DELETE` | `/admin/users/:id`      | Admin  | Безвозвратное удаление учётной записи и связанных данных            |

### 4.19. TMDB Прокси (`/tmdb` и корневые алиасы)

| Метод | URL                          | Доступ | Назначение                                        |
| :---- | :--------------------------- | :----- | :------------------------------------------------ |
| `GET` | `/search/movie?query=&page=` | Public | Поиск фильмов через TMDB API                      |
| `GET` | `/genre/movie/list`          | Public | Список официальных жанров кино                    |
| `GET` | `/movie/:id`                 | Public | Детальная карточка фильма                         |
| `*`   | `/tmdb/*`                    | Public | Универсальное проксирование любого TMDB эндпоинта |

---

## 5. Архитектура Real-Time и Durable Objects (Roadmap)

### 5.1. Текущая реализация (WebSockets)

- Эндпоинт `/api/realtime/ws` реализован на базе `WebSocketPair` в Cloudflare Workers.
- Клиентский сервис `src/services/api/realtimeService.ts` обеспечивает:
  - Автоматическое подключение и переподключение с экспоненциальной задержкой.
  - Heartbeat-пинг каждые 30 секунд для предотвращения закрытия соединения промежуточными прокси.
  - Подписку через `realtimeService.subscribe((event) => ...)`.

### 5.2. Durable Objects Архитектура

Для горизонтально масштабируемого совместного редактирования в реальном времени (multi-user collaboration):

1. **Durable Object Room Coordinator**:
   - Каждый совместный ресурс (страница заметок, список задач друзей) привязывается к уникальному экземпляру Durable Object по `roomId = idFromName(resourceId)`.
   - Durable Object хранит в памяти пул активных WebSocket-клиентов через **WebSocket Hibernation API**, снижая затраты на CPU до 0 во время простоя.
2. **Event Broadcast**:
   - При внесении изменений одним пользователем Durable Object мгновенно рассылает дельта-обновления (`note_updated`, `task_assigned`) всем подключённым участникам комнаты без обращения к БД.
3. **Persisted State & Conflict Resolution**:
   - Durable Object транзакционно сбрасывает агрегированное состояние в D1 через периодические flush-интервалы или сохраняет в локальный Storage DO (`ctx.storage`), обеспечивая устойчивость к разрывам соединения и бесконфликтное слияние (CRDT / LWW).

---

## 6. Стратегия взаимодействия фронтенда с бэкендом

1. **Сквозная типизация API (Hono RPC)**:
   - Фронтенд импортирует тип `AppType` из бэкенда через `src/services/api/rpcClient.ts`:
     ```ts
     import { createRpcClient } from '@/services/api/rpcClient'
     export const rpc = createRpcClient()
     ```
   - Доступен полный автокомплит путей, параметров запроса и типов возвращаемых данных.
2. **Офлайн-first приоритет**:
   - Приложение на клиенте сохраняет все состояния локально (IndexedDB с мгновенным чтением через синхронный кэш localStorage).
   - При наличии интернета и авторизации изменения автоматически отправляются на бэкенд в фоне с debounce.
3. **Отказоустойчивость**:
   - Если Worker недоступен (ошибка сети, 502/503/504, нет связи), фронтенд продолжает работать без ошибок и задержек, сохраняя данные в локальную IndexedDB.
   - При восстановлении подключения (`window.online`) запускается фоновый pull/push синк.
4. **Автоматический рефреш токенов**:
   - При ответе `401 Unauthorized` `apiClient` автоматически отправляет запрос на `/auth/refresh`. В случае успеха повторяет исходный запрос прозрачно для вызывающего кода.

---

## 7. Команды разработки и деплоя

```bash
# Локальный запуск Worker с локальной базой данных D1
cd worker && npx wrangler dev

# Генерация миграций Drizzle ORM
cd worker && npx drizzle-kit generate

# Применение миграций локально
cd worker && npx wrangler d1 migrations apply DB --local

# Применение миграций на продакшене Cloudflare
cd worker && npx wrangler d1 migrations apply DB --remote

# Проверка типов TypeScript бэкенда
cd worker && npm run typecheck

# Запуск тестов Vitest на рантайме Miniflare
cd worker && npm test

# Деплой в Cloudflare Workers
cd worker && npx wrangler deploy
```
