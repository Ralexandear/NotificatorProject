import { Router, Request, Response, NextFunction } from "express";
import ApiError from "../error/ApiError";
import GroupController from "../controllers/groupController";
import checkRoleMiddleware from "../middleware/checkRoleMiddleware";
const router = Router();

router.get('/list', GroupController.list)
router.post('/create', GroupController.create)
router.post('/edit', GroupController.edit)
router.delete('/delete', GroupController.delete)
router.use('/', (req: Request, res: Response, next: NextFunction) => next(ApiError.notFound()))

export default router