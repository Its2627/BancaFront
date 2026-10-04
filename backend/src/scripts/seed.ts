import '../lib/env';
import mongoose from 'mongoose';
import { connectDb, syncIndexes } from '../lib/db';
import { seedTransactionCategories } from '../api/transactionCategory/transactionCat.seed';
import { TransactionCategoryModel } from '../api/transactionCategory/transactionCat.model';

const main = async () => {
    await connectDb();
    await syncIndexes();
    await seedTransactionCategories();

    const total = await TransactionCategoryModel.countDocuments();
    console.log(`categorie in archivio: ${total}`);

    await mongoose.disconnect();
}

main().catch(async err => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});
