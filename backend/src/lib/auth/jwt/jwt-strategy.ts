import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { UserIdentityModel } from "../local/user-identity.model";
import { User } from "../../../api/user/user.entity";
import tokenSrv from "./token.service";
import { JWT_SECRET } from "./jwt.config";

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  async (payload, done) => {
    try {
      if (await tokenSrv.isRevoked(payload.jti)) {
        return done(null, false, { message: 'token revocato' });
      }

      const identity = await UserIdentityModel
        .findOne({ user: payload.id })
        .populate<{ user: User }>('user');

      if (!identity || !identity.user) {
        return done(null, false, { message: 'invalid token' });
      }

      if ((payload.tv ?? 0) !== identity.tokenVersion) {
        return done(null, false, { message: 'password cambiata, esegui di nuovo il login' });
      }

      done(null, {
        ...(identity.user as any).toObject(),
        tokenId: payload.jti,
        tokenExpiresAt: payload.exp ? new Date(payload.exp * 1000) : undefined
      });
    } catch(err) {
      done(err);
    }
  })
)
