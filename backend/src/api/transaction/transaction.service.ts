import { ClientSession, HydratedDocument, QueryFilter, Types } from "mongoose";
import { Transaction, TransactionType } from "./transaction.entity";
import { TransactionModel } from "./transaction.model";
import { BankAccount } from "../bankAccount/bankAccount.entity";
import { BankAccountModel } from "../bankAccount/bankAccount.model";
import { User } from "../user/user.entity";
import transactionCategorySrv from "../transactionCategory/transactionCat.service";
import { SYSTEM_CATEGORIES } from "../transactionCategory/transactionCat.seed";
import { runInTransaction } from "../../lib/db";
import { NotFoundError } from "../../errors/not-found.error";
import { InsufficientFundsError } from "../../errors/insufficient-funds.error";
import { InvalidRecipientError } from "../../errors/invalid-recipient.error";

export type TransferParams = {
    fromAccountId: Types.ObjectId | string;
    toIban: string;
    firstName: string;
    lastName: string;
    amount: number;
    paymentReference: string;
}

export type Transfer = {
    outgoing: HydratedDocument<Transaction>;
    incoming?: HydratedDocument<Transaction>;
}

export type TransactionFilters = {
    from?: Date;
    to?: Date;
    categoryId?: string;
    type?: TransactionType;
    minAmount?: number;
    maxAmount?: number;
    page: number;
    limit: number;
}

export type TransactionStats = {
        totalIn: number;
    totalOut: number;
        byCategory: { categoryName: string; total: number }[];
        byMonth: { label: string; income: number; expense: number }[];
};

export type PaginatedTransactions = {
    items: Transaction[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

const accountWithUser = (filter: QueryFilter<BankAccount>) =>
    BankAccountModel.findOne(filter).populate<{ user: User }>("user");

type AccountWithUser = NonNullable<Awaited<ReturnType<typeof accountWithUser>>>;

const sameName = (user: User, firstName: string, lastName: string): boolean =>
    user.firstName.trim().toLowerCase() === firstName.trim().toLowerCase()
    && user.lastName.trim().toLowerCase() === lastName.trim().toLowerCase();

export class TransactionService {

    async create(transaction: Transaction, session?: ClientSession): Promise<HydratedDocument<Transaction>> {
        const [newTransaction] = await TransactionModel.create([transaction], { session });
        return newTransaction;
    }

    async findByBankAccountId(
        bankAccountId: Types.ObjectId | string,
        filters: TransactionFilters): Promise<PaginatedTransactions> {

        const { from, to, categoryId, type, minAmount, maxAmount, page, limit } = filters;

        const query: QueryFilter<Transaction> = { bankAccount: bankAccountId };

        if (from || to) {
            query.date = {
                ...(from ? { $gte: from } : {}),
                ...(to ? { $lte: to } : {})
            };
        }

        if (categoryId) {
            query.category = categoryId;
        }

        if (type) {
            query.type = type;
        }

        if (minAmount !== undefined || maxAmount !== undefined) {
            query.amount = {
                ...(minAmount !== undefined ? { $gte: minAmount } : {}),
                ...(maxAmount !== undefined ? { $lte: maxAmount } : {})
            };
        }

        const [items, total] = await Promise.all([
            TransactionModel
                .find(query)
                .sort({ date: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('category'),
            TransactionModel.countDocuments(query)
        ]);

        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }

        async findOneByBankAccountId(
        transactionId: Types.ObjectId | string,
        bankAccountId: Types.ObjectId | string): Promise<Transaction | null> {

        return await TransactionModel
            .findOne({ _id: transactionId, bankAccount: bankAccountId })
            .populate('category');
    }

        async stats(
        bankAccountId: Types.ObjectId | string,
        from: Date,
        to: Date): Promise<TransactionStats> {

        const match = {
            bankAccount: new Types.ObjectId(bankAccountId),
            date: { $gte: from, $lte: to },
            status: 'completed'
        };

        const [totals, byCategory, byMonth] = await Promise.all([
            TransactionModel.aggregate<{ _id: string; total: number }>([
                { $match: match },
                { $group: { _id: '$direction', total: { $sum: '$amount' } } }
            ]),

            TransactionModel.aggregate<{ _id: string; total: number }>([
                { $match: { ...match, direction: 'out' } },
                {
                    $lookup: {
                        from: 'transactioncategories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'cat'
                    }
                },
                { $unwind: '$cat' },
                { $group: { _id: '$cat.categoryName', total: { $sum: '$amount' } } },
                { $sort: { total: -1 } }
            ]),

            TransactionModel.aggregate<{
                _id: { y: number; m: number; direction: string }; total: number
            }>([
                { $match: match },
                {
                    $group: {
                        _id: {
                            y: { $year: '$date' },
                            m: { $month: '$date' },
                            direction: '$direction'
                        },
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id.y': 1, '_id.m': 1 } }
            ])
        ]);

        const totalFor = (direction: string) =>
            totals.find(t => t._id === direction)?.total ?? 0;

        const months = new Map<string, { label: string; income: number; expense: number }>();

        for (const row of byMonth) {
            const key = `${row._id.y}-${String(row._id.m).padStart(2, '0')}`;
            const entry = months.get(key) ?? { label: key, income: 0, expense: 0 };

            if (row._id.direction === 'in') {
                entry.income += row.total;
            } else {
                entry.expense += row.total;
            }

            months.set(key, entry);
        }

        return {
            totalIn: totalFor('in'),
            totalOut: totalFor('out'),
            byCategory: byCategory.map(c => ({ categoryName: c._id, total: c.total })),
            byMonth: [...months.values()]
        };
    }

    async transfer(params: TransferParams): Promise<Transfer | null> {
        const { fromAccountId, toIban, firstName, lastName, amount, paymentReference } = params;

        if (!Number.isInteger(amount) || amount <= 0) {
            throw new InvalidRecipientError("importo non valido");
        }

        const source = await accountWithUser({ _id: fromAccountId });
        if (!source) {
            throw new NotFoundError();
        }

        const destination = await accountWithUser({ iban: toIban });

        return destination
            ? this.internalTransfer(source, destination, firstName, lastName, amount, paymentReference)
            : null
    }

        private withDebit<T>(
        sourceId: Types.ObjectId,
        amount: number,
        work: (debited: HydratedDocument<BankAccount>, session?: ClientSession) => Promise<T>): Promise<T> {

        return runInTransaction(async (session) => {
            const debited = await BankAccountModel.findOneAndUpdate(
                { _id: sourceId, balance: { $gte: amount } },
                { $inc: { balance: -amount } },
                { new: true, session }
            );

            if (!debited) {
                throw new InsufficientFundsError();
            }

            try {
                return await work(debited, session);
            } catch (err) {
                if (!session) {
                    await BankAccountModel.updateOne({ _id: sourceId }, { $inc: { balance: amount } });
                }
                throw err;
            }
        });
    }

    private async internalTransfer(
        source: AccountWithUser,
        destination: AccountWithUser,
        firstName: string,
        lastName: string,
        amount: number,
        paymentReference: string): Promise<Transfer> {

        if (destination._id.equals(source._id)) {
            throw new InvalidRecipientError("non puoi fare un bonifico a te stesso");
        }
        if (!sameName(destination.user, firstName, lastName)) {
            throw new InvalidRecipientError("nome e cognome non corrispondono all IBAN indicato");
        }

        const [outgoingCategory, incomingCategory] = await Promise.all([
            transactionCategorySrv.getCategoryIdByName(SYSTEM_CATEGORIES.outgoingTransfer),
            transactionCategorySrv.getCategoryIdByName(SYSTEM_CATEGORIES.incomingTransfer)
        ]);
        if (!outgoingCategory || !incomingCategory) {
            throw new NotFoundError();
        }

        return this.withDebit(source._id, amount, async (debited, session) => {
            const credited = await BankAccountModel.findOneAndUpdate(
                { _id: destination._id },
                { $inc: { balance: amount } },
                { new: true, session }
            );

            if (!credited) {
                throw new NotFoundError();
            }

            const date = new Date();

            const [outgoing, incoming] = await TransactionModel.create([
                {
                    bankAccount: source._id,
                    counterparty: {
                        bankAccount: destination._id,
                        iban: destination.iban,
                        firstName: destination.user.firstName,
                        lastName: destination.user.lastName
                    },
                    date,
                    amount,
                    direction: "out",
                    type: "transfer",
                    balanceAfter: debited.balance,
                    category: outgoingCategory,
                    paymentReference,
                    status: "completed"
                },
                {
                    bankAccount: destination._id,
                    counterparty: {
                        bankAccount: source._id,
                        iban: source.iban,
                        firstName: source.user.firstName,
                        lastName: source.user.lastName
                    },
                    date,
                    amount,
                    direction: "in",
                    type: "transfer",
                    balanceAfter: credited.balance,
                    category: incomingCategory,
                    paymentReference,
                    status: "completed"
                }
            ], { session, ordered: true });

            return { outgoing, incoming };
        });
    }
}

export default new TransactionService();
