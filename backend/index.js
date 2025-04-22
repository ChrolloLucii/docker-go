import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorMiddleware from "./src/middlewares/errorMiddleware.js";
import authRoutes from './src/routes/auth.js';

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


app.use(errorMiddleware);
app.use('/api/auth', authRoutes)
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});