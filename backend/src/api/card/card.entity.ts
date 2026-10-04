import { Types } from "mongoose";

export const CARD_STATUS = ['inactive', 'active', 'blocked', 'deleted'] as const;
export const CARD_TYPES = ['credit', 'debit', 'prepaid'] as const;

export type CardStatus = typeof CARD_STATUS[number];
export type CardType = typeof CARD_TYPES[number];

export type Card = {
    bankAccount: Types.ObjectId;
    name: string;

    encryptedCardNumber: string;

    cardNumberHash: string;

    last4: string;
    expiration: Date;

    hashedPin: string;

    encryptedPin: string;

    failedPinAttempts: number;

    status: CardStatus;
    type: CardType;

    creditLimit?: number;
}

export type CardDetails = {
    cardNumber: string;
    cvv: string;
    expiration: Date;
}
