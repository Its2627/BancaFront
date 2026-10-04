import { NextFunction, Request, Response } from 'express';

export class InvalidCardStatusError extends Error {
  constructor(message?: string) {
    super();
    this.name = 'InvalidCardStatus';
    this.message = message ?? 'operazione non consentita per lo stato della carta';
  }
};

export const invalidCardStatusHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InvalidCardStatusError) {
    res.status(409);
    res.json({
      error: err.name,
      message: err.message
    });
  } else {
    next(err);
  }
}
