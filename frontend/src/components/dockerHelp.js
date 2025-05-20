export const DOCKER_HELP = {
  FROM: {
    desc: "Указывает базовый образ для сборки.",
    bestPractice: "Используйте конкретные теги, а не latest.",
    example: "FROM node:18-alpine",
    link: "https://docs.docker.com/engine/reference/builder/#from"
  },
  RUN: {
    desc: "Выполняет команду в контейнере на этапе сборки.",
    bestPractice: "Объединяйте команды через && для уменьшения числа слоёв.",
    example: "RUN apt-get update && apt-get install -y curl",
    link: "https://docs.docker.com/engine/reference/builder/#run"
  },
  EXPOSE: {
    desc: "Открывает порт для взаимодействия с контейнером.",
    bestPractice: "Явно указывайте протокол (tcp/udp), если требуется.",
    example: "EXPOSE 3000",
    link: "https://docs.docker.com/engine/reference/builder/#expose"
  },
  WORKDIR: {
    desc: "Устанавливает рабочую директорию для следующих инструкций.",
    bestPractice: "Используйте абсолютные пути.",
    example: "WORKDIR /app",
    link: "https://docs.docker.com/engine/reference/builder/#workdir"
  },
  COPY: {
    desc: "Копирует файлы и директории в контейнер.",
    bestPractice: "Используйте .dockerignore для исключения лишних файлов.",
    example: "COPY . .",
    link: "https://docs.docker.com/engine/reference/builder/#copy"
  },
  CMD: {
    desc: "Задает команду по умолчанию для запуска контейнера.",
    bestPractice: "Используйте массив для передачи аргументов.",
    example: "CMD [\"node\", \"app.js\"]",
    link: "https://docs.docker.com/engine/reference/builder/#cmd"
  },
  ENV: {
    desc: "Устанавливает переменные окружения.",
    bestPractice: "Не храните секреты в ENV.",
    example: "ENV NODE_ENV=production",
    link: "https://docs.docker.com/engine/reference/builder/#env"
  },
  ENTRYPOINT: {
    desc: "Задает основную команду, которую нельзя переопределить через docker run.",
    bestPractice: "Используйте ENTRYPOINT для запуска основного процесса.",
    example: "ENTRYPOINT [\"/entrypoint.sh\"]",
    link: "https://docs.docker.com/engine/reference/builder/#entrypoint"
  },
  ARG: {
    desc: "Определяет переменные, передаваемые на этапе сборки.",
    bestPractice: "Используйте для параметризации сборки.",
    example: "ARG VERSION=1.0.0",
    link: "https://docs.docker.com/engine/reference/builder/#arg"
  },
  USER: {
    desc: "Устанавливает пользователя для выполнения следующих инструкций.",
    bestPractice: "Не запускайте приложения от root.",
    example: "USER node",
    link: "https://docs.docker.com/engine/reference/builder/#user"
  },
  VOLUME: {
    desc: "Создает точку монтирования для внешних данных.",
    bestPractice: "Используйте для хранения данных вне контейнера.",
    example: "VOLUME /data",
    link: "https://docs.docker.com/engine/reference/builder/#volume"
  },
  LABEL: {
    desc: "Добавляет метаданные к образу.",
    bestPractice: "Используйте для указания версии, автора и другой информации.",
    example: "LABEL maintainer=\"you@example.com\"",
    link: "https://docs.docker.com/engine/reference/builder/#label"
  }
};