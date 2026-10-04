import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRouter from './api/routes';
import './lib/auth/auth-handlers';
import { errorHandlers } from './errors';

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json());

const health = (_req: express.Request, res: express.Response) => {
    res.json({
        status: 'ok',
        api: '/api',
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'locale',
        database: mongoose.connection.name ?? null,
        connessione: mongoose.connection.readyState
    });
};

app.get('/', health);
app.get('/api/health', health);

app.use('/api', apiRouter);
app.use(errorHandlers);

export default app;
