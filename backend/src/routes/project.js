import { Router } from 'express';
import * as projCtrl from '../controllers/projectController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

// GET  /api/projects          → текущий пользователь
router.get('/', projCtrl.getAllProjectsPerUser);
// GET  /api/projects/:id
router.get('/:id', projCtrl.getProjectById);
// POST /api/projects
router.post('/', projCtrl.createProject);
// PUT  /api/projects/:id
router.put('/:id', projCtrl.updateProject);
// DELETE /api/projects/:id
router.delete('/:id', projCtrl.deleteProject);

export default router;