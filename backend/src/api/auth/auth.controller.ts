import { NextFunction, Request, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendCodeDto,
  ResetPasswordDto,
  VerifyEmailDto
} from "./auth.dto";
import { omit, pick } from "lodash";
import { InvalidCredentialsError } from "../../errors/invalid-credentials.error";
import passport from "passport";
import userSrv from "../user/user.service";
import tokenSrv from "../../lib/auth/jwt/token.service";
import * as jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET, newTokenId } from "../../lib/auth/jwt/jwt.config";
import bankAccountSrv from '../bankAccount/bankAccount.service'
import loginAttemptSrv from '../loginAttempts/loginAttempts.service'
import { UserExistsError } from "../../errors/user-exists.error";
import operationLogSrv from "../operationLog/operationLog.service";
import { clientIp, clientUserAgent } from "../../lib/client-ip";
import { CREDENZIALI_NON_VALIDE } from "../../lib/messages";

export const register = async (
  req: TypedRequest<RegisterDto>,
  res: Response,
  next: NextFunction) => {
    try {
      const userData = {
        ...omit(req.body, 'email', 'password'),
        registrationIp: clientIp(req)
      };
      const credentials = pick(req.body, 'email', 'password');

      const emailExist = await userSrv.existUser(credentials.email)

      if (emailExist)
      {
        return next(new UserExistsError());
      }

      const newUser = await userSrv.add(userData, credentials);

      const newBankAccount = await bankAccountSrv.create(newUser._id);

      res.status(201);
      res.json({ user: newUser, bankAccount: newBankAccount });

    } catch(err) {
      next(err);
    }
}

export const login = (
  req: TypedRequest<LoginDto>,
  res: Response,
  next: NextFunction) => {
    const { email } = req.body;

    passport.authenticate('local',{ session: false },
      async (err: any, user: Express.User | false, info: { message?: string } | undefined) => {
        if (err) {
          return next(err);
        }

        try {
          const valid = !!user && user.emailVerified !== false;

          await loginAttemptSrv.record({
            email,
            outcome: valid ? 'success' : 'failed',
            ipAddress: clientIp(req),
            userAgent: clientUserAgent(req)
          });

          if (!user) {
            return next(new InvalidCredentialsError(CREDENZIALI_NON_VALIDE));
          }

          if (user.emailVerified === false) {
            return next(new InvalidCredentialsError(
              'conferma il tuo indirizzo email prima di accedere: controlla la posta'
            ));
          }

          const token = jwt.sign({ id: user.id, tv: user.tokenVersion ?? 0 }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            jwtid: newTokenId()
          });

          res.status(200);
          res.json({ user: omit(user, 'tokenVersion', 'emailVerified'), token });

        } catch (err) {
          next(err);
        }
      }
    )(req, res, next);
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  try {
    const { tokenId, tokenExpiresAt } = req.user ?? {};

    if (tokenId && tokenExpiresAt) {
      await tokenSrv.revoke(tokenId, tokenExpiresAt);
    }

    res.status(200);
    res.json({ loggedOut: true });
  } catch(err) {
    next(err)
  }
}

export const verifyEmail = async (
  req: TypedRequest<unknown, VerifyEmailDto>,
  res: Response,
  next: NextFunction) => {
  try {
    const userId = await userSrv.verifyEmail(req.query.token);

    if (!userId) {
      return next(new InvalidCredentialsError('codice di verifica non valido o scaduto'));
    }

    await bankAccountSrv.createOpeningTransaction(userId);

    res.status(200);
    res.json({ verified: true });
  } catch(err) {
    next(err)
  }
}

export const resendCode = async (
  req: TypedRequest<ResendCodeDto>,
  res: Response,
  next: NextFunction) => {
  try {
    await userSrv.resendVerificationCode(req.body.email);

    res.status(202);
    res.json({ sent: true });
  } catch(err) {
    next(err)
  }
}

export const changePassword = async (
  req: TypedRequest<ChangePasswordDto>,
  res: Response,
  next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new InvalidCredentialsError());
    }

    const { currentPassword, newPassword } = req.body;
    const changed = await userSrv.changePassword(userId, currentPassword, newPassword);

    if (!changed) {
      await operationLogSrv.record(req, 'change_password', 'failed', 'password attuale errata');
      return next(new InvalidCredentialsError('password attuale non corretta'));
    }

    await operationLogSrv.record(req, 'change_password', 'success');

    res.status(200);
    res.json({ updated: true });
  } catch(err) {
    await operationLogSrv.record(
      req, 'change_password', 'failed', err instanceof Error ? err.message : 'errore'
    );
    next(err)
  }
}

export const forgotPassword = async (
  req: TypedRequest<ForgotPasswordDto>,
  res: Response,
  next: NextFunction) => {
  try {
    await userSrv.forgotPassword(req.body.email);

    res.status(202);
    res.json({ sent: true });
  } catch(err) {
    next(err)
  }
}

export const resetPassword = async (
  req: TypedRequest<ResetPasswordDto>,
  res: Response,
  next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const updated = await userSrv.resetPassword(token, password);

    if (!updated) {
      return next(new InvalidCredentialsError('codice di reset non valido o scaduto'));
    }

    res.status(200);
    res.json({ updated: true });
  } catch(err) {
    next(err)
  }
}
