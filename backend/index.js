import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorMiddleware from "./src/middlewares/errorMiddleware.js";
import authRoutes from './src/routes/auth.js';
import projectRoutes from './src/routes/project.js';
import fileRoutes from './src/routes/file.js';
import lintRoutes from './src/routes/lint.js';
import adminRoutes from './src/routes/admin.js';
import templatesRoutes from './src/routes/templates.js';
import projectMemberRoutes from './src/routes/projectMember.js';
import http from 'http';
import {Server} from 'socket.io';
import InviteObserver from "./src/observers/inviteObserver.js";
import dockerRoutes from './src/routes/docker.js';
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 4000;

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/files', fileRoutes);
app.use('/api/projects/:projectId/members', projectMemberRoutes);
app.use('/api/lint', lintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/docker', dockerRoutes)
// Error middleware должен быть последним
app.use(errorMiddleware);

// Создаем HTTP сервер с Express app
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinfile', (fileId) => {
    socket.join(fileId);
    console.log(`User ${socket.id} joined file:${fileId}`);
  });
  
  socket.on('leavefile', (fileId) => {
    socket.leave(fileId);
    console.log(`User ${socket.id} left file:${fileId}`);
  });
  
  socket.on('fileEdit', ({ fileId, content, userId }) => {
    socket.to(fileId).emit('fileEdited', { fileId, content, userId });
  });
  
  socket.on('registerUser', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} registered for notifications`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Invite observer
const inviteObserver = new InviteObserver(io);
app.set('inviteObserver', inviteObserver);

// Экспортируем io для использования в других файлах
export { io };

// Запускаем только server, который включает в себя Express app
server.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
  console.log(`🚀 Socket.io listening on http://localhost:${PORT}`);
});