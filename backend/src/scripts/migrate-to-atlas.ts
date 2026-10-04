import '../lib/env';
import mongoose from 'mongoose';
import type { Connection } from 'mongoose';

const SOURCE = process.env.MONGO_URI_SOURCE ?? 'mongodb://localhost:27017/gestione-banca';
const TARGET = process.env.MONGO_URI_TARGET ?? '';
const BATCH = 500;
const confirmed = process.argv.includes('--yes');

const open = async (uri: string, label: string): Promise<Connection> => {
    const conn = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 20000 });
    await conn.asPromise();
    console.log(`[${label}] connesso a ${conn.name}`);
    return conn;
};

const main = async () => {
    if (!TARGET) {
        console.error('manca MONGO_URI_TARGET: la connection string di Atlas.');
        console.error('esempio: MONGO_URI_TARGET="mongodb+srv://utente:password@cluster.mongodb.net/gestione-banca" npm run migrate:atlas -- --yes');
        process.exit(1);
    }

    if (TARGET === SOURCE) {
        console.error('sorgente e destinazione sono lo stesso database.');
        process.exit(1);
    }

    const source = await open(SOURCE, 'sorgente');
    const target = await open(TARGET, 'destinazione');

    const sourceDb = source.db!;
    const targetDb = target.db!;

    const collections = (await sourceDb.listCollections().toArray())
        .filter(c => c.type !== 'view' && !c.name.startsWith('system.'))
        .map(c => c.name)
        .sort();

    const plan: { name: string; docs: number; existing: number }[] = [];
    for (const name of collections) {
        plan.push({
            name,
            docs: await sourceDb.collection(name).countDocuments(),
            existing: await targetDb.collection(name).countDocuments().catch(() => 0)
        });
    }

    console.log('\ncollezioni da copiare (la destinazione viene svuotata e riscritta):');
    for (const p of plan) {
        console.log(`  ${p.name.padEnd(24)} ${String(p.docs).padStart(6)} documenti   (in destinazione ora: ${p.existing})`);
    }

    const toDrop = (await targetDb.listCollections().toArray())
        .map(c => c.name)
        .filter(n => !n.startsWith('system.') && !collections.includes(n));

    if (toDrop.length) {
        console.log(`\ncollezioni presenti solo in destinazione, verranno eliminate: ${toDrop.join(', ')}`);
    }

    if (!confirmed) {
        console.log('\nnessuna modifica applicata. Ripeti il comando con --yes per eseguire la copia.');
        await Promise.all([source.close(), target.close()]);
        return;
    }

    console.log('');

    for (const name of toDrop) {
        await targetDb.collection(name).drop().catch(() => undefined);
        console.log(`eliminata  ${name}`);
    }

    for (const { name, docs } of plan) {
        const from = sourceDb.collection(name);
        const to = targetDb.collection(name);

        await to.drop().catch(() => undefined);

        let copied = 0;
        let buffer: Record<string, unknown>[] = [];
        const cursor = from.find({});

        for await (const doc of cursor) {
            buffer.push(doc as Record<string, unknown>);
            if (buffer.length >= BATCH) {
                await to.insertMany(buffer, { ordered: false });
                copied += buffer.length;
                buffer = [];
            }
        }
        if (buffer.length) {
            await to.insertMany(buffer, { ordered: false });
            copied += buffer.length;
        }

        const indexes = (await from.indexes()).filter(i => i.name !== '_id_');
        for (const index of indexes) {
            const { v, key, name: indexName, ...options } = index as Record<string, unknown> & { key: Record<string, 1 | -1> };
            await to.createIndex(key, { name: indexName as string, ...options });
        }

        if (copied !== docs) {
            throw new Error(`${name}: copiati ${copied} documenti su ${docs}`);
        }

        console.log(`copiata    ${name.padEnd(24)} ${String(copied).padStart(6)} documenti, ${indexes.length} indici`);
    }

    console.log('\nverifica finale:');
    let mismatch = 0;
    for (const { name, docs } of plan) {
        const after = await targetDb.collection(name).countDocuments();
        const ok = after === docs;
        if (!ok) mismatch++;
        console.log(`  ${ok ? 'ok  ' : 'KO  '} ${name.padEnd(24)} locale ${docs} -> atlas ${after}`);
    }

    await Promise.all([source.close(), target.close()]);

    if (mismatch) {
        console.error(`\n${mismatch} collezioni non corrispondono.`);
        process.exit(1);
    }
    console.log('\nmigrazione completata: Atlas e identico al database locale.');
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
