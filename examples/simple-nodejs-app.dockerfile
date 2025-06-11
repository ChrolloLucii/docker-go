
# Простое веб-приложение на Node.js
# Этот Dockerfile создает контейнер с Express.js сервером

# Базовый образ с Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта (package.json и server.js создаются автоматически)
COPY . .

# Устанавливаем зависимости
RUN npm install

# Открываем порт для веб-сервера
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
