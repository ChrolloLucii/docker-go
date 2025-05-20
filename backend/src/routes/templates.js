import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json([]); // пока просто пустой массив
});

router.delete("/:id", (req, res) => {
  res.json({ message: "Шаблон удалён (заглушка)" });
});

export default router;