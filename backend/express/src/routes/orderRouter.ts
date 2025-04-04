import { Router, Response, Request, NextFunction } from "express";
import orderTypeRouter from './orderTypeRouter'
const router = Router();

router.use('/type', orderTypeRouter)
router.post('/create', )
router.get('/', )

export default router