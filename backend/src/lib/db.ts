import mongoose, { ClientSession, Schema } from 'mongoose';
import { unset } from 'lodash';

const DEFAULT_URI = 'mongodb://localhost:27017/gestione-banca';

export function serializePlugin(schema: Schema) {
    const hiddenPaths: string[] = [];
    schema.eachPath((path, type) => {
        if ((type as { options?: { select?: boolean } }).options?.select === false) {
            hiddenPaths.push(path);
        }
    });

    const serializeOptions = {
        virtuals: true,
        versionKey: false,
        transform: (_doc: unknown, ret: Record<string, unknown>) => {
            delete ret._id;
            hiddenPaths.forEach(path => unset(ret, path));
            return ret;
        }
    };

    schema.set('toJSON', serializeOptions);
    schema.set('toObject', serializeOptions);
}

mongoose.plugin(serializePlugin);
mongoose.set('debug', process.env.NODE_ENV !== 'production');

export const connectDb = () => mongoose.connect(process.env.MONGO_URI ?? DEFAULT_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 15000
});

let transactionsSupported: boolean | null = null;

const supportsTransactions = async (): Promise<boolean> => {
    if (transactionsSupported === null) {
        const info = await mongoose.connection.db?.admin().command({ hello: 1 });
        transactionsSupported = Boolean(info?.setName) || info?.msg === 'isdbgrid';

        if (!transactionsSupported) {
            console.warn(
                'mongo standalone: le transazioni non sono disponibili, le operazioni ' +
                'multi-documento vengono compensate a mano. Per averle serve un replica set ' +
                '(anche a un nodo solo) oppure Atlas.'
            );
        }
    }
    return transactionsSupported;
};

export async function runInTransaction<T>(fn: (session?: ClientSession) => Promise<T>): Promise<T> {
    if (!await supportsTransactions()) {
        return fn(undefined);
    }

    const session = await mongoose.startSession();
    try {
        let result!: T;
        await session.withTransaction(async () => {
            result = await fn(session);
        });
        return result;
    } finally {
        await session.endSession();
    }
}

export const syncIndexes = async (): Promise<void> => {
    await Promise.all(
        Object.values(mongoose.models).map(m => m.syncIndexes())
    );
}
