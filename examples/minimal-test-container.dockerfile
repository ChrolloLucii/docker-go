# Самый простой контейнер для тестирования
# Показывает базовые принципы Docker

# Легкий базовый образ Alpine Linux
FROM alpine:latest

# Обновляем пакеты и устанавливаем необходимые инструменты
RUN apk update && apk add --no-cache curl

# Создаем простую HTML страницу
RUN echo '<html><body><h1>🐳 Docker контейнер работает!</h1><p>Время: '"$(date)"'</p></body></html>' > /tmp/index.html

# Устанавливаем Python для простого веб-сервера
RUN apk add --no-cache python3

# Создаем рабочую директорию
WORKDIR /app

# Копируем HTML файл
RUN cp /tmp/index.html .

# Открываем порт
EXPOSE 8000

# Запускаем простой HTTP сервер Python
CMD ["python3", "-m", "http.server", "8000"]
