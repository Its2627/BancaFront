import { HydratedDocument, Types } from "mongoose";
import { PHONE_OPERATORS, PhoneOperator, Recharge } from "./recharge.entity";
import { RechargeModel } from "./recharge.model";
import { BankAccountModel } from "../bankAccount/bankAccount.model";
import { TransactionModel } from "../transaction/transaction.model";
import transactionCategorySrv from "../transactionCategory/transactionCat.service";
import { SYSTEM_CATEGORIES } from "../transactionCategory/transactionCat.seed";
import { runInTransaction } from "../../lib/db";
import { centsToEuro, euroToCents } from "../../lib/utils";
import { NotFoundError } from "../../errors/not-found.error";
import { InsufficientFundsError } from "../../errors/insufficient-funds.error";

const CHART_MONTHS = 6;

const RECENT_LIMIT = 5;

const MONTH_LABELS = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
];

export type RechargeParams = {
    bankAccountId: Types.ObjectId | string;
    phoneNumber: string;
    operator: PhoneOperator;
        amount: number;
};

export type RechargeDashboard = {
    rubrica: { operatore: string; telefono: string }[];
    ultimeRicariche: { telefono: string; importo: number }[];
    operatori: string[];
    analytics: {
        operatorePiuUsato: string;
        totaleSpeso: number;
        ricaricheEffettuate: number;
        andamentoMensile: { mesi: string[]; totali: number[] };
    };
};

export class RechargeService {
        async create(params: RechargeParams): Promise<HydratedDocument<Recharge>> {
        const { bankAccountId, phoneNumber, operator, amount } = params;

        if (!Number.isInteger(amount) || amount <= 0) {
            throw new InsufficientFundsError();
        }

        const categoryId = await transactionCategorySrv.getCategoryIdByName(
            SYSTEM_CATEGORIES.phoneRecharge
        );

        if (!categoryId) {
            throw new NotFoundError();
        }

        return runInTransaction(async (session) => {
            const debited = await BankAccountModel.findOneAndUpdate(
                { _id: bankAccountId, balance: { $gte: amount } },
                { $inc: { balance: -amount } },
                { new: true, session }
            );

            if (!debited) {
                throw new InsufficientFundsError();
            }

            try {
                const date = new Date();

                const [transaction] = await TransactionModel.create([{
                    bankAccount: debited._id,
                    date,
                    amount,
                    direction: 'out',
                    type: 'withdrawal',
                    balanceAfter: debited.balance,
                    category: categoryId,
                    paymentReference: `Ricarica ${operator} ${phoneNumber}`,
                    status: 'completed'
                }], { session });

                const [recharge] = await RechargeModel.create([{
                    bankAccount: debited._id,
                    phoneNumber,
                    operator,
                    amount,
                    transaction: transaction._id,
                    date
                }], { session });

                return recharge;

            } catch (err) {
                if (!session) {
                    await BankAccountModel.updateOne(
                        { _id: bankAccountId },
                        { $inc: { balance: amount } }
                    );
                }
                throw err;
            }
        });
    }

    async findByBankAccountId(
        bankAccountId: Types.ObjectId | string,
        limit = RECENT_LIMIT): Promise<Recharge[]> {
        return await RechargeModel
            .find({ bankAccount: bankAccountId })
            .sort({ date: -1 })
            .limit(limit);
    }

        async dashboard(bankAccountId: Types.ObjectId | string): Promise<RechargeDashboard> {
        const accountId = new Types.ObjectId(bankAccountId);

        const [rubrica, ultime, totals, perOperatore, perMese] = await Promise.all([
            RechargeModel.aggregate<{ _id: { phoneNumber: string; operator: string }; last: Date }>([
                { $match: { bankAccount: accountId } },
                {
                    $group: {
                        _id: { phoneNumber: '$phoneNumber', operator: '$operator' },
                        last: { $max: '$date' }
                    }
                },
                { $sort: { last: -1 } },
                { $limit: 10 }
            ]),

            this.findByBankAccountId(accountId),

            RechargeModel.aggregate<{ total: number; count: number }>([
                { $match: { bankAccount: accountId } },
                { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]),

            RechargeModel.aggregate<{ _id: string; count: number }>([
                { $match: { bankAccount: accountId } },
                { $group: { _id: '$operator', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]),

            this.monthlyTotals(accountId)
        ]);

        return {
            rubrica: rubrica.map(r => ({
                operatore: r._id.operator,
                telefono: r._id.phoneNumber
            })),
            ultimeRicariche: ultime.map(r => ({
                telefono: r.phoneNumber,
                importo: centsToEuro(r.amount)
            })),
            operatori: [...PHONE_OPERATORS],
            analytics: {
                operatorePiuUsato: perOperatore[0]?._id ?? '-',
                totaleSpeso: centsToEuro(totals[0]?.total ?? 0),
                ricaricheEffettuate: totals[0]?.count ?? 0,
                andamentoMensile: perMese
            }
        };
    }

        private async monthlyTotals(
        accountId: Types.ObjectId): Promise<{ mesi: string[]; totali: number[] }> {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - (CHART_MONTHS - 1), 1);

        const rows = await RechargeModel.aggregate<{ _id: { y: number; m: number }; total: number }>([
            { $match: { bankAccount: accountId, date: { $gte: from } } },
            {
                $group: {
                    _id: { y: { $year: '$date' }, m: { $month: '$date' } },
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const byKey = new Map(rows.map(r => [`${r._id.y}-${r._id.m}`, r.total]));

        const mesi: string[] = [];
        const totali: number[] = [];

        for (let i = 0; i < CHART_MONTHS; i++) {
            const month = new Date(from.getFullYear(), from.getMonth() + i, 1);
            const key = `${month.getFullYear()}-${month.getMonth() + 1}`;

            mesi.push(MONTH_LABELS[month.getMonth()]);
            totali.push(centsToEuro(byKey.get(key) ?? 0));
        }

        return { mesi, totali };
    }
}

export default new RechargeService();
