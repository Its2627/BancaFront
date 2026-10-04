import { HydratedDocument, Types } from "mongoose";
import { BankAccount } from "./bankAccount.entity";
import { generateIban } from "../../lib/utils";
import { BankAccountModel } from "./bankAccount.model";
import transactionCategorySrv from '../transactionCategory/transactionCat.service'
import transactionSrv from '../transaction/transaction.service'
import { SYSTEM_CATEGORIES } from '../transactionCategory/transactionCat.seed'
import { Transaction } from '../transaction/transaction.entity'
import { TransactionModel } from '../transaction/transaction.model'
import { NotFoundError } from "../../errors/not-found.error";

export const OPENING_DESCRIPTION = 'Apertura Conto';

export class BankAccountService {

        async create(userId: Types.ObjectId | string): Promise<HydratedDocument<BankAccount>> {
        const iban = await generateIban();

        return await BankAccountModel.create({
            user: new Types.ObjectId(userId),
            iban,
            balance: 0
        });
    }

        async createOpeningTransaction(
        userId: Types.ObjectId | string): Promise<HydratedDocument<Transaction> | null> {

        const bankAccount = await this.findByUserId(userId);

        if (!bankAccount) {
            throw new NotFoundError();
        }

        const existing = await TransactionModel.findOne({
            bankAccount: bankAccount._id,
            type: 'account_opening'
        });

        if (existing) {
            return null;
        }

        const categoryId = await transactionCategorySrv.getCategoryIdByName(
            SYSTEM_CATEGORIES.accountOpening
        );

        if (!categoryId) {
            throw new NotFoundError();
        }

        return await transactionSrv.create({
            bankAccount: bankAccount._id,
            date: new Date(),
            amount: 0,
            direction: 'in',
            type: 'account_opening',
            balanceAfter: bankAccount.balance,
            category: categoryId,
            paymentReference: OPENING_DESCRIPTION,
            status: 'completed'
        });
    }

    async findByUserId(userId: Types.ObjectId | string): Promise<HydratedDocument<BankAccount> | null> {
        return await BankAccountModel.findOne({ user: userId });
    }

    async getByIban(iban: string): Promise<HydratedDocument<BankAccount> | null> {
        return await BankAccountModel.findOne({ iban });
    }

}

export default new BankAccountService();
