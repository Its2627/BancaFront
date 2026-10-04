export const TRANSACTION_CATEGORY_TYPES = ['income', 'expense'] as const;

export type TransactionCategoryType = typeof TRANSACTION_CATEGORY_TYPES[number];

export type TransactionCategory = {
    categoryName: string;
    type: TransactionCategoryType;
}
