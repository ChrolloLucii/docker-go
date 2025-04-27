import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, (req, res) => {
  res.json({ message: `Hello, ${req.user.email}`, projects: [] });
});
export default router;