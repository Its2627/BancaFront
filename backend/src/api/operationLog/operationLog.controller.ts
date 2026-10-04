import { Response, NextFunction } from 'express';
import { TypedRequest } from '../../lib/typed-request.interface';
import { QueryOperationLogDto } from './operationLog.dto';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import operationLogSrv from './operationLog.service';

export const list = async (
  req: TypedRequest<unknown, QueryOperationLogDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return next(new InvalidCredentialsError());
        }

        res.json(await operationLogSrv.findByUserId(userId, req.query.limit));

    } catch (err) {
        next(err)
    }
}
