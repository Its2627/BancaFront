import '../src/lib/env';
import 'reflect-metadata';
import mongoose from 'mongoose';
import { connectDb } from '../src/lib/db';
import app from '../src/app';
import { seedTransactionCategories } from '../src/api/transactionCategory/transactionCat.seed';
import type { Request, Response } from 'express';

const CONNECTED = 1;
const DISCONNECTED = 0;

let ready: Promise<void> | null = null;

const init = (): Promise<void> => {
    const state = mongoose.connection.readyState;

    if (state === CONNECTED) {
        return Promise.resolve();
    }

    if (state === DISCONNECTED) {
        ready = null;
    }

    if (!ready) {
        ready = connectDb()
            .then(async () => {
                if (mongoose.connection.readyState !== CONNECTED) {
                    await mongoose.connection.asPromise();
                }
            })
            .then(() => seedTransactionCategories())
            .then(() => {
                if (mongoose.connection.readyState !== CONNECTED) {
                    throw new Error(
                        `connessione non stabilita: readyState ${mongoose.connection.readyState}`
                    );
                }
            })
            .catch(err => {
                ready = null;
                throw err;
            });
    }

    return ready;
};

export default async function handler(req: Request, res: Response) {
    try {
        await init();
    } catch (err) {
        console.error('connessione al database non riuscita:', err);
        res.status(503).json({ error: 'ServiceUnavailable', message: 'database non raggiungibile' });
        return;
    }

    return app(req, res);
}
