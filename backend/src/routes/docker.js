import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { 
  buildAndRun, 
  stopContainer, 
  getContainerLogs, 
  getContainerStatus, 
  cleanupAllContainers 
} from '../controllers/dockerController.js';

const router = Router();

// Применяем middleware аутентификации ко всем маршрутам
router.use(authMiddleware);

router.post('/build-and-run', buildAndRun);
router.delete('/containers/:containerName', stopContainer);
router.get('/containers/:containerName/logs', getContainerLogs);
router.get('/containers/:containerName/status', getContainerStatus);
router.delete('/containers/cleanup', cleanupAllContainers);

export default router;