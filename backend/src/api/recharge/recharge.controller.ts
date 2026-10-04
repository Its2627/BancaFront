import { Response, NextFunction } from 'express';
import { HydratedDocument } from 'mongoose';
import { TypedRequest } from '../../lib/typed-request.interface';
import { DoRechargeDto } from './recharge.dto';
import { BankAccount } from '../bankAccount/bankAccount.entity';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { NotFoundError } from '../../errors/not-found.error';
import { InsufficientFundsError } from '../../errors/insufficient-funds.error';
import { euroToCents } from '../../lib/utils';
import bankAccountSrv from '../bankAccount/bankAccount.service';
import rechargeSrv from './recharge.service';
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

export const dashboard = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);

        res.json(await rechargeSrv.dashboard(account._id));

    } catch (err) {
        next(err)
    }
}

export const doRecharge = async (
  req: TypedRequest<DoRechargeDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);
        const { phoneNumber, operator, amount } = req.body;

        const recharge = await rechargeSrv.create({
            bankAccountId: account._id,
            phoneNumber,
            operator,
            amount: euroToCents(amount)
        });

        await operationLogSrv.record(
            req, 'recharge', 'success', `${amount} EUR ${operator} ${phoneNumber}`
        );

        res.status(201);

        res.json({
            success: true,
            message: `Ricarica di ${amount.toFixed(2)} € per ${phoneNumber} effettuata.`,
            recharge
        });

    } catch (err) {

        if (err instanceof InsufficientFundsError) {
            await operationLogSrv.record(req, 'recharge', 'failed', 'saldo insufficiente');
            res.status(409);
            res.json({ success: false, message: 'Saldo insufficiente per questa ricarica.' });
            return;
        }

        await operationLogSrv.record(
            req, 'recharge', 'failed', err instanceof Error ? err.message : 'errore'
        );
        next(err)
    }
}
