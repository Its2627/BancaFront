import { Schema, model } from 'mongoose';
import { PHONE_OPERATORS, Recharge } from './recharge.entity';
import { centsToEuro } from '../../lib/utils';

const rechargeSchema = new Schema<Recharge>({
    bankAccount: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true },
    phoneNumber: { type: String, required: true, trim: true },
    operator: { type: String, required: true, enum: PHONE_OPERATORS },
    amount: { type: Number, required: true, min: 0 },
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
    date: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

rechargeSchema.index({ bankAccount: 1, date: -1 });

rechargeSchema.virtual('amountEuro').get(function () {
    return centsToEuro(this.amount);
});

export const RechargeModel = model<Recharge>('Recharge', rechargeSchema);
