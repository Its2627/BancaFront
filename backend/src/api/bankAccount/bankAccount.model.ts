import { Schema, model } from 'mongoose';
import { BankAccount } from './bankAccount.entity';
import { centsToEuro } from '../../lib/utils';

const bankAccountSchema = new Schema<BankAccount>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    iban: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
}, { timestamps: true })

bankAccountSchema.virtual('balanceEuro').get(function () {
    return centsToEuro(this.balance);
});

export const BankAccountModel = model<BankAccount>('BankAccount', bankAccountSchema);
