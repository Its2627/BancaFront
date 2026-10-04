import { model, Schema } from "mongoose";
import { RevokedToken } from "./revoked-token.entity";

const revokedTokenSchema = new Schema<RevokedToken>({
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RevokedTokenModel = model<RevokedToken>('RevokedToken', revokedTokenSchema);
