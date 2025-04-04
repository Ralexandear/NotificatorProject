import { Router, Request, Response, NextFunction } from "express";
const router = Router();

import userRouter from './userRouter'
import botRouter from './botRouter'
import groupRouter from './groupRouter'
import orderRouter from './orderRouter'
import pointRouter from './pointRouter'

import checkRoleMiddleware from "../middleware/checkRoleMiddleware";
import ApiError from "../error/ApiError";

// import orderRouter from './orderRouter'
router.use('/user', userRouter)

router.use('/', checkRoleMiddleware('ADMIN')) // дальше методы доступны только для зарегистрированных пользователей

router.use('/bot', botRouter)
router.use('/group', groupRouter)
router.use('/order', orderRouter)
// router.use('/user', userRouter)
router.use('/point', pointRouter)
router.use('/', (req: Request, res: Response, next: NextFunction) => next(ApiError.notFound()))

export default router