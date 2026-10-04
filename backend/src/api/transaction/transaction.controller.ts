import { QueryStatsDto, QueryTransactionsDto, TransferDto } from './transaction.dto'
import { TypedRequest } from '../../lib/typed-request.interface';
import { Response, NextFunction } from 'express';
import { HydratedDocument } from 'mongoose';
import bankAccountSrv from '../bankAccount/bankAccount.service'
import transactionSrv from './transaction.service'
import { BankAccount } from '../bankAccount/bankAccount.entity';
import { IdParams } from '../../lib/auth/id-params';
import { centsToEuro, euroToCents } from '../../lib/utils';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { NotFoundError } from '../../errors/not-found.error';
import { InvalidRecipientError } from '../../errors/invalid-recipient.error';
import operationLogSrv from '../operationLog/operationLog.service';

const currentAccount = async (userId?: string): Promise<HydratedDocument<BankAccount>> => {
    if (!userId) {
        throw new InvalidCredentialsError();
    }

    const bankAccount = await bankAccountSrv.findByUserId(userId);

    if (!bankAccount) {
        throw new NotFoundError();
    }

    return bankAccount;
}

export const list = async (
  req: TypedRequest<unknown, QueryTransactionsDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);
        const { minAmount, maxAmount, ...filters } = req.query;

        const result = await transactionSrv.findByBankAccountId(account._id, {
            ...filters,

            minAmount: minAmount === undefined ? undefined : euroToCents(minAmount),
            maxAmount: maxAmount === undefined ? undefined : euroToCents(maxAmount)
        });

        res.json(result);

    } catch (err) {
        next(err)
    }
}

const DEFAULT_STATS_MONTHS = 6;

export const stats = async (
  req: TypedRequest<unknown, QueryStatsDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);

        const to = req.query.to ?? new Date();
        const from = req.query.from ?? new Date(
            to.getFullYear(), to.getMonth() - (DEFAULT_STATS_MONTHS - 1), 1
        );

        const result = await transactionSrv.stats(account._id, from, to);

        res.json({
            from,
            to,
            totalIn: centsToEuro(result.totalIn),
            totalOut: centsToEuro(result.totalOut),
            byCategory: result.byCategory.map(c => ({
                categoryName: c.categoryName,
                total: centsToEuro(c.total)
            })),
            byMonth: result.byMonth.map(m => ({
                label: m.label,
                income: centsToEuro(m.income),
                expense: centsToEuro(m.expense)
            }))
        });

    } catch (err) {
        next(err)
    }
}

export const detail = async (
  req: TypedRequest<unknown, unknown, IdParams>,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);
        const transaction = await transactionSrv.findOneByBankAccountId(req.params.id, account._id);

        if (!transaction) {
            return next(new NotFoundError());
        }

        res.json(transaction);

    } catch (err) {
        next(err)
    }
}

export const transfer = async (
  req: TypedRequest<TransferDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);
        const { iban, firstName, lastName, amount, paymentReference } = req.body;

        const newTrasfer = await transactionSrv.transfer({
            fromAccountId: account._id,
            toIban: iban,
            firstName,
            lastName,
            amount: euroToCents(amount),
            paymentReference
        });

        if (!newTrasfer) {
            await operationLogSrv.record(req, 'transfer', 'failed', `iban non trovato: ${iban}`);
            return next(new InvalidRecipientError('iban non trovato'));
        }

        await operationLogSrv.record(req, 'transfer', 'success', `${amount} EUR a ${iban}`);

        res.status(201);
        res.json(newTrasfer.outgoing);

    } catch (err) {

        await operationLogSrv.record(
            req, 'transfer', 'failed', err instanceof Error ? err.message : 'errore'
        );
        next(err)
    }
}
