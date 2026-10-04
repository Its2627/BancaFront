import { Response, NextFunction } from 'express';
import { TypedRequest } from '../../lib/typed-request.interface';
import { ChangeCardPinDto, CreateCardDto, RevealCardDto, RevealPinDto } from './card.dto';
import { NotFoundError } from '../../errors/not-found.error';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { IdParams } from '../../lib/auth/id-params';
import { HydratedDocument } from 'mongoose';
import { BankAccount } from '../bankAccount/bankAccount.entity';
import { CardStatus } from './card.entity';
import cardSrv from './card.service';
import bankAccountSrv from '../bankAccount/bankAccount.service';
import userSrv from '../user/user.service';

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

const statusHandler = (status: CardStatus) =>
    async (req: TypedRequest<unknown, unknown, IdParams>, res: Response, next: NextFunction) => {
        try {
            const bankAccount = await currentAccount(req.user?.id);
            const card = await cardSrv.changeStatus(req.params.id, bankAccount._id, status);

            if (!card) {
                return next(new NotFoundError());
            }

            res.json(card);

        } catch (err) {
            next(err)
        }
    }

export const list = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction) => {
    try {
        const bankAccount = await currentAccount(req.user?.id);

        res.json(await cardSrv.findByBankAccountId(bankAccount._id));

    } catch (err) {
        next(err)
    }
}

export const create = async (
  req: TypedRequest<CreateCardDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const bankAccount = await currentAccount(req.user?.id);

        const { card, details } = await cardSrv.create(bankAccount._id, req.body);

        res.status(201);
        res.json({ ...card.toJSON(), ...details });

    } catch (err) {
        next(err)
    }
}

export const reveal = async (
  req: TypedRequest<RevealCardDto, unknown, IdParams>,
  res: Response,
  next: NextFunction) => {
    try {
        const bankAccount = await currentAccount(req.user?.id);

        const details = await cardSrv.revealDetails(req.params.id, bankAccount._id, req.body.pin);

        if (!details) {
            return next(new NotFoundError());
        }

        res.json(details);

    } catch (err) {
        next(err)
    }
}

export const revealPin = async (
  req: TypedRequest<RevealPinDto, unknown, IdParams>,
  res: Response,
  next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return next(new InvalidCredentialsError());
        }

        const bankAccount = await currentAccount(userId);

        if (!await userSrv.verifyPassword(userId, req.body.password)) {
            return next(new InvalidCredentialsError('password non corretta'));
        }

        const pin = await cardSrv.revealPin(req.params.id, bankAccount._id);

        if (!pin) {
            return next(new NotFoundError());
        }

        res.json({ pin });

    } catch (err) {
        next(err)
    }
}

export const activate = statusHandler('active');

export const block = statusHandler('blocked');

export const remove = statusHandler('deleted');

export const changePin = async (
  req: TypedRequest<ChangeCardPinDto, unknown, IdParams>,
  res: Response,
  next: NextFunction) => {
    try {
        const bankAccount = await currentAccount(req.user?.id);
        const { currentPin, newPin } = req.body;

        const card = await cardSrv.changePin(req.params.id, bankAccount._id, currentPin, newPin);

        if (!card) {
            return next(new NotFoundError());
        }

        res.json({ updated: true });

    } catch (err) {
        next(err)
    }
}
