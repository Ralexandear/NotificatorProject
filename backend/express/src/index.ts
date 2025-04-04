import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authMiddleware from './middleware/authMiddleware';
import errorHandlingMiddleware from './middleware/errorHandlingMiddleware';


// В вашем основном файле
// import Database from './database/db';
// import * as models from './database/init';
// import { Request, Response } from 'express';
// import router from './routes/index';
// import errorHandlingMiddleware from './middleware/errorHandlingMiddleware';
 
const PORT = process.env.EXPRESS_PORT || 5000;

const app = express()
app.use(cors())
app.use(express.json())

app.use(authMiddleware); // Checking users

//ErrorHandling
//@ts-ignore
app.use(errorHandlingMiddleware);




async function start() {
  try {
    app.listen(PORT, () => console.log(`Notificatorbot server started http://localhost:${PORT}`));
  } catch (error) {
    console.error(error);
  }
}

start();