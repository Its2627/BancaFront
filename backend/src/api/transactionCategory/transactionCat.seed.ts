import { TransactionCategory } from './transactionCat.entity';
import { TransactionCategoryModel } from './transactionCat.model';

export const SYSTEM_CATEGORIES = {
    accountOpening: 'Apertura conto',
    outgoingTransfer: 'Bonifico in uscita',
    incomingTransfer: 'Bonifico in entrata',
    phoneRecharge: 'Ricarica telefonica',
} as const;

const DEFAULTS: TransactionCategory[] = [

    { categoryName: SYSTEM_CATEGORIES.accountOpening, type: 'income' },
    { categoryName: SYSTEM_CATEGORIES.outgoingTransfer, type: 'expense' },
    { categoryName: SYSTEM_CATEGORIES.incomingTransfer, type: 'income' },
    { categoryName: SYSTEM_CATEGORIES.phoneRecharge, type: 'expense' },

    { categoryName: 'Stipendio', type: 'income' },
    { categoryName: 'Rimborso', type: 'income' },
    { categoryName: 'Interessi', type: 'income' },
    { categoryName: 'Versamento contante', type: 'income' },
    { categoryName: 'Altre entrate', type: 'income' },

    { categoryName: 'Spesa alimentare', type: 'expense' },
    { categoryName: 'Affitto', type: 'expense' },
    { categoryName: 'Bollette', type: 'expense' },
    { categoryName: 'Trasporti', type: 'expense' },
    { categoryName: 'Carburante', type: 'expense' },
    { categoryName: 'Ristoranti', type: 'expense' },
    { categoryName: 'Salute', type: 'expense' },
    { categoryName: 'Istruzione', type: 'expense' },
    { categoryName: 'Svago', type: 'expense' },
    { categoryName: 'Abbonamenti', type: 'expense' },
    { categoryName: 'Viaggi', type: 'expense' },
    { categoryName: 'Prelievo contante', type: 'expense' },
    { categoryName: 'Pagamento con carta', type: 'expense' },
    { categoryName: 'Commissioni', type: 'expense' },
    { categoryName: 'Altre uscite', type: 'expense' },
];

const normalizeLegacyCategories = async (): Promise<void> => {
    await TransactionCategoryModel.collection.updateMany(
        { type: 'Entrata' }, { $set: { type: 'income' }, $unset: { transactionCategoryId: '' } });
    await TransactionCategoryModel.collection.updateMany(
        { type: 'Uscita' }, { $set: { type: 'expense' }, $unset: { transactionCategoryId: '' } });
    await TransactionCategoryModel.collection.updateMany(
        { transactionCategoryId: { $exists: true } }, { $unset: { transactionCategoryId: '' } });
}

export const seedTransactionCategories = async (): Promise<void> => {
    await normalizeLegacyCategories();

    await Promise.all(DEFAULTS.map(category =>
        TransactionCategoryModel.updateOne(
            { categoryName: category.categoryName },
            { $setOnInsert: category },
            { upsert: true }
        )
    ));
}
