# Docker-Go Backend

## Описание

Бэкенд для системы визуального и текстового конструирования Dockerfile с возможностью запуска контейнеров, проверки Dockerfile через hadolint, управления проектами, файлами, участниками и ролями. Реализована поддержка совместной работы, разграничение прав, интеграция с Docker и WebSocket-уведомления.

---

## Структура проекта

```
docker-go/
├── backend/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   ├── postmanCollection.json
│   ├── migrations/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── observers/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── strategies/
│       └── utils/
├── frontend/
│   ├── .env.local
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       └── services/
```

---

## Основные сущности

- **User** — пользователь системы (id, email, username, role).
- **Project** — проект пользователя.
- **DockerFile** — файл Dockerfile, связанный с проектом.
- **ProjectMember** — участник проекта с ролью (editor, admin, participant).
- **Template** — шаблон Dockerfile.
- **ProjectVersion** — версия проекта.

---

## Установка и запуск

### Требования

- Node.js >= 18
- npm
- PostgreSQL
- Docker (для hadolint и запуска контейнеров)

### Установка зависимостей

```sh
cd backend
npm install
```

### Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dockergo
DB_USER=postgres
DB_PASS=yourpassword
JWT_SECRET=your_jwt_secret
FRONTEND_ORIGIN=http://localhost:3000
```

### Миграции базы данных

```sh
npx sequelize-cli db:migrate
```

### Запуск сервера

```sh
npm run dev
```

---

## Основные возможности API

### Аутентификация

- `POST /api/auth/register` — регистрация пользователя
- `POST /api/auth/login` — вход

### Проекты

- `GET /api/projects` — список проектов пользователя
- `POST /api/projects` — создать проект
- `PUT /api/projects/:id` — обновить проект
- `DELETE /api/projects/:id` — удалить проект

### Файлы

- `GET /api/projects/:projectId/files` — список файлов проекта
- `POST /api/projects/:projectId/files` — создать файл
- `PUT /api/projects/:projectId/files/:fileId` — обновить файл
- `DELETE /api/projects/:projectId/files/:fileId` — удалить файл

### Участники проекта

- `GET /api/projects/:projectId/members` — список участников
- `POST /api/projects/:projectId/members` — добавить участника (по userId)
- `POST /api/projects/:projectId/members/by-username` — добавить участника по нику
- `DELETE /api/projects/:projectId/members/:userId` — удалить участника

### Dockerfile и контейнеры

- `POST /api/docker/build-and-run` — собрать и запустить контейнер по Dockerfile
- `GET /api/docker/containers/:containerName/status` — статус контейнера
- `GET /api/docker/containers/:containerName/logs` — логи контейнера
- `DELETE /api/docker/containers/:containerName` — остановить и удалить контейнер
- `DELETE /api/docker/containers/cleanup` — удалить все свои контейнеры

### Линтинг Dockerfile

- `POST /api/lint` — проверить Dockerfile через hadolint

### Админ-панель

- `GET /api/admin/users` — список пользователей
- `PUT /api/admin/users/:id/role` — смена роли пользователя
- `DELETE /api/admin/users/:id` — удалить пользователя

---

## Примеры запросов

### Пример: запуск Dockerfile

```http
POST /api/docker/build-and-run
Authorization: Bearer <token>
Content-Type: application/json

{
  "dockerfileContent": "FROM node:18\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]",
  "projectId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Ответ:**
```json
{
  "success": true,
  "buildId": "b1c2d3e4-...",
  "imageName": "user-...-project-...-...",
  "containerName": "user-...-project-...-...-container",
  "containerPort": "3000",
  "hostPort": 3123,
  "url": "http://localhost:3123",
  "buildOutput": "...",
  "runOutput": "..."
}
```

---

## Тестирование

- Модульные тесты: `npm run test`
- Интеграционные тесты: см. `src/services/__tests__/`, `src/repositories/__tests__/`
- Коллекция Postman: `postmanCollection.json` (можно импортировать в Postman)

---

## Паттерны проектирования

- **Стратегия**: разграничение прав доступа через классы стратегий (`src/strategies/roleStrategy.js`)
- **Обсервер**: уведомления о приглашениях через WebSocket (`src/observers/inviteObserver.js`)
- **Фабрика**: создание стратегий доступа в зависимости от роли пользователя

---

## Основные сценарии работы

1. Пользователь регистрируется и входит в систему.
2. Создаёт проект, добавляет Dockerfile (через визуальный или текстовый редактор).
3. Приглашает участников по нику или userId.
4. Запускает сборку и запуск контейнера по Dockerfile, получает ссылку и логи.
5. Использует линтер для проверки Dockerfile.
6. Администратор управляет пользователями и проектами через админ-панель.