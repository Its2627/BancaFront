import { Schema, model } from 'mongoose';
import { Contact } from './contact.entity';

const contactSchema = new Schema<Contact>({
    bankAccount: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    iban: { type: String, required: true, trim: true, uppercase: true },
}, { timestamps: true });

contactSchema.index({ bankAccount: 1, iban: 1 }, { unique: true });

contactSchema.virtual('fullName').get(function () {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
});

export const ContactModel = model<Contact>('Contact', contactSchema);
