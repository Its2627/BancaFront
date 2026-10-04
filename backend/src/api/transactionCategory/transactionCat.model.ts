import { Schema, model } from "mongoose"
import { TRANSACTION_CATEGORY_TYPES, TransactionCategory } from './transactionCat.entity'

export const transactionCategorySchema = new Schema<TransactionCategory>({
    categoryName: { type: String, required: true, unique: true, trim: true },
    type: { type: String, required: true, enum: TRANSACTION_CATEGORY_TYPES },
}, { timestamps: true })

export const TransactionCategoryModel = model<TransactionCategory>('TransactionCategory', transactionCategorySchema);
