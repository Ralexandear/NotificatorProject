import { Router, Request, Response } from "express";
import userController from '../controllers/userController';
import authMiddleware from "../middleware/authMiddleware";
const router = Router();

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/edit', authMiddleware, userController.edit)
router.get('/auth', authMiddleware, userController.check)

export default router