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
dotenv.config();

const app = express();

app.use(cors(

  { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
));
// app.use(cors())
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects/:projectId/files', fileRoutes);
app.use('/api/lint', lintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/projects/:projectId/members', projectMemberRoutes);
app.use(errorMiddleware);
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});