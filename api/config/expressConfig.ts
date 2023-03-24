import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import UserRouter from '../src/domains/User/controllers/index';
import ContractRouter from '../src/domains/Contract/controllers/index';
import ProjectRouter from '../src/domains/Project/controllers/index';
import { errorHandler } from '../src/middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(cors(
	{
		origin: 'http://localhost:5173',//process.env.APP_URL,
		credentials: true,
	},
));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));



app.use('/api/users',UserRouter);
app.use('/api/contracts',ContractRouter);
app.use('/api/projects',ProjectRouter);

app.use(errorHandler);


export default app;