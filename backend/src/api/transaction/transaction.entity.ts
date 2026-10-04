import { Types } from "mongoose";

export const TRANSACTION_STATUS = ['pending', 'completed', 'failed'] as const;
export const TRANSACTION_TYPES = ['transfer', 'deposit', 'withdrawal', 'card_payment', 'account_opening'] as const;
export const TRANSACTION_DIRECTIONS = ['in', 'out'] as const;

export type TransactionStatus = typeof TRANSACTION_STATUS[number];
export type TransactionType = typeof TRANSACTION_TYPES[number];
export type TransactionDirection = typeof TRANSACTION_DIRECTIONS[number];

export type TransactionCounterparty = {
    bankAccount?: Types.ObjectId;
    iban?: string;
    firstName?: string;
    lastName?: string;
}

export type Transaction = {
    bankAccount: Types.ObjectId;
    counterparty?: TransactionCounterparty;
    date: Date;
    amount: number;
    direction: TransactionDirection;
    type: TransactionType;
    balanceAfter: number;
    category: Types.ObjectId;
    paymentReference: string;
    status: TransactionStatus;
}
