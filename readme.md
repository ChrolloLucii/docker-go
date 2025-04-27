# JWT‑Auth-App

Простое приложение с бэкендом на Express и фронтендом на Next.js. Реализует регистрацию, вход и доступ к защищённому ресурсу через JWT.


## Требования  
- Node.js v16+  
- npm или yarn  

## Установка и запуск

#### 1. Клонировать репозиторий  
```bash
git clone https://github.com/username/docker-go.git
cd docker-go
```
#### 2. Важно Переключиться на ветку homework
```bash
git checkout homework
```
#### 3. Создать .env файл в backend и прописать: 
JWT_SECRET=secret
#### 3. Создать .env.local файл в frontend и прописать: 
NEXT_PUBLIC_API_URL=http://localhost:4000/api
#### 4. В корне проекта выполнить: 
```bash
npm install
npm run dev
```