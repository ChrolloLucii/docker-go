# Гарантированно рабочий Node.js контейнер
# Самый простой пример для начинающих

FROM node:18-alpine

WORKDIR /app

# Устанавливаем Express напрямую
RUN npm init -y && npm install express

# Создаем простое приложение
RUN echo 'const express = require("express");\nconst app = express();\napp.get("/", (req, res) => res.send("<h1>🚀 Node.js работает!</h1>"));\napp.listen(3000, () => console.log("Server started"));' > server.js

EXPOSE 3000

CMD ["node", "server.js"]
