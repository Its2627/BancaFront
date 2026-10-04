import { Response, NextFunction } from 'express';
import { TypedRequest } from '../../lib/typed-request.interface';
import transactionCategorySrv from './transactionCat.service';

export const list = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction) => {
    try {
        res.json(await transactionCategorySrv.findAll());
    } catch (err) {
        next(err)
    }
}
