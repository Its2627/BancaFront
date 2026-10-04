import { Request, Response, NextFunction } from "express";

type HttpError = Error & { status?: number; statusCode?: number };

export const genericErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status ?? err.statusCode ?? 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status);
  res.json({
    error: err.name,
    message: err.message
  });
}
