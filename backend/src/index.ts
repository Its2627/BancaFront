import './lib/env';
import 'reflect-metadata';
import { createServer } from 'http';
import { connectDb, syncIndexes } from './lib/db';
import app from './app';
import { seedTransactionCategories } from './api/transactionCategory/transactionCat.seed';

const PORT = Number(process.env.PORT ?? 3000);

connectDb()
    .then(async () => {
        await syncIndexes();
        await seedTransactionCategories();

        const server = createServer(app);

        server.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`la porta ${PORT} e' gia' occupata: chiudi l'altro processo oppure avvia con PORT=3001`);
            } else {
                console.error(err);
            }
            process.exit(1);
        });

        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    })
