import passport from "passport";
import { Strategy as LocalStrategy } from 'passport-local';
import { UserIdentityModel } from "./user-identity.model";
import { User } from "../../../api/user/user.entity";
import * as bcrypt from 'bcrypt';
import { CREDENZIALI_NON_VALIDE } from '../../messages';

passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async function(email, password, done) {
    try {

      const identity = await UserIdentityModel
        .findOne({ 'credentials.email': email.toLowerCase() })
        .select('+credentials.hashedPassword')
        .populate<{ user: User }>('user');

      if (!identity) {
        return done(null, false, { message: CREDENZIALI_NON_VALIDE });
      }

      const match = await bcrypt.compare(password, identity.credentials.hashedPassword);
      if (!match) {
        return done(null, false, { message: CREDENZIALI_NON_VALIDE });
      }

      const user = {
        ...(identity.user as any).toObject(),
        tokenVersion: identity.tokenVersion,

        emailVerified: identity.emailVerified
      };

      done(null, user);

    } catch(err) {
      done(err);
    }
  })
);
