# 🚂 Деплой на Railway - Быстрый старт

## ✅ Готовность проекта

Все готово к деплою! Файлы на месте:
- ✅ `railway.toml` - конфигурация Railway
- ✅ `package.json` - скрипты настроены
- ✅ `.gitignore` - правильные исключения
- ✅ `.env.example` - пример переменных
- ✅ `README.md` - документация

---

## 🚀 Деплой на Railway (3 способа)

### Способ 1: Через GitHub (Рекомендуется)

1. **Закоммитьте изменения:**
   ```bash
   cd backend
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Создайте проект на Railway:**
   - Зайдите на https://railway.app
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите ваш репозиторий
   - Выберите папку `backend`

3. **Добавьте MongoDB:**
   - Нажмите "+ New"
   - Выберите "Database" → "Add MongoDB"
   - Railway создаст MongoDB автоматически

4. **Настройте переменные окружения:**
   - Зайдите в настройки проекта
   - Перейдите в "Variables"
   - Добавьте:
     ```env
     NODE_ENV=production
     MONGODB_URI=${{MongoDB.MONGO_URL}}
     JWT_SECRET=your_secret_here_min_32_chars
     JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
     JWT_EXPIRE=15m
     JWT_REFRESH_EXPIRE=7d
     FRONTEND_URL=https://your-frontend.vercel.app
     TWO_FACTOR_ISSUER=InfluencerAggregator
     RATE_LIMIT_WINDOW_MS=900000
     RATE_LIMIT_MAX_REQUESTS=100
     ```
   - **Важно:** JWT_SECRET и JWT_REFRESH_SECRET - сгенерируйте сильные ключи!
   
5. **Сгенерируйте JWT секреты:**
   ```bash
   # В терминале
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Скопируйте результат в JWT_SECRET
   
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   # Скопируйте результат в JWT_REFRESH_SECRET
   ```

6. **Деплой:**
   - Railway автоматически задеплоит
   - Получите URL в настройках (Settings → Domains)

---

### Способ 2: Через Railway CLI

1. **Установите Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Логин:**
   ```bash
   railway login
   ```

3. **Инициализация в папке backend:**
   ```bash
   cd backend
   railway init
   ```

4. **Добавьте MongoDB:**
   ```bash
   railway add mongodb
   ```

5. **Настройте переменные:**
   ```bash
   railway variables
   ```
   Откроется интерактивный редактор. Добавьте все переменные.

6. **Деплой:**
   ```bash
   railway up
   ```

7. **Получите URL:**
   ```bash
   railway domain
   ```

---

### Способ 3: Прямой деплой

1. Откройте https://railway.app
2. Нажмите "New Project"
3. Выберите "Empty Project"
4. Нажмите "+ Add Service" → "GitHub Repo"
5. Следуйте инструкциям выше

---

## 🔧 Настройка переменных окружения

### Обязательные переменные:

```env
NODE_ENV=production
MONGODB_URI=монгоАтлас_URL_или_Railway_MongoDB_URI
JWT_SECRET=сгенерированный_секрет_64_символа
JWT_REFRESH_SECRET=сгенерированный_секрет_64_символа
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=ваш_frontend_URL
TWO_FACTOR_ISSUER=InfluencerAggregator
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Генерация секретов:

```bash
# Запустите в терминале:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Запустите команду дважды - для JWT_SECRET и JWT_REFRESH_SECRET.

---

## 📊 Проверка деплоя

### 1. Health Check:
```bash
curl https://your-app.railway.app/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T..."
}
```

### 2. API Test:
```bash
curl https://your-app.railway.app/api/v1/public/services
```

---

## 🔗 Подключение MongoDB Atlas (если Railway MongoDB не используется)

1. Создайте аккаунт на https://www.mongodb.com/cloud/atlas
2. Создайте бесплатный кластер
3. Whitelist IP: `0.0.0.0/0` (разрешить все)
4. Создайте пользователя БД
5. Получите Connection String
6. Добавьте в Railway Variables: `MONGODB_URI=ваш_connection_string`

---

## 🌐 Настройка Frontend

После деплоя бэкенда, обновите `.env` в фронтенде:

```env
VITE_API_URL=https://your-api.railway.app/api/v1
```

Затем деплойте фронтенд на Vercel.

---

## 🎯 Финальный чеклист

- [ ] Проект закоммичен в GitHub
- [ ] Railway проект создан
- [ ] MongoDB подключен
- [ ] Все переменные окружения добавлены
- [ ] JWT секреты сгенерированы
- [ ] Деплой успешно завершен
- [ ] Health check работает
- [ ] API доступен
- [ ] Frontend настроен на новый API URL

---

## 🐛 Решение проблем

### Ошибка подключения к MongoDB:
- Проверьте MONGODB_URI
- Whitelist IP адрес
- Проверьте credentials

### Ошибка авторизации:
- Проверьте JWT_SECRET и JWT_REFRESH_SECRET
- Убедитесь что они не пустые
- Перезапустите сервис

### Порт не прослушивается:
- Railway автоматически назначает PORT
- Не изменяйте PORT вручную

---

## 📞 Поддержка

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

**Готово! 🎉 Ваш API будет доступен на URL вида:**
**https://your-project-name.railway.app**

