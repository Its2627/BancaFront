import { Response, NextFunction } from 'express';
import { TypedRequest } from '../../lib/typed-request.interface';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { NotFoundError } from '../../errors/not-found.error';
import bankAccountSrv from './bankAccount.service';

export const me = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return next(new InvalidCredentialsError());
        }

        const bankAccount = await bankAccountSrv.findByUserId(userId);

        if (!bankAccount) {
            return next(new NotFoundError());
        }

        res.json(bankAccount);

    } catch (err) {
        next(err)
    }
}
