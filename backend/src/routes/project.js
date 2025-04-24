import {Router} from 'express';

import * as projController from '../controllers/projectController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', projController.getAllProjects);
router.get('/:id', projController.getProjectById);
router.post('/', projController.createProject);
router.put('/:id', projController.updateProject);
router.delete('/:id', projController.deleteProject);
router.get('/:userId', projController.getAllProjectsPerUser);
export default router;