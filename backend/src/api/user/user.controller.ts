import { Response, NextFunction } from 'express';
import { TypedRequest } from '../../lib/typed-request.interface';
import { UpdateUserDto } from './user.dto';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { NotFoundError } from '../../errors/not-found.error';
import userSrv from './user.service';

export const me = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return next(new InvalidCredentialsError());
        }

        const profile = await userSrv.getProfile(userId);

        if (!profile) {
            return next(new NotFoundError());
        }

        res.json(profile);

    } catch (err) {
        next(err)
    }
}

export const updateMe = async (
  req: TypedRequest<UpdateUserDto>,
  res: Response,
  next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return next(new InvalidCredentialsError());
        }

        const updated = await userSrv.updatePicture(userId, req.body.picture);

        if (!updated) {
            return next(new NotFoundError());
        }

        res.json(updated);

    } catch (err) {
        next(err)
    }
}
