import { NextFunction, Request, Response } from 'express';

export class InvalidCredentialsError extends Error {
  constructor(message?: string) {
    super();
    this.name = 'InvalidCredentials';
    this.message = message ?? 'Invalid username/password supplied';
  }
};

export const invalidCredentialsHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InvalidCredentialsError) {
    res.status(400);
    res.json({
      error: err.name,
      message: err.message
    });
  } else {
    next(err);
  }
}
