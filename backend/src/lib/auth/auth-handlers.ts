import { User as AppUser } from "../../api/user/user.entity";
import './local/local-strategy';
import './jwt/jwt-strategy';

declare global {
  namespace Express {
    interface User extends AppUser {

      id: string;

      tokenId?: string;
      tokenExpiresAt?: Date;

      tokenVersion?: number;

      emailVerified?: boolean;
    }
  }
}
