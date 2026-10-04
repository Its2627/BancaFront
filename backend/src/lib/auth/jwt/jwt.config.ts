import crypto from "crypto";

export const JWT_SECRET = process.env.JWT_SECRET ?? 'my_jwt_secret';

export const JWT_EXPIRES_IN = '1d';

export const newTokenId = (): string => crypto.randomUUID();
