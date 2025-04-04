import 'dotenv/config'
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiError from '../error/ApiError';
import { FatalError } from '../error/FatalError';

const SECRET_KEY = (() => {
  const {SECRET_KEY} = process.env;
  
  if (! SECRET_KEY) throw new FatalError('SECRET_KEY is missing in ENV file')
  return SECRET_KEY
})();

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    if (!req.headers.authorization) {
      return next(ApiError.unauthorized('Api key is missing!'));
    }

    const [tokenType, token] = req.headers.authorization.split(' ');

    if (tokenType !== 'Bearer' || !token) {
      return next(ApiError.unauthorized());
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    if (! (
      typeof decoded === 'object' &&
      decoded.id &&
      decoded.username &&
      decoded.authorizationType &&
      decoded.TelegramUserId &&
      decoded.role
    )) {
      return next(ApiError.unauthorized());
    }

    
    next();
  } catch (e) {
    return next(ApiError.unauthorized());
  }
}
