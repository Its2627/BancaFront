import { NextFunction, Request, Response } from 'express';

export class UserExistsError extends Error {
  constructor() {
    super();
    this.name = 'UserExists';
    this.message = 'username already in use';
  }
};

export const userExistsHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof UserExistsError) {
    res.status(400);
    res.json({
      error: err.name,
      message: err.message
    });
  } else {
    next(err);
  }
}
