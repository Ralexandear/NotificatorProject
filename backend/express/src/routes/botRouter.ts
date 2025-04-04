import { Router, Request, Response, NextFunction } from "express";
const router = Router();
import botController from "../controllers/botController";
import checkRoleMiddleware from "../middleware/checkRoleMiddleware";
import ApiError from "../error/ApiError";

router.post('/create', botController.create)
router.get('/list', botController.list)
router.delete('/delete', botController.delete)

export default router