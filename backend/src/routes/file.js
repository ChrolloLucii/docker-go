import {Router} from 'express';
import * as fileCtrl from '../controllers/fileController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();