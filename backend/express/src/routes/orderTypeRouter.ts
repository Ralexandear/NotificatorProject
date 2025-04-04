import { Router } from "express";
import orderTypeController from "../controllers/orderTypeController";
const router = Router();

router.post('/create', orderTypeController.create)
router.post('/edit', orderTypeController.edit)
router.get('/list', orderTypeController.list)
router.delete('/delete', orderTypeController.delete)

export default router