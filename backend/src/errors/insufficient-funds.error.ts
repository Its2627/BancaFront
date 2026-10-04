import { NextFunction, Request, Response } from 'express';

export class InsufficientFundsError extends Error {
  constructor() {
    super();
    this.name = 'InsufficientFunds';
    this.message = 'saldo non sufficiente';
  }
};

export const insufficientFundsHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InsufficientFundsError) {
    res.status(409);
    res.json({
      error: err.name,
      message: err.message
    });
  } else {
    next(err);
  }
}
