# Самый простой контейнер - Python HTTP сервер
# 100% рабочий пример для новичков

FROM python:3.11-alpine

WORKDIR /app

# Создаем простую HTML страницу
RUN echo '<html><body><h1>🐳 Python HTTP Server</h1><p>Контейнер работает!</p><p>Время: '"$(date)"'</p></body></html>' > index.html

EXPOSE 8000

# Запускаем встроенный HTTP сервер Python
CMD ["python", "-m", "http.server", "8000"]
