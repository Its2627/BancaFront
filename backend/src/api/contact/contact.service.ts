import { HydratedDocument, Types } from "mongoose";
import { Contact } from "./contact.entity";
import { ContactModel } from "./contact.model";
import { CreateContactDto } from "./contact.dto";
import { AlreadyCompletedError } from "../../errors/already-completed.error";

const DUPLICATE_KEY = 11000;

export class ContactService {

    async findByBankAccountId(bankAccountId: Types.ObjectId | string): Promise<Contact[]> {
        return await ContactModel
            .find({ bankAccount: bankAccountId })
            .sort({ lastName: 1, firstName: 1 });
    }

    async create(
        bankAccountId: Types.ObjectId | string,
        body: CreateContactDto): Promise<HydratedDocument<Contact>> {

        try {
            return await ContactModel.create({
                bankAccount: new Types.ObjectId(bankAccountId),
                ...body
            });
        } catch (err: any) {

            if (err?.code === DUPLICATE_KEY) {
                throw new AlreadyCompletedError('questo IBAN e\' gia\' in rubrica');
            }
            throw err;
        }
    }

        async remove(
        contactId: Types.ObjectId | string,
        bankAccountId: Types.ObjectId | string): Promise<Contact | null> {

        return await ContactModel.findOneAndDelete({
            _id: contactId,
            bankAccount: bankAccountId
        });
    }
}

export default new ContactService();
