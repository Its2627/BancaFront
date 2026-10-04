import { NextFunction, Request, Response } from 'express';

export class AlreadyCompletedError extends Error {

  constructor(message?: string) {
    super();
    this.name = 'AlreadyCompleted';
    this.message = message ?? 'operazione gia\' eseguita';
  }
};

export const alreadyCompletedHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AlreadyCompletedError) {
    res.status(400);
    res.json({
      error: err.name,
      message: err.message
    });
  } else {
    next(err);
  }
}
