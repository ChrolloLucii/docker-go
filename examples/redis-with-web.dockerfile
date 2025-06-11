# Redis сервер с простым веб-интерфейсом
# Пример для изучения баз данных

# Многоэтапная сборка - сначала Redis
FROM redis:alpine as redis-stage

# Теперь создаем основной контейнер с веб-интерфейсом
FROM node:18-alpine

# Устанавливаем Redis
RUN apk add --no-cache redis

# Создаем простое приложение для тестирования Redis
WORKDIR /app

# Создаем package.json
RUN echo '{\
  "name": "redis-test",\
  "version": "1.0.0",\
  "dependencies": {\
    "redis": "^4.0.0",\
    "express": "^4.18.0"\
  }\
}' > package.json

# Устанавливаем зависимости
RUN npm install

# Создаем простое приложение
RUN echo 'const express = require("express");\
const redis = require("redis");\
const app = express();\
\
app.get("/", async (req, res) => {\
  try {\
    const client = redis.createClient({ host: "localhost", port: 6379 });\
    await client.connect();\
    await client.set("test", "Redis работает!");\
    const value = await client.get("test");\
    await client.disconnect();\
    res.send(`<h1>🗄️ Redis тест</h1><p>Значение: ${value}</p>`);\
  } catch (err) {\
    res.send(`<h1>❌ Ошибка</h1><p>${err.message}</p>`);\
  }\
});\
\
app.listen(3000, () => console.log("Server running"));' > app.js

# Открываем порты
EXPOSE 3000 6379

# Запускаем Redis и приложение
CMD ["sh", "-c", "redis-server --daemonize yes && node app.js"]
