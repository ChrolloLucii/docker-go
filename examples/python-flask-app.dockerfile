# Python Flask веб-приложение
# Простой пример API сервера

# Базовый образ Python
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Создаем простое Flask приложение
RUN echo 'from flask import Flask\n\
app = Flask(__name__)\n\
\n\
@app.route("/")\n\
def hello():\n\
    return "<h1>🐍 Python Flask работает!</h1><p>Контейнер успешно запущен</p>"\n\
\n\
if __name__ == "__main__":\n\
    app.run(host="0.0.0.0", port=5000)' > app.py

# Устанавливаем Flask
RUN pip install flask

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["python", "app.py"]
