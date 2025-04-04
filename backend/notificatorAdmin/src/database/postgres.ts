import 'dotenv/config'
import {Sequelize} from "sequelize";
import { FatalError } from '../errors/FatalError';

const {POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, DB_PORT = 5432} = process.env

if (POSTGRES_DB === undefined || POSTGRES_USER === undefined || POSTGRES_PASSWORD === undefined) {
  throw new FatalError('Unable to connect to POSTGRES, at least one of required parameters is missing!');
}

export const postgres = new Sequelize(
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  {
    dialect: 'postgres',
    host: 'localhost',
    port: +DB_PORT
  }
)

export default postgres;