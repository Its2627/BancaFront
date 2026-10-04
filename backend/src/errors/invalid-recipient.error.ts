import { NextFunction, Request, Response } from 'express';

export class InvalidRecipientError extends Error {
  constructor(message?: string) {
    super();
    this.name = 'InvalidRecipient';
    this.message = message ?? 'destinatario non valido';
  }
};

export const invalidRecipientHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InvalidRecipientError) {
    res.status(400);
    res.json({
      error: err.name,
      message: err.message
    });
  } else {
    next(err);
  }
}
