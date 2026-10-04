import { model, Schema } from "mongoose";
import { UserIdentity } from "./user-identity.entity";

export const userIdentitySchema = new Schema<UserIdentity>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, default: 'local' },
  credentials: {
    type: {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      hashedPassword: { type: String, required: true, select: false }
    },
    _id: false,
  },
  emailVerified: { type: Boolean, required: true, default: false },
  emailVerificationCode: { type: String, default: null, select: false },
  emailVerificationExpiresAt: { type: Date, default: null },
  passwordResetCode: { type: String, default: null, select: false },
  passwordResetExpiresAt: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },

  tokenVersion: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export const UserIdentityModel = model<UserIdentity>('UserIdentity', userIdentitySchema);
