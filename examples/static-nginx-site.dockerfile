# Статический веб-сайт с Nginx
# Простой пример для HTML страницы

# Используем официальный образ Nginx
FROM nginx:alpine

# Копируем HTML файлы в директорию веб-сервера
COPY . /usr/share/nginx/html

# Nginx автоматически слушает порт 80
EXPOSE 80

# Nginx запускается автоматически
