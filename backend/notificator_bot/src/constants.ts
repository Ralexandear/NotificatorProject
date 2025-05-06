import 'dotenv/config';
import { FatalError } from './shared/errors/FatalError';
import Logger from './shared/utils/Logger';

export const {BOT_TOKEN: BOT_TOKEN_ENV, NODE_ENV} = process.env ?? {}

if (BOT_TOKEN_ENV === undefined) {
  throw new FatalError('At least one of required parameters is not defined in .env file')
}

export const BOT_TOKEN = BOT_TOKEN_ENV;
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const RABBIT_RESPONSE_TIMEOUT = 30 //seconds

if (!IS_PRODUCTION) {
  Logger.useDebug();
}
