import { Router } from "express";
import pointController from "../controllers/pointController";
const router = Router();

router.post('/', pointController.create)
router.delete('/', pointController.delete)

export default router