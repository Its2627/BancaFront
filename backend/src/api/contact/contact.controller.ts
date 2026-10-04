import { Response, NextFunction } from 'express';
import { HydratedDocument } from 'mongoose';
import { TypedRequest } from '../../lib/typed-request.interface';
import { CreateContactDto } from './contact.dto';
import { IdParams } from '../../lib/auth/id-params';
import { BankAccount } from '../bankAccount/bankAccount.entity';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { NotFoundError } from '../../errors/not-found.error';
import bankAccountSrv from '../bankAccount/bankAccount.service';
import contactSrv from './contact.service';

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
  req: TypedRequest,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);

        res.json(await contactSrv.findByBankAccountId(account._id));

    } catch (err) {
        next(err)
    }
}

export const create = async (
  req: TypedRequest<CreateContactDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);

        const contact = await contactSrv.create(account._id, req.body);

        res.status(201);
        res.json(contact);

    } catch (err) {
        next(err)
    }
}

export const remove = async (
  req: TypedRequest<unknown, unknown, IdParams>,
  res: Response,
  next: NextFunction) => {
    try {
        const account = await currentAccount(req.user?.id);

        const removed = await contactSrv.remove(req.params.id, account._id);

        if (!removed) {
            return next(new NotFoundError());
        }

        res.json({ deleted: true });

    } catch (err) {
        next(err)
    }
}
