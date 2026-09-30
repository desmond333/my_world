# BACKEND MAP — Cloudflare Workers & Cloudflare D1 Backend

Карта архитектуры, базы данных и REST API бэкенда для AI-агентов и разработчиков.

---

## 1. Стек и технологии

- **Runtime**: Cloudflare Workers (V8 Edge isolates, бессерверный запуск с минимальной задержкой по всему миру).
- **Фреймворк**: Hono v4 (TypeScript, типизированный роутинг, встроенный CORS, валидация).
- **База данных**: Cloudflare D1 (SQLite-совместимая распределённая реляционная БД).
- **Аутентификация**:
  - Access Token: JWT (Web Crypto API `HMAC SHA-256`), срок жизни 15 минут, передаётся в заголовке `Authorization: Bearer <token>`.
  - Refresh Token: JWT (Web Crypto API), срок жизни 7 дней, передаётся в `httpOnly`, `Secure`, `SameSite=Lax` куке `myworld_refresh`.
  - Хеширование паролей: PBKDF2 (`Web Crypto API`, 100 000 итераций, соль 16 байт, SHA-256).
- **Деплой и миграции**: Wrangler CLI (`wrangler.toml`, `migrations/0001_init.sql`, `migrations/0002_friends_and_tasks.sql`).
- **Безопасность**:
  - `secureHeaders` middleware (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
  - Rate Limiting middleware (`src/middleware/rateLimit.ts`): скользящее окно запросов для `/auth/login` и `/auth/register` для защиты от перебора паролей (brute force) со стандартными заголовками `X-RateLimit-*` и `Retry-After: <seconds>`.
- **Мониторинг и логирование**:
  - Централизованное структурированное JSON-логирование ошибок в `app.onError` и мониторинг запросов с кодами >= 400 (`timestamp`, `level`, `method`, `path`, `status`, `durationMs`, `ip`, `userAgent`, `stack`).
- **Тестирование**:
  - `@cloudflare/vitest-pool-workers`: запуск тестов Vitest напрямую в V8-рантайме Miniflare с реальной in-memory D1 базой данных.
- **Прокси**: TMDB API (The Movie Database) с серверным хранением API-ключа `TMDB_API_KEY`.

---

## 2. Структура каталогов `worker/`

```
worker/
├── migrations/
│   ├── 0001_init.sql          # Полная схема БД D1 (все 16 таблиц + индексы)
│   └── 0002_friends_and_tasks.sql # Таблица friendships, allow_friend_tasks, sender_id/name
├── vitest.config.ts           # Настройка @cloudflare/vitest-pool-workers
├── src/
│   ├── index.ts               # Точка входа Hono, secureHeaders, CORS, логирование, роуты
│   ├── index.test.ts          # Интеграционные тесты эндпоинтов на in-memory D1
│   ├── types.ts               # Типы данных (Env, JWT, таблицы БД, снимки синхронизации)
│   ├── lib/
│   │   ├── crypto.ts          # Хеширование и валидация паролей через Web Crypto PBKDF2
│   │   └── jwt.ts             # Создание, проверка и декодирование JWT токенов
│   ├── middleware/
│   │   ├── auth.ts            # Проверка Bearer JWT и куки, инъекция user в контекст
│   │   ├── admin.ts           # Проверка прав администратора (role === 'admin')
│   │   └── rateLimit.ts       # Rate Limiting для защиты от brute-force перебора
│   ├── db/
│   │   ├── client.ts          # Утилиты пагинации safeLimit/safeOffset, JSON-сериализаторы
│   │   └── queries/           # Репозитории и SQL-запросы к D1
│   │       ├── birthdays.ts
│   │       ├── collection.ts
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
│       ├── auth.ts            # Регистрация, вход, обновление токена, выход, профиль
│       ├── birthdays.ts       # Дни рождения и свой день рождения
│       ├── collection.ts      # Фильмы, книги, игры (вишлист и просмотренное)
│       ├── favorites.ts       # Избранные животные
│       ├── finance.ts         # Записи расходов/доходов, баланс по валютам, курсы
│       ├── friends.ts         # Друзья, поиск, запросы, назначение задач
│       ├── lottery.ts         # Статистика лотереи и запись бросков
│       ├── notes.ts           # Заметки и дневник снов
│       ├── productivity.ts    # Задачи, цели, мечты, статистика месяцев, трекер настроения
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

## 3. Таблицы базы данных (Cloudflare D1)

Схема определена в `worker/migrations/0001_init.sql`:

| Таблица               | Назначение                      | Ключевые поля                                                                                                           |
| :-------------------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| `users`               | Учётные записи пользователей    | `id`, `email`, `password_hash`, `role` (`user` \| `admin`), `created_at`                                                |
| `user_settings`       | Глобальные настройки интерфейса | `user_id`, `lang`, `theme_mode`, `city_id`, `scope`, `extra_tab`, `start_page`, `blocks_json`, `allow_friend_tasks`     |
| `training_days`       | Отметки тренировок по дням      | `user_id`, `date`, `sports_json`                                                                                        |
| `training_sports`     | Пользовательские виды спорта    | `id`, `user_id`, `label`, `color`, `enabled`                                                                            |
| `finance_entries`     | Транзакции (доходы/расходы)     | `id`, `user_id`, `month`, `kind`, `amount`, `currency`, `category`, `comment`, `date`                                   |
| `finance_balance`     | Текущие остатки по валютам      | `user_id`, `currency`, `amount`                                                                                         |
| `finance_rates`       | Курсы валют пользователя        | `user_id`, `rates_json`, `rates_source`, `updated_at`                                                                   |
| `productivity_items`  | Задачи, цели, мечты             | `id`, `user_id`, `kind`, `title`, `date`, `done`, `repeat`, `priority`, `note`, `sender_id`, `sender_name`              |
| `productivity_months` | Счётчики и баллы за месяцы      | `user_id`, `month_key`, `points`, `task_count`, `goal_count`, `dream_count`                                             |
| `productivity_mood`   | Дневник настроения по датам     | `user_id`, `date`, `level` (1-5), `note`                                                                                |
| `subscriptions`       | Подписки и регулярные платежи   | `id`, `user_id`, `name`, `price`, `currency`, `period`, `started_at`, `until`, `note`                                   |
| `birthdays`           | Памятные даты и дни рождения    | `id`, `user_id`, `name`, `date`                                                                                         |
| `collections`         | Медиатека (movies/books/games)  | `id`, `user_id`, `collection`, `list_key` (`wishlist` \| `watched`), `title`, `year`, `score`, `image_url`, `tags_json` |
| `favorites`           | Избранные животные              | `id`, `user_id`, `animal_id`, `name`, `breed`, `image`, `added_at`                                                      |
| `lottery_stats`       | Статистика колеса лотереи       | `user_id`, `sector_id`, `spins`, `wins`, `earned`                                                                       |
| `notes`               | Заметки и дневник снов          | `id`, `user_id`, `kind` (`note` \| `dream`), `title`, `body`, `created_at`, `updated_at`                                |
| `shop_state`          | Казна, скины, покупки, пасхалки | `user_id`, `coins`, `unlocked_parts_json`, `active_cat_skin`, `active_theme_skin`, `greeting_json`                      |
| `view_modes`          | Состояние режимов simple/normal | `user_id`, `global_mode`, `page_modes_json`, `avatar_mode`                                                              |
| `friendships`         | Связи друзей и заявки           | `id`, `user_id`, `friend_id`, `status` (`pending` \| `accepted`), `created_at`, `updated_at`                            |

---

## 4. Каталог REST API эндпоинтов

### 4.1. Аутентификация (`/auth`)

| Метод  | URL              | Доступ | Параметры / Тело      | Ответ                                        |
| :----- | :--------------- | :----- | :-------------------- | :------------------------------------------- |
| `POST` | `/auth/register` | Public | `{ email, password }` | `{ token, user }` + cookie `myworld_refresh` |
| `POST` | `/auth/login`    | Public | `{ email, password }` | `{ token, user }` + cookie `myworld_refresh` |
| `POST` | `/auth/refresh`  | Cookie | —                     | `{ accessToken, user }`                      |
| `POST` | `/auth/logout`   | Public | —                     | `{ success: true }` + сброс cookie           |
| `GET`  | `/auth/me`       | Bearer | —                     | `{ user: { id, email, role, createdAt } }`   |

### 4.2. Полная синхронизация состояния (`/api/sync`)

| Метод  | URL         | Доступ | Назначение                                             | Ответ                           |
| :----- | :---------- | :----- | :----------------------------------------------------- | :------------------------------ |
| `GET`  | `/api/sync` | Bearer | Получить полный снимок облачных данных пользователя    | `{ snapshot: SyncSnapshot }`    |
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
| `POST`   | `/api/training/sports`         | Bearer | Создать новый вид спорта `{ label, color }`                   |
| `PUT`    | `/api/training/sports/:id`     | Bearer | Обновить вид спорта                                           |
| `DELETE` | `/api/training/sports/:id`     | Bearer | Удалить вид спорта                                            |

### 4.5. Финансы (`/api/finance`)

| Метод    | URL                                          | Доступ | Назначение                                      |
| :------- | :------------------------------------------- | :----- | :---------------------------------------------- |
| `GET`    | `/api/finance/entries?month=&limit=&offset=` | Bearer | Получить список финансовых записей              |
| `POST`   | `/api/finance/entries`                       | Bearer | Создать запись расхода/дохода                   |
| `PUT`    | `/api/finance/entries/:id`                   | Bearer | Обновить финансовую запись                      |
| `DELETE` | `/api/finance/entries/:id`                   | Bearer | Удалить запись                                  |
| `GET`    | `/api/finance/balance`                       | Bearer | Получить балансы по валютам `{ RUB, USD, GEL }` |
| `PUT`    | `/api/finance/balance`                       | Bearer | Установить баланс                               |
| `GET`    | `/api/finance/rates`                         | Bearer | Получить курсы валют                            |
| `PUT`    | `/api/finance/rates`                         | Bearer | Обновить курсы валют `{ rates, source }`        |

### 4.6. Продуктивность и трекер настроения (`/api/productivity`)

| Метод    | URL                                            | Доступ | Назначение                                      |
| :------- | :--------------------------------------------- | :----- | :---------------------------------------------- |
| `GET`    | `/api/productivity?kind=&done=&limit=&offset=` | Bearer | Задачи, цели, мечты                             |
| `POST`   | `/api/productivity`                            | Bearer | Создать элемент продуктивности                  |
| `PUT`    | `/api/productivity/:id`                        | Bearer | Обновить статус, приоритет, дату                |
| `DELETE` | `/api/productivity/:id`                        | Bearer | Удалить элемент                                 |
| `GET`    | `/api/productivity/months`                     | Bearer | Статистика по месяцам                           |
| `PUT`    | `/api/productivity/months`                     | Bearer | Обновить баллы месяцев                          |
| `GET`    | `/api/productivity/mood`                       | Bearer | Записи дневника настроения                      |
| `PUT`    | `/api/productivity/mood/:date`                 | Bearer | Установить настроение на дату `{ level, note }` |
| `DELETE` | `/api/productivity/mood/:date`                 | Bearer | Удалить отметку настроения                      |

### 4.7. Подписки (`/api/subscriptions`)

| Метод    | URL                      | Доступ | Назначение                                            |
| :------- | :----------------------- | :----- | :---------------------------------------------------- |
| `GET`    | `/api/subscriptions`     | Bearer | Список подписок                                       |
| `POST`   | `/api/subscriptions`     | Bearer | Добавить подписку `{ name, price, currency, period }` |
| `PUT`    | `/api/subscriptions/:id` | Bearer | Обновить подписку                                     |
| `DELETE` | `/api/subscriptions/:id` | Bearer | Удалить подписку                                      |

### 4.8. Дни рождения (`/api/birthdays`)

| Метод    | URL                  | Доступ | Назначение                                    |
| :------- | :------------------- | :----- | :-------------------------------------------- |
| `GET`    | `/api/birthdays`     | Bearer | Получить свой день рождения и список друзей   |
| `POST`   | `/api/birthdays`     | Bearer | Добавить день рождения друга `{ name, date }` |
| `DELETE` | `/api/birthdays/:id` | Bearer | Удалить день рождения                         |
| `PUT`    | `/api/birthdays/own` | Bearer | Установить свой день рождения `{ date }`      |

### 4.9. Медиа-коллекция (`/api/collection`)

| Метод    | URL                               | Доступ | Назначение                                         |
| :------- | :-------------------------------- | :----- | :------------------------------------------------- |
| `GET`    | `/api/collection/:kind?list=`     | Bearer | Элементы медиатеки (`movies`, `books`, `games`)    |
| `POST`   | `/api/collection/:kind`           | Bearer | Добавить элемент в вишлист или просмотренное       |
| `PUT`    | `/api/collection/:kind/:id`       | Bearer | Обновить статус, рейтинг, заметку                  |
| `DELETE` | `/api/collection/:kind/:id?list=` | Bearer | Удалить элемент из коллекции                       |
| `POST`   | `/api/collection/:kind/reorder`   | Bearer | Сохранить порядок элементов `{ list, orderedIds }` |

### 4.10. Избранное (`/api/favorites`)

| Метод    | URL                  | Доступ | Назначение                     |
| :------- | :------------------- | :----- | :----------------------------- |
| `GET`    | `/api/favorites`     | Bearer | Список избранных карточек      |
| `POST`   | `/api/favorites`     | Bearer | Добавить карточку в избранное  |
| `DELETE` | `/api/favorites/:id` | Bearer | Удалить карточку из избранного |

### 4.11. Лотерея (`/api/lottery`)

| Метод  | URL                   | Доступ | Назначение                                              |
| :----- | :-------------------- | :----- | :------------------------------------------------------ |
| `GET`  | `/api/lottery/stats`  | Bearer | Статистика по секторам                                  |
| `PUT`  | `/api/lottery/stats`  | Bearer | Перезаписать статистику                                 |
| `POST` | `/api/lottery/record` | Bearer | Записать результат прокрутки `{ sectorId, won, prize }` |

### 4.12. Заметки и дневник снов (`/api/notes`)

| Метод    | URL                               | Доступ | Назначение                                          |
| :------- | :-------------------------------- | :----- | :-------------------------------------------------- |
| `GET`    | `/api/notes?kind=&limit=&offset=` | Bearer | Список заметок и снов (`kind=note` \| `kind=dream`) |
| `POST`   | `/api/notes`                      | Bearer | Создать новую запись `{ kind, title, body }`        |
| `PUT`    | `/api/notes/:id`                  | Bearer | Обновить заголовок/тело                             |
| `DELETE` | `/api/notes/:id`                  | Bearer | Удалить запись                                      |

### 4.13. Магазин и казна (`/api/shop`)

| Метод | URL         | Доступ | Назначение                                           |
| :---- | :---------- | :----- | :--------------------------------------------------- |
| `GET` | `/api/shop` | Bearer | Баланс казны, разблокированные части, активные скины |
| `PUT` | `/api/shop` | Bearer | Обновить состояние магазина и казны                  |

### 4.14. Режимы отображения (`/api/view-modes`)

| Метод | URL               | Доступ | Назначение                                   |
| :---- | :---------------- | :----- | :------------------------------------------- |
| `GET` | `/api/view-modes` | Bearer | Глобальный режим, режимы страниц, режим кота |
| `PUT` | `/api/view-modes` | Bearer | Сохранить режимы (`simple` / `normal`)       |

### 4.15. Панель администратора (`/admin`)

| Метод    | URL                     | Доступ | Назначение                                                          |
| :------- | :---------------------- | :----- | :------------------------------------------------------------------ |
| `GET`    | `/admin/users`          | Admin  | Список всех зарегистрированных пользователей                        |
| `GET`    | `/admin/users/:id/data` | Admin  | Полный слепок базы данных Cloudflare D1 для выбранного пользователя |
| `DELETE` | `/admin/users/:id`      | Admin  | Безвозвратное удаление учётной записи и связанных данных            |

### 4.16. TMDB Прокси (`/tmdb` и корневые алиасы)

| Метод | URL                          | Доступ | Назначение                                        |
| :---- | :--------------------------- | :----- | :------------------------------------------------ |
| `GET` | `/search/movie?query=&page=` | Public | Поиск фильмов через TMDB API                      |
| `GET` | `/genre/movie/list`          | Public | Список официальных жанров кино                    |
| `GET` | `/movie/:id`                 | Public | Детальная карточка фильма                         |
| `*`   | `/tmdb/*`                    | Public | Универсальное проксирование любого TMDB эндпоинта |

### 4.17. Друзья и совместные задачи (`/api/friends`)

| Метод    | URL                        | Доступ | Назначение                                                         |
| :------- | :------------------------- | :----- | :----------------------------------------------------------------- |
| `GET`    | `/api/friends`             | Bearer | Список друзей, входящих и исходящих заявок                         |
| `GET`    | `/api/friends/search`      | Bearer | Поиск пользователей по email (`?q=`)                               |
| `POST`   | `/api/friends/request`     | Bearer | Отправить заявку в друзья `{ email }` или `{ friendId }`           |
| `POST`   | `/api/friends/accept/:id`  | Bearer | Принять заявку в друзья                                            |
| `POST`   | `/api/friends/decline/:id` | Bearer | Отклонить заявку в друзья                                          |
| `DELETE` | `/api/friends/:friendId`   | Bearer | Удалить из друзей                                                  |
| `POST`   | `/api/friends/tasks`       | Bearer | Назначить задачу другу `{ friendId, title, date, priority, note }` |
| `GET`    | `/api/friends/tasks/sent`  | Bearer | Список задач, назначенных друзьям, и их статус                     |

---

## 5. Стратегия взаимодействия фронтенда с бэкендом

1. **Офлайн-first приоритет**:
   - Приложение на клиенте сохраняет все состояния локально (IndexedDB с мгновенным чтением через синхронный кэш localStorage).
   - При наличии интернета и авторизации изменения автоматически отправляются на бэкенд в фоне с debounce.
2. **Отказоустойчивость**:
   - Если Worker недоступен (ошибка сети, 502/503/504, нет связи), фронтенд продолжает работать без ошибок и задержек, сохраняя данные в локальную IndexedDB.
   - При восстановлении подключения (`window.online`) запускается фоновый pull/push синк.
3. **Автоматический рефреш токенов**:
   - При ответе `401 Unauthorized` `apiClient` автоматически отправляет запрос на `/auth/refresh`. В случае успеха повторяет исходный запрос прозрачно для вызывающего кода.

---

## 6. Команды разработки и деплоя

```bash
# Локальный запуск Worker с локальной базой данных D1
cd worker && npx wrangler dev

# Применение миграций локально
cd worker && npx wrangler d1 migrations apply DB --local

# Применение миграций на продакшене Cloudflare
cd worker && npx wrangler d1 migrations apply DB --remote

# Проверка типов TypeScript
cd worker && npm run typecheck

# Деплой в Cloudflare Workers
cd worker && npx wrangler deploy
```
