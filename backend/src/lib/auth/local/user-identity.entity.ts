import { Types } from "mongoose";
import { User } from "../../../api/user/user.entity";

export type UserIdentity = {
  provider: string;
  credentials: {
    email: string;
    hashedPassword: string;
  };

  emailVerified: boolean;
  emailVerificationCode: string | null;
  emailVerificationExpiresAt: Date | null;
  passwordResetCode: string | null;
  passwordResetExpiresAt: Date | null;

  passwordChangedAt: Date | null;

  tokenVersion: number;
  user: Types.ObjectId;
}

export type PopulatedUserIdentity = Omit<UserIdentity, 'user'> & { user: User & { id: string } };
