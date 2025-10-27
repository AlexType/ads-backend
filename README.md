# 🚀 Influencer Aggregator - Backend API

RESTful API для агрегатора поиска блогеров. Позволяет рекламодателям находить блогеров для рекламных кампаний.

## 📋 Содержание

- [Возможности](#-возможности)
- [Технологии](#-технологии)
- [Быстрый старт](#-быстрый-старт)
- [Установка](#установка)
- [Конфигурация](#-конфигурация)
- [Структура проекта](#-структура-проекта)
- [API документация](#-api-документация)
- [Аутентификация](#-аутентификация)
- [Безопасность](#-безопасность)
- [Скрипты](#-скрипты)
- [Разработка](#-разработка)
- [Production](#-production)

---

## 🎯 Возможности

### Аутентификация и авторизация
- ✅ Регистрация и вход пользователей
- ✅ JWT токены (Access + Refresh)
- ✅ Двухфакторная аутентификация (2FA)
- ✅ Восстановление пароля
- ✅ httpOnly cookies для безопасного хранения
- ✅ Роли: blogger, advertiser, admin

### Поиск и рекомендации
- ✅ Поиск блогеров с множественными фильтрами
- ✅ AI рекомендации на основе кампании
- ✅ Детальные профили блогеров
- ✅ Статистика аудитории

### Кампании и заказы
- ✅ CRUD операции для кампаний
- ✅ Полный жизненный цикл заказов
- ✅ Отслеживание статусов
- ✅ Аналитика по кампаниям

### Коммуникация
- ✅ Чат между блогером и рекламодателем
- ✅ Уведомления в реальном времени
- ✅ Support тикеты

### Платежи
- ✅ История транзакций
- ✅ График доходов
- ✅ Статистика выплат

### Администрирование
- ✅ Управление пользователями и администраторами
- ✅ Управление услугами
- ✅ Настройки сайта
- ✅ Дашборд с метриками

---

## 🛠 Технологии

- **Node.js** 18+ - Runtime
- **Express.js** 4.x - Web framework
- **MongoDB** + Mongoose - База данных
- **JWT** - Аутентификация
- **Bcrypt** - Хеширование паролей
- **Speakeasy** - 2FA генерация
- **Winston** - Логирование
- **Helmet** - Безопасные заголовки
- **CORS** - Кросс-доменные запросы
- **Express Rate Limit** - Защита от DDoS
- **Express Validator** - Валидация данных
- **Socket.io** - WebSockets
- **Nodemailer** - Отправка email

---

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- MongoDB Atlas (или локальный MongoDB)
- npm или yarn

### 1️⃣ Клонирование проекта
```bash
git clone <repository-url>
cd backend
```

### 2️⃣ Установка зависимостей
```bash
npm install
```

### 3️⃣ Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```env
# Окружение
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5174

# 2FA
TWO_FACTOR_ISSUER=InfluencerAggregator

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (опционально для production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### 4️⃣ Запуск сервера

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Сервер будет доступен на `http://localhost:3000`

---

## 📦 Структура проекта

```
backend/
├── src/
│   ├── config/
│   │   ├── cors.js           # CORS настройки
│   │   └── database.js        # MongoDB подключение
│   ├── controllers/           # Бизнес-логика
│   │   ├── auth.controller.js
│   │   ├── campaign.controller.js
│   │   ├── order.controller.js
│   │   ├── search.controller.js
│   │   ├── analytics.controller.js
│   │   └── ...
│   ├── middleware/
│   │   └── auth.middleware.js # JWT аутентификация
│   ├── models/                # Mongoose схемы
│   │   ├── User.model.js
│   │   ├── Blogger.model.js
│   │   ├── Order.model.js
│   │   └── ...
│   ├── routes/                # API маршруты
│   │   ├── auth.routes.js
│   │   ├── campaign.routes.js
│   │   └── ...
│   ├── validators/            # Валидация данных
│   │   ├── auth.validator.js
│   │   └── ...
│   ├── utils/
│   │   └── logger.js          # Winston logger
│   ├── app.js                 # Express приложение
│   └── server.js              # Entry point
├── scripts/                   # Утилиты
│   ├── clear-db.js
│   ├── seed-database.js
│   └── create-*.js
├── logs/                      # Логи
├── .env
├── package.json
└── README.md
```

---

## 📚 API документация

### Базовый URL
```
http://localhost:3000/api/v1
```

### Основные эндпоинты

#### 🔐 Аутентификация
```bash
POST   /auth/register           # Регистрация
POST   /auth/login              # Вход
POST   /auth/logout             # Выход
POST   /auth/refresh            # Обновление токена
POST   /auth/forgot-password    # Забыли пароль
POST   /auth/reset-password     # Сброс пароля
POST   /auth/2fa/enable         # Включить 2FA
POST   /auth/2fa/verify         # Подтвердить 2FA
POST   /auth/2fa/disable        # Отключить 2FA
```

#### 👤 Профиль
```bash
GET    /profile                 # Получить профиль
PUT    /profile                 # Обновить профиль
POST   /profile/change-password # Сменить пароль
```

#### 📢 Кампании
```bash
GET    /campaigns               # Список кампаний
POST   /campaigns               # Создать кампанию
GET    /campaigns/:id           # Детали кампании
PUT    /campaigns/:id           # Обновить кампанию
DELETE /campaigns/:id           # Удалить кампанию
```

#### 📋 Заказы
```bash
GET    /orders                  # Список заказов
POST   /orders                  # Создать заказ
GET    /orders/:id              # Детали заказа
PUT    /orders/:id              # Обновить заказ
```

#### 🔍 Поиск
```bash
GET    /search/bloggers         # Поиск блогеров
GET    /bloggers/:id            # Профиль блогера
GET    /recommendations         # AI рекомендации
```

#### 📊 Аналитика
```bash
GET    /analytics/blogger       # Аналитика блогера
GET    /analytics/advertiser    # Аналитика рекламодателя
```

#### 💬 Чаты
```bash
GET    /chats                   # Список чатов
POST   /chats                   # Создать/найти чат
GET    /chats/:id/messages      # Сообщения
POST   /chats/:id/messages      # Отправить сообщение
```

#### 💳 Платежи
```bash
GET    /payments                # История платежей
GET    /payments/:id            # Детали платежа
```

### Полная документация

Детальная документация находится в `/api-docs/`:

- **API.md** - Все эндпоинты API
- **AUTH.md** - Система аутентификации
- **MODELS.md** - Модели данных
- **VALIDATION.md** - Правила валидации
- **SECURITY_AND_CODE_ANALYSIS_REPORT.md** - Анализ безопасности

---

## 🔐 Аутентификация

### Регистрация
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Иван",
  "lastName": "Иванов",
  "role": "blogger" // или "advertiser"
}
```

### Вход
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Использование токена
```bash
GET /api/v1/profile
Authorization: Bearer <access_token>
```

Токены хранятся в httpOnly cookies автоматически.

---

## 🛡 Безопасность

### Реализованные меры
- ✅ **JWT** - Управление сессиями
- ✅ **Bcrypt** - Хеширование паролей
- ✅ **Helmet** - Безопасные HTTP заголовки
- ✅ **CORS** - Защита от нежелательных источников
- ✅ **Rate Limiting** - Защита от DDoS атак
- ✅ **Mongo Sanitize** - Защита от NoSQL injection
- ✅ **Express Validator** - Валидация всех входных данных
- ✅ **httpOnly Cookies** - Защита от XSS атак
- ✅ **2FA** - Двухфакторная аутентификация

### Rate Limiting
```javascript
// По умолчанию
15 минут: 100 запросов

// Для auth endpoints (строже)
15 минут: 10 запросов
```

### CORS
```javascript
// Разрешены origin:
- http://localhost:5173
- http://localhost:5174
```

---

## 🧪 Скрипты

### Управление данными
```bash
# Очистить базу данных
npm run clear-db

# Заполнить тестовыми данными
npm run seed

# Создать пользователя
npm run create-user

# Создать рекламодателя
npm run create-advertiser

# Создать блогера
npm run create-blogger

# Добавить кампании
npm run add-campaigns

# Добавить услуги
npm run add-services
```

### Разработка
```bash
# Запуск в dev режиме (с автоперезагрузкой)
npm run dev

# Запуск production
npm start

# Линтинг
npm run lint

# Форматирование
npm run format

# Тесты
npm test
```

---

## 👥 Роли пользователей

### Blogger (Блогер)
- Создание и редактирование профиля
- Подключение социальных аккаунтов
- Просмотр и принятие заказов
- Просмотр аналитики
- Получение платежей
- Общение с рекламодателями

### Advertiser (Рекламодатель)
- Создание кампаний
- Поиск блогеров
- Создание заказов
- Просмотр аналитики
- Управление бюджетом
- Общение с блогерами

### Admin (Администратор)
- Управление пользователями
- Управление администраторами
- Управление услугами
- Настройки сайта
- Просмотр статистики
- Поддержка пользователей

---

## 📊 Модели данных

### Основные сущности
1. **User** - Пользователи системы
2. **Blogger** - Профили блогеров
3. **SocialAccount** - Социальные аккаунты
4. **Campaign** - Рекламные кампании
5. **Order** - Заказы
6. **Chat** - Чаты
7. **Message** - Сообщения
8. **Payment** - Платежи
9. **Notification** - Уведомления
10. **Review** - Отзывы
11. **Analytics** - Аналитика
12. **SupportTicket** - Тикеты поддержки
13. **Service** - Услуги
14. **SiteSettings** - Настройки сайта

Полное описание моделей: `/api-docs/MODELS.md`

---

## 🔧 Разработка

### Добавление нового эндпоинта

1. **Создать модель** в `src/models/`
2. **Создать контроллер** в `src/controllers/`
3. **Создать валидатор** в `src/validators/`
4. **Создать роуты** в `src/routes/`
5. **Подключить роуты** в `src/app.js`

### Пример структуры
```javascript
// models/Example.model.js
const ExampleSchema = new mongoose.Schema({
  field: String
});

// controllers/example.controller.js
const getExamples = async (req, res, next) => {
  // Логика
};

// validators/example.validator.js
const validateExample = [ /* rules */ ];

// routes/example.routes.js
router.get('/', authenticate, getExamples);
```

---

## 🚀 Production

### Подготовка к деплою

1. **Обновите `.env`:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_uri
   JWT_SECRET=strong_secret_here
   ```

2. **Настройте MongoDB Atlas:**
   - Whitelist IP адреса сервера
   - Создайте production базу данных

3. **Включите HTTPS:**
   - Настройте SSL сертификат
   - Перенаправляйте HTTP → HTTPS

4. **Настройте мониторинг:**
   - Winston логи
   - Error tracking (Sentry)
   - Uptime monitoring

### Переменные окружения

**Обязательные:**
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

**Рекомендуемые:**
- `FRONTEND_URL`
- `SMTP_*` (для email)
- `NODE_ENV=production`

---

## 📞 Поддержка

### Полезные ссылки
- **API Документация:** `/api-docs/API.md`
- **Модели:** `/api-docs/MODELS.md`
- **Авторизация:** `/api-docs/AUTH.md`
- **Архитектура:** `/api-docs/ARCHITECTURE.md`

### Логи
Логи сохраняются в папке `logs/`:
- `error.log` - Ошибки
- `combined.log` - Все логи

---

## ✅ Статус проекта

**Backend API:** ✅ Полностью готов  
**Тесты:** 🟡 Частично  
**Документация:** ✅ Готова  
**Безопасность:** ✅ Все меры реализованы  

---

## 📝 Changelog

### v1.0.0 (2025-10-27)
- ✅ Полная реализация всех эндпоинтов
- ✅ Аутентификация с JWT
- ✅ Реализация 2FA
- ✅ Восстановление пароля
- ✅ Поиск блогеров
- ✅ AI рекомендации
- ✅ Чаты и уведомления
- ✅ Аналитика
- ✅ Платежи
- ✅ Админ-панель
- ✅ Все меры безопасности

---

**Версия:** 1.0.0  
**Лицензия:** MIT  
**Автор:** Senior Developer
