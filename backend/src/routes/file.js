import { Router } from 'express';
import * as fileCtrl from '../controllers/fileController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router({ mergeParams: true });
router.use(authMiddleware);

// GET    /api/projects/:projectId/files
router.get('/', fileCtrl.getFiles);
// GET    /api/projects/:projectId/files/:id
router.get('/:id', fileCtrl.getFile);
// POST   /api/projects/:projectId/files
router.post('/', fileCtrl.createFile);
// PUT    /api/projects/:projectId/files/:id
router.put('/:id', fileCtrl.updateFile);
// DELETE /api/projects/:projectId/files/:id
router.delete('/:id', fileCtrl.deleteFile);

export default router;