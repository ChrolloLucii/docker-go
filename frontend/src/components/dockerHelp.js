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
  }
};