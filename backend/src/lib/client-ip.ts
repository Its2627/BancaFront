import { Request } from "express";

export const clientIp = (req: Request): string =>
    req.ip ?? req.socket.remoteAddress ?? '';

export const clientUserAgent = (req: Request): string => req.get('user-agent') ?? '';
