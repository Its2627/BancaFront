import {
    TRANSACTION_DIRECTIONS,
    TRANSACTION_STATUS,
    TRANSACTION_TYPES,
    Transaction,
    TransactionCounterparty
} from "./transaction.entity";
import { Schema, model } from 'mongoose';
import { centsToEuro } from "../../lib/utils";

const counterpartySchema = new Schema<TransactionCounterparty>({
    bankAccount: { type: Schema.Types.ObjectId, ref: 'BankAccount' },
    iban: { type: String },
    firstName: { type: String },
    lastName: { type: String },
}, { _id: false });

const transactionSchema = new Schema<Transaction>({
    bankAccount: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true },
    counterparty: { type: counterpartySchema, required: false },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    direction: { type: String, required: true, enum: TRANSACTION_DIRECTIONS },
    type: { type: String, required: true, enum: TRANSACTION_TYPES },
    balanceAfter: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'TransactionCategory', required: true },
    paymentReference: { type: String, required: true },
    status: { type: String, required: true, enum: TRANSACTION_STATUS, default: 'pending' }
}, { timestamps: true })

transactionSchema.index({ bankAccount: 1, date: -1 });

transactionSchema.virtual('amountEuro').get(function () {
    return centsToEuro(this.amount);
});

transactionSchema.virtual('balanceAfterEuro').get(function () {
    return centsToEuro(this.balanceAfter);
});

export const TransactionModel = model<Transaction>('Transaction', transactionSchema);
