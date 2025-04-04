import ApiError from "../error/ApiError";
import { Request, Response, NextFunction } from "express";
import Logger from "../utils/Logger";

export default function errorHandlingMiddleware(error: Error | ApiError, req : Request, res : Response, next: NextFunction): Response{
  Logger.error(error)

  if (error instanceof ApiError){
    return res.status(error.status).json({ok: false, message: error.message})
  }
  return res.status(500).json({message: 'Unexpected error'})
}