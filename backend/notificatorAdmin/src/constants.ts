import 'dotenv/config';
import { FatalError } from './errors/FatalError';

export const {API_ID: API_ID_ENV, API_HASH: API_HASH_ENV, BOT_TOKEN: BOT_TOKEN_ENV, ADMIN_CHAT_ID: ADMIN_CHAT_ID_ENV} = process.env ?? {}

if (API_ID_ENV === undefined || API_HASH_ENV === undefined || BOT_TOKEN_ENV === undefined) {
  throw new FatalError('At least one of required parameters is not defined in .env file')
}

export const API_ID = +API_ID_ENV;
export const API_HASH = API_HASH_ENV;
export const BOT_TOKEN = BOT_TOKEN_ENV;
export const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';
