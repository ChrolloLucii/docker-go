import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { getAllUsers, getAllProjects, deleteAnyProject, updateUserRole, deleteUser } from "../controllers/adminController.js";


const router = Router();
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", getAllUsers);
router.get("/projects", getAllProjects);
router.delete("/projects/:id", deleteAnyProject);
router.put("/users/:id/role", updateUserRole); // смена роли пользователя
router.delete("/users/:id", deleteUser);       // удаление пользователя
export default router;