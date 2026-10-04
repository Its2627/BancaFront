import '../src/lib/env';
import 'reflect-metadata';
import { connectDb } from '../src/lib/db';
import app from '../src/app';
import { seedTransactionCategories } from '../src/api/transactionCategory/transactionCat.seed';
import type { Request, Response } from 'express';

let ready: Promise<void> | null = null;

const init = (): Promise<void> => {
    if (!ready) {
        ready = connectDb()
            .then(() => seedTransactionCategories())
            .then(() => undefined);
    }
    return ready;
};

export default async function handler(req: Request, res: Response) {
    try {
        await init();
    } catch (err) {
        ready = null;
        console.error('connessione al database non riuscita:', err);
        res.status(503).json({ error: 'ServiceUnavailable', message: 'database non raggiungibile' });
        return;
    }

    return app(req, res);
}
