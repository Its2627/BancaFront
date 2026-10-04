import { Schema, model } from 'mongoose';
import { CARD_STATUS, CARD_TYPES, Card } from './card.entity';
import { centsToEuro } from '../../lib/utils';

const cardSchema = new Schema<Card>({
    bankAccount: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true },
    name: { type: String, required: true },
    encryptedCardNumber: { type: String, required: true, select: false },
    cardNumberHash: { type: String, required: true, unique: true, select: false },
    last4: { type: String, required: true, match: /^\d{4}$/ },
    expiration: { type: Date, required: true },
    hashedPin: { type: String, required: true, select: false },
    encryptedPin: { type: String, required: true, select: false },
    failedPinAttempts: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, required: true, enum: CARD_STATUS, default: 'inactive' },
    type: { type: String, required: true, enum: CARD_TYPES },
    creditLimit: {
        type: Number,
        min: 0,
        required: function (this: Card) { return this.type === 'credit'; }
    }
}, { timestamps: true })

cardSchema.index({ bankAccount: 1 });

cardSchema.virtual('maskedNumber').get(function () {
    return `**** **** **** ${this.last4}`;
});

cardSchema.virtual('creditLimitEuro').get(function () {
    return this.creditLimit === undefined ? null : centsToEuro(this.creditLimit);
});

export const CardModel = model<Card>('Card', cardSchema);
