import { Response, NextFunction } from 'express';
import { TypedRequest } from '../../lib/typed-request.interface';
import { QueryLoginAttemptsDto } from './loginAttempts.dto';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { NotFoundError } from '../../errors/not-found.error';
import loginAttemptSrv from './loginAttempts.service';
import userSrv from '../user/user.service';

export const list = async (
  req: TypedRequest<unknown, QueryLoginAttemptsDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return next(new InvalidCredentialsError());
        }

        const identity = await userSrv.getIdentityByUserId(userId);

        if (!identity) {
            return next(new NotFoundError());
        }

        const attempts = await loginAttemptSrv.findByEmail(identity.credentials.email, req.query.limit);

        res.json(attempts);

    } catch (err) {
        next(err)
    }
}
